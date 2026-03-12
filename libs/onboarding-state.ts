import { StyleDirection } from '@/types';
import { supabase } from '@/libs/supabase';

type OnboardingStatus = 'saved' | 'queued' | 'processing' | 'done' | 'failed';

type OnboardingPatch = {
  style_direction?: Exclude<StyleDirection, null>;
  style_picks?: string[];
  color_likes?: string[];
  color_avoids?: string[];
  occasions?: string[];
  avatar_mode?: 'upload' | 'base' | 'skip';
  avatar_image_urls?: string[];
  is_complete?: boolean;
  status?: OnboardingStatus;
  last_error?: string | null;
  processing_request_id?: string | null;
};

async function getUserId() {
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

export async function saveOnboardingState(patch: OnboardingPatch) {
  const userId = await getUserId();
  await ensureUserProfile(userId);

  const payload = {
    user_id: userId,
    ...patch,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('onboarding_states').upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false });
  if (error) {
    throw error;
  }
}

export async function saveAvatarReferences(storageUrls: string[]) {
  if (!storageUrls.length) {
    return;
  }

  const userId = await getUserId();
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
  const { error } = await supabase.functions.invoke('process-onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {},
  });

  if (error) {
    await saveOnboardingState({ status: 'failed', last_error: error.message ?? 'Failed to queue onboarding processing' });
    throw error;
  }
}
