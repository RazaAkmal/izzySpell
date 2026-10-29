#!/usr/bin/env bash
# Login & Sign-Up, Batch C - email + consent, email password reset, session
# invalidation after a password change. End-to-end checks against a running app.
#
# DB WRITES (shared production Neon DB):
#   1. Creates TWO users via sign-up:
#        zztest<RUN_ID>a  email delivered@resend.dev (Resend's test inbox)
#        zztest<RUN_ID>b  email zztest-<RUN_ID>@example.com, then set to NULL
#                         directly with Prisma (to get "a user without email")
#   2. POST /api/auth/forgotPassword creates up to 3 password_reset_tokens rows for
#      user "a" (only SHA-256 hashes are stored). If RESEND_API_KEY is set on the server
#      this sends test emails to delivered@resend.dev; otherwise (dev) the link is only
#      printed in the dev server console.
#   3. Creates 2 more token rows for user "a" directly with Prisma (one valid, one
#      already expired), using the app's own generateResetToken/hashResetToken.
#   4. Resets user "a"'s password once (sets password + password_changed_at, marks the
#      token used, deletes its other tokens).
#   5. Deletes user "a" (checks its tokens are cascade-deleted) and user "b".
# Nothing else is written. Other zztest* accounts are not touched. No email is read.
#
# Usage:  bash docs/test-auth-batch-c.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:3000 (npm run dev must be running).
#   Needs: curl, python3, node 22.6+ (runs the app's .ts helpers), .env in the project root.
#   For a fast run start the dev server with SESSION_CHECK_INTERVAL_SECONDS=1 and run this
#   script with SESSION_CHECK_WAIT=2. Without them the script waits 62 s (the default check
#   interval is 60 s).
#
# JSON bodies are built with python3 json.dumps (macOS bash 3.2 breaks nested quoted JSON);
# all Prisma code lives in a quoted heredoc file, never in shell strings.

set -uo pipefail
cd "$(dirname "$0")/.."
PROJECT_DIR="$(pwd)"

BASE="${1:-http://localhost:3000}"
RUN_ID="$(date +%s)$RANDOM"
USER_A="zztest${RUN_ID}a"
USER_B="zztest${RUN_ID}b"
EMAIL_A="delivered@resend.dev"
EMAIL_B="zztest-${RUN_ID}@example.com"
PASS1="Password1"
PASS2="NewPassw0rd"
TMPDIR_RUN="$(mktemp -d)"
JAR="$TMPDIR_RUN/jar"; JAR_OLD="$TMPDIR_RUN/jar_old"
PASSED=0; FAILED=0
LAST_CODE=""; LAST_BODY=""; LAST_SENT=""; LAST_TIME=""
GENERIC_INVALID="This link is invalid or has expired. Please request a new one."

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

pass() { echo "  PASS  $1"; PASSED=$((PASSED+1)); }
fail() {
  echo "  FAIL  $1"
  echo "        sent:     ${LAST_SENT:-<n/a>}"
  echo "        got HTTP: ${LAST_CODE:-<n/a>}"
  echo "        got body: ${2:-$LAST_BODY}"
  FAILED=$((FAILED+1))
}

request() { # request <METHOD> <path> <raw body> [cookie jar]
  local out; out="$(mktemp "$TMPDIR_RUN/resp.XXXXXX")"
  local jar="${4:-$TMPDIR_RUN/nojar}"; [ -f "$jar" ] || touch "$jar"
  LAST_SENT="$3"
  local meta; meta="$(curl -s -m 60 -o "$out" -w "%{http_code} %{time_total}" -X "$1" "$BASE$2" -b "$jar" \
    -H 'Content-Type: application/json' --data-binary "$3")"
  LAST_CODE="${meta%% *}"; LAST_TIME="${meta#* }"
  LAST_BODY="$(cat "$out")"
}

check() { # check <label> <METHOD> <path> <body> <expected_code> <expected_text>
  request "$2" "$3" "$4"
  if [ "$LAST_CODE" = "$5" ] && [[ "$LAST_BODY" == *"$6"* ]]; then pass "$1"; else fail "$1"; fi
}

