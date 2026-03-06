import { createClient, SupportedStorage } from '@supabase/supabase-js';

import { supabasePublishableKey, supabaseUrl } from './supabase-config';

const isBrowser = typeof window !== 'undefined';

const browserStorage: SupportedStorage = {
  getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(window.localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(window.localStorage.removeItem(key)),
};

const noopStorage: SupportedStorage = {
  getItem: () => Promise.resolve(null),
  setItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
};

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: isBrowser ? browserStorage : noopStorage,
    autoRefreshToken: isBrowser,
    persistSession: isBrowser,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'modario-mobile-web',
    },
  },
});
