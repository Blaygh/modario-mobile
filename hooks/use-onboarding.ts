import {
  buildBaseModelStyleCards,
  buildBodyTypeCards,
  buildSkinToneCards,
  deriveBaseModelSelections,
  fetchOnboardingBundle,
  fetchOnboardingState,
  fetchMe,
  getMatchingBaseModels,
  saveOnboardingDraft,
  submitOnboarding,
  uploadAvatarReferenceImage,
} from '@/libs/onboarding-service';
import { useBaseAvatars, useCurrentAvatar, useMe, modarioQueryKeys } from '@/hooks/use-modario-data';
import { useAuth } from '@/provider/auth-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const onboardingQueryKeys = {
  state: ['onboarding-state'] as const,
  bundle: (styleDirection: string) => ['onboarding-bundle', styleDirection] as const,
};

export function useOnboardingState() {
  return useQuery({
    queryKey: onboardingQueryKeys.state,
    queryFn: fetchOnboardingState,
    staleTime: 30 * 1000,
  });
}

export function useOnboardingBundle(styleDirection?: 'menswear' | 'womenswear' | null) {
  const { session } = useAuth();
  const resolvedDirection = styleDirection ?? 'womenswear';

  return useQuery({
    queryKey: onboardingQueryKeys.bundle(resolvedDirection),
    enabled: Boolean(session?.access_token && styleDirection),
    queryFn: () => fetchOnboardingBundle(session!.access_token, resolvedDirection),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveOnboardingDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveOnboardingDraft,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.state });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.me });
    },
  });
}

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitOnboarding,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.state });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.me });
    },
  });
}

export function useUploadAvatarReferenceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, localUri }: { userId: string; localUri: string }) => uploadAvatarReferenceImage(userId, localUri),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.state });
    },
  });
}

export function useOnboardingGate() {
  const meQuery = useMe();
  const onboardingStateQuery = useOnboardingState();

  const isLoading = meQuery.isLoading || onboardingStateQuery.isLoading;
  const hasCompletedOnboarding = onboardingStateQuery.data?.isComplete ?? meQuery.data?.onboardingComplete ?? false;

  return {
    meQuery,
    onboardingStateQuery,
    isLoading,
    hasCompletedOnboarding,
  };
}

export function useAvatarFlowData(styleDirection?: 'menswear' | 'womenswear' | null) {
  const onboardingStateQuery = useOnboardingState();
  const resolvedDirection = styleDirection ?? onboardingStateQuery.data?.styleDirection ?? 'womenswear';
  const bundleQuery = useOnboardingBundle(resolvedDirection);
  const baseModelsQuery = useBaseAvatars();
  const currentAvatarQuery = useCurrentAvatar();

  const derivedSelections = deriveBaseModelSelections(onboardingStateQuery.data ?? null, bundleQuery.data, baseModelsQuery.data ?? []);

  return {
    onboardingStateQuery,
    bundleQuery,
    baseModelsQuery,
    currentAvatarQuery,
    derivedSelections,
    styleCards: buildBaseModelStyleCards(baseModelsQuery.data ?? [], bundleQuery.data?.baseAvatarFlow ?? null),
    getSkinToneCards: (nextStyleDirection: 'menswear' | 'womenswear') =>
      buildSkinToneCards(baseModelsQuery.data ?? [], bundleQuery.data?.baseAvatarFlow ?? null, nextStyleDirection),
    getBodyTypeCards: (nextStyleDirection: 'menswear' | 'womenswear', skinTonePresetId: string) =>
      buildBodyTypeCards(baseModelsQuery.data ?? [], bundleQuery.data?.baseAvatarFlow ?? null, nextStyleDirection, skinTonePresetId),
    getMatchingBaseModels: (nextStyleDirection: 'menswear' | 'womenswear', skinTonePresetId: string, bodyTypePresetId: string) =>
      getMatchingBaseModels(baseModelsQuery.data ?? [], nextStyleDirection, skinTonePresetId, bodyTypePresetId),
  };
}

export { fetchMe };
