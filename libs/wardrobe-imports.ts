import * as Crypto from 'expo-crypto';

import { supabase } from '@/libs/supabase';

const WARDROBE_IMPORTS_ENDPOINT = 'http://api.modario.io/wardrobe/imports';

type ImportSession = {
  id: string;
  user_id: string;
  mode: string;
  status: string;
  last_error: string | null;
  source_image_url: string;
  created_at: string;
  updated_at: string;
};

type ImportSessionsResponse = {
  import_sessions: ImportSession[];
};

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

export async function uploadWardrobeImportImage(userId: string, localUri: string) {
  const extension = fileExtensionFromUri(localUri);
  const randomUuid = Crypto.randomUUID();
  const path = `u_${userId}/imports/${randomUuid}.${extension}`;

  const imageResponse = await fetch(localUri);
  const imageBlob = await imageResponse.blob();

  const { error } = await supabase.storage.from('wardrobe').upload(path, imageBlob, {
    contentType: contentTypeFromExtension(extension),
    upsert: false,
  });

  if (error) {
    throw new Error(error.message || 'Failed to upload wardrobe image');
  }

  return path;
}

export async function createWardrobeImports(accessToken: string, sourceImageUrls: string[]) {
  const response = await fetch(WARDROBE_IMPORTS_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_image_urls: sourceImageUrls,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create wardrobe imports (${response.status})`);
  }

  return (await response.json()) as ImportSessionsResponse;
}
