# Modario Mobile

Modario Mobile is the Expo/React Native client for a premium editorial fashion experience built around one honest launch loop:

**Auth → onboarding → wardrobe import → wardrobe browse/detail/edit → live outfit recommendations → save → plan.**

This release candidate prioritizes backend-owned truth, production-safe UX, and reliable wardrobe-centered usefulness over broad but incomplete surface area.

## Product scope

### Launch loop
- Supabase-authenticated session bootstrap with backend-authoritative onboarding gating.
- Incremental onboarding persistence backed by `public.onboarding_states` plus `/me` bootstrap truth.
- Avatar onboarding with gallery/camera uploads or base-model selection.
- Wardrobe import via signed Supabase Storage uploads and exact import-session polling.
- Live wardrobe item detail/edit/archive flows.
- Live outfit recommendations, saved outfits, and planner persistence.
- Billing plan display plus checkout initiation and return-state refresh.

### Surfaces intentionally reduced for honesty
- Discover remains an editorial preview until live commerce/personalized ranking is ready.
- Notification preference toggles are hidden until there is a real persistence contract.
- Subscription management/cancellation is hidden until backend support exists.

## Architecture overview

### Stack
- Expo Router
- React Native
- React Query
- Supabase Auth
- Supabase Storage
- Supabase Edge Functions
- Premium editorial fashion design system in `components/custom/mvp-ui.tsx`

### Source of truth by domain
- **Auth/session:** Supabase auth session.
- **Routing/bootstrap:** `/me` + `onboarding_states` via the onboarding provider.
- **Onboarding:** backend-owned state, AsyncStorage cache only for boot smoothing/offline continuity.
- **Wardrobe:** backend-owned API + storage uploads.
- **Recommendations / saved outfits / planner / billing:** backend-owned API state.
- **Discover:** intentionally marked editorial/static until backend truth is ready.

### Important directories
- `app/` – Expo Router screens.
- `provider/` – auth and onboarding bootstrap/gating providers.
- `hooks/` – React Query hooks and query-key conventions.
- `libs/` – API clients, runtime validation, Supabase utilities, and telemetry abstraction.
- `docs/` – frontend integration docs and supporting notes.
- `scripts/` – smoke-test scripts for bootstrap, onboarding, wardrobe/outfits/planner, and billing.

## Environment variables

Create an `.env` or `.env.local` file with the following public variables for Expo:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-or-anon-key>
```

### Notes
- Production builds require a valid HTTPS Supabase URL.
- The client falls back to placeholder values only in non-production environments.
- The backend API base is currently hardcoded to `https://api.modario.io` in `libs/modario-api.ts` and `libs/onboarding-service.ts`.

## Supabase setup

### Authentication
- Enable the auth providers required by the product (email OTP and Google if used in your environment).
- Ensure the Expo app callback/deep link configuration matches the configured auth redirect URIs.
- On sign-out, the app clears user-scoped onboarding cache and React Query state.

### Storage buckets used by the app
- `avatars`
  - Stores onboarding avatar reference uploads.
  - Uploads use signed upload URLs.
- `wardrobe`
  - Stores wardrobe import images.
  - Uploads use signed upload URLs.

### Required database/backend assumptions
- `public.onboarding_states` exists and is readable/writable for the authenticated user through RLS.
- `public.user_profiles` exists and can be upserted by the authenticated user.
- `public.user_images` exists for avatar reference tracking.
- Edge Function `process-onboarding` is deployed.

## Backend contract expectations

Canonical frontend-facing contract notes live in:

- `docs/modario-ui-api-contracts.md`

High-value endpoints currently used by the client:

### Bootstrap / onboarding
- `GET /me`
- Supabase query to `public.onboarding_states`
- `POST /functions/v1/get-onboarding-bundle`
- `POST /functions/v1/process-onboarding`

### Wardrobe
- `POST /wardrobe/imports`
- `GET /wardrobe/imports/{id}`
- `POST /wardrobe/imports/{id}/commit`
- `GET /items`
- `GET /wardrobe/items/{id}`
- `PATCH /wardrobe/items/{id}`
- `DELETE /wardrobe/items/{id}`

### Outfits / planner
- `GET /outfits/recommendations`
- `POST /candidates/save`
- `GET /outfits/`
- `GET /outfits/{id}`
- `PATCH /outfits/{id}`
- `DELETE /outfits/{id}`
- `GET /planned`
- `POST /planned`
- `PATCH /planned/{plan_id}`
- `DELETE /planned/{plan_id}`

### Billing
- `GET /billing/me`
- `GET /billing/plans`
- `POST /billing/checkout-session`

## Local development

### Install dependencies
```bash
npm install
```

### Start Expo
```bash
npm run start
```

### Helpful variants
```bash
npm run web
npm run web:offline -- --port 8081
npm run ios
npm run android
```

## Quality gates

Run these before merging:

```bash
npm run lint
npm run typecheck
npm run smoke:bootstrap
npm run smoke:onboarding
npm run smoke:wardrobe
npm run smoke:billing
```

## Release steps

1. Confirm environment variables point to the correct Supabase project.
2. Confirm the target backend environment is serving the expected API contract.
3. Run all quality gates locally/CI.
4. Verify Android/iOS app config, icons, permissions, and deep links.
5. Perform the smoke checklist below on a signed-in test account.
6. Cut the release build only after passing the QA checklist.

## Smoke-test checklist

### Auth + bootstrap
- Sign in on a fresh install.
- Verify backend-authoritative routing lands in onboarding when `onboarding.is_complete = false`.
- Verify routing lands in tabs when `onboarding.is_complete = true`.
- Sign out and confirm previous-user state does not leak.

### Onboarding
- Complete onboarding using **Upload photos**, **Choose base model**, and **Skip for now** paths.
- Confirm uploaded avatar references persist in backend onboarding state.
- Confirm submit routes directly to Home while processing remains non-blocking.

### Wardrobe
- Import 1 image and 3 images successfully.
- Confirm processing follows the exact import session ID.
- Confirm `review_required` allows include/exclude and role override.
- Confirm archive/restore remains recoverable from the wardrobe archived segment.

### Outfits + planner
- Load recommendations from a populated wardrobe.
- Save a candidate outfit.
- Plan a candidate outfit and verify it auto-saves first.
- Edit planner slot/notes and delete a plan.

### Billing
- Load plans and entitlement.
- Start checkout.
- Verify post-return entitlement refresh on success.
- Verify cancel path remains honest and non-destructive.

## QA checklist

- [ ] No primary CTA appears tappable without a real action.
- [ ] Empty/loading/error/success states are present on core launch-loop screens.
- [ ] Headers remain visually centered.
- [ ] AsyncStorage is not used as the final onboarding truth.
- [ ] Signed upload flows work for avatar and wardrobe images.
- [ ] Saved outfits use live preview images.
- [ ] Planner supports multiple visible slots per day.
- [ ] Discover/editorial surfaces clearly communicate limitations.
- [ ] Legal links resolve correctly.
- [ ] Android/iOS permissions match actual product behavior.

## Rollback / environment notes

- If backend onboarding truth regresses, routing will intentionally fail closed into the bootstrap error UI rather than trusting stale client-only completion flags.
- If billing or discover backend capabilities lag, the client intentionally favors hiding unsupported management/commerce actions over implying incomplete functionality.
