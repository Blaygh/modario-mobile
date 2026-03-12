import { getOnboardingProfile } from '@/libs/onboarding-storage';
import { supabasePublishableKey, supabaseUrl } from '@/libs/supabase-config';

export type OnboardingStyleCard = {
  id: string;
  title: string;
  imageUrl: string;
};

export type OnboardingColorOption = {
  id: string;
  name: string;
  hex: string;
  family: 'neutral' | 'accent';
};

export type OnboardingAvoidPreset = {
  id: string;
  label: string;
};

export type OnboardingOccasion = {
  id: string;
  label: string;
};

export type BaseAvatarModel = {
  id: string;
  key: string;
  displayName?: string;
  styleDirection: 'menswear' | 'womenswear';
  skinToneKey?: string;
  bodyTypeKey?: string;
  imageUrl: string;
};

export type BaseAvatarFlow = {
  defaults: {
    skinToneKey: string;
    skinToneDisplayName: string;
    bodyTypeKey: string;
    bodyTypeDisplayName: string;
  };
  styleDirectionCards: Array<{
    key: 'menswear' | 'womenswear';
    label: string;
    defaultModel: BaseAvatarModel;
  }>;
  skinToneOptionsByStyleDirection: Record<
    string,
    Array<{
      skinToneKey: string;
      skinToneDisplayName: string;
      previewModel: BaseAvatarModel;
    }>
  >;
  bodyTypeOptionsByStyleDirectionAndSkinTone: Record<
    string,
    Record<
      string,
      Array<{
        bodyTypeKey: string;
        bodyTypeDisplayName: string;
        previewModel: BaseAvatarModel;
      }>
    >
  >;
};

export type OnboardingBundle = {
  styleCards: OnboardingStyleCard[];
  colors: OnboardingColorOption[];
  avoidPresets: OnboardingAvoidPreset[];
  occasions: OnboardingOccasion[];
  baseAvatarFlow: BaseAvatarFlow | null;
};

type BundleFilters = {
  gender?: string;
  skinTone?: string;
  bodyType?: string;
};

const normalizeHex = (value: string | undefined) => {
  if (!value) return '#E5E5E5';
  return value.startsWith('#') ? value : `#${value}`;
};

const normalizeModel = (raw: any): BaseAvatarModel => ({
  id: raw?.id ?? raw?.key ?? '',
  key: raw?.key ?? '',
  displayName: raw?.display_name,
  styleDirection: raw?.style_direction,
  skinToneKey: raw?.skin_tone_key,
  bodyTypeKey: raw?.body_type_key,
  imageUrl: raw?.image_url ?? '',
});

export const loadBundleFiltersFromProfile = async (): Promise<Required<BundleFilters>> => {
  const profile = await getOnboardingProfile();
  const gender = profile.styleDirection === 'menswear' || profile.baseModelGender === 'male' ? 'male' : 'female';

  return {
    gender,
    skinTone: profile.skinTone ?? 'medium',
    bodyType: profile.bodyType ?? 'average',
  };
};

export async function getOnboardingBundle(accessToken: string, filters: BundleFilters): Promise<OnboardingBundle> {
  const query = new URLSearchParams();

  if (filters.gender) query.set('gender', filters.gender);
  if (filters.skinTone) query.set('skin_tone', filters.skinTone);
  if (filters.bodyType) query.set('body_type', filters.bodyType);

  const url = `${supabaseUrl}/functions/v1/get-onboarding-bundle?${query.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabasePublishableKey,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load onboarding bundle (${response.status})`);
  }

  const payload = await response.json();

  const styleCardsRaw = payload.style_cards ?? payload.styleCards ?? [];
  const colorOptionsRaw = payload.colors ?? payload.color_options ?? payload.colorOptions ?? [];
  const avoidPresetsRaw = payload.avoid_presets ?? payload.avoid_color_presets ?? payload.avoidPresets ?? [];
  const occasionsRaw = payload.occasions ?? [];

  const flowRaw = payload.base_avatar_flow;
  const baseAvatarFlow: BaseAvatarFlow | null = flowRaw
    ? {
        defaults: {
          skinToneKey: flowRaw?.defaults?.skin_tone_preset?.key ?? 'medium',
          skinToneDisplayName: flowRaw?.defaults?.skin_tone_preset?.display_name ?? 'Medium',
          bodyTypeKey: flowRaw?.defaults?.body_type_preset?.key ?? 'average',
          bodyTypeDisplayName: flowRaw?.defaults?.body_type_preset?.display_name ?? 'Average',
        },
        styleDirectionCards: (flowRaw?.style_direction_cards ?? []).map((card: any) => ({
          key: card.key,
          label: card.label,
          defaultModel: normalizeModel(card.default_model),
        })),
        skinToneOptionsByStyleDirection: Object.fromEntries(
          Object.entries(flowRaw?.skin_tone_options_by_style_direction ?? {}).map(([styleDirection, options]) => [
            styleDirection,
            (options as any[]).map((option) => ({
              skinToneKey: option.skin_tone_preset?.key,
              skinToneDisplayName: option.skin_tone_preset?.display_name,
              previewModel: normalizeModel(option.preview_model),
            })),
          ]),
        ),
        bodyTypeOptionsByStyleDirectionAndSkinTone: Object.fromEntries(
          Object.entries(flowRaw?.body_type_options_by_style_direction_and_skin_tone ?? {}).map(([styleDirection, byTone]) => [
            styleDirection,
            Object.fromEntries(
              Object.entries(byTone as Record<string, any[]>).map(([skinTone, options]) => [
                skinTone,
                options.map((option) => ({
                  bodyTypeKey: option.body_type_preset?.key,
                  bodyTypeDisplayName: option.body_type_preset?.display_name,
                  previewModel: normalizeModel(option.preview_model),
                })),
              ]),
            ),
          ]),
        ),
      }
    : null;

  return {
    styleCards: styleCardsRaw.map((card: any) => ({
      id: card.id,
      title: card.title,
      imageUrl: card?.variant?.image_url ?? card?.Variant?.image_url ?? card?.image_url ?? '',
    })),
    colors: colorOptionsRaw.map((option: any) => ({
      id: option.id ?? option.key ?? option.name,
      name: option.name,
      hex: normalizeHex(option.hex ?? option.color_hex),
      family: option.family === 'neutral' ? 'neutral' : 'accent',
    })),
    avoidPresets: avoidPresetsRaw.map((preset: any) => ({
      id: preset.id ?? preset.key,
      label: preset.label,
    })),
    occasions: occasionsRaw.map((occasion: any) => ({
      id: occasion.id ?? occasion.key ?? occasion.name,
      label: occasion.label ?? occasion.name,
    })),
    baseAvatarFlow,
  };
}
