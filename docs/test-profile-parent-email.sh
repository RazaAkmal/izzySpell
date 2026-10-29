#!/usr/bin/env bash
# "My Profile": adding an email to an account that has none (add-only).
# End-to-end checks against a running app.
#
# DB WRITES (shared production Neon DB):
#   1. Creates ONE user  zztest<RUN_ID>p  via sign-up (fake email
#      zztest-<RUN_ID>@example.com + consent), then sets its parent_email,
#      parent_consent_at and consent_version to NULL directly with Prisma (to simulate
#      an account created before sign-up asked for an email).
#   2. Saves that user's profile 2 times (profile fields only; then profile + a parent
#      email ZZTest-<RUN_ID>-mum@Example.com with consent). Rejected requests write nothing.
#   3. Deletes that user at the end (only that exact name; refuses if it owns lists).
# Nothing else is written. Emails are compared inside node and never printed.
#
# Usage:  bash docs/test-profile-email.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:3000 (npm run dev must be running).
#   Needs: curl, python3, node, .env in the project root.

set -uo pipefail
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

BASE="${1:-http://localhost:3000}"
RUN_ID="$(date +%s)$RANDOM"
USER_NAME="zztest${RUN_ID}p"
SIGNUP_EMAIL="zztest-${RUN_ID}@example.com"
NEW_EMAIL="ZZTest-${RUN_ID}-mum@Example.com"
NEW_EMAIL_LOWER="$(echo "$NEW_EMAIL" | tr '[:upper:]' '[:lower:]')"
OTHER_EMAIL="zztest-${RUN_ID}-other@example.com"
PASS1="Password1"
TMPDIR_RUN="$(mktemp -d)"
JAR="$TMPDIR_RUN/jar"
PASSED=0; FAILED=0
LAST_CODE=""; LAST_BODY=""; LAST_SENT=""

# json k1 v1 ... -> compact JSON; "num:123" -> number, "bool:true" -> boolean
json() {
  python3 -c '
import json, sys
def value(v):
    if v.startswith("num:"): return int(v[4:])
    if v.startswith("bool:"): return v[5:] == "true"
    return v
a = sys.argv[1:]
print(json.dumps({k: value(v) for k, v in zip(a[0::2], a[1::2])}, separators=(",", ":")))
' "$@"
}
# profile_body k1 v1 ... -> {"data":{...},"userId":"someone-else"} (same value rules as json)
profile_body() {
  python3 -c '
import json, sys
def value(v):
    if v.startswith("num:"): return int(v[4:])
    if v.startswith("bool:"): return v[5:] == "true"
    return v
a = sys.argv[1:]
print(json.dumps({"data": {k: value(v) for k, v in zip(a[0::2], a[1::2])}, "userId": "someone-else"}, separators=(",", ":")))
' "$@"
}

