import AsyncStorage from '@react-native-async-storage/async-storage';

const WARDROBE_IMPORT_TRACKER_KEY_PREFIX = 'modario-wardrobe-import-tracker';

const trackerKey = (userId: string) => `${WARDROBE_IMPORT_TRACKER_KEY_PREFIX}:${userId}`;

const normalizeIds = (ids: string[]) => Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));

export async function getTrackedWardrobeImportSessionIds(userId: string) {
  const stored = await AsyncStorage.getItem(trackerKey(userId));

  if (!stored) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? normalizeIds(parsed.filter((value): value is string => typeof value === 'string')) : [];
  } catch {
    return [] as string[];
  }
}

export async function trackWardrobeImportSessionIds(userId: string, ids: string[]) {
  const current = await getTrackedWardrobeImportSessionIds(userId);
  const next = normalizeIds([...current, ...ids]);
  await AsyncStorage.setItem(trackerKey(userId), JSON.stringify(next));

  return next;
}

export async function removeTrackedWardrobeImportSessionIds(userId: string, ids: string[]) {
  const removals = new Set(normalizeIds(ids));
  const current = await getTrackedWardrobeImportSessionIds(userId);
  const next = current.filter((id) => !removals.has(id));
  await AsyncStorage.setItem(trackerKey(userId), JSON.stringify(next));

  return next;
}
