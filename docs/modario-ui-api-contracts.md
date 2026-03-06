# Modario App Services — Reconstructed API Contracts for UI Team

This document is a best-effort reconstructed API catalog based on the current architecture and implementation details discussed so far. It is intended for the UI team to integrate against the app services.

## Confidence / Scope Notes

This is **not** a code-generated OpenAPI spec. It is reconstructed from the current backend design across auth, onboarding, wardrobe, outfits, billing, and recommendation flows.

- **Confirmed** endpoints are directly referenced in implementation discussions.
- **Derived** endpoints are strongly implied by current flow and data orchestration.
- Some response fields remain implementation-dependent and should be finalized against live code before public release.

---

## 1) Service Map

Current backend shape appears to be:

- Supabase Edge Functions for client-facing onboarding/bundle/orchestration endpoints
- Django app services for auth, billing, wardrobe processing, outfits, and internal async work
- Celery workers for async jobs
- Supabase Storage for avatar references, generated item cutouts, and preview images
- Postgres as system of record

Major domains:

- Auth / sessions
- Onboarding
- Avatar generation
- Wardrobe items + wardrobe imports
- Outfit candidates + generated outfits
- Recommendations
- Billing / subscriptions / entitlements
- User profile / settings

---

## 2) Authentication Conventions

### 2.1 Client Authentication

Hybrid approach:

- Frontend session management via NextAuth.js
- JWT-based backend authentication issued by auth service
- Some client-facing routes may rely on Supabase auth context for Edge Functions

### 2.2 Internal Service Authentication

- HMAC-based internal signing headers
- Internal tokens/shared secrets for trusted callbacks

### 2.3 Common Headers

**Client-authenticated requests**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Internal callback requests**

- `Content-Type: application/json`
- HMAC/internal auth headers

---

## 3) Onboarding Endpoints

### 3.1 Get Onboarding Bundle

**Status:** Confirmed  
**Type:** Supabase Edge Function  
**Route:** `POST /functions/v1/get-onboarding-bundle`

#### Purpose

Returns data required to render onboarding.

#### Request Body

```json
{
  "style_direction": "womenswear",
  "skin_tone": "medium",
  "body_type": "average"
}
```

All fields appear optional.

#### Response

```json
{
  "version": 1,
  "style_cards": [
    {
      "id": "uuid",
      "title": "Minimal neutral casual",
      "intent": "onboarding",
      "display_order": 1,
      "variant": {
        "card_id": "uuid",
        "variant_key": "female_medium_default",
        "img_url": "https://...",
        "is_default": true
      }
    }
  ],
  "colors": [{ "key": "black", "label": "Black" }],
  "avoid_presets": [{ "key": "no_neons", "label": "Avoid neon colors" }],
  "occasions": [
    { "key": "everyday", "label": "Everyday" },
    { "key": "work", "label": "Work" }
  ]
}
```

---

### 3.2 Submit / Upsert Onboarding State

**Status:** Derived (strongly implied)  
**Type:** Edge function or equivalent app endpoint  
**Likely Route:** `POST /functions/v1/submit-onboarding-state`

#### Purpose

Incrementally saves onboarding selections.

#### Request Body (subset allowed)

```json
{
  "style_direction": "menswear",
  "style_picks": ["card_key_1", "card_key_2"],
  "color_likes": ["black", "white", "burgundy"],
  "color_avoids": ["neon_green"],
  "occasions": ["everyday", "work"],
  "avatar_mode": "base",
  "avatar_image_urls": [],
  "avatar_skin_tone_preset_id": "uuid",
  "avatar_body_type_preset_id": "uuid",
  "avatar_base_model_id": "uuid",
  "is_complete": false
}
```

#### Likely Response

```json
{
  "ok": true,
  "onboarding_state": {
    "user_id": "uuid",
    "status": "saved",
    "is_complete": false,
    "updated_at": "2026-03-05T18:00:00Z"
  }
}
```

---

### 3.3 Process Onboarding

**Status:** Confirmed  
**Type:** Supabase Edge Function  
**Route:** `POST /functions/v1/process-onboarding`

#### Purpose

Triggers asynchronous onboarding processing.

#### Response

```json
{
  "ok": true,
  "processing_request_id": "uuid",
  "status": "queued"
}
```

---

### 3.4 Get Onboarding Status

**Status:** Derived (strongly implied)  
**Likely Route:** `GET /onboarding/state` (or edge variant)

#### Purpose

Polls stage and processing completion.

#### Response

```json
{
  "user_id": "uuid",
  "status": "processing",
  "style_status": "done",
  "avatar_status": "processing",
  "is_complete": true,
  "fully_processed": false,
  "processing_request_id": "uuid",
  "avatar_final_image_url": null,
  "last_error": null,
  "updated_at": "2026-03-05T18:00:00Z",
  "processed_at": null
}
```

---

### 3.5 Onboarding Processing Callback (Internal)

**Status:** Confirmed internal  
**Route:** `POST /functions/v1/onboarding-processing-callback`

Not called by UI.

---

## 4) Avatar Endpoints

