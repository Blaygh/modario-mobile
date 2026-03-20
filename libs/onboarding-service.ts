import * as Crypto from 'expo-crypto';

import { supabase } from '@/libs/supabase';
import { getOnboardingBundle, type BaseAvatarFlow, type BundlePreviewModel, type OnboardingBundle } from '@/libs/onboarding-bundle';
import { getMe, type BaseAvatarModel, type MeProfile } from '@/libs/modario-api';
import { saveAvatarReferences, saveOnboardingState, triggerOnboardingProcessing } from '@/libs/onboarding-state';
import type { StyleDirection } from '@/types';

const AVATAR_UPLOAD_BUCKET_CANDIDATES = ['avatars', 'avatar-references', 'user-images', 'user_images', 'wardrobe'] as const;

type OnboardingStatus = 'saved' | 'queued' | 'processing' | 'done' | 'failed';
export type AvatarMode = 'upload' | 'base' | 'skip' | null;

export type OnboardingStateRecord = {
  userId: string;
  styleDirection: StyleDirection;
  stylePicks: string[];
  colorLikes: string[];
  colorAvoids: string[];
  occasions: string[];
  avatarMode: AvatarMode;
  avatarImageUrls: string[];
  avatarSkinTonePresetId: string | null;
  avatarBodyTypePresetId: string | null;
  avatarBaseModelId: string | null;
  avatarFinalImageUrl: string | null;
  isComplete: boolean;
  status: OnboardingStatus;
  styleStatus: string | null;
  avatarStatus: string | null;
  fullyProcessed: boolean;
  processingRequestId: string | null;
  lastError: string | null;
  updatedAt: string | null;
  processedAt: string | null;
};

export type OnboardingPatch = {
  style_direction?: Exclude<StyleDirection, null>;
  style_picks?: string[];
  color_likes?: string[];
  color_avoids?: string[];
  occasions?: string[];
  avatar_mode?: Exclude<AvatarMode, null>;
  avatar_image_urls?: string[];
  avatar_skin_tone_preset_id?: string | null;
  avatar_body_type_preset_id?: string | null;
  avatar_base_model_id?: string | null;
  avatar_final_image_url?: string | null;
  is_complete?: boolean;
  status?: OnboardingStatus;
  style_status?: string | null;
  avatar_status?: string | null;
  fully_processed?: boolean;
  processing_request_id?: string | null;
  last_error?: string | null;
};

export type BaseModelPresetOption = {
  id: string;
  key: string;
  label: string;
  isDefault: boolean;
  sortOrder: number;
};

export type BaseModelPreviewCard = {
  id: string;
  label: string;
  description?: string;
  imageUrl: string | null;
  styleDirection: Exclude<StyleDirection, null>;
  skinTonePresetId: string | null;
  bodyTypePresetId: string | null;
  baseModelId: string | null;
};

const normalizeState = (raw: Record<string, unknown> | null): OnboardingStateRecord | null => {
  if (!raw || typeof raw.user_id !== 'string') {
    return null;
  }

  return {
    userId: raw.user_id,
    styleDirection: raw.style_direction === 'menswear' || raw.style_direction === 'womenswear' ? raw.style_direction : null,
    stylePicks: Array.isArray(raw.style_picks) ? raw.style_picks.filter((value): value is string => typeof value === 'string') : [],
    colorLikes: Array.isArray(raw.color_likes) ? raw.color_likes.filter((value): value is string => typeof value === 'string') : [],
    colorAvoids: Array.isArray(raw.color_avoids) ? raw.color_avoids.filter((value): value is string => typeof value === 'string') : [],
    occasions: Array.isArray(raw.occasions) ? raw.occasions.filter((value): value is string => typeof value === 'string') : [],
    avatarMode: raw.avatar_mode === 'upload' || raw.avatar_mode === 'base' || raw.avatar_mode === 'skip' ? raw.avatar_mode : null,
    avatarImageUrls: Array.isArray(raw.avatar_image_urls) ? raw.avatar_image_urls.filter((value): value is string => typeof value === 'string') : [],
    avatarSkinTonePresetId: typeof raw.avatar_skin_tone_preset_id === 'string' ? raw.avatar_skin_tone_preset_id : null,
    avatarBodyTypePresetId: typeof raw.avatar_body_type_preset_id === 'string' ? raw.avatar_body_type_preset_id : null,
    avatarBaseModelId: typeof raw.avatar_base_model_id === 'string' ? raw.avatar_base_model_id : null,
    avatarFinalImageUrl: typeof raw.avatar_final_image_url === 'string' ? raw.avatar_final_image_url : null,
    isComplete: Boolean(raw.is_complete),
    status: raw.status === 'queued' || raw.status === 'processing' || raw.status === 'done' || raw.status === 'failed' ? raw.status : 'saved',
    styleStatus: typeof raw.style_status === 'string' ? raw.style_status : null,
    avatarStatus: typeof raw.avatar_status === 'string' ? raw.avatar_status : null,
    fullyProcessed: Boolean(raw.fully_processed),
    processingRequestId: typeof raw.processing_request_id === 'string' ? raw.processing_request_id : null,
    lastError: typeof raw.last_error === 'string' ? raw.last_error : null,
    updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : null,
    processedAt: typeof raw.processed_at === 'string' ? raw.processed_at : null,
  };
};