login() { # login <name> <password> <jar> -> 0 if a session was created
  local jar="$3"; rm -f "$jar"; touch "$jar"
  local csrf; csrf=$(curl -s -c "$jar" -b "$jar" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -s -o /dev/null -c "$jar" -b "$jar" -X POST "$BASE/api/auth/callback/credentials" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "name=$1" --data-urlencode "password=$2"
  has_session "$jar"
}
has_session() { # has_session <jar> -> 0 if /api/auth/session returns a user (uses a copy: the call may clear cookies)
  local copy="$TMPDIR_RUN/jar_probe"; cp "$1" "$copy"
  curl -s -b "$copy" -c "$copy" "$BASE/api/auth/session" | python3 -c 'import sys,json;d=json.load(sys.stdin);sys.exit(0 if d and d.get("user") else 1)'
}

# ---- Prisma helper (quoted heredoc: no shell expansion inside) ----
cat > "$TMPDIR_RUN/db.mjs" <<'JS'
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const root = process.env.PROJECT_DIR;
const require = createRequire(root + "/package.json");
const { PrismaClient } = require("@prisma/client");
const { generateResetToken, hashResetToken } = await import(pathToFileURL(root + "/src/lib/passwordResetToken.ts").href);
const p = new PrismaClient();
const [cmd, a1, a2] = process.argv.slice(2);
try {
  if (cmd === "user-id") {                       // read
    const u = await p.user.findUnique({ where: { name: a1 }, select: { id: true } });
    console.log(u ? u.id : "none");
  } else if (cmd === "unset-email") {            // WRITE: parentEmail -> NULL for that one user
    const r = await p.user.updateMany({ where: { name: a1 }, data: { parentEmail: null } });
    console.log(r.count);
  } else if (cmd === "token-count") {            // read
    console.log(await p.passwordResetToken.count({ where: { userId: a1 } }));
  } else if (cmd === "create-token") {           // WRITE: one token row; prints the RAW token
    const token = generateResetToken();
    await p.passwordResetToken.create({
      data: { userId: a1, tokenHash: hashResetToken(token), expiresAt: new Date(Date.now() + Number(a2) * 60_000) },
    });
    console.log(token);
  } else if (cmd === "random-token") {           // no DB: a well-formed token that was never stored
    console.log(generateResetToken());
  } else if (cmd === "token-used") {             // read
    const t = await p.passwordResetToken.findUnique({ where: { tokenHash: hashResetToken(a1) }, select: { usedAt: true } });
    console.log(!t ? "missing" : t.usedAt ? "used" : "unused");
  } else if (cmd === "password-changed") {       // read
    const u = await p.user.findUnique({ where: { name: a1 }, select: { passwordChangedAt: true } });
    console.log(!u ? "no-user" : u.passwordChangedAt ? "set" : "null");
  } else if (cmd === "delete-user") {            // WRITE: delete that exact user if it owns no lists
    const u = await p.user.findUnique({ where: { name: a1 }, select: { id: true, _count: { select: { spellingLists: true } } } });
    if (!u) console.log("none");
    else if (u._count.spellingLists > 0) console.log("refused-owns-lists");
    else { await p.user.delete({ where: { id: u.id } }); console.log("deleted"); }
  }
} finally {
  await p.$disconnect();
}
JS
db() { ( set -a; . ./.env; set +a; PROJECT_DIR="$PROJECT_DIR" NODE_NO_WARNINGS=1 node "$TMPDIR_RUN/db.mjs" "$@" ); }

cleanup() {
  echo "== Cleanup"
  for u in "$USER_A" "$USER_B"; do echo "  $u: $(db delete-user "$u")"; done
  rm -rf "$TMPDIR_RUN"
}
trap cleanup EXIT

echo "Base URL: $BASE   users: $USER_A (with email), $USER_B (without)   shell: ${BASH_VERSION:-not bash}"

echo "== Setup (WRITE: 2 users with consent; user b's email removed)"
check "sign-up user a -> 201" POST /api/auth/signup "$(json name "$USER_A" parentEmail "$EMAIL_A" confirmParentEmail "$EMAIL_A" password "$PASS1" confirmPassword "$PASS1" acceptedTerms bool:true)" 201 "$USER_A"
check "sign-up user b -> 201" POST /api/auth/signup "$(json name "$USER_B" parentEmail "$EMAIL_B" confirmParentEmail "$EMAIL_B" password "$PASS1" confirmPassword "$PASS1" acceptedTerms bool:true)" 201 "$USER_B"
[ "$(db unset-email "$USER_B")" = "1" ] && pass "user b now has no email" || fail "user b now has no email" "-"
ID_A="$(db user-id "$USER_A")"; ID_B="$(db user-id "$USER_B")"

echo "== Forgot password: identical answer for unknown / no-email / with-email"
request POST /api/auth/forgotPassword "$(json name "zz_no_such_user_$RUN_ID")"; R_UNKNOWN="$LAST_CODE $LAST_BODY"; T_UNKNOWN="$LAST_TIME"
request POST /api/auth/forgotPassword "$(json name "$USER_B")";               R_NOEMAIL="$LAST_CODE $LAST_BODY"; T_NOEMAIL="$LAST_TIME"
request POST /api/auth/forgotPassword "$(json name "$USER_A")";               R_EMAIL="$LAST_CODE $LAST_BODY";   T_EMAIL="$LAST_TIME"
[ "$R_UNKNOWN" = "$R_NOEMAIL" ] && [ "$R_NOEMAIL" = "$R_EMAIL" ] && pass "identical status+body for all three ($R_EMAIL)" || fail "identical responses" "unknown=[$R_UNKNOWN] noemail=[$R_NOEMAIL] email=[$R_EMAIL]"
[[ "$R_EMAIL" == "200 "*"If that account has an email on file"* ]] && pass "response is 200 with the generic message" || fail "generic message" "$R_EMAIL"
python3 -c 'import sys; sys.exit(0 if all(float(t) >= 1.4 for t in sys.argv[1:]) else 1)' "$T_UNKNOWN" "$T_NOEMAIL" "$T_EMAIL" \
  && pass "every response padded to >=1.4s (unknown ${T_UNKNOWN}s, no-email ${T_NOEMAIL}s, email ${T_EMAIL}s)" || fail "response padding" "times: $T_UNKNOWN $T_NOEMAIL $T_EMAIL"
check "forgotPassword empty name -> 400" POST /api/auth/forgotPassword "$(json name '   ')" 400 "Username is required"
[ "$(db token-count "$ID_A")" = "1" ] && pass "token row created for the user WITH email (1)" || fail "token row for user a" "$(db token-count "$ID_A")"
[ "$(db token-count "$ID_B")" = "0" ] && pass "no token row for the user WITHOUT email" || fail "no token row for user b" "$(db token-count "$ID_B")"

echo "== Rate limit: max 3 links per hour"
request POST /api/auth/forgotPassword "$(json name "$USER_A")"
request POST /api/auth/forgotPassword "$(json name "$USER_A")"
[ "$(db token-count "$ID_A")" = "3" ] && pass "2nd and 3rd requests created rows (3)" || fail "3 rows after 3 requests" "$(db token-count "$ID_A")"
request POST /api/auth/forgotPassword "$(json name "$USER_A")"; R_LIMITED="$LAST_CODE $LAST_BODY"
[ "$(db token-count "$ID_A")" = "3" ] && pass "4th request within the hour created NO new row" || fail "4th request created no row" "$(db token-count "$ID_A")"
[ "$R_LIMITED" = "$R_EMAIL" ] && pass "rate-limited response is identical too" || fail "rate-limited response identical" "$R_LIMITED"

echo "== Keep a session from BEFORE the reset"
login "$USER_A" "$PASS1" "$JAR_OLD" && pass "user a logged in (old session saved)" || fail "login before reset" "-"

echo "== Tokens created directly (WRITE: 1 valid, 1 expired) with the app's helpers"
TOKEN="$(db create-token "$ID_A" 60)"
EXPIRED="$(db create-token "$ID_A" -5)"
RANDOM_TOKEN="$(db random-token)"
[[ "$TOKEN" =~ ^[A-Za-z0-9_-]{43}$ ]] && pass "token created (43 base64url chars)" || fail "token created" "$TOKEN"

echo "== Rejected reset requests change nothing"
check "OLD { name, password } body -> 400" POST /api/auth/resetPassword "$(json name "$USER_A" password "$PASS2" confirmPassword "$PASS2")" 400 ""
check "random token -> 400 generic"        POST /api/auth/resetPassword "$(json token "$RANDOM_TOKEN" password "$PASS2" confirmPassword "$PASS2")" 400 "$GENERIC_INVALID"
check "expired token -> 400 generic"       POST /api/auth/resetPassword "$(json token "$EXPIRED" password "$PASS2" confirmPassword "$PASS2")" 400 "$GENERIC_INVALID"
check "malformed token -> 400 generic"     POST /api/auth/resetPassword "$(json token short password "$PASS2" confirmPassword "$PASS2")" 400 "$GENERIC_INVALID"
check "valid token + extra field -> 400"   POST /api/auth/resetPassword "$(json token "$TOKEN" password "$PASS2" confirmPassword "$PASS2" name "$USER_A")" 400 ""
check "valid token, short password -> 400" POST /api/auth/resetPassword "$(json token "$TOKEN" password a confirmPassword a)" 400 "at least 8 characters"
check "valid token, mismatch -> 400"       POST /api/auth/resetPassword "$(json token "$TOKEN" password "$PASS2" confirmPassword "x$PASS2")" 400 "Passwords do not match"
[ "$(db password-changed "$USER_A")" = "null" ] && pass "password_changed_at still NULL" || fail "password_changed_at still NULL" "$(db password-changed "$USER_A")"
[ "$(db token-used "$TOKEN")" = "unused" ] && pass "valid token still unused" || fail "valid token still unused" "$(db token-used "$TOKEN")"
login "$USER_A" "$PASS1" "$JAR" && pass "old password still works" || fail "old password still works" "-"

echo "== Reset with the valid token (WRITE)"
check "reset with valid token -> 200" POST /api/auth/resetPassword "$(json token "$TOKEN" password "$PASS2" confirmPassword "$PASS2")" 200 "Your password has been reset"
[ "$(db token-used "$TOKEN")" = "used" ] && pass "token marked used" || fail "token marked used" "$(db token-used "$TOKEN")"
[ "$(db password-changed "$USER_A")" = "set" ] && pass "password_changed_at set" || fail "password_changed_at set" "$(db password-changed "$USER_A")"
[ "$(db token-count "$ID_A")" = "1" ] && pass "user's other tokens deleted (only the used one remains)" || fail "other tokens deleted" "$(db token-count "$ID_A")"
check "same token a second time -> 400 generic" POST /api/auth/resetPassword "$(json token "$TOKEN" password "Another1x" confirmPassword "Another1x")" 400 "$GENERIC_INVALID"

echo "== Session from before the reset is ended (no redirect loop)"
echo "  waiting ${SESSION_CHECK_WAIT:-62}s for the server's cached session check to expire (SESSION_CHECK_INTERVAL_SECONDS)..."
sleep "${SESSION_CHECK_WAIT:-62}"
cp "$JAR_OLD" "$JAR"
DASH="$(curl -s -o /dev/null -L --max-redirs 5 -b "$JAR" -c "$JAR" -w '%{http_code} %{num_redirects} %{url_effective}' "$BASE/dashboard")"; DASH_EXIT=$?
LAST_SENT="GET /dashboard with the pre-reset cookie (follow redirects, max 5)"; LAST_CODE="${DASH%% *}"; LAST_BODY="$DASH (curl exit $DASH_EXIT)"
[ "$DASH_EXIT" = "0" ] && [ "${DASH%% *}" = "200" ] && [[ "$DASH" == *"/sign-in" ]] && pass "/dashboard -> ... -> /sign-in, HTTP 200, no loop ($DASH)" || fail "/dashboard ends on /sign-in without a loop"
cp "$JAR_OLD" "$JAR"
DASH2="$(curl -s -o /dev/null -L --max-redirs 5 -b "$JAR" -c "$JAR" -w '%{http_code} %{url_effective}' "$BASE/sign-in")"
[[ "$DASH2" == "200 "*"/sign-in" ]] && pass "/sign-in with the pre-reset cookie ends on /sign-in ($DASH2)" || fail "/sign-in with old cookie" "$DASH2"
has_session "$JAR_OLD" && fail "old session rejected by /api/auth/session" "session still valid" || pass "old session rejected by /api/auth/session"
request PUT /api/auth/updateProfile "$(json data x)" "$JAR_OLD"
[ "$LAST_CODE" = "401" ] && pass "API route sees no session with the old cookie (401)" || fail "API route 401 with old cookie"

echo "== New password"
login "$USER_A" "$PASS1" "$JAR" && fail "old password rejected after reset" "session created" || pass "old password rejected after reset"
login "$USER_A" "$PASS2" "$JAR" && pass "login works with the new password" || fail "login with new password" "-"
NEWDASH="$(curl -s -o /dev/null -L --max-redirs 5 -b "$JAR" -c "$JAR" -w '%{http_code} %{url_effective}' "$BASE/dashboard")"
[[ "$NEWDASH" != *"/sign-in" ]] && pass "new session is accepted (/dashboard -> ${NEWDASH#* })" || fail "new session accepted" "$NEWDASH"

echo "== Deleting the user cascades its tokens (WRITE: deletes user a)"
[ "$(db delete-user "$USER_A")" = "deleted" ] && pass "user a deleted" || fail "user a deleted" "-"
[ "$(db token-count "$ID_A")" = "0" ] && pass "its token rows are gone (ON DELETE CASCADE)" || fail "tokens cascade-deleted" "$(db token-count "$ID_A")"

echo
echo "Result: $PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
