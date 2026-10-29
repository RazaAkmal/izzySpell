#!/usr/bin/env bash
# Login & Sign-Up hardening, Batch A - end-to-end checks against a running app.
#
# DB WRITES (shared production Neon DB, via the app):
#   1. Creates ONE user named  zztest<RUN_ID>  (sign-up, with a fake parent email
#      zztest-<RUN_ID>@example.com and parental consent)
#   2. Saves a profile for that user (updateProfile; the request also carries FAKE card
#      fields, which are ignored)
#   3. Deletes that user at the end (only that exact name; refuses if it owns lists)
# Rejected requests write nothing. The old { name, password } reset body is sent once and
# must be rejected without changing anything. One read-only Prisma SELECT checks the
# stored consent fields (the email is never printed).
# Nothing else is written. Other zztest* accounts are not touched.
#
# Usage:  bash docs/test-auth-batch-a.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:3000 (npm run dev must be running).
#   Needs: curl, python3, node, and .env in the project root (for the cleanup step).
#
# Works with macOS /bin/bash 3.2, newer bash and zsh. JSON bodies are built by
# python3 (json.dumps) from plain variables: an earlier version built them with
# escaped quotes inside "$(...)", which bash 3.2 brace-expands and splits at the
# commas, so the server received broken JSON ("Invalid request").

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="${1:-http://localhost:3000}"
RUN_ID="$(date +%s)$RANDOM"
USER_NAME="zztest${RUN_ID}"
USER_NAME_UPPER="$(echo "$USER_NAME" | tr '[:lower:]' '[:upper:]')"
PASS1="Password1"
PASS2="NewPassw0rd"
LONG73="$(printf 'a%.0s' $(seq 1 73))"
# Mixed case on purpose: it must be stored lower-cased
PARENT_EMAIL="ZZTest-${RUN_ID}@Example.com"
PARENT_EMAIL_LOWER="$(echo "$PARENT_EMAIL" | tr '[:upper:]' '[:lower:]')"
JAR="$(mktemp)"
TMPDIR_RUN="$(mktemp -d)"
PASSED=0; FAILED=0
LAST_CODE=""; LAST_BODY=""; LAST_SENT=""

# json k1 v1 k2 v2 ...  -> compact JSON object (all values are strings)
# json k1 v1 k2 v2 ... -> compact JSON object. Values are strings, except
# "num:123" -> number and "bool:true"/"bool:false" -> boolean.
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

# signup_json <fields...> -> sign-up body with valid parent email + consent added
# (fields given later override these, so a test can break one of them)
signup_json() { json parentEmail "$PARENT_EMAIL" confirmParentEmail "$PARENT_EMAIL" acceptedTerms bool:true "$@"; }

pass() { echo "  PASS  $1"; PASSED=$((PASSED+1)); }
fail() {
  echo "  FAIL  $1"
  echo "        sent:     ${LAST_SENT:-<n/a>}"
  echo "        got HTTP: ${LAST_CODE:-<n/a>}"
  echo "        got body: ${2:-$LAST_BODY}"
  FAILED=$((FAILED+1))
}

# request <METHOD> <path> <raw body>  -> sets LAST_CODE / LAST_BODY / LAST_SENT
# (runs in the current shell, one unique temp file per request)
request() {
  local out; out="$(mktemp "$TMPDIR_RUN/resp.XXXXXX")"
  LAST_SENT="$3"
  LAST_CODE="$(curl -s -m 60 -o "$out" -w "%{http_code}" -X "$1" "$BASE$2" -b "$JAR" \
    -H 'Content-Type: application/json' --data-binary "$3")"
  LAST_BODY="$(cat "$out")"
}

# check <label> <expected_code> <expected_text_in_body> <path> <raw body> [--allow-invalid-json]
check() {
  if [ "${6:-}" != "--allow-invalid-json" ] && ! printf '%s' "$5" | python3 -c 'import json,sys; json.load(sys.stdin)' 2>/dev/null; then
    LAST_SENT="$5"; LAST_CODE="(not sent)"; fail "$1" "test bug: body is not valid JSON"; return
  fi
  request POST "$4" "$5"
  if [ "$LAST_CODE" = "$2" ] && [[ "$LAST_BODY" == *"$3"* ]]; then pass "$1"; else fail "$1"; fi
}

