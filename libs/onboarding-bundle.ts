import { supabasePublishableKey, supabaseUrl } from '@/libs/supabase-config';
import { logTelemetry } from '@/libs/telemetry';

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
      isDefault: boolean;
      sortOrder: number;
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
        isDefault: boolean;
        sortOrder: number;
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
  styleDirection?: 'menswear' | 'womenswear';
};

const REQUEST_TIMEOUT_MS = 12000;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const asString = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const asOptionalString = (value: unknown) => (typeof value === 'string' && value.trim().length > 0 ? value : undefined);
const asBoolean = (value: unknown) => value === true;
const asNumber = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const asArray = (value: unknown) => (Array.isArray(value) ? value : []);

const normalizeHex = (value: string | undefined) => {
  if (!value) return '#E5E5E5';
  return value.startsWith('#') ? value : `#${value}`;
};

const assertNonEmpty = (value: string, message: string) => {
  if (!value.trim()) {
    throw new Error(message);
  }
  return value;
};

const normalizeModel = (raw: unknown): BaseAvatarModel => {
  if (!isRecord(raw)) {
    throw new Error('Base avatar model payload was malformed.');
  }

  const styleDirection = raw.style_direction;
  if (styleDirection !== 'menswear' && styleDirection !== 'womenswear') {
    throw new Error('Base avatar model was missing a valid style direction.');
  }

  return {
    id: assertNonEmpty(asString(raw.id ?? raw.key), 'Base avatar model was missing an id.'),
    key: assertNonEmpty(asString(raw.key ?? raw.id), 'Base avatar model was missing a key.'),
    displayName: asOptionalString(raw.display_name),
    styleDirection,
    skinToneKey: asOptionalString(raw.skin_tone_key) ?? (isRecord(raw.skin_tone_preset) ? asOptionalString(raw.skin_tone_preset.key) : undefined),
    bodyTypeKey: asOptionalString(raw.body_type_key) ?? (isRecord(raw.body_type_preset) ? asOptionalString(raw.body_type_preset.key) : undefined),
    imageUrl: assertNonEmpty(asString(raw.image_url), 'Base avatar model was missing an image URL.'),
  };
};

function parseStyleCards(payload: unknown) {
  return asArray(payload).map((card, index) => {
    if (!isRecord(card)) {
      throw new Error(`Style card at index ${index} was malformed.`);
    }

    const variant = isRecord(card.variant) ? card.variant : isRecord(card.Variant) ? card.Variant : null;
    const imageUrl =
      asOptionalString(variant?.img_url) ??
      asOptionalString(variant?.image_url) ??
      asOptionalString(card.image_url) ??
      asOptionalString(card.img_url);

    return {
      id: assertNonEmpty(asString(card.id), `Style card at index ${index} was missing an id.`),
      title: assertNonEmpty(asString(card.title), `Style card ${asString(card.id, String(index))} was missing a title.`),
      imageUrl: assertNonEmpty(imageUrl ?? '', `Style card ${asString(card.id, String(index))} was missing an image URL.`),
    } satisfies OnboardingStyleCard;
  });
}

function parseColors(payload: unknown) {
  return asArray(payload).map((option, index) => {
    if (!isRecord(option)) {
      throw new Error(`Color option at index ${index} was malformed.`);
    }

    const name = asOptionalString(option.name) ?? asOptionalString(option.label) ?? asOptionalString(option.key);
    return {
      id: assertNonEmpty(asString(option.id ?? option.key ?? name), `Color option at index ${index} was missing an id.`),
      name: assertNonEmpty(name ?? '', `Color option at index ${index} was missing a name.`),
      hex: normalizeHex(asOptionalString(option.hex) ?? asOptionalString(option.color_hex)),
      family: option.family === 'neutral' ? 'neutral' : 'accent',
    } satisfies OnboardingColorOption;
  });
}

