import { supabase } from '@/libs/supabase';
import { StyleDirection } from '@/types';

const API_BASE = 'https://api.modario.io';

export type OnboardingStatus = 'saved' | 'queued' | 'processing' | 'done' | 'failed';
export type AvatarMode = 'upload' | 'base' | 'skip' | null;

export type MeResponse = {
  user: {
    user_id: string;
    display_name: string | null;
    country_code: string | null;
    locale: string | null;
    timezone: string | null;
    gender: string | null;
    created_at: string | null;
    updated_at: string | null;
  } | null;
  onboarding: {
    is_complete: boolean;
    status: OnboardingStatus | null;
    processing_request_id: string | null;
    updated_at: string | null;
  } | null;
  preferences?: unknown;
  style_profile?: unknown;
  avatar?: unknown;
};

export type OnboardingStateRow = {
  id: string;
  created_at: string;
  user_id: string;
  color_likes: string[] | null;
  color_avoids: string[] | null;
  style_direction: StyleDirection;
  style_picks: string[] | null;
  occasions: string[] | null;
  is_complete: boolean | null;
  avatar_mode: AvatarMode;
  avatar_image_urls: string[] | null;
  avatar_base_model_id: string | null;
  avatar_skin_tone_preset_id: string | null;
  avatar_body_type_preset_id: string | null;
  avatar_final_image_url: string | null;
  status: OnboardingStatus;
  style_status: OnboardingStatus | null;
  avatar_status: OnboardingStatus | null;
  processing_request_id: string | null;
  processed_at: string | null;
  fully_processed: boolean;
  fully_processed_at: string | null;
  updated_at: string | null;
  last_error: string | null;
};

export type OnboardingState = {
  id?: string;
  userId?: string;
  styleDirection: StyleDirection;
  stylePicks: string[] | null;
  colorLikes: string[];
  colorAvoids: string[];
  occasions: string[];
  avatarMode: AvatarMode;
  avatarImageUrls: string[];
  avatarBaseModelId: string | null;
  avatarSkinTonePresetId: string | null;
  avatarBodyTypePresetId: string | null;
  avatarFinalImageUrl: string | null;
  isComplete: boolean;
  status: OnboardingStatus | null;
  styleStatus: OnboardingStatus | null;
  avatarStatus: OnboardingStatus | null;
  processingRequestId: string | null;
  processedAt: string | null;
  fullyProcessed: boolean;
  fullyProcessedAt: string | null;
  updatedAt: string | null;
  lastError: string | null;
};

export type OnboardingPatch = {
  style_direction?: Exclude<StyleDirection, null>;
  style_picks?: string[] | null;
  color_likes?: string[];
  color_avoids?: string[];
  occasions?: string[];
  avatar_mode?: Exclude<AvatarMode, null>;
  avatar_image_urls?: string[];
  avatar_base_model_id?: string | null;
  avatar_skin_tone_preset_id?: string | null;
  avatar_body_type_preset_id?: string | null;
  avatar_final_image_url?: string | null;
  is_complete?: boolean;
  status?: OnboardingStatus;
  style_status?: OnboardingStatus | null;
  avatar_status?: OnboardingStatus | null;
  last_error?: string | null;
  processing_request_id?: string | null;
};

function normalizeStringArray(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function normalizeOnboardingState(row: OnboardingStateRow | null | undefined): OnboardingState {
  return {
    id: row?.id,
    userId: row?.user_id,
    styleDirection: row?.style_direction ?? null,
    stylePicks: row?.style_picks ?? null,
    colorLikes: normalizeStringArray(row?.color_likes),
    colorAvoids: normalizeStringArray(row?.color_avoids),
    occasions: normalizeStringArray(row?.occasions),
    avatarMode: row?.avatar_mode ?? null,
    avatarImageUrls: normalizeStringArray(row?.avatar_image_urls),
    avatarBaseModelId: row?.avatar_base_model_id ?? null,
    avatarSkinTonePresetId: row?.avatar_skin_tone_preset_id ?? null,
    avatarBodyTypePresetId: row?.avatar_body_type_preset_id ?? null,
    avatarFinalImageUrl: row?.avatar_final_image_url ?? null,
    isComplete: row?.is_complete === true,
    status: row?.status ?? null,
    styleStatus: row?.style_status ?? null,
    avatarStatus: row?.avatar_status ?? null,
    processingRequestId: row?.processing_request_id ?? null,
    processedAt: row?.processed_at ?? null,
    fullyProcessed: row?.fully_processed ?? false,
    fullyProcessedAt: row?.fully_processed_at ?? null,
    updatedAt: row?.updated_at ?? null,
    lastError: row?.last_error ?? null,
  };
}

async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated');
  }

  return user.id;
}

async function ensureUserProfile(userId: string) {
  await supabase.from('user_profiles').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: false });
}

async function apiRequest<T>(path: string, accessToken: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const data = (await response.json()) as { detail?: string; error?: string; message?: string };
      message = data.detail ?? data.error ?? data.message ?? message;
    } catch {
      // Keep fallback message for non-JSON responses.
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getMe(accessToken: string) {
  return apiRequest<MeResponse>('/me', accessToken);
}

export async function getOnboardingState() {
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

  return normalizeOnboardingState((data ?? null) as OnboardingStateRow | null);
}

export async function saveOnboardingState(patch: OnboardingPatch) {
  const userId = await getCurrentUserId();
  await ensureUserProfile(userId);

  const payload = {
    user_id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('onboarding_states').upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false }).select('*').single();
  if (error) {
    throw error;
  }

  return normalizeOnboardingState(data as OnboardingStateRow);
}

export async function saveAvatarReferences(storageUrls: string[]) {
  if (!storageUrls.length) {
    return;
  }

  const userId = await getCurrentUserId();
  await ensureUserProfile(userId);

  const rows = storageUrls.map((storage_url) => ({
    user_id: userId,
    purpose: 'avatar_reference',
    storage_url,
  }));

  const { error } = await supabase.from('user_images').insert(rows);
  if (error) {
    throw error;
  }
}

export async function triggerOnboardingProcessing() {
  const { data, error } = await supabase.functions.invoke('process-onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {},
  });

  if (error) {
    await saveOnboardingState({ status: 'failed', last_error: error.message ?? 'Failed to queue onboarding processing' });
    throw error;
  }

  return data;
}
