import AsyncStorage from '@react-native-async-storage/async-storage';

export type AvatarChoice = 'upload' | 'base' | 'skip' | null;
export type BaseModelGender = 'male' | 'female' | null;
export type StyleDirection = 'menswear' | 'womenswear' | null;

export type OnboardingProfile = {
  styleCardIds: string[];
  likedColors: string[];
  avoidedColors: string[];
  occasions: string[];
  avatarChoice: AvatarChoice;
  styleDirection: StyleDirection;
  baseModelGender: BaseModelGender;
  skinTone: string | null;
  bodyType: string | null;
};

export const ONBOARDING_PROFILE_KEY = 'modario-onboarding-profile';
const ONBOARDING_COMPLETED_KEY_PREFIX = 'modario-onboarding-completed';

const onboardingCompletionKey = (userId: string) => `${ONBOARDING_COMPLETED_KEY_PREFIX}:${userId}`;

export const defaultOnboardingProfile: OnboardingProfile = {
  styleCardIds: [],
  likedColors: [],
  avoidedColors: [],
  occasions: [],
  avatarChoice: null,
  styleDirection: null,
  baseModelGender: null,
  skinTone: null,
  bodyType: null,
};

export async function getOnboardingProfile(): Promise<OnboardingProfile> {
  const stored = await AsyncStorage.getItem(ONBOARDING_PROFILE_KEY);
  if (!stored) {
    return defaultOnboardingProfile;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<OnboardingProfile>;
    return {
      ...defaultOnboardingProfile,
      ...parsed,
      styleCardIds: parsed.styleCardIds ?? [],
      likedColors: parsed.likedColors ?? [],
      avoidedColors: parsed.avoidedColors ?? [],
      occasions: parsed.occasions ?? [],
    };
  } catch {
    return defaultOnboardingProfile;
  }
}

export async function updateOnboardingProfile(patch: Partial<OnboardingProfile>) {
  const current = await getOnboardingProfile();
  const next: OnboardingProfile = { ...current, ...patch };
  await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(next));
  return next;
}

export async function isOnboardingComplete(userId: string) {
  const completed = await AsyncStorage.getItem(onboardingCompletionKey(userId));
  return completed === 'true';
}

export async function setOnboardingComplete(userId: string, completed: boolean) {
  await AsyncStorage.setItem(onboardingCompletionKey(userId), completed ? 'true' : 'false');
}