### 4.1 List Base Avatar Models

**Status:** Derived (strongly implied)  
**Likely Route:** `GET /avatars/base-models`

### 4.2 Avatar Upload During Onboarding

**Status:** Confirmed flow  
Uploads to Supabase Storage using paths such as:

`avatars/{user_id}/reference/{uuid}.jpg`

---

## 5) Wardrobe Endpoints

### 5.1 Create Wardrobe Import Session

**Status:** Confirmed by flow structure  
**Likely Route:** `POST /wardrobe/imports`

### 5.2 Get Wardrobe Import Session

**Status:** Derived  
**Likely Route:** `GET /wardrobe/imports/{import_session_id}`

### 5.3 Confirm Detected Items

**Status:** Derived (strongly implied)  
**Likely Route:** `POST /wardrobe/imports/{import_session_id}/confirm`

### 5.4 List Wardrobe Items

**Status:** Confirmed contract shape  
**Likely Route:** `GET /wardrobe/items`

### 5.5 Update Wardrobe Item

**Status:** Derived  
**Likely Route:** `PATCH /wardrobe/items/{item_id}`

### 5.6 Delete/Archive Wardrobe Item

**Status:** Derived  
**Likely Route:** `DELETE /wardrobe/items/{item_id}`

---

## 6) Outfits / Candidates / Planning Endpoints

### 6.1 Trigger Outfit Generation

**Status:** Derived (strongly implied)  
**Likely Route:** `POST /outfits/generate`

### 6.2 List Outfit Candidates

**Status:** Confirmed by schema support  
**Likely Route:** `GET /outfit-candidates`

### 6.3 List Final Outfits

**Status:** Confirmed by outfits table + promotion flow  
**Likely Route:** `GET /outfits`

### 6.4 Outfit Details

**Status:** Derived  
**Likely Route:** `GET /outfits/{outfit_id}`

### 6.5 Save / Rename Outfit

**Status:** Derived  
**Likely Route:** `PATCH /outfits/{outfit_id}`

### 6.6 Delete Outfit

**Status:** Derived  
**Likely Route:** `DELETE /outfits/{outfit_id}`

### 6.7 Plan Outfit

**Status:** Derived  
**Likely Routes:**

- `POST /outfits/{outfit_id}/plan`
- `GET /outfit-plans`
- `DELETE /outfit-plans/{plan_id}`

---

## 7) Recommendation Endpoints

### 7.1 Get Recommendations

**Status:** Derived from recommendation pipeline  
**Likely Route:** `GET /recommendations`

Supports item or outfit recommendation views.

---

## 8) Billing / Entitlements Endpoints

### 8.1 Create Checkout Session

**Status:** Confirmed  
**Route:** `POST /billing/checkout-session`

### 8.2 Stripe Webhook

**Status:** Confirmed internal  
**Route:** `POST /stripe/webhook`

### 8.3 Get Subscription / Entitlements

**Status:** Derived (strongly implied)  
**Likely Route:** `GET /billing/subscription`

---

## 9) Auth Endpoints (Derived)

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

---

## 10) Profile Endpoints (Derived)

- `GET /profile`
- `PATCH /profile`

---

## 11) Core Domain DTOs

### Item DTO (derived)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "role": "top",
  "item_type": "shirt",
  "attributes": { "color": "white", "style": ["minimal"], "img_url": "https://..." },
  "active": true,
  "metadata": {},
  "generated_image_path": "path/to/cutout.png"
}
```

### Candidate DTO (derived)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "wardrobe_item_ids": ["uuid"],
  "role_map": { "top": ["uuid", "https://..."] },
  "score": 0.77,
  "is_complete": false,
  "missing_roles": ["bottom", "shoes"],
  "preview_image_url": null,
  "created_at": "..."
}
```

### Outfit DTO (derived)

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "wardrobe_item_ids": ["uuid", "uuid"],
  "is_complete": true,
  "preview_image_url": "https://...",
  "llm_summary": "...",
  "source": "generated",
  "created_at": "...",
  "updated_at": "..."
}
```

---

## 12) Enum Reference

- `style_direction`: `womenswear | menswear`
- `avatar_mode`: `upload | base | skip`
- onboarding `status`: `saved | queued | processing | done | failed`

Outfit generation behavior (current known):

- start at 2 active wardrobe items
- 2–4: generate on each change
- 5+: generate when delta since last run is at least 3

---

## 13) Suggested UI Integration Order

1. Auth/session + onboarding bundle/save/process/status
2. Wardrobe import create/poll/review/confirm + wardrobe list
3. Outfit generation/candidates/outfits/details/planning
4. Billing checkout + entitlement-driven UI gating + recommendations

---

## 14) Pending Backend Confirmation

- Exact route names for wardrobe CRUD / outfits / planning / recommendations
- Exact auth payload shapes
- Which client routes are Edge Functions vs Django
- Final profile/settings response shapes

---

## 15) Recommended Next Step

Promote this to a backend-owned source of truth:

1. OpenAPI spec (preferred), or
2. versioned UI integration contract covering only client-facing endpoints.