export async function fetchMe(accessToken: string): Promise<MeProfile> {
  return getMe(accessToken);
}

export async function fetchOnboardingState() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data, error: onboardingError } = await supabase.from('onboarding_states').select('*').eq('user_id', user.id).maybeSingle();

  if (onboardingError) {
    throw onboardingError;
  }

  return normalizeState(data as Record<string, unknown> | null);
}

export async function saveOnboardingDraft(patch: OnboardingPatch) {
  await saveOnboardingState(patch);
}

export async function submitOnboarding() {
  await saveOnboardingState({ is_complete: true, status: 'saved', last_error: null });
  void triggerOnboardingProcessing().catch((error) => {
    console.error('Failed to queue onboarding processing after submit:', error);
  });
}

const fileExtensionFromUri = (uri: string) => {
  const normalized = uri.split('?')[0] ?? uri;
  const segments = normalized.split('.');
  const extension = segments.length > 1 ? segments[segments.length - 1].toLowerCase() : 'jpg';

  if (!extension || extension.length > 8) {
    return 'jpg';
  }

  return extension;
};

const contentTypeFromExtension = (extension: string) => {
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'heic') return 'image/heic';
  return 'image/jpeg';
};

export async function uploadAvatarReferenceImage(userId: string, localUri: string) {
  const extension = fileExtensionFromUri(localUri);
  const objectPath = `u_${userId}/avatar-references/${Crypto.randomUUID()}.${extension}`;
  const imageResponse = await fetch(localUri);
  const imageBlob = await imageResponse.blob();

  let lastError: Error | null = null;

  for (const bucket of AVATAR_UPLOAD_BUCKET_CANDIDATES) {
    try {
      const { data: signedUpload, error: signError } = await supabase.storage.from(bucket).createSignedUploadUrl(objectPath);
      if (signError || !signedUpload?.token) {
        throw signError ?? new Error(`Failed to create signed upload url for ${bucket}`);
      }

      const { error: uploadError } = await supabase.storage.from(bucket).uploadToSignedUrl(objectPath, signedUpload.token, imageBlob, {
        contentType: contentTypeFromExtension(extension),
        upsert: false,
      });

      if (uploadError) {
        throw uploadError;
      }

      await saveAvatarReferences([`${bucket}/${objectPath}`]);
      return `${bucket}/${objectPath}`;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Failed to upload avatar image');
    }
  }

  throw lastError ?? new Error('Failed to upload avatar image');
}

export async function fetchOnboardingBundle(accessToken: string, styleDirection: Exclude<StyleDirection, null>) {
  return getOnboardingBundle(accessToken, { styleDirection });
}

export function getDefaultSkinTonePreset(flow: BaseAvatarFlow | null) {
  return flow?.skinTonePresets.find((preset) => preset.isDefault) ?? flow?.skinTonePresets[0] ?? null;
}

export function getDefaultBodyTypePreset(flow: BaseAvatarFlow | null) {
  return flow?.bodyTypePresets.find((preset) => preset.isDefault) ?? flow?.bodyTypePresets[0] ?? null;
}

function previewCardFromModel({
  label,
  model,
  styleDirection,
  description,
}: {
  label: string;
  model: Pick<BaseAvatarModel, 'id' | 'imageUrl' | 'styleDirection' | 'skinTonePresetId' | 'bodyTypePresetId'> | BundlePreviewModel | null;
  styleDirection: Exclude<StyleDirection, null>;
  description?: string;
}): BaseModelPreviewCard {
  return {
    id: model?.id ?? label,
    label,
    description,
    imageUrl: model?.imageUrl ?? null,
    styleDirection: (model?.styleDirection as Exclude<StyleDirection, null>) ?? styleDirection,
    skinTonePresetId: model?.skinTonePresetId ?? null,
    bodyTypePresetId: model?.bodyTypePresetId ?? null,
    baseModelId: model?.id ?? null,
  };
}

