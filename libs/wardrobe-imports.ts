import * as Crypto from 'expo-crypto';

import { supabase } from '@/libs/supabase';

const WARDROBE_API_BASE = 'https://api.modario.io';
const WARDROBE_IMPORTS_ENDPOINT = `${WARDROBE_API_BASE}/wardrobe/imports`;


export type WardrobeItem = {
  id: string;
  user_id: string;
  role: string;
  item_type: string | null;
  attributes: Record<string, unknown>;
  active: boolean;
  metadata: Record<string, unknown>;
  image: {
    status: string;
    display_url: string | null;
    generated_path: string | null;
    primary_path: string | null;
    last_error: string | null;
    generated_at: string | null;
  };
  created_at: string;
  updated_at: string;
};

export type WardrobeItemsResponse = {
  items: WardrobeItem[];
};

export type ImportSession = {
  id: string;
  user_id: string;
  mode: string;
  status: string;
  last_error: string | null;
  source_image_url: string;
  created_at: string;
  updated_at: string;
};

export type ImportSessionsResponse = {
  import_sessions: ImportSession[];
};

export type ImportDetectedItem = {
  detected_item_id: string;
  role_suggestion: string | null;
  label: string | null;
  confidence: number | null;
  crop: Record<string, unknown>;
  crop_storage_url: string | null;
  attributes_preview: Record<string, unknown>;
};

export type ImportSessionDetailsResponse = {
  import_session: {
    id: string;
    user_id: string;
    mode: string;
    status: string;
    last_error: string | null;
  };
  source_image: {
    storage_url: string;
  };
  detected_items: ImportDetectedItem[];
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

export async function listWardrobeImports(accessToken: string, limit = 20, offset = 0) {
  const response = await fetch(`${WARDROBE_IMPORTS_ENDPOINT}?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list wardrobe imports (${response.status})`);
  }

  return (await response.json()) as ImportSessionsResponse;
}

export async function getWardrobeImportDetails(accessToken: string, importSessionId: string) {
  const response = await fetch(`${WARDROBE_IMPORTS_ENDPOINT}/${importSessionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load import details (${response.status})`);
  }

  return (await response.json()) as ImportSessionDetailsResponse;
}

export async function commitWardrobeImportDecisions(
  accessToken: string,
  importSessionId: string,
  decisions: Array<{ detected_item_id: string; include: boolean }>,
) {
  const response = await fetch(`${WARDROBE_IMPORTS_ENDPOINT}/${importSessionId}/commit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decisions }),
  });

  if (!response.ok) {
    throw new Error(`Failed to commit import decisions (${response.status})`);
  }
}

export const isReviewRequiredStatus = (status: string | null | undefined) => {
  const value = (status ?? '').toLowerCase();
  return value.includes('review');
};


export async function listWardrobeItems(
  accessToken: string,
  options?: { limit?: number; offset?: number; active?: boolean; role?: string },
) {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  const active = options?.active ?? true;

  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    active: String(active),
  });

  if (options?.role) {
    query.set('role', options.role);
  }

  const response = await fetch(`${WARDROBE_API_BASE}/items?${query.toString()}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to list wardrobe items (${response.status})`);
  }

  return (await response.json()) as WardrobeItemsResponse;
}
