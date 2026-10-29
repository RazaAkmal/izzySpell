#!/usr/bin/env bash
# Login & Sign-Up hardening, Batch B (card step removed) - end-to-end checks.
#
# DB WRITES (shared production Neon DB, via the app unless noted):
#   1. Creates ONE user named  zztest<RUN_ID>  (sign-up, with a fake email
#      zztest-<RUN_ID>@example.com and consent - required since Batch C)
#   2. Updates that user's profile TWICE via PUT /api/auth/updateProfile
#      (first name/last name/age/grade/profile image + profileUpdated=true). The
#      requests also carry FAKE card fields (test card 4111...) which must be ignored.
#   3. Deletes that user at the end (only that exact name; refuses if it owns lists)
# Rejected requests (400/401) write nothing. Reads of that one user's row are done
# directly with Prisma (read-only SELECT) to check the card columns.
# Nothing else is written. Other zztest* accounts are not touched.
#
# Usage:  bash docs/test-auth-batch-b.sh [BASE_URL]
#   BASE_URL defaults to http://localhost:3000 (npm run dev must be running).
#   Needs: curl, python3, node, and .env in the project root.
#
# JSON bodies are built with python3 json.dumps (macOS bash 3.2 breaks nested quoted JSON).

set -uo pipefail
cd "$(dirname "$0")/.."

BASE="${1:-http://localhost:3000}"
RUN_ID="$(date +%s)$RANDOM"
USER_NAME="zztest${RUN_ID}"
PASS1="Password1"
LONG51="$(printf 'a%.0s' $(seq 1 51))"
EMPTY_BODY='{}'
JAR="$(mktemp)"
TMPDIR_RUN="$(mktemp -d)"
PASSED=0; FAILED=0
LAST_CODE=""; LAST_BODY=""; LAST_SENT=""

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
# profile_body k1 v1 k2 v2 ... -> {"data":{...},"userId":"someone-else"}
# A value written as num:123 becomes a JSON number. No braces are ever typed in the
# shell: macOS bash 3.2 brace-expands {a,b} inside nested "$(...)" and breaks the body.
profile_body() {
  python3 -c '
import json, sys
a = sys.argv[1:]
data = {k: (int(v[4:]) if v.startswith("num:") else v) for k, v in zip(a[0::2], a[1::2])}
print(json.dumps({"data": data, "userId": "someone-else"}, separators=(",", ":")))
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
  LAST_CODE="$(curl -s -m 60 -o "$out" -w "%{http_code}" -X "$1" "$BASE$2" -b "$JAR" \
    -H 'Content-Type: application/json' --data-binary "$3")"
  LAST_BODY="$(cat "$out")"
}

check() { # check <label> <METHOD> <path> <body> <expected_code> <expected_text_in_body>
  request "$2" "$3" "$4"
  if [ "$LAST_CODE" = "$5" ] && [[ "$LAST_BODY" == *"$6"* ]]; then pass "$1"; else fail "$1"; fi
}

login() { # login <name> <password> -> 0 if a session was created
  rm -f "$JAR"; touch "$JAR"
  local csrf; csrf=$(curl -s -c "$JAR" -b "$JAR" "$BASE/api/auth/csrf" | python3 -c 'import sys,json;print(json.load(sys.stdin)["csrfToken"])')
  curl -s -o /dev/null -c "$JAR" -b "$JAR" -X POST "$BASE/api/auth/callback/credentials" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    --data-urlencode "csrfToken=$csrf" --data-urlencode "name=$1" --data-urlencode "password=$2"
  curl -s -b "$JAR" "$BASE/api/auth/session" > "$TMPDIR_RUN/session.json"
  python3 -c 'import sys,json;d=json.load(open(sys.argv[1]));sys.exit(0 if d and d.get("user") else 1)' "$TMPDIR_RUN/session.json"
}

