import {
  assertArray,
  assertRecord,
  assertString,
  optionalArray,
  optionalBoolean,
  optionalNumber,
  optionalRecord,
  optionalString,
  optionalStringArray,
} from '@/libs/api-validation';

const API_BASE = 'https://api.modario.io';

export type RequestOptions = {
  accessToken: string;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

async function apiRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${options.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = (await response.json()) as { detail?: string; error?: string; message?: string };
      message = data.detail ?? data.error ?? data.message ?? message;
    } catch {
      // Ignore non-JSON response bodies.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

const toTitle = (value: string) =>
  value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const stringOrNull = optionalString;
const numberOrNull = optionalNumber;
const arrayOfStrings = optionalStringArray;

function suggestionArray(value: unknown) {
  return optionalArray(value)
    .map((entry) => optionalRecord(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      text: optionalString(entry.text) ?? '',
      type: optionalString(entry.type) ?? 'note',
    }))
    .filter((entry) => entry.text.length > 0);
}

function assertResponseRecord(payload: unknown, endpoint: string) {
  return assertRecord(payload, `Malformed response from ${endpoint}.`);
}

export type RecommendationCandidate = {
  id: string;
  candidateId: string;
  previewImageUrl: string | null;
  summary: string;
  suggestions: Array<{ text: string; type: string }>;
  tags: string[];
  wardrobeItemIds: string[];
  roles: Array<{ role: string; itemId: string }>;
  score: number | null;
  createdAt: string | null;
};

export type SavedOutfitSummary = {
  id: string;
  name: string;
  previewImageUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SavedOutfitItem = {
  itemId: string;
  role: string;
  wardrobeRole: string | null;
  itemType: string | null;
  color: string | null;
  previewImageUrl: string | null;
  attributes: Record<string, unknown>;
};

export type SavedOutfitDetail = {
  id: string;
  name: string;
  previewImageUrl: string | null;
  summary: string | null;
  suggestions: Array<{ text: string; type: string }>;
  tags: string[];
  items: SavedOutfitItem[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type PlannedOutfit = {
  id: string;
  outfitId: string;
  outfitName: string;
  outfitPreviewImageUrl: string | null;
  plannedDate: string;
  slotIndex: number;
  notes: string;
  reminderState: 'unsupported' | 'requested' | 'none';
  createdAt: string | null;
  updatedAt: string | null;
};

export type WardrobeListItem = {
  id: string;
  role: string;
  itemType: string;
  active: boolean;
  previewImageUrl: string | null;
  colorLabel: string | null;
  attributes: Record<string, unknown>;
};

export type WardrobeItemDetail = {
  id: string;
  role: string;
  itemType: string;
  attributes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  active: boolean;
  sourceImportSessionId: string | null;
  sourceDetectedItemId: string | null;
  imageUrl: string | null;
  imageStatus: string | null;
  imageError: string | null;
  updatedAt: string | null;
  createdAt: string | null;
};

export type ImportDetectedItemReview = {
  detectedItemId: string;
  roleSuggestion: string | null;
  label: string | null;
  confidence: number | null;
  cropImageUrl: string | null;
  attributesPreview: Record<string, unknown>;
};

export type ImportSessionDetail = {
  id: string;
  status: 'uploaded' | 'detecting' | 'review_required' | 'committed' | 'failed' | string;
  lastError: string | null;
  sourceImageUrl: string | null;
  detectedItems: ImportDetectedItemReview[];
  importedCount: number | null;
};

export type BaseAvatarModel = {
  id: string;
  key: string | null;
  displayName: string;
  styleDirection: 'menswear' | 'womenswear' | null;
  skinTonePresetId: string | null;
  skinTonePresetKey: string | null;
  skinTonePresetName: string | null;
  skinToneSortOrder: number | null;
  skinToneIsDefault: boolean;
  bodyTypePresetId: string | null;
  bodyTypePresetKey: string | null;
  bodyTypePresetName: string | null;
  bodyTypeSortOrder: number | null;
  bodyTypeIsDefault: boolean;
  poseKey: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  isDefault: boolean;
  sortOrder: number | null;
  description: string | null;
};

export type CurrentAvatar = {
  id: string | null;
  baseModelId: string | null;
  imageUrl: string | null;
  styleDirection: string | null;
  label: string | null;
};

export type Profile = {
  userId: string | null;
  displayName: string;
  country: string | null;
  locale: string | null;
  timezone: string | null;
  gender: string | null;
  onboardingComplete: boolean;
  onboardingStatus: string | null;
  styleDirection: string | null;
  stylePicks: string[];
  colorLikes: string[];
  colorAvoids: string[];
  occasions: string[];
  avatarImageUrl: string | null;
  avatarLabel: string | null;
};

export type BillingEntitlement = {
  planKey: string | null;
  status: string;
  isEntitled: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  updatedAt: string | null;
};

export type BillingPlan = {
  key: string;
  name: string;
  stripePriceId: string;
  interval: string;
};

export type BillingCheckoutSession = {
  url: string;
};

type RecommendationResponse = {
  recommendations?: Array<{
    id: string;
    wardrobe_item_ids?: string[];
    role_map?: Record<string, [string, string]>;
    score?: string | number;
    llm_summary?: string;
    llm_tags?: string[];
    llm_suggestions?: Array<{ text: string; type: string }>;
    preview_image_url?: string | null;
    created_at?: string;
  }>;
  recommendationss?: RecommendationResponse['recommendations'];
};

function normalizeRecommendation(record: NonNullable<RecommendationResponse['recommendations']>[number]): RecommendationCandidate {
  const roleMap = optionalRecord(record.role_map) ?? {};

  return {
    id: assertString(record.id, 'Recommendation candidate was missing an id.'),
    candidateId: assertString(record.id, 'Recommendation candidate was missing an id.'),
    previewImageUrl: stringOrNull(record.preview_image_url),
    summary: stringOrNull(record.llm_summary) ?? 'A curated outfit recommendation based on your wardrobe.',
    suggestions: suggestionArray(record.llm_suggestions),
    tags: arrayOfStrings(record.llm_tags),
    wardrobeItemIds: arrayOfStrings(record.wardrobe_item_ids),
    roles: Object.entries(roleMap)
      .map(([role, pair]) => ({
        role,
        itemId: Array.isArray(pair) && typeof pair[0] === 'string' ? pair[0] : '',
      }))
      .filter((entry) => Boolean(entry.itemId)),
    score: numberOrNull(record.score),
    createdAt: stringOrNull(record.created_at),
  };
}

function normalizeSavedOutfitSummary(outfit: Record<string, unknown>): SavedOutfitSummary {
  return {
    id: String(outfit.id ?? ''),
    name: stringOrNull(outfit.name) ?? 'Saved outfit',
    previewImageUrl: stringOrNull(outfit.preview_image_url),
    createdAt: stringOrNull(outfit.created_at),
    updatedAt: stringOrNull(outfit.updated_at),
  };
}

function deriveTags(items: SavedOutfitItem[], fallbackTags?: unknown) {
  const backendTags = arrayOfStrings(fallbackTags);
  if (backendTags.length) {
    return backendTags;
  }

  return Array.from(
    new Set(
      items.flatMap((item) => {
        const fashionStyle = item.attributes.fashion_style;
        return Array.isArray(fashionStyle) ? fashionStyle.filter((value): value is string => typeof value === 'string') : [];
      }),
    ),
  ).slice(0, 4);
}

export async function getProfile(accessToken: string) {
  const payload = await apiRequest<unknown>('/me', { accessToken });
  const data = assertResponseRecord(payload, '/me');
  const user = optionalRecord(data.user);
  const onboarding = optionalRecord(data.onboarding);
  const preferences = optionalRecord(data.preferences);
  const styleProfile = optionalRecord(data.style_profile);
  const avatar = optionalRecord(data.avatar);

  return {
    userId: stringOrNull(user?.user_id),
    displayName: stringOrNull(user?.display_name) ?? 'Modario member',
    country: stringOrNull(user?.country_code),
    locale: stringOrNull(user?.locale),
    timezone: stringOrNull(user?.timezone),
    gender: stringOrNull(user?.gender),
    onboardingComplete: optionalBoolean(onboarding?.is_complete) === true,
    onboardingStatus: stringOrNull(onboarding?.status),
    styleDirection: stringOrNull(styleProfile?.style_direction),
    stylePicks: arrayOfStrings(styleProfile?.style_picks),
    colorLikes: arrayOfStrings(preferences?.color_likes),
    colorAvoids: arrayOfStrings(preferences?.color_avoids),
    occasions: arrayOfStrings(preferences?.occasions),
    avatarImageUrl:
      stringOrNull(avatar?.image_url) ?? stringOrNull(avatar?.display_url) ?? stringOrNull(avatar?.preview_image_url),
    avatarLabel: stringOrNull(avatar?.label) ?? stringOrNull(avatar?.name),
  } satisfies Profile;
}

export async function getOutfitRecommendations(accessToken: string) {
  const payload = await apiRequest<unknown>('/outfits/recommendations', { accessToken });
  const data = assertResponseRecord(payload, '/outfits/recommendations');
  const recommendations = optionalArray(data.recommendations).length ? data.recommendations : data.recommendationss;
  const recommendationRows = assertArray(recommendations ?? [], 'Malformed recommendations payload.');
  return recommendationRows.map((row, index) =>
    normalizeRecommendation(assertRecord(row, `Recommendation ${index} was malformed.`) as NonNullable<RecommendationResponse['recommendations']>[number]),
  );
}

export async function saveCandidate(accessToken: string, candidateId: string, name?: string | null) {
  const data = await apiRequest<{ outfit: Record<string, unknown> }>('/candidates/save', {
    accessToken,
    method: 'POST',
    body: {
      candidate_id: candidateId,
      ...(name ? { name } : {}),
    },
  });

  return normalizeSavedOutfitSummary(data.outfit);
}

export async function listSavedOutfits(accessToken: string) {
  const data = await apiRequest<{ outfits: Record<string, unknown>[] }>('/outfits/', { accessToken });
  return (data.outfits ?? []).map(normalizeSavedOutfitSummary);
}

export async function getSavedOutfitDetail(accessToken: string, outfitId: string) {
  const payload = await apiRequest<unknown>(`/outfits/${outfitId}`, { accessToken });
  const data = assertResponseRecord(payload, `/outfits/${outfitId}`);
  const outfit = assertRecord(data.outfit, 'Saved outfit detail was missing outfit data.');
  const itemRows = assertArray(data.items ?? [], 'Saved outfit detail was missing items.');

  const items: SavedOutfitItem[] = itemRows.map((row, index) => {
    const item = assertRecord(row, `Saved outfit item ${index} was malformed.`);
    const attributes = optionalRecord(item.attributes) ?? {};

    return {
      itemId: assertString(item.item_id, `Saved outfit item ${index} was missing an item id.`),
      role: assertString(item.role, `Saved outfit item ${index} was missing a role.`),
      wardrobeRole: stringOrNull(item.wardrobe_role),
      itemType:
        stringOrNull(item.item_type) ??
        (typeof attributes.item_type === 'string' ? attributes.item_type : null),
      color:
        (typeof attributes.color === 'string' ? attributes.color : null) ??
        (typeof attributes.color_base === 'string' ? attributes.color_base : null) ??
        (typeof attributes.color_description === 'string' ? attributes.color_description : null),
      previewImageUrl: stringOrNull(item.preview_image_url),
      attributes,
    };
  });

  return {
    id: String(outfit.id ?? outfitId),
    name: stringOrNull(outfit.name) ?? 'Saved outfit',
    previewImageUrl:
      stringOrNull(outfit.preview_image_url) ?? items.find((item) => item.previewImageUrl)?.previewImageUrl ?? null,
    summary: stringOrNull(outfit.llm_summary),
    suggestions: suggestionArray(outfit.llm_suggestions),
    tags: deriveTags(items, outfit.llm_tags),
    items,
    createdAt: stringOrNull(outfit.created_at),
    updatedAt: stringOrNull(outfit.updated_at),
  } satisfies SavedOutfitDetail;
}

export async function renameSavedOutfit(accessToken: string, outfitId: string, name: string) {
  const data = await apiRequest<{ outfit: Record<string, unknown> }>(`/outfits/${outfitId}`, {
    accessToken,
    method: 'PATCH',
    body: { name },
  });

  return normalizeSavedOutfitSummary(data.outfit);
}

export async function deleteSavedOutfit(accessToken: string, outfitId: string) {
  return apiRequest<{ status: string }>(`/outfits/${outfitId}`, {
    accessToken,
    method: 'DELETE',
  });
}

export async function listPlannedOutfits(accessToken: string, from: string, to: string) {
  const payload = await apiRequest<unknown>('/planned', { accessToken, query: { from, to } });
  const data = assertResponseRecord(payload, '/planned');
  const plannedOutfits = assertArray(data.planned_outfits ?? [], 'Malformed planned outfits payload.');

  return plannedOutfits.map((row, index) => {
    const entry = assertRecord(row, `Planned outfit ${index} was malformed.`);

    return {
      id: assertString(entry.id, `Planned outfit ${index} was missing an id.`),
      outfitId: assertString(entry.outfit_id, `Planned outfit ${index} was missing an outfit id.`),
      outfitName: stringOrNull(entry.outfit_name) ?? 'Planned outfit',
      outfitPreviewImageUrl: stringOrNull(entry.preview_image_url),
      plannedDate: assertString(entry.planned_date, `Planned outfit ${index} was missing a planned date.`),
      slotIndex: typeof entry.slot_index === 'number' ? entry.slot_index : 0,
      notes: stringOrNull(entry.notes) ?? '',
      reminderState:
        entry.reminder_state === 'requested' ? 'requested' : entry.reminder_state === 'none' ? 'none' : 'unsupported',
      createdAt: stringOrNull(entry.created_at),
      updatedAt: stringOrNull(entry.updated_at),
    } satisfies PlannedOutfit;
  });
}

export async function createPlannedOutfit(
  accessToken: string,
  payload: { outfitId: string; plannedDate: string; slotIndex?: number; notes?: string },
) {
  const data = await apiRequest<{ planned_outfit: Record<string, unknown> }>('/planned', {
    accessToken,
    method: 'POST',
    body: {
      outfit_id: payload.outfitId,
      planned_date: payload.plannedDate,
      slot_index: payload.slotIndex ?? 0,
      notes: payload.notes ?? '',
    },
  });

  return {
    id: String(data.planned_outfit.id ?? ''),
    outfitId: String(data.planned_outfit.outfit_id ?? payload.outfitId),
    outfitName: stringOrNull(data.planned_outfit.outfit_name) ?? 'Planned outfit',
    outfitPreviewImageUrl: stringOrNull(data.planned_outfit.preview_image_url),
    plannedDate: String(data.planned_outfit.planned_date ?? payload.plannedDate),
    slotIndex: typeof data.planned_outfit.slot_index === 'number' ? data.planned_outfit.slot_index : payload.slotIndex ?? 0,
    notes: stringOrNull(data.planned_outfit.notes) ?? payload.notes ?? '',
    reminderState: 'unsupported',
    createdAt: stringOrNull(data.planned_outfit.created_at),
    updatedAt: stringOrNull(data.planned_outfit.updated_at),
  } satisfies PlannedOutfit;
}

export async function updatePlannedOutfit(
  accessToken: string,
  planId: string,
  payload: { outfitId: string; slotIndex?: number; notes?: string },
) {
  const data = await apiRequest<{ planned_outfit: Record<string, unknown> }>(`/planned/${planId}`, {
    accessToken,
    method: 'PATCH',
    body: {
      outfit_id: payload.outfitId,
      slot_index: payload.slotIndex ?? 0,
      notes: payload.notes ?? '',
    },
  });

  return {
    id: String(data.planned_outfit.id ?? planId),
    outfitId: String(data.planned_outfit.outfit_id ?? payload.outfitId),
    outfitName: stringOrNull(data.planned_outfit.outfit_name) ?? 'Planned outfit',
    outfitPreviewImageUrl: stringOrNull(data.planned_outfit.preview_image_url),
    plannedDate: String(data.planned_outfit.planned_date ?? ''),
    slotIndex: typeof data.planned_outfit.slot_index === 'number' ? data.planned_outfit.slot_index : payload.slotIndex ?? 0,
    notes: stringOrNull(data.planned_outfit.notes) ?? payload.notes ?? '',
    reminderState: 'unsupported',
    createdAt: stringOrNull(data.planned_outfit.created_at),
    updatedAt: stringOrNull(data.planned_outfit.updated_at),
  } satisfies PlannedOutfit;
}

export async function deletePlannedOutfit(accessToken: string, planId: string) {
  return apiRequest<{ status: string }>(`/planned/${planId}`, {
    accessToken,
    method: 'DELETE',
  });
}

export async function listWardrobeItems(
  accessToken: string,
  options?: { limit?: number; offset?: number; active?: boolean; role?: string },
) {
  const data = await apiRequest<{
    items: Array<{
      id: string;
      role?: string | null;
      item_type?: string | null;
      active?: boolean;
      attributes?: Record<string, unknown>;
      image?: { display_url?: string | null };
      generated_image_path?: string | null;
      primary_image_path?: string | null;
    }>;
  }>('/items', {
    accessToken,
    query: {
      limit: options?.limit ?? 50,
      offset: options?.offset ?? 0,
      active: options?.active ?? true,
      role: options?.role,
    },
  });

  return (data.items ?? []).map(
    (item) =>
      ({
        id: item.id,
        role: stringOrNull(item.role) ?? 'item',
        itemType: stringOrNull(item.item_type) ?? (typeof item.attributes?.item_type === 'string' ? item.attributes.item_type : 'Item'),
        active: item.active ?? true,
        previewImageUrl: stringOrNull(item.image?.display_url) ?? stringOrNull(item.generated_image_path) ?? stringOrNull(item.primary_image_path),
        colorLabel:
          (typeof item.attributes?.color === 'string' ? item.attributes.color : null) ??
          (typeof item.attributes?.color_base === 'string' ? item.attributes.color_base : null) ??
          (typeof item.attributes?.color_description === 'string' ? item.attributes.color_description : null),
        attributes: item.attributes ?? {},
      }) satisfies WardrobeListItem,
  );
}

export async function getWardrobeItemDetail(accessToken: string, itemId: string) {
  const data = await apiRequest<{
    item: {
      id: string;
      role?: string | null;
      item_type?: string | null;
      attributes?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      active?: boolean;
      source_import_session_id?: string | null;
      source_detected_item_id?: string | null;
      image?: { status?: string | null; display_url?: string | null; last_error?: string | null };
      image_status?: string | null;
      image_last_error?: string | null;
      primary_image_path?: string | null;
      generated_image_path?: string | null;
      created_at?: string;
      updated_at?: string;
    };
  }>(`/wardrobe/items/${itemId}`, { accessToken });

  const item = data.item;

  return {
    id: item.id,
    role: stringOrNull(item.role) ?? 'item',
    itemType: stringOrNull(item.item_type) ?? 'Item',
    attributes: item.attributes ?? {},
    metadata: item.metadata ?? {},
    active: item.active ?? true,
    sourceImportSessionId: stringOrNull(item.source_import_session_id),
    sourceDetectedItemId: stringOrNull(item.source_detected_item_id),
    imageUrl: stringOrNull(item.image?.display_url) ?? stringOrNull(item.generated_image_path) ?? stringOrNull(item.primary_image_path),
    imageStatus: stringOrNull(item.image?.status) ?? stringOrNull(item.image_status),
    imageError: stringOrNull(item.image?.last_error) ?? stringOrNull(item.image_last_error),
    updatedAt: stringOrNull(item.updated_at),
    createdAt: stringOrNull(item.created_at),
  } satisfies WardrobeItemDetail;
}

export async function updateWardrobeItem(
  accessToken: string,
  itemId: string,
  payload: Pick<WardrobeItemDetail, 'role' | 'active'> & { itemType?: string; attributes?: Record<string, unknown>; metadata?: Record<string, unknown> },
) {
  await apiRequest<{ item: Record<string, unknown> }>(`/wardrobe/items/${itemId}`, {
    accessToken,
    method: 'PATCH',
    body: {
      role: payload.role,
      item_type: payload.itemType,
      attributes: payload.attributes,
      metadata: payload.metadata,
      active: payload.active,
    },
  });

  return getWardrobeItemDetail(accessToken, itemId);
}

export async function deleteWardrobeItem(accessToken: string, itemId: string) {
  return apiRequest<{ status: string }>(`/wardrobe/items/${itemId}`, {
    accessToken,
    method: 'DELETE',
  });
}

export async function getImportSession(accessToken: string, importSessionId: string) {
  const data = await apiRequest<{
    import_session: { id: string; status: string; last_error?: string | null; imported_count?: number | null };
    source_image?: { storage_url?: string | null };
    detected_items?: Array<{
      detected_item_id: string;
      role_suggestion?: string | null;
      label?: string | null;
      confidence?: number | null;
      crop_storage_url?: string | null;
      attributes_preview?: Record<string, unknown>;
    }>;
    committed_items_count?: number | null;
  }>(`/wardrobe/imports/${importSessionId}`, { accessToken });

  return {
    id: data.import_session.id,
    status: data.import_session.status,
    lastError: stringOrNull(data.import_session.last_error),
    sourceImageUrl: stringOrNull(data.source_image?.storage_url),
    detectedItems: (data.detected_items ?? []).map((item) => ({
      detectedItemId: item.detected_item_id,
      roleSuggestion: stringOrNull(item.role_suggestion),
      label: stringOrNull(item.label),
      confidence: numberOrNull(item.confidence),
      cropImageUrl: stringOrNull(item.crop_storage_url),
      attributesPreview: item.attributes_preview ?? {},
    })),
    importedCount:
      numberOrNull(data.import_session.imported_count) ?? numberOrNull(data.committed_items_count) ?? (data.import_session.status === 'committed' ? (data.detected_items ?? []).length : null),
  } satisfies ImportSessionDetail;
}

export async function commitWardrobeImportReview(
  accessToken: string,
  importSessionId: string,
  decisions: Array<{ detectedItemId: string; include: boolean; roleOverride: string | null }>,
) {
  return apiRequest<{ status?: string; imported_count?: number | null }>(`/wardrobe/imports/${importSessionId}/commit`, {
    accessToken,
    method: 'POST',
    body: {
      decisions: decisions.map((decision) => ({
        detected_item_id: decision.detectedItemId,
        include: decision.include,
        role_override: decision.roleOverride,
      })),
    },
  });
}

export async function listBaseAvatarModels(accessToken: string, styleDirection?: string | null) {
  const data = await apiRequest<{ base_avatars?: unknown[]; base_models?: unknown[]; models?: unknown[] }>('/avatar/base-models', {
    accessToken,
    query: styleDirection ? { style_direction: styleDirection } : undefined,
  });

  const models = (data.base_avatars ?? data.base_models ?? data.models ?? []) as Array<Record<string, unknown>>;

  return models
    .map((model) => {
      const skinTonePreset = (model.skin_tone_preset ?? {}) as Record<string, unknown>;
      const bodyTypePreset = (model.body_type_preset ?? {}) as Record<string, unknown>;
      const styleDirectionValue = typeof model.style_direction === 'string' ? model.style_direction : null;

      return {
        id: String(model.id ?? model.base_model_id ?? ''),
        key: stringOrNull(model.key),
        displayName: String(model.display_name ?? model.name ?? model.label ?? 'Base model'),
        styleDirection: styleDirectionValue === 'menswear' || styleDirectionValue === 'womenswear' ? styleDirectionValue : null,
        skinTonePresetId: stringOrNull(model.skin_tone_preset_id) ?? stringOrNull(skinTonePreset.id),
        skinTonePresetKey: stringOrNull(model.skin_tone_key) ?? stringOrNull(skinTonePreset.key),
        skinTonePresetName:
          stringOrNull(model.skin_tone_name) ?? stringOrNull(skinTonePreset.display_name) ?? stringOrNull(skinTonePreset.name),
        skinToneSortOrder: numberOrNull(model.skin_tone_sort_order) ?? numberOrNull(skinTonePreset.sort_order),
        skinToneIsDefault: Boolean(model.skin_tone_is_default) || Boolean(skinTonePreset.is_default),
        bodyTypePresetId: stringOrNull(model.body_type_preset_id) ?? stringOrNull(bodyTypePreset.id),
        bodyTypePresetKey: stringOrNull(model.body_type_key) ?? stringOrNull(bodyTypePreset.key),
        bodyTypePresetName:
          stringOrNull(model.body_type_name) ?? stringOrNull(bodyTypePreset.display_name) ?? stringOrNull(bodyTypePreset.name),
        bodyTypeSortOrder: numberOrNull(model.body_type_sort_order) ?? numberOrNull(bodyTypePreset.sort_order),
        bodyTypeIsDefault: Boolean(model.body_type_is_default) || Boolean(bodyTypePreset.is_default),
        poseKey: stringOrNull(model.pose_key),
        imagePath: stringOrNull(model.image_path),
        imageUrl: stringOrNull(model.image_url) ?? stringOrNull(model.preview_image_url) ?? stringOrNull(model.display_url),
        isDefault: Boolean(model.is_default),
        sortOrder: numberOrNull(model.sort_order),
        description: stringOrNull(model.description),
      } satisfies BaseAvatarModel;
    })
    .filter((model) => Boolean(model.id));
}

export async function selectBaseAvatar(accessToken: string, baseModelId: string) {
  return apiRequest<{ status?: string }>(`/avatar/base-models/${baseModelId}/select`, {
    accessToken,
    method: 'POST',
  });
}

export async function getCurrentAvatar(accessToken: string) {
  const payload = await apiRequest<unknown>('/avatar/current', { accessToken });
  const data = assertResponseRecord(payload, '/avatar/current');
  const avatar = optionalRecord(data.avatar) ?? optionalRecord(data.current_avatar) ?? data;

  return {
    id: stringOrNull(avatar.id),
    baseModelId: stringOrNull(avatar.base_model_id) ?? stringOrNull(avatar.id),
    imageUrl: stringOrNull(avatar.image_url) ?? stringOrNull(avatar.preview_image_url) ?? stringOrNull(avatar.display_url),
    styleDirection: stringOrNull(avatar.style_direction),
    label: stringOrNull(avatar.name) ?? stringOrNull(avatar.label),
  } satisfies CurrentAvatar;
}

export async function getBillingEntitlement(accessToken: string) {
  const payload = await apiRequest<unknown>('/billing/me', { accessToken });
  const data = assertResponseRecord(payload, '/billing/me');
  const entitlement = assertRecord(data.entitlement, 'Billing entitlement payload was malformed.');

  return {
    planKey: stringOrNull(entitlement.plan_key),
    status: assertString(entitlement.status, 'Billing entitlement was missing a status.'),
    isEntitled: optionalBoolean(entitlement.is_entitled) === true,
    currentPeriodEnd: stringOrNull(entitlement.current_period_end),
    cancelAtPeriodEnd: optionalBoolean(entitlement.cancel_at_period_end) === true,
    updatedAt: stringOrNull(entitlement.updated_at),
  } satisfies BillingEntitlement;
}

export async function getBillingPlans(accessToken: string) {
  const payload = await apiRequest<unknown>('/billing/plans', { accessToken });
  const data = assertResponseRecord(payload, '/billing/plans');
  const plans = assertArray(data.billing_plans ?? [], 'Billing plans payload was malformed.');

  return plans.map((row, index) => {
    const plan = assertRecord(row, `Billing plan ${index} was malformed.`);

    return {
      key: assertString(plan.key, `Billing plan ${index} was missing a key.`),
      name: assertString(plan.name, `Billing plan ${index} was missing a name.`),
      stripePriceId: assertString(plan.stripe_price_id, `Billing plan ${index} was missing a Stripe price id.`),
      interval: assertString(plan.interval, `Billing plan ${index} was missing an interval.`),
    } satisfies BillingPlan;
  });
}

export async function createBillingCheckoutSession(accessToken: string, planKey: string) {
  const payload = await apiRequest<unknown>('/billing/checkout-session', {
    accessToken,
    method: 'POST',
    body: { plan_key: planKey },
  });

  const data = assertResponseRecord(payload, '/billing/checkout-session');

  return {
    url: assertString(data.url, 'Billing checkout response was missing a URL.'),
  } satisfies BillingCheckoutSession;
}

export { apiRequest, toTitle };
