const FALLBACK_SUPABASE_URL = 'https://example.supabase.co';
const FALLBACK_SUPABASE_KEY = 'public-anon-key-placeholder';

const isProduction = process.env.NODE_ENV === 'production';

const normalizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    if (parsed.protocol !== 'https:' && isProduction) {
      throw new Error('Supabase URL must use HTTPS in production environments.');
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    if (isProduction) {
      throw new Error('Invalid EXPO_PUBLIC_SUPABASE_URL configured for production.');
    }

    return FALLBACK_SUPABASE_URL;
  }
};

const resolveSupabaseUrl = (): string => {
  const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

  if (!rawUrl) {
    if (isProduction) {
      throw new Error('EXPO_PUBLIC_SUPABASE_URL is required in production.');
    }

    return FALLBACK_SUPABASE_URL;
  }

  return normalizeUrl(rawUrl);
};

const resolveSupabaseKey = (): string => {
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    if (isProduction) {
      throw new Error('EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required in production.');
    }

    return FALLBACK_SUPABASE_KEY;
  }

  return key;
};

export const supabaseUrl = resolveSupabaseUrl();
export const supabasePublishableKey = resolveSupabaseKey();
