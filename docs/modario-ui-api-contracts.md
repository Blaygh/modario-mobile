# Modario Mobile Frontend Integration Contract

This document is the **canonical frontend integration note** for the mobile client in this repository. It reflects the contracts the current app actually consumes and normalizes.

It is not a generated OpenAPI file. Where the backend may expose richer payloads, this document intentionally describes the subset the mobile app depends on for the release candidate.

## Conventions

- Base API: `https://api.modario.io`
- Auth: `Authorization: Bearer <access_token>`
- Content type: `application/json`
- Supabase is used directly for some authenticated reads/writes and Storage uploads.
- Runtime normalization happens in `libs/onboarding-bundle.ts`, `libs/onboarding-service.ts`, and `libs/modario-api.ts`.

---

## 1. Bootstrap and onboarding

### 1.1 `GET /me`
Used for:
- session-aware bootstrap
- route gating
- profile/account summary
- billing/account refresh side effects

Expected response subset:

```json
{
  "user": {
    "user_id": "uuid",
    "display_name": "Jane",
    "country_code": "US",
    "locale": "en-US",
    "timezone": "America/New_York",
    "gender": "female"
  },
  "onboarding": {
    "is_complete": true,
    "status": "done",
    "processing_request_id": "uuid-or-null",
    "updated_at": "2026-03-20T00:00:00Z"
  },
  "preferences": {
    "color_likes": ["black", "cream"],
    "color_avoids": ["neon_green"],
    "occasions": ["work", "travel"]
  },
  "style_profile": {
    "style_direction": "womenswear",
    "style_picks": ["tailored_minimal", "soft_structure"]
  },
  "avatar": {
    "image_url": "https://...",
    "label": "Soft tailored base"
  }
}
```

### 1.2 `public.onboarding_states`
Read/write is done directly through Supabase for the authenticated user.

Important fields consumed by the app:

```json
{
  "user_id": "uuid",
  "style_direction": "womenswear",
  "style_picks": ["tailored_minimal"],
  "color_likes": ["black"],
  "color_avoids": [],
  "occasions": ["work"],
  "avatar_mode": "upload",
  "avatar_image_urls": ["u_<id>/reference/front.jpg"],
  "avatar_base_model_id": null,
  "avatar_skin_tone_preset_id": null,
  "avatar_body_type_preset_id": null,
  "avatar_final_image_url": null,
  "is_complete": false,
  "status": "saved",
  "style_status": null,
  "avatar_status": "saved",
  "processing_request_id": null,
  "processed_at": null,
  "fully_processed": false,
  "fully_processed_at": null,
  "updated_at": "2026-03-20T00:00:00Z",
  "last_error": null
}
```

### 1.3 `POST /functions/v1/get-onboarding-bundle`
Request subset:

```json
{
  "style_direction": "womenswear"
}
```

Response subsets used by the app:
- `style_cards`
- `colors`
- `avoid_presets`
- `occasions`
- `base_avatar_flow`

The mobile client validates these collections at runtime before rendering onboarding.

### 1.4 `POST /functions/v1/process-onboarding`
Used only after onboarding submit. Processing is non-blocking.

Expected subset:

```json
{
  "ok": true,
  "processing_request_id": "uuid",
  "status": "queued"
}
```

### Routing contract
The app routes using this precedence:
1. no session → auth
2. session + backend onboarding incomplete → onboarding
3. session + backend onboarding complete → tabs

AsyncStorage is cache only, never the final authority.

---

## 2. Avatar flows

### 2.1 Storage uploads
Buckets:
- `avatars`

Upload model:
- create signed upload URL
- upload reference image with signed token
- persist resulting storage path in onboarding state and `user_images`

Expected storage path pattern:

```text
u_<user_id>/reference/<uuid>.<ext>
```

### 2.2 `GET /avatar/base-models`
Used to populate base-model selection. Consumed subset:

```json
{
  "models": [
    {
      "id": "uuid",
      "key": "soft-tailored-default",
      "display_name": "Soft Tailored",
      "style_direction": "womenswear",
      "skin_tone_preset_id": "uuid",
      "skin_tone_preset_key": "medium",
      "skin_tone_preset_name": "Medium",
      "body_type_preset_id": "uuid",
      "body_type_preset_key": "straight",
      "body_type_preset_name": "Straight",
      "image_url": "https://...",
      "is_default": true,
      "sort_order": 1
    }
  ]
}
```

