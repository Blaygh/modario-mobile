import { getMe, getOnboardingState, MeResponse, OnboardingState, saveOnboardingState, triggerOnboardingProcessing } from '@/libs/onboarding-service';
import { getOnboardingBundle, OnboardingBundle } from '@/libs/onboarding-bundle';
import { StyleDirection } from '@/types';
import { useAuth } from '@/provider/auth-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const onboardingQueryKeys = {
  me: ['me'] as const,
  onboardingState: ['onboarding-state'] as const,
  onboardingBundle: (styleDirection: Exclude<StyleDirection, null> | 'unknown') => ['onboarding-bundle', styleDirection] as const,
};

function useAccessToken() {
  const { session } = useAuth();
  return session?.access_token;
}

export function useMe() {
  const accessToken = useAccessToken();

  return useQuery<MeResponse>({
    queryKey: onboardingQueryKeys.me,
    enabled: Boolean(accessToken),
    queryFn: () => getMe(accessToken!),
    staleTime: 30 * 1000,
  });
}

export function useOnboardingState() {
  const { session } = useAuth();

  return useQuery<OnboardingState | null>({
    queryKey: onboardingQueryKeys.onboardingState,
    enabled: Boolean(session),
    queryFn: () => getOnboardingState(),
    staleTime: 30 * 1000,
  });
}

export function useOnboardingBundle(styleDirection: StyleDirection) {
  const accessToken = useAccessToken();
  const normalizedDirection = styleDirection === 'menswear' || styleDirection === 'womenswear' ? styleDirection : null;

  return useQuery<OnboardingBundle>({
    queryKey: onboardingQueryKeys.onboardingBundle(normalizedDirection ?? 'unknown'),
    enabled: Boolean(accessToken && normalizedDirection),
    queryFn: () => getOnboardingBundle(accessToken!, { styleDirection: normalizedDirection! }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveOnboardingStateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveOnboardingState,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState }),
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me }),
      ]);
    },
  });
}

export function useSubmitOnboardingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const savedState = await saveOnboardingState({
        is_complete: true,
        status: 'saved',
        last_error: null,
      });

      queryClient.setQueryData<MeResponse | undefined>(onboardingQueryKeys.me, (current) =>
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
      queryClient.setQueryData<OnboardingState | null>(onboardingQueryKeys.onboardingState, savedState);

      try {
        await triggerOnboardingProcessing();
      } catch (error) {
        console.error('Failed to trigger onboarding processing:', error);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState }),
        queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me }),
      ]);

      return savedState;
    },
  });
}
