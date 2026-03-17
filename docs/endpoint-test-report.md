# Endpoint Test Report + How to Make It Work

## What was tested
The script tests endpoints used by the app:

- `GET /auth/v1/user`
- `GET /functions/v1/get-onboarding-bundle`
- `POST /functions/v1/get-onboarding-bundle`
- `POST /functions/v1/process-onboarding`
- `GET /rest/v1/onboarding_states`
- `GET /rest/v1/user_profiles`
- `GET /rest/v1/user_images`

## Why it failed in this container
The environment proxy blocked tunnel access to the Supabase host:

- `curl: (56) CONNECT tunnel failed, response 403`
- status `000` for every request

So this environment cannot validate endpoint behavior directly.

## How to make it work (on your machine or CI runner with outbound access)

1. Get a **fresh user access token** (JWT) from login flow.
2. Get your project **publishable/anon key** from Supabase settings.
3. Run:

```bash
SUPABASE_TOKEN='<fresh_access_token>' \
SUPABASE_ANON_KEY='<anon_or_publishable_key>' \
./scripts/test-supabase-endpoints.sh
```

### Helpful options

- Force direct host bypass if your environment proxy breaks CONNECT:

```bash
FORCE_NO_PROXY=1 \
SUPABASE_TOKEN='<fresh_access_token>' \
SUPABASE_ANON_KEY='<anon_or_publishable_key>' \
./scripts/test-supabase-endpoints.sh
```

- Add verbose curl diagnostics:

```bash
CURL_VERBOSE=1 SUPABASE_TOKEN='...' SUPABASE_ANON_KEY='...' ./scripts/test-supabase-endpoints.sh
```

- Override project URL if token `iss` is not parseable:

```bash
SUPABASE_URL='https://<project-ref>.supabase.co' SUPABASE_TOKEN='...' SUPABASE_ANON_KEY='...' ./scripts/test-supabase-endpoints.sh
```

## Script improvements in this revision

- Auto-detects Supabase URL from the JWT `iss` claim.
- Warns when token appears expired (`exp`).
- Supports `FORCE_NO_PROXY=1` to append project host to `NO_PROXY`.
- Supports `CURL_VERBOSE=1` and `CURL_TIMEOUT_SECONDS` for better diagnostics.
- Prints a clear notice when `SUPABASE_ANON_KEY` is missing.
