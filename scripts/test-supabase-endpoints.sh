#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_TOKEN:-}" ]]; then
  echo "Error: SUPABASE_TOKEN is required" >&2
  exit 1
fi

base64_decode() {
  local input="$1"
  local rem=$(( ${#input} % 4 ))
  if [[ $rem -gt 0 ]]; then
    input+=$(printf '=%.0s' $(seq 1 $((4-rem))))
  fi
  echo "$input" | tr '_-' '/+' | base64 -d 2>/dev/null || true
}

extract_token_payload() {
  local token="$1"
  local payload
  payload=$(echo "$token" | cut -d'.' -f2)
  base64_decode "$payload"
}

extract_iss_host() {
  local payload="$1"
  echo "$payload" | sed -n 's/.*"iss"[[:space:]]*:[[:space:]]*"https:\/\/\([^\"]*\)\/auth\/v1".*/\1/p' | head -n1
}

extract_exp() {
  local payload="$1"
  echo "$payload" | sed -n 's/.*"exp"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' | head -n1
}

payload_json=$(extract_token_payload "${SUPABASE_TOKEN}")
iss_host=$(extract_iss_host "$payload_json")
exp_unix=$(extract_exp "$payload_json")

if [[ -z "${SUPABASE_URL:-}" ]]; then
  if [[ -n "$iss_host" ]]; then
    SUPABASE_URL="https://${iss_host}"
  else
    SUPABASE_URL="https://bcaajafisvrttvinjfad.supabase.co"
  fi
else
  SUPABASE_URL="${SUPABASE_URL}"
fi

if [[ -n "$exp_unix" ]]; then
  now=$(date +%s)
  if (( exp_unix <= now )); then
    echo "Warning: SUPABASE_TOKEN appears expired (exp=${exp_unix}, now=${now})." >&2
  fi
fi

project_host=${SUPABASE_URL#https://}
project_host=${project_host#http://}
project_host=${project_host%%/*}

if [[ "${FORCE_NO_PROXY:-0}" == "1" ]]; then
  export NO_PROXY="${NO_PROXY:-},${project_host}"
  export no_proxy="${no_proxy:-},${project_host}"
fi

CURL_COMMON=(curl -sS --max-time "${CURL_TIMEOUT_SECONDS:-20}")
if [[ "${CURL_VERBOSE:-0}" == "1" ]]; then
  CURL_COMMON+=( -v )
fi

API_KEY_HEADER=()
if [[ -n "${SUPABASE_ANON_KEY:-}" ]]; then
  API_KEY_HEADER=(-H "apikey: ${SUPABASE_ANON_KEY}")
else
  echo "Notice: SUPABASE_ANON_KEY not provided. Some endpoints may reject requests without apikey header." >&2
fi

run_test() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local body="${4:-}"

  local headers=(
    -H "Authorization: Bearer ${SUPABASE_TOKEN}"
    -H "Content-Type: application/json"
  )

  local url="${SUPABASE_URL}${endpoint}"
  local curl_cmd=("${CURL_COMMON[@]}" -X "${method}" "${url}" "${headers[@]}" "${API_KEY_HEADER[@]}" -w "\nHTTP_STATUS:%{http_code}\n")

  if [[ -n "${body}" ]]; then
    curl_cmd+=(--data-raw "${body}")
  fi

  echo "=== ${name} ==="
  echo "${method} ${url}"

  local output
  if ! output=$("${curl_cmd[@]}" 2>&1); then
    echo "Result: NETWORK_ERROR"
    echo "Details: ${output}"
    echo
    return 0
  fi

  local status
  status=$(echo "${output}" | sed -n 's/^HTTP_STATUS://p' | tail -n 1)
  local response
  response=$(echo "${output}" | sed '/^HTTP_STATUS:/d')

  echo "Status: ${status}"
  echo "Response:"
  echo "${response}" | head -c 700
  echo
  echo
}

echo "Using Supabase URL: ${SUPABASE_URL}"
echo "Project host: ${project_host}"
if [[ "${FORCE_NO_PROXY:-0}" == "1" ]]; then
  echo "NO_PROXY override enabled for host ${project_host}"
fi

echo

run_test "Auth user" "GET" "/auth/v1/user"
run_test "Onboarding bundle (GET)" "GET" "/functions/v1/get-onboarding-bundle?gender=female&skin_tone=medium&body_type=average"
run_test "Onboarding bundle (POST)" "POST" "/functions/v1/get-onboarding-bundle" '{"style_direction":"womenswear"}'
run_test "Process onboarding" "POST" "/functions/v1/process-onboarding" '{}'
run_test "Onboarding states table" "GET" "/rest/v1/onboarding_states?select=*&limit=1"
run_test "User profiles table" "GET" "/rest/v1/user_profiles?select=*&limit=1"
run_test "User images table" "GET" "/rest/v1/user_images?select=*&limit=1"