export function buildBaseModelStyleCards(baseModels: BaseAvatarModel[], flow: BaseAvatarFlow | null) {
  const defaultSkin = getDefaultSkinTonePreset(flow);
  const defaultBody = getDefaultBodyTypePreset(flow);

  return (['menswear', 'womenswear'] as const).map((direction) => {
    const bundleCard = flow?.styleDirectionCards.find((item) => item.key === direction);
    const model =
      baseModels.find(
        (item) =>
          item.styleDirection === direction &&
          item.skinTonePresetId === defaultSkin?.id &&
          item.bodyTypePresetId === defaultBody?.id,
      ) ?? bundleCard?.defaultModel ?? null;

    return previewCardFromModel({
      label: direction === 'menswear' ? 'Menswear-leaning' : 'Womenswear-leaning',
      description: direction === 'menswear' ? 'Structured tailoring and sharper lines.' : 'Fluid silhouettes and softer tailoring.',
      model,
      styleDirection: direction,
    });
  });
}

export function buildSkinToneCards(baseModels: BaseAvatarModel[], flow: BaseAvatarFlow | null, styleDirection: Exclude<StyleDirection, null>) {
  const defaultBody = getDefaultBodyTypePreset(flow);

  return flow?.skinTonePresets
    .map((preset) => {
      const bundleOption = flow.skinToneOptionsByStyleDirection[styleDirection]?.find((option) => option.id === preset.id);
      const model =
        baseModels.find(
          (item) => item.styleDirection === styleDirection && item.skinTonePresetId === preset.id && item.bodyTypePresetId === defaultBody?.id,
        ) ?? bundleOption?.previewModel ?? null;

      return previewCardFromModel({ label: preset.label, description: preset.isDefault ? 'Default preset' : undefined, model, styleDirection });
    })
    .filter(Boolean) ?? [];
}

export function buildBodyTypeCards(
  baseModels: BaseAvatarModel[],
  flow: BaseAvatarFlow | null,
  styleDirection: Exclude<StyleDirection, null>,
  skinTonePresetId: string,
) {
  return flow?.bodyTypePresets
    .map((preset) => {
      const bundleOption = flow.bodyTypeOptionsByStyleDirectionAndSkinTone[styleDirection]?.[skinTonePresetId]?.find((option) => option.id === preset.id);
      const model =
        baseModels.find(
          (item) => item.styleDirection === styleDirection && item.skinTonePresetId === skinTonePresetId && item.bodyTypePresetId === preset.id,
        ) ?? bundleOption?.previewModel ?? null;

      return previewCardFromModel({ label: preset.label, description: preset.isDefault ? 'Default preset' : undefined, model, styleDirection });
    })
    .filter(Boolean) ?? [];
}

export function getMatchingBaseModels(
  baseModels: BaseAvatarModel[],
  styleDirection: Exclude<StyleDirection, null>,
  skinTonePresetId: string,
  bodyTypePresetId: string,
) {
  return baseModels.filter(
    (model) =>
      model.styleDirection === styleDirection && model.skinTonePresetId === skinTonePresetId && model.bodyTypePresetId === bodyTypePresetId,
  );
}

export function deriveBaseModelSelections(
  onboardingState: OnboardingStateRecord | null,
  bundle: OnboardingBundle | undefined,
  baseModels: BaseAvatarModel[],
) {
  const selectedModel = onboardingState?.avatarBaseModelId ? baseModels.find((model) => model.id === onboardingState.avatarBaseModelId) ?? null : null;
  const flow = bundle?.baseAvatarFlow ?? null;
  const defaultSkin = getDefaultSkinTonePreset(flow);
  const defaultBody = getDefaultBodyTypePreset(flow);

  return {
    styleDirection: (selectedModel?.styleDirection === 'menswear' || selectedModel?.styleDirection === 'womenswear' ? selectedModel.styleDirection : onboardingState?.styleDirection) ?? 'womenswear',
    skinTonePresetId: selectedModel?.skinTonePresetId ?? onboardingState?.avatarSkinTonePresetId ?? defaultSkin?.id ?? null,
    bodyTypePresetId: selectedModel?.bodyTypePresetId ?? onboardingState?.avatarBodyTypePresetId ?? defaultBody?.id ?? null,
    selectedModel,
  };
}
