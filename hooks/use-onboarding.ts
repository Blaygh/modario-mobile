import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { uploadAvatarReferenceImage } from '@/libs/avatar-onboarding';
import { getOnboardingBundle, OnboardingBundle } from '@/libs/onboarding-bundle';
import { setOnboardingComplete, setOnboardingStateCache } from '@/libs/onboarding-storage';
import {
  getMe,
  getOnboardingState,
  MeResponse,
  OnboardingState,
  saveAvatarReferences,
  saveOnboardingState,
  triggerOnboardingProcessing,
} from '@/libs/onboarding-service';
import { logTelemetry } from '@/libs/telemetry';
import { useAuth } from '@/provider/auth-provider';
import { StyleDirection } from '@/types';

export const onboardingQueryKeys = {
  session: (userId: string | null | undefined) => ['session', userId ?? 'anonymous'] as const,
  me: (userId: string | null | undefined) => ['me', userId ?? 'anonymous'] as const,
  onboardingState: (userId: string | null | undefined) => ['onboardingState', userId ?? 'anonymous'] as const,
  onboardingBundle: (userId: string | null | undefined, styleDirection: Exclude<StyleDirection, null> | 'unknown') =>
    ['onboardingBundle', userId ?? 'anonymous', styleDirection] as const,
};

function useSessionIdentity() {
  const { session } = useAuth();

  return {
    accessToken: session?.access_token,
    userId: session?.user.id,
  };
}

function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= 2) {
    return false;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('malformed') || message.includes('missing')) {
    return false;
  }

  return true;
}

export function useMe() {
  const { accessToken, userId } = useSessionIdentity();

  return useQuery<MeResponse>({
    queryKey: onboardingQueryKeys.me(userId),
    enabled: Boolean(accessToken && userId),
    queryFn: async () => {
      const data = await getMe(accessToken!);
      logTelemetry({ event: 'onboarding.me.loaded', operation: 'getMe', userId });
      return data;
    },
    staleTime: 30 * 1000,
    retry: shouldRetry,
  });
}

export function useOnboardingState() {
  const { userId } = useSessionIdentity();

  return useQuery<OnboardingState | null>({
    queryKey: onboardingQueryKeys.onboardingState(userId),
    enabled: Boolean(userId),
    queryFn: async () => {
      const data = await getOnboardingState();
      logTelemetry({ event: 'onboarding.state.loaded', operation: 'getOnboardingState', userId, context: { isComplete: data?.isComplete ?? false } });
      return data;
    },
    staleTime: 30 * 1000,
    retry: shouldRetry,
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
    gcTime: 15 * 60 * 1000,
    retry: shouldRetry,
  });
}

export function useSaveOnboardingStateMutation() {
  const queryClient = useQueryClient();
  const { userId } = useSessionIdentity();

  return useMutation({
    mutationFn: saveOnboardingState,
    onSuccess: async (savedState) => {
      queryClient.setQueryData<OnboardingState | null>(onboardingQueryKeys.onboardingState(userId), savedState);
      if (userId) {
        await setOnboardingStateCache(userId, savedState);
        await setOnboardingComplete(userId, savedState.isComplete);
      }
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

      if (userId) {
        await setOnboardingStateCache(userId, savedState);
        await setOnboardingComplete(userId, true);
      }

      void triggerOnboardingProcessing().catch((error) => {
        logTelemetry({
          event: 'onboarding.processing.trigger_failed',
          level: 'warn',
          operation: 'triggerOnboardingProcessing',
          userId,
          message: error instanceof Error ? error.message : 'Unknown processing trigger error',
        });
      });

      void queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) });
      void queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) });

      return savedState;
    },
  });
}
