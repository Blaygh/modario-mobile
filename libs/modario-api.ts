const API_BASE = 'https://api.modario.io';

type RequestOptions = {
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
      // Keep fallback message when the response body is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export type OutfitRecommendation = {
  id: string;
  candidateId: string;
  previewImageUrl: string | null;
  summary: string;
  tags: string[];
  suggestions: Array<{ text: string; type: string }>;
  wardrobeItemIds: string[];
  roles: Array<{
    role: string;
    itemId: string;
  }>;
  score: number | null;
  createdAt: string | null;
};

export type SavedOutfitSummary = {
  id: string;
  name: string;
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
  createdAt: string | null;
  updatedAt: string | null;
  items: SavedOutfitItem[];
  previewImageUrl: string | null;
  tags: string[];
};

export type PlannedOutfit = {
  id: string;
  outfitId: string;
  plannedDate: string;
  slotIndex: number;
  notes: string;
  outfitName: string;
  createdAt: string | null;
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

export type ImportSessionDetail = {
  id: string;
  status: string;
  lastError: string | null;
  sourceImageUrl: string | null;
  detectedItems: Array<{
    detectedItemId: string;
    roleSuggestion: string | null;
    label: string | null;
    confidence: number | null;
    cropImageUrl: string | null;
    attributesPreview: Record<string, unknown>;
  }>;
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

type OutfitRecommendationResponse = {
  recommendations?: Array<{
    id: string;
    wardrobe_item_ids?: string[];
    role_map?: Record<string, [string, string]>;
    score?: string;
    llm_summary?: string;
    llm_tags?: string[];
    llm_suggestions?: Array<{ text: string; type: string }>;
    preview_image_url?: string | null;
    created_at?: string;
  }>;
  recommendationss?: OutfitRecommendationResponse['recommendations'];
};

function normalizeRecommendation(record: NonNullable<OutfitRecommendationResponse['recommendations']>[number]): OutfitRecommendation {
  const roleMap = record.role_map ?? {};
  const roles = Object.entries(roleMap)
    .map(([role, [itemId]]) => ({ role, itemId }))
    .filter((entry) => Boolean(entry.itemId));

  return {
    id: record.id,
    candidateId: record.id,
    previewImageUrl: record.preview_image_url ?? null,
    summary: record.llm_summary ?? 'A curated outfit recommendation based on your wardrobe.',
    tags: (record.llm_tags ?? []).filter(Boolean),
    suggestions: record.llm_suggestions ?? [],
    wardrobeItemIds: (record.wardrobe_item_ids ?? []).filter(Boolean),
    roles,
    score: record.score ? Number(record.score) : null,
    createdAt: record.created_at ?? null,
  };
}

export async function getOutfitRecommendations(accessToken: string) {
  const data = await apiRequest<OutfitRecommendationResponse>('/outfits/recommendations', { accessToken });
  const recommendations = data.recommendations ?? data.recommendationss ?? [];
  return recommendations.map(normalizeRecommendation);
}

export async function saveCandidate(accessToken: string, candidateId: string, name?: string | null) {
  const data = await apiRequest<{
    outfit: { id: string; name: string | null; created_at?: string; updated_at?: string };
  }>('/candidates/save', {
    accessToken,
    method: 'POST',
    body: {
      candidate_id: candidateId,
      ...(name ? { name } : {}),
    },
  });

  return {
    id: data.outfit.id,
    name: data.outfit.name ?? 'Saved outfit',
    createdAt: data.outfit.created_at ?? null,
    updatedAt: data.outfit.updated_at ?? null,
  } satisfies SavedOutfitSummary;
}

export async function listSavedOutfits(accessToken: string) {
  const data = await apiRequest<{
    outfits: Array<{ id: string; name: string | null; created_at?: string; updated_at?: string }>;
  }>('/outfits/', { accessToken });

  return data.outfits.map(
    (outfit) =>
      ({
        id: outfit.id,
        name: outfit.name ?? 'Saved outfit',
        createdAt: outfit.created_at ?? null,
        updatedAt: outfit.updated_at ?? null,
      }) satisfies SavedOutfitSummary,
  );
}

export async function getSavedOutfitDetail(accessToken: string, outfitId: string) {
  const data = await apiRequest<{
    outfit: { id: string; name: string | null; created_at?: string; updated_at?: string };
    items: Array<{
      item_id: string;
      role: string;
      wardrobe_role?: string | null;
      item_type?: string | null;
      preview_image_url?: string | null;
      attributes?: Record<string, unknown>;
    }>;
  }>(`/outfits/${outfitId}`, { accessToken });

  const items = data.items.map(
    (item) =>
      ({
        itemId: item.item_id,
        role: item.role,
        wardrobeRole: item.wardrobe_role ?? null,
        itemType: item.item_type ?? (typeof item.attributes?.item_type === 'string' ? item.attributes.item_type : null),
        color:
          (typeof item.attributes?.color_base === 'string' ? item.attributes.color_base : null) ??
          (typeof item.attributes?.color_description === 'string' ? item.attributes.color_description : null),
        previewImageUrl: item.preview_image_url ?? null,
        attributes: item.attributes ?? {},
      }) satisfies SavedOutfitItem,
  );

  const derivedTags = Array.from(
    new Set(
      items
        .flatMap((item) => {
          const styles = item.attributes?.fashion_style;
          return Array.isArray(styles) ? styles.filter((value): value is string => typeof value === 'string') : [];
        })
        .slice(0, 4),
    ),
  );

  return {
    id: data.outfit.id,
    name: data.outfit.name ?? 'Saved outfit',
    createdAt: data.outfit.created_at ?? null,
    updatedAt: data.outfit.updated_at ?? null,
    items,
    previewImageUrl: items.find((item) => item.previewImageUrl)?.previewImageUrl ?? null,
    tags: derivedTags,
  } satisfies SavedOutfitDetail;
}

export async function deleteSavedOutfit(accessToken: string, outfitId: string) {
  return apiRequest<{ status: string }>(`/outfits/${outfitId}`, {
    accessToken,
    method: 'DELETE',
  });
}

export async function listPlannedOutfits(accessToken: string, from: string, to: string) {
  const data = await apiRequest<{
    planned_outfits: Array<{
      id: string;
      outfit_id: string;
      planned_date: string;
      slot_index?: number;
      notes?: string | null;
      created_at?: string;
      outfit_name?: string | null;
    }>;
  }>('/planned', { accessToken, query: { from, to } });

  return data.planned_outfits.map(
    (entry) =>
      ({
        id: entry.id,
        outfitId: entry.outfit_id,
        plannedDate: entry.planned_date,
        slotIndex: entry.slot_index ?? 0,
        notes: entry.notes ?? '',
        outfitName: entry.outfit_name ?? 'Planned outfit',
        createdAt: entry.created_at ?? null,
      }) satisfies PlannedOutfit,
  );
}

export async function createPlannedOutfit(
  accessToken: string,
  payload: { outfitId: string; plannedDate: string; slotIndex?: number; notes?: string },
) {
  const data = await apiRequest<{
    planned_outfit: { id: string; outfit_id: string; planned_date: string; slot_index?: number; notes?: string | null; created_at?: string };
  }>('/planned', {
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
    id: data.planned_outfit.id,
    outfitId: data.planned_outfit.outfit_id,
    plannedDate: data.planned_outfit.planned_date,
    slotIndex: data.planned_outfit.slot_index ?? 0,
    notes: data.planned_outfit.notes ?? '',
    outfitName: 'Planned outfit',
    createdAt: data.planned_outfit.created_at ?? null,
  } satisfies PlannedOutfit;
}

export async function updatePlannedOutfit(
  accessToken: string,
  planId: string,
  payload: { outfitId: string; slotIndex?: number; notes?: string },
) {
  const data = await apiRequest<{
    planned_outfit: { id: string; outfit_id: string; planned_date: string; slot_index?: number; notes?: string | null; created_at?: string };
  }>(`/planned/${planId}`, {
    accessToken,
    method: 'PATCH',
    body: {
      outfit_id: payload.outfitId,
      slot_index: payload.slotIndex ?? 0,
      notes: payload.notes ?? '',
    },
  });

  return {
    id: data.planned_outfit.id,
    outfitId: data.planned_outfit.outfit_id,
    plannedDate: data.planned_outfit.planned_date,
    slotIndex: data.planned_outfit.slot_index ?? 0,
    notes: data.planned_outfit.notes ?? '',
    outfitName: 'Planned outfit',
    createdAt: data.planned_outfit.created_at ?? null,
  } satisfies PlannedOutfit;
}

export async function deletePlannedOutfit(accessToken: string, planId: string) {
  return apiRequest<{ status: string }>(`/planned/${planId}`, {
    accessToken,
    method: 'DELETE',
  });
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
      image?: {
        status?: string | null;
        display_url?: string | null;
        last_error?: string | null;
      };
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
    role: item.role ?? 'item',
    itemType: item.item_type ?? 'Item',
    attributes: item.attributes ?? {},
    metadata: item.metadata ?? {},
    active: item.active ?? true,
    sourceImportSessionId: item.source_import_session_id ?? null,
    sourceDetectedItemId: item.source_detected_item_id ?? null,
    imageUrl: item.image?.display_url ?? item.generated_image_path ?? item.primary_image_path ?? null,
    imageStatus: item.image?.status ?? item.image_status ?? null,
    imageError: item.image?.last_error ?? item.image_last_error ?? null,
    updatedAt: item.updated_at ?? null,
    createdAt: item.created_at ?? null,
  } satisfies WardrobeItemDetail;
}

export async function updateWardrobeItem(
  accessToken: string,
  itemId: string,
  payload: Pick<WardrobeItemDetail, 'role' | 'itemType' | 'attributes' | 'metadata' | 'active'>,
) {
  const data = await apiRequest<{ item: Record<string, unknown> }>(`/wardrobe/items/${itemId}`, {
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

  return getWardrobeItemDetail(accessToken, String(data.item.id ?? itemId));
}

export async function archiveWardrobeItem(accessToken: string, itemId: string) {
  return apiRequest<{ status: string }>(`/wardrobe/items/${itemId}`, {
    accessToken,
    method: 'DELETE',
  });
}

export async function getImportSession(accessToken: string, importSessionId: string) {
  const data = await apiRequest<{
    import_session: { id: string; status: string; last_error?: string | null };
    source_image?: { storage_url?: string | null };
    detected_items?: Array<{
      detected_item_id: string;
      role_suggestion?: string | null;
      label?: string | null;
      confidence?: number | null;
      crop_storage_url?: string | null;
      attributes_preview?: Record<string, unknown>;
    }>;
  }>(`/wardrobe/imports/${importSessionId}`, { accessToken });

  return {
    id: data.import_session.id,
    status: data.import_session.status,
    lastError: data.import_session.last_error ?? null,
    sourceImageUrl: data.source_image?.storage_url ?? null,
    detectedItems: (data.detected_items ?? []).map((item) => ({
      detectedItemId: item.detected_item_id,
      roleSuggestion: item.role_suggestion ?? null,
      label: item.label ?? null,
      confidence: item.confidence ?? null,
      cropImageUrl: item.crop_storage_url ?? null,
      attributesPreview: item.attributes_preview ?? {},
    })),
  } satisfies ImportSessionDetail;
}

export async function listBaseAvatarModels(accessToken: string, styleDirection?: string | null) {
  const data = await apiRequest<{
    base_avatars?: unknown[];
    base_models?: unknown[];
    models?: unknown[];
  }>('/avatar/base-models', {
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
        key: typeof model.key === 'string' ? model.key : null,
        displayName: String(model.display_name ?? model.name ?? model.label ?? 'Base model'),
        styleDirection: styleDirectionValue === 'menswear' || styleDirectionValue === 'womenswear' ? styleDirectionValue : null,
        skinTonePresetId:
          (typeof model.skin_tone_preset_id === 'string' ? model.skin_tone_preset_id : null) ??
          (typeof skinTonePreset.id === 'string' ? skinTonePreset.id : null),
        skinTonePresetKey:
          (typeof model.skin_tone_key === 'string' ? model.skin_tone_key : null) ??
          (typeof skinTonePreset.key === 'string' ? skinTonePreset.key : null),
        skinTonePresetName:
          (typeof model.skin_tone_name === 'string' ? model.skin_tone_name : null) ??
          (typeof skinTonePreset.display_name === 'string' ? skinTonePreset.display_name : null) ??
          (typeof skinTonePreset.name === 'string' ? skinTonePreset.name : null),
        skinToneSortOrder:
          (typeof model.skin_tone_sort_order === 'number' ? model.skin_tone_sort_order : null) ??
          (typeof skinTonePreset.sort_order === 'number' ? skinTonePreset.sort_order : null),
        skinToneIsDefault:
          Boolean(model.skin_tone_is_default) || Boolean(skinTonePreset.is_default),
        bodyTypePresetId:
          (typeof model.body_type_preset_id === 'string' ? model.body_type_preset_id : null) ??
          (typeof bodyTypePreset.id === 'string' ? bodyTypePreset.id : null),
        bodyTypePresetKey:
          (typeof model.body_type_key === 'string' ? model.body_type_key : null) ??
          (typeof bodyTypePreset.key === 'string' ? bodyTypePreset.key : null),
        bodyTypePresetName:
          (typeof model.body_type_name === 'string' ? model.body_type_name : null) ??
          (typeof bodyTypePreset.display_name === 'string' ? bodyTypePreset.display_name : null) ??
          (typeof bodyTypePreset.name === 'string' ? bodyTypePreset.name : null),
        bodyTypeSortOrder:
          (typeof model.body_type_sort_order === 'number' ? model.body_type_sort_order : null) ??
          (typeof bodyTypePreset.sort_order === 'number' ? bodyTypePreset.sort_order : null),
        bodyTypeIsDefault:
          Boolean(model.body_type_is_default) || Boolean(bodyTypePreset.is_default),
        poseKey: typeof model.pose_key === 'string' ? model.pose_key : null,
        imagePath: typeof model.image_path === 'string' ? model.image_path : null,
        imageUrl:
          (typeof model.image_url === 'string' ? model.image_url : null) ??
          (typeof model.preview_image_url === 'string' ? model.preview_image_url : null) ??
          (typeof model.display_url === 'string' ? model.display_url : null),
        isDefault: Boolean(model.is_default),
        sortOrder: typeof model.sort_order === 'number' ? model.sort_order : null,
        description: typeof model.description === 'string' ? model.description : null,
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
  const data = await apiRequest<Record<string, unknown>>('/avatar/current', { accessToken });
  const avatar = (data.avatar ?? data.current_avatar ?? data) as Record<string, unknown>;

  return {
    id: typeof avatar.id === 'string' ? avatar.id : null,
    baseModelId:
      (typeof avatar.base_model_id === 'string' ? avatar.base_model_id : null) ??
      (typeof avatar.id === 'string' ? avatar.id : null),
    imageUrl:
      (typeof avatar.image_url === 'string' ? avatar.image_url : null) ??
      (typeof avatar.preview_image_url === 'string' ? avatar.preview_image_url : null) ??
      (typeof avatar.display_url === 'string' ? avatar.display_url : null),
    styleDirection: typeof avatar.style_direction === 'string' ? avatar.style_direction : null,
    label: typeof avatar.name === 'string' ? avatar.name : typeof avatar.label === 'string' ? avatar.label : null,
  } satisfies CurrentAvatar;
}

export async function listWardrobeItems(
  accessToken: string,
  options?: { limit?: number; offset?: number; active?: boolean; role?: string },
) {
  const query = new URLSearchParams({
    limit: String(options?.limit ?? 50),
    offset: String(options?.offset ?? 0),
    active: String(options?.active ?? true),
  });

  if (options?.role) {
    query.set('role', options.role);
  }

  return apiRequest<{
    items: Array<{
      id: string;
      role?: string | null;
      item_type?: string | null;
      attributes?: Record<string, unknown>;
      image?: { display_url?: string | null };
    }>;
  }>(`/items?${query.toString()}`, { accessToken });
}