login() { # login <name> <password> -> 0 if a session was created
  rm -f "$JAR"; touch "$JAR"
  local csrf; csrf=$(curl -s -c "$JAR" -b "$JAR" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -s -o /dev/null -c "$JAR" -b "$JAR" -X POST "$BASE/api/auth/callback/credentials" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "name=$1" --data-urlencode "password=$2"
  curl -s -b "$JAR" "$BASE/api/auth/session" > "$TMPDIR_RUN/session.json"
  LAST_SENT="login name=$1"; LAST_CODE="-"; LAST_BODY="$(cat "$TMPDIR_RUN/session.json")"
  python3 -c 'import sys,json;d=json.load(open(sys.argv[1]));sys.exit(0 if d and d.get("user") else 1)' "$TMPDIR_RUN/session.json"
}

cleanup() {
  echo "== Cleanup: deleting $USER_NAME"
  ( set -a; . ./.env; set +a
    node -e "
const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();
(async()=>{const u=await p.user.findUnique({where:{name:'$USER_NAME'},select:{id:true,_count:{select:{spellingLists:true}}}});
if(!u){console.log('  nothing to delete');return;}
if(u._count.spellingLists>0){console.log('  NOT deleted: user unexpectedly owns lists');return;}
await p.user.delete({where:{id:u.id}});console.log('  deleted',u.id);})().finally(()=>p.\$disconnect())" )
  rm -rf "$JAR" "$TMPDIR_RUN"
}
trap cleanup EXIT

echo "Base URL: $BASE   test user: $USER_NAME   shell: ${BASH_VERSION:-not bash}"
rm -f "$JAR"; touch "$JAR"   # start without a session

echo "== Sign-up validation (rejected before any DB write)"
check "malformed JSON -> 400"     400 "Invalid request"          /api/auth/signup 'not-json' --allow-invalid-json
check "name too short -> 400"     400 "at least 4 characters"    /api/auth/signup "$(signup_json name abc password Password1 confirmPassword Password1)"
check "name with space -> 400"    400 "only letters and numbers" /api/auth/signup "$(signup_json name 'zz test' password Password1 confirmPassword Password1)"
check "all digits -> 400"         400 "cannot be all numbers"    /api/auth/signup "$(signup_json name 123456 password Password1 confirmPassword Password1)"
check "password 7 chars -> 400"   400 "at least 8 characters"    /api/auth/signup "$(signup_json name "$USER_NAME" password Passwor confirmPassword Passwor)"
check "password 73 bytes -> 400"  400 "maximum 72 bytes"         /api/auth/signup "$(signup_json name "$USER_NAME" password "$LONG73" confirmPassword "$LONG73")"
check "confirm mismatch -> 400"   400 "Passwords do not match"   /api/auth/signup "$(signup_json name "$USER_NAME" password Password1 confirmPassword Password2)"
check "missing parent email -> 400"      400 "Parent email is required"       /api/auth/signup "$(json name "$USER_NAME" confirmParentEmail "$PARENT_EMAIL" password Password1 confirmPassword Password1 acceptedTerms bool:true)"
check "invalid parent email -> 400"      400 "valid email address"            /api/auth/signup "$(signup_json name "$USER_NAME" password Password1 confirmPassword Password1 parentEmail not-an-email confirmParentEmail not-an-email)"
check "parent email mismatch -> 400"     400 "Parent emails do not match"     /api/auth/signup "$(signup_json name "$USER_NAME" password Password1 confirmPassword Password1 confirmParentEmail "other-$PARENT_EMAIL")"
check "acceptedTerms false -> 400"       400 "parent or legal guardian"       /api/auth/signup "$(signup_json name "$USER_NAME" password Password1 confirmPassword Password1 acceptedTerms bool:false)"
check "acceptedTerms missing -> 400"     400 "parent or legal guardian"       /api/auth/signup "$(json name "$USER_NAME" parentEmail "$PARENT_EMAIL" confirmParentEmail "$PARENT_EMAIL" password Password1 confirmPassword Password1)"
check "acceptedTerms as string -> 400"   400 "parent or legal guardian"       /api/auth/signup "$(signup_json name "$USER_NAME" password Password1 confirmPassword Password1 acceptedTerms true)"

echo "== Sign-up success (WRITE: creates $USER_NAME, name sent with spaces to check trimming)"
check "valid sign-up -> 201" 201 "\"name\":\"$USER_NAME\"" /api/auth/signup "$(signup_json name "  $USER_NAME  " password "$PASS1" confirmPassword "$PASS1")"
KEYS=$(printf '%s' "$LAST_BODY" | python3 -c 'import sys,json;print(",".join(sorted(json.load(sys.stdin).keys())))' 2>/dev/null)
[ "$KEYS" = "id,name" ] && pass "sign-up response has only id,name" || fail "sign-up response has only id,name" "$KEYS"
[[ "$LAST_BODY" != *'$2'* ]] && pass "sign-up response has no bcrypt hash" || fail "sign-up response has no bcrypt hash"
[[ "$LAST_BODY" != *"example.com"* ]] && pass "sign-up response does not echo the parent email" || fail "sign-up response does not echo the parent email"
# READ-ONLY: stored consent fields (email compared inside node, never printed)
CONSENT=$( ( set -a; . ./.env; set +a
  node -e "
const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();
(async()=>{const u=await p.user.findUnique({where:{name:'$USER_NAME'},select:{parentEmail:true,parentConsentAt:true,consentVersion:true}});
if(!u){console.log('user-missing');return;}
console.log([u.parentEmail?'email:present':'email:absent', u.parentEmail==='$PARENT_EMAIL_LOWER'?'lowercased:yes':'lowercased:no', u.parentConsentAt?'consentAt:present':'consentAt:absent', 'version:'+u.consentVersion].join(' '));
})().finally(()=>p.\$disconnect())" ) )
[ "$CONSENT" = "email:present lowercased:yes consentAt:present version:2026-10-29" ] && pass "DB: parentEmail stored lower-cased, parentConsentAt + consentVersion set ($CONSENT)" || fail "DB: consent fields stored" "$CONSENT"

echo "== Case-insensitive duplicate"
check "same name, other case -> 400 exists" 400 "already exists" /api/auth/signup "$(signup_json name "$USER_NAME_UPPER" password "$PASS1" confirmPassword "$PASS1")"

echo "== Login & session"
login "$USER_NAME" "$PASS1" && pass "login with exact name" || fail "login with exact name"
SKEYS=$(python3 -c 'import json,sys;print(",".join(sorted(json.load(open(sys.argv[1]))["user"].keys())))' "$TMPDIR_RUN/session.json" 2>/dev/null)
[ "$SKEYS" = "id,name" ] && pass "session.user has only id,name" || fail "session.user has only id,name"
login "$USER_NAME_UPPER" "$PASS1" && pass "login with other case (case-insensitive)" || fail "login with other case (case-insensitive)"
login "$USER_NAME" "wrongpassword" && fail "wrong password rejected" "session created" || pass "wrong password rejected"
login "zz_no_such_user_$RUN_ID" "$PASS1" && fail "unknown user rejected" "session created" || pass "unknown user rejected"

echo "== updateProfile (WRITE: profile + FAKE card for $USER_NAME)"
login "$USER_NAME" "$PASS1" >/dev/null
PROFILE_BODY='{"data":{"firstName":"Zz","lastName":"Test","age":"8-9","grade":"3rd Grade","cardName":"Zz Test","cardNumber":4111111111111111,"cardCVC":123,"expireMonth":"January","expireYear":2030}}'
request PUT /api/auth/updateProfile "$PROFILE_BODY"
UPKEYS=$(printf '%s' "$LAST_BODY" | python3 -c 'import sys,json;print(",".join(sorted(json.load(sys.stdin).keys())))' 2>/dev/null)
[ "$UPKEYS" = "age,firstName,grade,id,lastName,name,profileImage,profileUpdated" ] && pass "updateProfile response has only public fields" || fail "updateProfile response has only public fields"
[[ "$LAST_BODY" == *'"profileUpdated":true'* ]] && pass "updateProfile still reports profileUpdated (CardDetailsForm needs it)" || fail "updateProfile still reports profileUpdated"
request PUT /api/auth/updateProfile 'not-json'
[ "$LAST_CODE" = "400" ] && pass "updateProfile malformed body -> 400" || fail "updateProfile malformed body -> 400"
rm -f "$JAR"; touch "$JAR"   # reset checks run logged out

echo "== Old reset body is rejected (account-takeover hole closed in Batch C)"
check "old { name, password } reset body -> 400" 400 "" /api/auth/resetPassword "$(json name "$USER_NAME" password "$PASS2" confirmPassword "$PASS2")"
login "$USER_NAME" "$PASS1" && pass "password unchanged by the old body (old password still works)" || fail "password unchanged by the old body"
login "$USER_NAME" "$PASS2" && fail "old body did not set the new password" "session created" || pass "old body did not set the new password"
# The full email-based reset flow is tested in docs/test-auth-batch-c.sh

echo
echo "Result: $PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