pass() { echo "  PASS  $1"; PASSED=$((PASSED+1)); }
fail() {
  echo "  FAIL  $1"
  echo "        sent:     ${LAST_SENT:-<n/a>}"
  echo "        got HTTP: ${LAST_CODE:-<n/a>}"
  echo "        got body: ${2:-$LAST_BODY}"
  FAILED=$((FAILED+1))
}
request() { # request <METHOD> <path> <raw body>
  local out; out="$(mktemp "$TMPDIR_RUN/resp.XXXXXX")"
  LAST_SENT="$3"
  LAST_CODE="$(curl -s -m 60 -o "$out" -w "%{http_code}" -X "$1" "$BASE$2" -b "$JAR" -H 'Content-Type: application/json' --data-binary "$3")"
  LAST_BODY="$(cat "$out")"
}
check() { # check <label> <METHOD> <path> <body> <expected_code> <expected_text>
  request "$2" "$3" "$4"
  if [ "$LAST_CODE" = "$5" ] && [[ "$LAST_BODY" == *"$6"* ]]; then pass "$1"; else fail "$1"; fi
}
login() {
  rm -f "$JAR"; touch "$JAR"
  local csrf; csrf=$(curl -s -c "$JAR" -b "$JAR" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -s -o /dev/null -c "$JAR" -b "$JAR" -X POST "$BASE/api/auth/callback/credentials" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "name=$1" --data-urlencode "password=$2"
  curl -s -b "$JAR" "$BASE/api/auth/session" | python3 -c 'import sys,json;d=json.load(sys.stdin);sys.exit(0 if d and d.get("user") else 1)'
}

# ---- Prisma helper (quoted heredoc: no shell expansion inside) ----
cat > "$TMPDIR_RUN/db.mjs" <<'JS'
import { createRequire } from "node:module";
const require = createRequire(process.env.PROJECT_DIR + "/package.json");
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
const [cmd, name, expected] = process.argv.slice(2);
try {
  if (cmd === "clear-email") {              // WRITE: make the test user look like an old account
    const r = await p.user.updateMany({ where: { name }, data: { parentEmail: null, parentConsentAt: null, consentVersion: null } });
    console.log(r.count);
  } else if (cmd === "state") {             // read: present/absent only; email compared, never printed
    const u = await p.user.findUnique({ where: { name }, select: { parentEmail: true, parentConsentAt: true, consentVersion: true, firstName: true } });
    if (!u) { console.log("no-user"); }
    else console.log([
      u.parentEmail ? "email:present" : "email:absent",
      "matches:" + (expected ? (u.parentEmail === expected ? "yes" : "no") : "n/a"),
      u.parentConsentAt ? "consentAt:present" : "consentAt:absent",
      "version:" + (u.consentVersion ?? "null"),
      "firstName:" + (u.firstName ?? "null"),
    ].join(" "));
  } else if (cmd === "delete-user") {       // WRITE: delete that exact user if it owns no lists
    const u = await p.user.findUnique({ where: { name }, select: { id: true, _count: { select: { spellingLists: true } } } });
    if (!u) console.log("none");
    else if (u._count.spellingLists > 0) console.log("refused-owns-lists");
    else { await p.user.delete({ where: { id: u.id } }); console.log("deleted"); }
  }
} finally {
  await p.$disconnect();
}
JS
db() { ( set -a; . ./.env; set +a; PROJECT_DIR="$PROJECT_DIR" NODE_NO_WARNINGS=1 node "$TMPDIR_RUN/db.mjs" "$@" ); }

cleanup() { echo "== Cleanup: $USER_NAME: $(db delete-user "$USER_NAME")"; rm -rf "$TMPDIR_RUN"; }
trap cleanup EXIT

PROFILE_ARGS=(firstName Zz lastName Test age 8-9 grade "3rd Grade")

echo "Base URL: $BASE   test user: $USER_NAME   shell: ${BASH_VERSION:-not bash}"
echo "== Setup (WRITE: user created, then its email removed)"
check "sign-up -> 201" POST /api/auth/signup "$(json name "$USER_NAME" parentEmail "$SIGNUP_EMAIL" confirmParentEmail "$SIGNUP_EMAIL" password "$PASS1" confirmPassword "$PASS1" acceptedTerms bool:true)" 201 "$USER_NAME"
[ "$(db clear-email "$USER_NAME")" = "1" ] && pass "email removed (simulates an old account)" || fail "email removed" "-"
login "$USER_NAME" "$PASS1" && pass "login" || fail "login" "-"

echo "== Profile page before: add section data, no email"
PAGE="$(curl -s -b "$JAR" "$BASE/profile/x")"
[[ "$PAGE" == *'hasParentEmail\":false'* || "$PAGE" == *'"hasParentEmail":false'* ]] && pass "profile page gets hasParentEmail=false" || fail "hasParentEmail=false on the page" "(page HTML, $(printf %s "$PAGE" | wc -c) bytes)"

echo "== Profile-only update still works (WRITE: profile fields)"
check "profile fields only -> 200" PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}")" 200 '"profileUpdated":true'
[[ "$(db state "$USER_NAME")" == "email:absent "* ]] && pass "no email was set" || fail "no email was set" "$(db state "$USER_NAME")"

