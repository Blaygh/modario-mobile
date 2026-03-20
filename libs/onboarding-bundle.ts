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

export type BundlePreviewModel = {
  id: string;
  key: string;
  displayName?: string;
  styleDirection: 'menswear' | 'womenswear';
  skinTonePresetId?: string;
  bodyTypePresetId?: string;
  skinToneKey?: string;
  bodyTypeKey?: string;
  imageUrl: string;
};

export type BaseAvatarFlow = {
  defaults: {
    skinToneId: string | null;
    skinToneKey: string;
    skinToneDisplayName: string;
    bodyTypeId: string | null;
    bodyTypeKey: string;
    bodyTypeDisplayName: string;
  };
  skinTonePresets: Array<{
    id: string;
    key: string;
    label: string;
    isDefault: boolean;
    sortOrder: number;
  }>;
  bodyTypePresets: Array<{
    id: string;
    key: string;
    label: string;
    isDefault: boolean;
    sortOrder: number;
  }>;
  styleDirectionCards: Array<{
    key: 'menswear' | 'womenswear';
    label: string;
    defaultModel: BundlePreviewModel;
  }>;
  skinToneOptionsByStyleDirection: Record<
    string,
    Array<{
      id: string;
      skinToneKey: string;
      skinToneDisplayName: string;
      isDefault: boolean;
      sortOrder: number;
      previewModel: BundlePreviewModel;
    }>
  >;
  bodyTypeOptionsByStyleDirectionAndSkinTone: Record<
    string,
    Record<
      string,
      Array<{
        id: string;
        bodyTypeKey: string;
        bodyTypeDisplayName: string;
        isDefault: boolean;
        sortOrder: number;
        previewModel: BundlePreviewModel;
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
  styleDirection?: 'menswear' | 'womenswear';
};

const normalizeHex = (value: string | undefined) => {
  if (!value) return '#E5E5E5';
  return value.startsWith('#') ? value : `#${value}`;
};

const toSortOrder = (value: unknown, fallback: number) => (typeof value === 'number' ? value : fallback);

const normalizeModel = (raw: any): BundlePreviewModel => ({
  id: raw?.id ?? raw?.key ?? '',
  key: raw?.key ?? '',
  displayName: raw?.display_name,
  styleDirection: raw?.style_direction,
  skinTonePresetId: raw?.skin_tone_preset_id ?? raw?.skin_tone_preset?.id,
  bodyTypePresetId: raw?.body_type_preset_id ?? raw?.body_type_preset?.id,
  skinToneKey: raw?.skin_tone_key ?? raw?.skin_tone_preset?.key,
  bodyTypeKey: raw?.body_type_key ?? raw?.body_type_preset?.key,
  imageUrl: raw?.image_url ?? '',
});

export const loadBundleFiltersFromProfile = async (): Promise<Required<BundleFilters>> => {
  const profile = await getOnboardingProfile();
  const styleDirection =
    profile.styleDirection === 'menswear' || profile.styleDirection === 'womenswear'
      ? profile.styleDirection
      : profile.baseModelGender === 'male'
        ? 'menswear'
        : 'womenswear';

  return { styleDirection };
};

export async function getOnboardingBundle(accessToken: string, filters: BundleFilters): Promise<OnboardingBundle> {
  const url = `${supabaseUrl}/functions/v1/get-onboarding-bundle`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabasePublishableKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ style_direction: filters.styleDirection ?? 'womenswear' }),
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

  const skinToneEntries = Object.values(flowRaw?.skin_tone_options_by_style_direction ?? {}).flat() as any[];
  const bodyTypeEntries = Object.values(flowRaw?.body_type_options_by_style_direction_and_skin_tone ?? {}).flatMap((byTone: any) => Object.values(byTone ?? {}).flat()) as any[];

  const skinTonePresets = Array.from(
    new Map(
      skinToneEntries
        .filter((option) => option?.skin_tone_preset?.id)
        .map((option, index) => [
          option.skin_tone_preset.id,
          {
            id: option.skin_tone_preset.id as string,
            key: option.skin_tone_preset.key as string,
            label: option.skin_tone_preset.display_name as string,
            isDefault: Boolean(option.skin_tone_preset.is_default),
            sortOrder: toSortOrder(option.skin_tone_preset.sort_order, index + 1),
          },
        ] as const),
    ).values(),
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  const bodyTypePresets = Array.from(
    new Map(
      bodyTypeEntries
        .filter((option) => option?.body_type_preset?.id)
        .map((option, index) => [
          option.body_type_preset.id,
          {
            id: option.body_type_preset.id as string,
            key: option.body_type_preset.key as string,
            label: option.body_type_preset.display_name as string,
            isDefault: Boolean(option.body_type_preset.is_default),
            sortOrder: toSortOrder(option.body_type_preset.sort_order, index + 1),
          },
        ] as const),
    ).values(),
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  const defaultSkinToneOption = skinToneEntries.find((option) => option?.skin_tone_preset?.is_default) ?? skinToneEntries[0];
  const defaultBodyTypeOption = bodyTypeEntries.find((option) => option?.body_type_preset?.is_default) ?? bodyTypeEntries[0];

  const baseAvatarFlow: BaseAvatarFlow | null = flowRaw
    ? {
        defaults: {
          skinToneId: defaultSkinToneOption?.skin_tone_preset?.id ?? flowRaw?.defaults?.skin_tone_preset?.id ?? null,
          skinToneKey: defaultSkinToneOption?.skin_tone_preset?.key ?? flowRaw?.defaults?.skin_tone_preset?.key ?? 'medium',
          skinToneDisplayName: defaultSkinToneOption?.skin_tone_preset?.display_name ?? flowRaw?.defaults?.skin_tone_preset?.display_name ?? 'Medium',
          bodyTypeId: defaultBodyTypeOption?.body_type_preset?.id ?? flowRaw?.defaults?.body_type_preset?.id ?? null,
          bodyTypeKey: defaultBodyTypeOption?.body_type_preset?.key ?? flowRaw?.defaults?.body_type_preset?.key ?? 'average',
          bodyTypeDisplayName: defaultBodyTypeOption?.body_type_preset?.display_name ?? flowRaw?.defaults?.body_type_preset?.display_name ?? 'Average',
        },
        skinTonePresets,
        bodyTypePresets,
        styleDirectionCards: (flowRaw?.style_direction_cards ?? []).map((card: any) => ({
          key: card.key,
          label: card.label,
          defaultModel: normalizeModel(card.default_model),
        })),
        skinToneOptionsByStyleDirection: Object.fromEntries(
          Object.entries(flowRaw?.skin_tone_options_by_style_direction ?? {}).map(([styleDirection, options]) => [
            styleDirection,
            (options as any[])
              .filter((option) => option?.skin_tone_preset?.id)
              .map((option, index) => ({
                id: option.skin_tone_preset.id as string,
                skinToneKey: option.skin_tone_preset.key as string,
                skinToneDisplayName: option.skin_tone_preset.display_name as string,
                isDefault: Boolean(option.skin_tone_preset.is_default),
                sortOrder: toSortOrder(option.skin_tone_preset.sort_order, index + 1),
                previewModel: normalizeModel(option.preview_model),
              }))
              .sort((a, b) => a.sortOrder - b.sortOrder),
          ]),
        ),
        bodyTypeOptionsByStyleDirectionAndSkinTone: Object.fromEntries(
          Object.entries(flowRaw?.body_type_options_by_style_direction_and_skin_tone ?? {}).map(([styleDirection, byTone]) => [
            styleDirection,
            Object.fromEntries(
              Object.entries(byTone as Record<string, any[]>).map(([skinTone, options]) => [
                skinTone,
                options
                  .filter((option) => option?.body_type_preset?.id)
                  .map((option, index) => ({
                    id: option.body_type_preset.id as string,
                    bodyTypeKey: option.body_type_preset.key as string,
                    bodyTypeDisplayName: option.body_type_preset.display_name as string,
                    isDefault: Boolean(option.body_type_preset.is_default),
                    sortOrder: toSortOrder(option.body_type_preset.sort_order, index + 1),
                    previewModel: normalizeModel(option.preview_model),
                  }))
                  .sort((a, b) => a.sortOrder - b.sortOrder),
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
      imageUrl: card?.variant?.img_url ?? card?.variant?.image_url ?? card?.Variant?.img_url ?? card?.Variant?.image_url ?? card?.image_url ?? '',
    })),
    colors: colorOptionsRaw.map((option: any) => ({
      id: option.id ?? option.key ?? option.name,
      name: option.name ?? option.label ?? option.key,
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
