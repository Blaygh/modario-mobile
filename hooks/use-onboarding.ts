import { supabase } from '@/libs/supabase';
import { StyleDirection } from '@/types';
import { useQuery } from '@tanstack/react-query';

export type ColorRow = {
  family: string;
  hex: string;
  key: string;
  sort_order: number;
  label: string;
};

export type AvoidPreset = {
  description: string;
  key: string;
  label: string;
  sort_order: number;
};

export interface OnboardingBundle {
  style_cards: {
    id: string;
    title: string;
    variant: { img_url?: string; image_url?: string };
  }[];
  colors: ColorRow[];
  avoid_presets: AvoidPreset[];
  occasions: {
    key: string;
    label: string;
    sort_order: number;
  }[];
}

interface OnboardingState {
  id: string;
  created_at: string;
  user_id: string;
  color_likes: string[] | null;
  color_avoids: string[] | null;
  style_direction: StyleDirection;
  style_picks: string[] | null;
  occasions: string[] | null;
  is_complete: boolean | null;
  avatar_mode: 'upload' | 'base' | 'skip' | null;
  avatar_image_urls: string[] | null;
  status: 'saved' | 'queued' | 'processing' | 'done' | 'failed';
  processing_request_id: string | null;
  processed_at: string | null;
  last_error: string | null;
}

export function useGetOnboardingBundle() {
  return useQuery({
    queryKey: ['onboarding-bundle'],
    queryFn: async (): Promise<OnboardingBundle> => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        throw new Error('User not authenticated');
      }

      const { data } = await supabase.from('onboarding_states').select('style_direction').eq('user_id', user.id).single();

      const styleDirection = data?.style_direction ?? 'womenswear';

      const res = await supabase.functions.invoke('get-onboarding-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          style_direction: styleDirection,
        },
      });

      if (res.error || !res.data) {
        throw new Error(res.error?.message ?? 'Failed to fetch onboarding bundle');
      }

      return res.data;
    },
  });
}

export function useGetOnboardingState() {
  return useQuery({
    queryKey: ['onboarding-state'],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      const { data, error: obError } = await supabase.from('onboarding_states').select('*').eq('user_id', user.id).single();

      if (obError) {
        return null;
      }

      return data as OnboardingState | null;
    },
  });
}