function parseAvoidPresets(payload: unknown) {
  return asArray(payload).map((preset, index) => {
    if (!isRecord(preset)) {
      throw new Error(`Avoid preset at index ${index} was malformed.`);
    }

    return {
      id: assertNonEmpty(asString(preset.id ?? preset.key), `Avoid preset at index ${index} was missing an id.`),
      label: assertNonEmpty(asString(preset.label ?? preset.name), `Avoid preset at index ${index} was missing a label.`),
    } satisfies OnboardingAvoidPreset;
  });
}

function parseOccasions(payload: unknown) {
  return asArray(payload).map((occasion, index) => {
    if (!isRecord(occasion)) {
      throw new Error(`Occasion at index ${index} was malformed.`);
    }

    const label = asOptionalString(occasion.label) ?? asOptionalString(occasion.name);
    return {
      id: assertNonEmpty(asString(occasion.id ?? occasion.key ?? label), `Occasion at index ${index} was missing an id.`),
      label: assertNonEmpty(label ?? '', `Occasion at index ${index} was missing a label.`),
    } satisfies OnboardingOccasion;
  });
}

function parseBaseAvatarFlow(payload: unknown): BaseAvatarFlow | null {
  if (!isRecord(payload)) {
    return null;
  }

  const styleDirectionCards = asArray(payload.style_direction_cards).map((card, index) => {
    if (!isRecord(card)) {
      throw new Error(`Base avatar style direction card at index ${index} was malformed.`);
    }

    const key = card.key;
    if (key !== 'menswear' && key !== 'womenswear') {
      throw new Error(`Base avatar style direction card at index ${index} was missing a valid key.`);
    }

    return {
      key: key as 'menswear' | 'womenswear',
      label: assertNonEmpty(asString(card.label), `Base avatar style direction card ${key} was missing a label.`),
      defaultModel: normalizeModel(card.default_model),
    };
  });

  const skinToneOptionsByStyleDirection = Object.fromEntries(
    Object.entries(isRecord(payload.skin_tone_options_by_style_direction) ? payload.skin_tone_options_by_style_direction : {}).map(([styleDirection, rawOptions]) => [
      styleDirection,
      asArray(rawOptions)
        .map((option, index) => {
          if (!isRecord(option) || !isRecord(option.skin_tone_preset)) {
            throw new Error(`Skin tone option ${styleDirection}:${index} was malformed.`);
          }

          return {
            skinToneKey: assertNonEmpty(asString(option.skin_tone_preset.key), `Skin tone option ${styleDirection}:${index} was missing a key.`),
            skinToneDisplayName: assertNonEmpty(
              asString(option.skin_tone_preset.display_name),
              `Skin tone option ${styleDirection}:${index} was missing a display name.`,
            ),
            isDefault: asBoolean(option.skin_tone_preset.is_default),
            sortOrder: asNumber(option.skin_tone_preset.sort_order, index + 1),
            previewModel: normalizeModel(option.preview_model),
          };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    ]),
  );

  const bodyTypeOptionsByStyleDirectionAndSkinTone = Object.fromEntries(
    Object.entries(isRecord(payload.body_type_options_by_style_direction_and_skin_tone) ? payload.body_type_options_by_style_direction_and_skin_tone : {}).map(
      ([styleDirection, byTone]) => [
        styleDirection,
        Object.fromEntries(
          Object.entries(isRecord(byTone) ? byTone : {}).map(([skinTone, rawOptions]) => [
            skinTone,
            asArray(rawOptions)
              .map((option, index) => {
                if (!isRecord(option) || !isRecord(option.body_type_preset)) {
                  throw new Error(`Body type option ${styleDirection}:${skinTone}:${index} was malformed.`);
                }

                return {
                  bodyTypeKey: assertNonEmpty(
                    asString(option.body_type_preset.key),
                    `Body type option ${styleDirection}:${skinTone}:${index} was missing a key.`,
                  ),
                  bodyTypeDisplayName: assertNonEmpty(
                    asString(option.body_type_preset.display_name),
                    `Body type option ${styleDirection}:${skinTone}:${index} was missing a display name.`,
                  ),
                  isDefault: asBoolean(option.body_type_preset.is_default),
                  sortOrder: asNumber(option.body_type_preset.sort_order, index + 1),
                  previewModel: normalizeModel(option.preview_model),
                };
              })
              .sort((a, b) => a.sortOrder - b.sortOrder),
          ]),
        ),
      ],
    ),
  );

  const allSkinTones = Object.values(skinToneOptionsByStyleDirection).flat();
  const allBodyTypes = Object.values(bodyTypeOptionsByStyleDirectionAndSkinTone).flatMap((entry) => Object.values(entry).flat());
  const defaultSkinTone = allSkinTones.find((option) => option.isDefault) ?? allSkinTones[0];
  const defaultBodyType = allBodyTypes.find((option) => option.isDefault) ?? allBodyTypes[0];

  if (!defaultSkinTone || !defaultBodyType) {
    throw new Error('Base avatar flow payload was missing default preset metadata.');
  }

  return {
    defaults: {
      skinToneKey: defaultSkinTone.skinToneKey,
      skinToneDisplayName: defaultSkinTone.skinToneDisplayName,
      bodyTypeKey: defaultBodyType.bodyTypeKey,
      bodyTypeDisplayName: defaultBodyType.bodyTypeDisplayName,
    },
    styleDirectionCards,
    skinToneOptionsByStyleDirection,
    bodyTypeOptionsByStyleDirectionAndSkinTone,
  };
}

function parseOnboardingBundle(payload: unknown): OnboardingBundle {
  if (!isRecord(payload)) {
    throw new Error('Onboarding bundle response was malformed.');
  }

  return {
    styleCards: parseStyleCards(payload.style_cards ?? payload.styleCards),
    colors: parseColors(payload.colors ?? payload.color_options ?? payload.colorOptions),
    avoidPresets: parseAvoidPresets(payload.avoid_presets ?? payload.avoid_color_presets ?? payload.avoidPresets),
    occasions: parseOccasions(payload.occasions),
    baseAvatarFlow: parseBaseAvatarFlow(payload.base_avatar_flow),
  };
}

export async function getOnboardingBundle(accessToken: string, filters: BundleFilters): Promise<OnboardingBundle> {
  const url = `${supabaseUrl}/functions/v1/get-onboarding-bundle`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: supabasePublishableKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ style_direction: filters.styleDirection ?? 'womenswear' }),
      signal: controller.signal,
    });

    if (!response.ok) {
      logTelemetry({
        event: 'onboarding.bundle.request_failed',
        level: 'warn',
        endpoint: '/functions/v1/get-onboarding-bundle',
        operation: 'getOnboardingBundle',
        status: response.status,
        context: { styleDirection: filters.styleDirection ?? 'womenswear' },
      });
      throw new Error(`Failed to load onboarding bundle (${response.status})`);
    }

    const payload: unknown = await response.json();
    const bundle = parseOnboardingBundle(payload);

    logTelemetry({
      event: 'onboarding.bundle.loaded',
      endpoint: '/functions/v1/get-onboarding-bundle',
      operation: 'getOnboardingBundle',
      status: response.status,
      context: {
        styleDirection: filters.styleDirection ?? 'womenswear',
        styleCards: bundle.styleCards.length,
        colors: bundle.colors.length,
        occasions: bundle.occasions.length,
      },
    });

    return bundle;
  } catch (error) {
    if (error instanceof Error) {
      logTelemetry({
        event: 'onboarding.bundle.error',
        level: 'error',
        endpoint: '/functions/v1/get-onboarding-bundle',
        operation: 'getOnboardingBundle',
        message: error.name === 'AbortError' ? 'Request timed out' : error.message,
        context: { styleDirection: filters.styleDirection ?? 'womenswear' },
      });
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Loading the onboarding bundle timed out. Please retry.');
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