### 2.3 `POST /avatar/base-models/{id}/select`
Used when the user confirms a base avatar model.

### 2.4 `GET /avatar/current`
Used for profile/avatar summary and onboarding continuity.

---

## 3. Wardrobe

### 3.1 Storage uploads
Bucket:
- `wardrobe`

Upload model:
- create signed upload URL
- upload import image using signed token
- send resulting storage paths to import creation endpoint

Expected storage path pattern:

```text
u_<user_id>/imports/<uuid>.<ext>
```

### 3.2 `POST /wardrobe/imports`
Request:

```json
{
  "source_image_urls": [
    "u_<user>/imports/a.jpg",
    "u_<user>/imports/b.jpg"
  ]
}
```

Response subset:

```json
{
  "import_sessions": [
    {
      "id": "uuid",
      "status": "uploaded"
    }
  ]
}
```

### 3.3 `GET /wardrobe/imports/{id}`
The app polls the **exact session ID** created by the user.

Response subset:

```json
{
  "import_session": {
    "id": "uuid",
    "status": "review_required",
    "last_error": null
  },
  "source_image": {
    "storage_url": "u_<user>/imports/a.jpg"
  },
  "detected_items": [
    {
      "detected_item_id": "uuid",
      "role_suggestion": "top",
      "label": "White shirt",
      "confidence": 0.92,
      "crop_storage_url": "https://...",
      "attributes_preview": {
        "color": "white"
      }
    }
  ],
  "imported_count": 2
}
```

Statuses used by the app:
- `uploaded`
- `detecting`
- `review_required`
- `committed`
- `failed`

### 3.4 `POST /wardrobe/imports/{id}/commit`
Request:

```json
{
  "decisions": [
    {
      "detected_item_id": "uuid",
      "include": true,
      "role_override": "top"
    }
  ]
}
```

Response subset:

```json
{
  "status": "committed",
  "imported_count": 2
}
```

### 3.5 `GET /items`
List wardrobe items.

Query params used:
- `limit`
- `offset`
- `active`
- `role`

### 3.6 `GET /wardrobe/items/{id}`
Wardrobe detail source of truth. No mock detail should be mixed with this domain.

Response subset:

```json
{
  "item": {
    "id": "uuid",
    "role": "top",
    "item_type": "shirt",
    "attributes": { "color": "white" },
    "metadata": {},
    "active": true,
    "source_import_session_id": "uuid",
    "source_detected_item_id": "uuid",
    "updated_at": "2026-03-20T00:00:00Z",
    "created_at": "2026-03-20T00:00:00Z"
  },
  "image": {
    "display_url": "https://...",
    "status": "ready",
    "last_error": null
  }
}
```

### 3.7 `PATCH /wardrobe/items/{id}`
Editable subset used by the app:

```json
{
  "role": "outerwear",
  "active": false,
  "item_type": "blazer",
  "attributes": { "color": "beige" },
  "metadata": {}
}
```

### 3.8 `DELETE /wardrobe/items/{id}`
Treated by the app as a real archive/delete action depending on backend semantics. Archived visibility is preserved in the wardrobe UI.

---

## 4. Outfit recommendations and saved outfits

### 4.1 `GET /outfits/recommendations`
Returns recommendation **candidates**, not saved outfits.

Response subset:

```json
{
  "recommendations": [
    {
      "id": "candidate_uuid",
      "wardrobe_item_ids": ["item_1", "item_2"],
      "role_map": {
        "top": ["item_1", "shirt"],
        "bottom": ["item_2", "trouser"]
      },
      "score": 0.89,
      "llm_summary": "Soft tailored layers for work.",
      "llm_tags": ["tailored", "neutral"],
      "llm_suggestions": [
        { "text": "Swap in loafers for a sharper finish.", "type": "styling" }
      ],
      "preview_image_url": "https://...",
      "created_at": "2026-03-20T00:00:00Z"
    }
  ]
}
```

### 4.2 `POST /candidates/save`
Converts a recommendation candidate into a saved outfit.

Request:

```json
{
  "candidate_id": "candidate_uuid",
  "name": "Optional custom name"
}
```

Response subset:

