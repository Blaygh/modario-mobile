import * as Crypto from 'expo-crypto';

import { BaseAvatarModel } from '@/libs/modario-api';
import { supabase } from '@/libs/supabase';
import { StyleDirection } from '@/types';

export type BaseAvatarPreset = {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  isDefault: boolean;
};

export type BaseAvatarPreviewOption = {
  id: string;
  key: string;
  label: string;
  model: BaseAvatarModel;
  preset?: BaseAvatarPreset | null;
};

const imageExtensionFromUri = (uri: string) => {
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

const bySortOrder = <T extends { sortOrder: number; isDefault?: boolean }>(a: T, b: T) => {
  if (a.isDefault && !b.isDefault) return -1;
  if (!a.isDefault && b.isDefault) return 1;
  return a.sortOrder - b.sortOrder;
};

function dedupePresets(
  values: Array<{ id: string | null; key: string | null; label: string | null; sortOrder: number | null; isDefault: boolean | null }>,
): BaseAvatarPreset[] {
  const seen = new Map<string, BaseAvatarPreset>();

  values.forEach((value, index) => {
    const id = value.id ?? value.key;
    const key = value.key ?? value.id;

    if (!id || !key) {
      return;
    }

    const current = seen.get(id);
    const next: BaseAvatarPreset = {
      id,
      key,
      label: value.label ?? key,
      sortOrder: value.sortOrder ?? index + 1,
      isDefault: value.isDefault === true,
    };

    if (!current || bySortOrder(next, current) < 0) {
      seen.set(id, next);
    }
  });

  return Array.from(seen.values()).sort(bySortOrder);
}

function findBestModel(
  models: BaseAvatarModel[],
  filters: {
    styleDirection?: StyleDirection;
    skinTonePresetId?: string | null;
    bodyTypePresetId?: string | null;
  },
) {
  const exact = models.filter((model) => {
    const styleMatches = !filters.styleDirection || model.styleDirection === filters.styleDirection;
    const skinMatches = !filters.skinTonePresetId || model.skinTonePresetId === filters.skinTonePresetId;
    const bodyMatches = !filters.bodyTypePresetId || model.bodyTypePresetId === filters.bodyTypePresetId;
    return styleMatches && skinMatches && bodyMatches;
  });

  if (exact.length) {
    return exact.sort((a, b) => Number(a.sortOrder ?? 9999) - Number(b.sortOrder ?? 9999))[0] ?? null;
  }

  const relaxed = models.filter((model) => !filters.styleDirection || model.styleDirection === filters.styleDirection);
  return relaxed.sort((a, b) => Number(a.sortOrder ?? 9999) - Number(b.sortOrder ?? 9999))[0] ?? null;
}

export function deriveBaseAvatarOptions(models: BaseAvatarModel[]) {
  const skinTonePresets = dedupePresets(
    models.map((model) => ({
      id: model.skinTonePresetId,
      key: model.skinTonePresetKey,
      label: model.skinTonePresetName,
      sortOrder: model.skinToneSortOrder,
      isDefault: model.skinToneIsDefault,
    })),
  );
  const bodyTypePresets = dedupePresets(
    models.map((model) => ({
      id: model.bodyTypePresetId,
      key: model.bodyTypePresetKey,
      label: model.bodyTypePresetName,
      sortOrder: model.bodyTypeSortOrder,
      isDefault: model.bodyTypeIsDefault,
    })),
  );

  const defaultSkinTone = skinTonePresets[0] ?? null;
  const defaultBodyType = bodyTypePresets[0] ?? null;

  const directions: Array<Exclude<StyleDirection, null>> = ['womenswear', 'menswear'];
  const styleDirectionOptions = directions.reduce<BaseAvatarPreviewOption[]>((options, styleDirection) => {
    const model = findBestModel(models, {
      styleDirection,
      skinTonePresetId: defaultSkinTone?.id ?? null,
      bodyTypePresetId: defaultBodyType?.id ?? null,
    });

    if (!model) {
      return options;
    }

    options.push({
      id: styleDirection,
      key: styleDirection,
      label: styleDirection === 'menswear' ? 'Menswear-leaning' : 'Womenswear-leaning',
      model,
      preset: null,
    });
    return options;
  }, []);

  return {
    defaultSkinTone,
    defaultBodyType,
    skinTonePresets,
    bodyTypePresets,
    styleDirectionOptions,
  };
}

export function getSkinTonePreviewOptions(models: BaseAvatarModel[], styleDirection: Exclude<StyleDirection, null>) {
  const { skinTonePresets, defaultBodyType } = deriveBaseAvatarOptions(models);

  return skinTonePresets.reduce<BaseAvatarPreviewOption[]>((options, preset) => {
    const model = findBestModel(models, {
      styleDirection,
      skinTonePresetId: preset.id,
      bodyTypePresetId: defaultBodyType?.id ?? null,
    });

    if (!model) {
      return options;
    }

    options.push({
      id: preset.id,
      key: preset.key,
      label: preset.label,
      model,
      preset,
    });
    return options;
  }, []);
}

export function getBodyTypePreviewOptions(models: BaseAvatarModel[], styleDirection: Exclude<StyleDirection, null>, skinTonePresetId: string) {
  const { bodyTypePresets } = deriveBaseAvatarOptions(models);

  return bodyTypePresets.reduce<BaseAvatarPreviewOption[]>((options, preset) => {
    const model = findBestModel(models, {
      styleDirection,
      skinTonePresetId,
      bodyTypePresetId: preset.id,
    });

    if (!model) {
      return options;
    }

    options.push({
      id: preset.id,
      key: preset.key,
      label: preset.label,
      model,
      preset,
    });
    return options;
  }, []);
}

export function getMatchingBaseModels(
  models: BaseAvatarModel[],
  filters: {
    styleDirection: Exclude<StyleDirection, null>;
    skinTonePresetId: string;
    bodyTypePresetId: string;
  },
) {
  return models
    .filter(
      (model) =>
        model.styleDirection === filters.styleDirection &&
        model.skinTonePresetId === filters.skinTonePresetId &&
        model.bodyTypePresetId === filters.bodyTypePresetId,
    )
    .sort((a, b) => Number(a.sortOrder ?? 9999) - Number(b.sortOrder ?? 9999));
}

export function deriveAvatarDraftFromSelection(models: BaseAvatarModel[], selectedBaseModelId?: string | null) {
  const model = models.find((entry) => entry.id === selectedBaseModelId);

  if (!model) {
    return null;
  }

  return {
    styleDirection: model.styleDirection,
    skinTonePresetId: model.skinTonePresetId,
    bodyTypePresetId: model.bodyTypePresetId,
    baseModelId: model.id,
  };
}

export async function uploadAvatarReferenceImage(userId: string, localUri: string) {
  const extension = imageExtensionFromUri(localUri);
  const path = `u_${userId}/reference/${Crypto.randomUUID()}.${extension}`;
  const contentType = contentTypeFromExtension(extension);

  const { data: signedData, error: signedError } = await supabase.storage.from('avatars').createSignedUploadUrl(path);

  if (signedError || !signedData?.token) {
    throw new Error(signedError?.message ?? 'Failed to create signed avatar upload URL');
  }

  const imageResponse = await fetch(localUri);
  const imageBlob = await imageResponse.blob();
  const imageBuffer = await imageBlob.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from('avatars').uploadToSignedUrl(path, signedData.token, imageBuffer, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload avatar reference image');
  }

  return path;
}