# READ-ONLY: prints this test user's row as JSON (card columns reported as null/"<set>"/"undefined", never values)
db_row() {
  ( set -a; . ./.env; set +a
    node -e "
const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();
(async()=>{const u=await p.user.findUnique({where:{name:'$USER_NAME'},select:{firstName:true,lastName:true,age:true,grade:true,profileImage:true,profileUpdated:true,cardNumber:true,cardName:true,expireMonth:true,expireYear:true,cardCVC:true}});
if(!u){console.log('null');return;}
const mask=v=>v===null?null:(v==='undefined'?'undefined':'<set>');
console.log(JSON.stringify({...u,cardNumber:mask(u.cardNumber),cardName:mask(u.cardName),expireMonth:mask(u.expireMonth),expireYear:mask(u.expireYear),cardCVC:mask(u.cardCVC)}));
})().finally(()=>p.\$disconnect())" )
}

cards_all_null() { # cards_all_null <row json> -> 0 if all five card columns are null
  printf '%s' "$1" | python3 -c 'import sys,json; r=json.load(sys.stdin); sys.exit(0 if all(r[k] is None for k in ["cardNumber","cardName","expireMonth","expireYear","cardCVC"]) else 1)'
}
no_undefined_text() { # 0 if no column holds the text "undefined"
  printf '%s' "$1" | python3 -c 'import sys,json; r=json.load(sys.stdin); sys.exit(0 if "undefined" not in r.values() else 1)'
}
row_field() { printf '%s' "$1" | python3 -c 'import sys,json; print(json.load(sys.stdin)[sys.argv[1]])' "$2"; }

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
rm -f "$JAR"; touch "$JAR"

echo "== Setup (WRITE: creates $USER_NAME)"
check "sign-up -> 201" POST /api/auth/signup "$(json name "$USER_NAME" parentEmail "zztest-${RUN_ID}@example.com" confirmParentEmail "zztest-${RUN_ID}@example.com" password "$PASS1" confirmPassword "$PASS1" acceptedTerms bool:true)" 201 "\"name\":\"$USER_NAME\""
ROW="$(db_row)"
[ "$(row_field "$ROW" profileUpdated)" = "False" ] && pass "new user starts with profileUpdated=false" || fail "new user starts with profileUpdated=false" "$ROW"
cards_all_null "$ROW" && pass "new user has no card data" || fail "new user has no card data" "$ROW"

echo "== Not logged in"
check "updateProfile without session -> 401" PUT /api/auth/updateProfile \
  "$(profile_body firstName Zz lastName Test age 8-9 grade '3rd Grade')" 401 "Not authenticated"

login "$USER_NAME" "$PASS1" && pass "login" || fail "login" "$(cat "$TMPDIR_RUN/session.json")"

echo "== Bad input -> 400 (nothing written)"
check "malformed JSON"           PUT /api/auth/updateProfile 'not-json' 400 "Invalid request"
check "empty body {}"            PUT /api/auth/updateProfile "$EMPTY_BODY" 400 "Invalid request"
check "missing firstName"        PUT /api/auth/updateProfile "$(profile_body lastName Test age 8-9 grade '3rd Grade')" 400 "First name is required"
check "whitespace lastName"      PUT /api/auth/updateProfile "$(profile_body firstName Zz lastName '   ' age 8-9 grade '3rd Grade')" 400 "Last name is required"
check "firstName 51 chars"       PUT /api/auth/updateProfile "$(profile_body firstName "$LONG51" lastName Test age 8-9 grade '3rd Grade')" 400 "at most 50 characters"
check "age not an option"        PUT /api/auth/updateProfile "$(profile_body firstName Zz lastName Test age 5-6 grade '3rd Grade')" 400 "Please select your Age"
check "grade not an option"      PUT /api/auth/updateProfile "$(profile_body firstName Zz lastName Test age 8-9 grade '7th Grade')" 400 "Please select your Grade"
check "age = text 'undefined'"   PUT /api/auth/updateProfile "$(profile_body firstName Zz lastName Test age undefined grade '3rd Grade')" 400 "Please select your Age"
ROW="$(db_row)"
[ "$(row_field "$ROW" profileUpdated)" = "False" ] && [ "$(row_field "$ROW" firstName)" = "None" ] && pass "rejected requests wrote nothing" || fail "rejected requests wrote nothing" "$ROW"

echo "== Valid profile + extra card fields (WRITE: profile only)"
request PUT /api/auth/updateProfile "$(profile_body firstName '  Zz ' lastName Test age 8-9 grade '3rd Grade' profileImage '' \
  cardNumber num:4111111111111111 cardCVC num:123 cardName 'Zz Test' expireMonth January expireYear num:2030)"
[ "$LAST_CODE" = "200" ] && pass "valid profile -> 200" || fail "valid profile -> 200"
KEYS=$(printf '%s' "$LAST_BODY" | python3 -c 'import sys,json;print(",".join(sorted(json.load(sys.stdin).keys())))' 2>/dev/null)
[ "$KEYS" = "age,firstName,grade,id,lastName,name,profileImage,profileUpdated" ] && pass "response has only public fields" || fail "response has only public fields"
[[ "$LAST_BODY" == *'"profileUpdated":true'* ]] && pass "response profileUpdated=true" || fail "response profileUpdated=true"
ROW="$(db_row)"
cards_all_null "$ROW" && pass "DB: all five card columns still NULL" || fail "DB: all five card columns still NULL" "$ROW"
no_undefined_text "$ROW" && pass "DB: no column holds the text \"undefined\"" || fail "DB: no column holds the text \"undefined\"" "$ROW"
[ "$(row_field "$ROW" profileUpdated)" = "True" ] && pass "DB: profileUpdated=true (profile alone completes onboarding)" || fail "DB: profileUpdated=true" "$ROW"
[ "$(row_field "$ROW" firstName)" = "Zz" ] && pass "DB: firstName stored trimmed" || fail "DB: firstName stored trimmed" "$ROW"
[ "$(row_field "$ROW" profileImage)" = "None" ] && pass "DB: empty profileImage stored as NULL" || fail "DB: empty profileImage stored as NULL" "$ROW"

echo "== Edit later via 'My Profile' (WRITE: profile only, no profileImage sent)"
request PUT /api/auth/updateProfile "$(profile_body firstName Edited lastName Test age 9-10 grade '4th Grade' cardNumber 4111)"
[ "$LAST_CODE" = "200" ] && pass "edit -> 200" || fail "edit -> 200"
ROW="$(db_row)"
[ "$(row_field "$ROW" profileUpdated)" = "True" ] && pass "edit keeps profileUpdated=true (no forced card step)" || fail "edit keeps profileUpdated=true" "$ROW"
cards_all_null "$ROW" && pass "edit: card columns still NULL" || fail "edit: card columns still NULL" "$ROW"
no_undefined_text "$ROW" && pass "edit: no column holds the text \"undefined\"" || fail "edit: no \"undefined\" text" "$ROW"
[ "$(row_field "$ROW" firstName)" = "Edited" ] && [ "$(row_field "$ROW" age)" = "9-10" ] && pass "edit: new values stored" || fail "edit: new values stored" "$ROW"

echo
echo "Result: $PASSED passed, $FAILED failed"
[ "$FAILED" -eq 0 ]