```json
{
  "outfit": {
    "id": "saved_outfit_uuid",
    "name": "Saved outfit",
    "preview_image_url": "https://..."
  }
}
```

### 4.3 `GET /outfits/`
List saved outfits.

### 4.4 `GET /outfits/{id}`
Saved outfit detail response subset:

```json
{
  "outfit": {
    "id": "uuid",
    "name": "Work layers",
    "preview_image_url": "https://...",
    "llm_summary": "Balanced smart-casual look.",
    "llm_tags": ["work", "neutral"],
    "llm_suggestions": [
      { "text": "Add a structured tote.", "type": "styling" }
    ]
  },
  "items": [
    {
      "item_id": "wardrobe_uuid",
      "role": "top",
      "wardrobe_role": "top",
      "item_type": "shirt",
      "preview_image_url": "https://...",
      "attributes": { "color": "white" }
    }
  ]
}
```

### 4.5 `PATCH /outfits/{id}`
Used only for rename:

```json
{
  "name": "New name"
}
```

### 4.6 `DELETE /outfits/{id}`
Deletes the saved outfit.

---

## 5. Planner

### 5.1 `GET /planned`
Query params used:
- `from`
- `to`

Response subset:

```json
{
  "planned_outfits": [
    {
      "id": "plan_uuid",
      "outfit_id": "saved_outfit_uuid",
      "outfit_name": "Work layers",
      "preview_image_url": "https://...",
      "planned_date": "2026-03-20",
      "slot_index": 1,
      "notes": "Client dinner",
      "reminder_state": "none",
      "created_at": "2026-03-20T00:00:00Z",
      "updated_at": "2026-03-20T00:00:00Z"
    }
  ]
}
```

### 5.2 `POST /planned`
Request:

```json
{
  "outfit_id": "saved_outfit_uuid",
  "planned_date": "2026-03-20",
  "slot_index": 0,
  "notes": "Travel day"
}
```

### 5.3 `PATCH /planned/{plan_id}`
Used for updating slot and notes (and resending the outfit ID currently bound to the plan):

```json
{
  "outfit_id": "saved_outfit_uuid",
  "slot_index": 2,
  "notes": "Move to evening slot"
}
```

### 5.4 `DELETE /planned/{plan_id}`
Deletes a plan entry.

Planner assumptions:
- multiple outfits per day are supported using `slot_index`
- reminder state may be present, but delivery is not faked if unsupported

---

## 6. Billing

### 6.1 `GET /billing/me`
Response subset:

```json
{
  "entitlement": {
    "plan_key": "premium_monthly",
    "status": "active",
    "is_entitled": true,
    "current_period_end": "2026-04-20T00:00:00Z",
    "cancel_at_period_end": false,
    "updated_at": "2026-03-20T00:00:00Z"
  }
}
```

### 6.2 `GET /billing/plans`
Response subset:

```json
{
  "billing_plans": [
    {
      "key": "premium_monthly",
      "name": "Premium Monthly",
      "stripe_price_id": "price_123",
      "interval": "month"
    }
  ]
}
```

### 6.3 `POST /billing/checkout-session`
Request:

```json
{
  "plan_key": "premium_monthly"
}
```

Response subset:

```json
{
  "url": "https://checkout.stripe.com/..."
}
```

Post-return app behavior:
- billing success screen invalidates entitlement
- billing UI refreshes live state
- unsupported manage/cancel actions remain hidden

---

## 7. Query-key expectations

React Query keys used by the app:
- `me`
- `onboardingState`
- `onboardingBundle`
- `baseModels`
- `currentAvatar`
- `outfitRecommendations`
- `savedOutfits`
- `savedOutfitDetail`
- `plannedOutfits`
- `wardrobeItems`
- `wardrobeItemDetail`
- `wardrobeImportSession`
- `billingPlans`
- `billingEntitlement`

Mutations invalidate related domain keys so the launch loop remains coherent.

---

## 8. Honesty rules enforced by the frontend

- Backend truth wins for routing and auth-sensitive onboarding decisions.
- Wardrobe detail uses live backend data only.
- Recommendation candidates and saved outfits are treated as separate concepts.
- Candidate planning auto-saves before plan creation.
- Planner reminder delivery is not faked.
- Discover commerce actions stay hidden until they are truly supported.