echo "== Rejected email updates (nothing written)"
check "email + confirm, no acceptedTerms -> 400" PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}" parentEmail "$NEW_EMAIL" confirmParentEmail "$NEW_EMAIL")" 400 "tick the box"
check "only parentEmail -> 400"                  PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}" parentEmail "$NEW_EMAIL")" 400 "tick the box"
check "mismatch -> 400"                          PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}" parentEmail "$NEW_EMAIL" confirmParentEmail "$OTHER_EMAIL" acceptedTerms bool:true)" 400 "Emails do not match"
check "invalid -> 400"                           PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}" parentEmail not-an-email confirmParentEmail not-an-email acceptedTerms bool:true)" 400 "valid email address"
check "acceptedTerms false -> 400"               PUT /api/auth/updateProfile "$(profile_body "${PROFILE_ARGS[@]}" parentEmail "$NEW_EMAIL" confirmParentEmail "$NEW_EMAIL" acceptedTerms bool:false)" 400 "Please accept the Terms of Service"
[[ "$(db state "$USER_NAME")" == "email:absent "* ]] && pass "still no email after the rejected requests" || fail "still no email" "$(db state "$USER_NAME")"

echo "== Valid trio (WRITE: profile + email + consent)"
check "valid email + consent -> 200" PUT /api/auth/updateProfile "$(profile_body firstName Added lastName Test age 8-9 grade '3rd Grade' parentEmail "  $NEW_EMAIL " confirmParentEmail "$NEW_EMAIL" acceptedTerms bool:true)" 200 '"profileUpdated":true'
RESP="$LAST_BODY"
KEYS=$(printf '%s' "$RESP" | python3 -c 'import sys,json;print(",".join(sorted(json.load(sys.stdin).keys())))' 2>/dev/null)
[ "$KEYS" = "age,firstName,grade,id,lastName,name,profileImage,profileUpdated" ] && pass "response has only the usual public fields" || fail "response public fields only" "$KEYS"
lc_resp="$(printf '%s' "$RESP" | tr '[:upper:]' '[:lower:]')"
[[ "$lc_resp" != *"$NEW_EMAIL_LOWER"* && "$lc_resp" != *"@example.com"* ]] && pass "response does not contain the email" || fail "response does not contain the email" "(redacted)"
STATE="$(db state "$USER_NAME" "$NEW_EMAIL_LOWER")"
[ "$STATE" = "email:present matches:yes consentAt:present version:2026-10-29 firstName:Added" ] && pass "DB: lower-cased email, consent time + version, profile saved ($(echo "$STATE" | sed 's/ firstName:.*//'))" || fail "DB state after adding" "$STATE"

echo "== Profile page after: masked only"
PAGE="$(curl -s -b "$JAR" "$BASE/profile/x")"
lc_page="$(printf '%s' "$PAGE" | tr '[:upper:]' '[:lower:]')"
[[ "$lc_page" != *"$NEW_EMAIL_LOWER"* ]] && pass "profile page (getUserDetails output) does not contain the email" || fail "profile page does not contain the email" "(redacted)"
[[ "$PAGE" == *'z***@example.com'* ]] && pass "profile page gets the masked email (z***@example.com)" || fail "masked email on the page" "-"
[[ "$PAGE" == *'hasParentEmail\":true'* || "$PAGE" == *'"hasParentEmail":true'* ]] && pass "profile page gets hasParentEmail=true" || fail "hasParentEmail=true on the page" "-"

echo "== Add-only: a second, different email is rejected"
check "second email -> 400" PUT /api/auth/updateProfile "$(profile_body firstName Changed lastName Test age 8-9 grade '3rd Grade' parentEmail "$OTHER_EMAIL" confirmParentEmail "$OTHER_EMAIL" acceptedTerms bool:true)" 400 "already has an email"
STATE="$(db state "$USER_NAME" "$NEW_EMAIL_LOWER")"
[[ "$STATE" == "email:present matches:yes "* ]] && pass "stored email unchanged (compared in node: yes)" || fail "stored email unchanged" "$STATE"
[[ "$STATE" == *"firstName:Added" ]] && pass "rejected request wrote nothing (profile fields unchanged too)" || fail "nothing written by the rejected request" "$STATE"

echo
echo "Result: $PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
