import { uploadAvatarReferenceImage } from '@/libs/avatar-onboarding';
import { getOnboardingBundle, OnboardingBundle } from '@/libs/onboarding-bundle';
import {
  getMe,
  getOnboardingState,
  MeResponse,
  OnboardingState,
  saveAvatarReferences,
  saveOnboardingState,
  triggerOnboardingProcessing,
} from '@/libs/onboarding-service';
import { StyleDirection } from '@/types';
import { useAuth } from '@/provider/auth-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const onboardingQueryKeys = {
  me: (userId: string | null | undefined) => ['me', userId ?? 'anonymous'] as const,
  onboardingState: (userId: string | null | undefined) => ['onboarding-state', userId ?? 'anonymous'] as const,
  onboardingBundle: (userId: string | null | undefined, styleDirection: Exclude<StyleDirection, null> | 'unknown') =>
    ['onboarding-bundle', userId ?? 'anonymous', styleDirection] as const,
};

function useSessionIdentity() {
  const { session } = useAuth();

  return {
    accessToken: session?.access_token,
    userId: session?.user.id,
  };
}

export function useMe() {
  const { accessToken, userId } = useSessionIdentity();

  return useQuery<MeResponse>({
    queryKey: onboardingQueryKeys.me(userId),
    enabled: Boolean(accessToken && userId),
    queryFn: () => getMe(accessToken!),
    staleTime: 30 * 1000,
  });
}

export function useOnboardingState() {
  const { accessToken, userId } = useSessionIdentity();

  return useQuery<OnboardingState | null>({
    queryKey: onboardingQueryKeys.onboardingState(userId),
    enabled: Boolean(accessToken && userId),
    queryFn: () => getOnboardingState(),
    staleTime: 30 * 1000,
  });
}

export function useOnboardingBundle(styleDirection: StyleDirection) {
  const { accessToken, userId } = useSessionIdentity();
  const normalizedDirection = styleDirection === 'menswear' || styleDirection === 'womenswear' ? styleDirection : null;

  return useQuery<OnboardingBundle>({
    queryKey: onboardingQueryKeys.onboardingBundle(userId, normalizedDirection ?? 'unknown'),
    enabled: Boolean(accessToken && userId && normalizedDirection),
    queryFn: () => getOnboardingBundle(accessToken!, { styleDirection: normalizedDirection! }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveOnboardingStateMutation() {
  const queryClient = useQueryClient();
  const { userId } = useSessionIdentity();

  return useMutation({
    mutationFn: saveOnboardingState,
    onSuccess: async (savedState) => {
      queryClient.setQueryData<OnboardingState | null>(onboardingQueryKeys.onboardingState(userId), savedState);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) }),
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) }),
      ]);
    },
  });
}

export function useUploadAvatarPhotoMutation() {
  const { userId } = useSessionIdentity();

  return useMutation({
    mutationFn: async (localUri: string) => {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const uploadedPath = await uploadAvatarReferenceImage(userId, localUri);
      await saveAvatarReferences([uploadedPath]);
      return uploadedPath;
    },
  });
}

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();
  const { userId } = useSessionIdentity();

  return useMutation({
    mutationFn: async () => {
      const savedState = await saveOnboardingState({
        is_complete: true,
        status: 'saved',
        last_error: null,
      });

      queryClient.setQueryData<MeResponse | undefined>(onboardingQueryKeys.me(userId), (current) =>
        current
          ? {
              ...current,
              onboarding: {
                is_complete: true,
                status: savedState.status,
                processing_request_id: savedState.processingRequestId,
                updated_at: savedState.updatedAt,
              },
            }
          : current,
      );
      queryClient.setQueryData<OnboardingState | null>(onboardingQueryKeys.onboardingState(userId), savedState);

      void triggerOnboardingProcessing().catch((error) => {
        console.error('Failed to trigger onboarding processing:', error);
      });

      void queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) });
      void queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) });

      return savedState;
    },
  });
}
