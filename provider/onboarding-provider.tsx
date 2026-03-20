import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import {
  onboardingQueryKeys,
  useMe,
  useOnboardingBundle,
  useOnboardingState,
  useSaveOnboardingStateMutation,
  useSubmitOnboardingMutation,
} from '@/hooks/use-onboarding';
import {
  clearOnboardingStateCache,
  getOnboardingStateCache,
  setOnboardingStateCache,
} from '@/libs/onboarding-storage';
import { OnboardingBundle } from '@/libs/onboarding-bundle';
import { OnboardingPatch, OnboardingState } from '@/libs/onboarding-service';
import { logTelemetry } from '@/libs/telemetry';
import { useAuth } from '@/provider/auth-provider';
import { StyleDirection } from '@/types';

type SaveOptions = {
  screen?: string;
  step?: string;
};

type RoutingTarget = 'auth' | 'onboarding' | 'tabs';

type OnboardingSessionContextValue = {
  meQuery: ReturnType<typeof useMe>;
  onboardingStateQuery: ReturnType<typeof useOnboardingState>;
  bundleQuery: ReturnType<typeof useOnboardingBundle>;
  draft: OnboardingState | null;
  backendState: OnboardingState | null;
  bundle: OnboardingBundle | undefined;
  styleDirection: StyleDirection;
  backendOnboardingComplete: boolean;
  bootstrapError: Error | null;
  hasBootstrapData: boolean;
  isBootstrapping: boolean;
  isRoutingReady: boolean;
  routingTarget: RoutingTarget;
  saveError: Error | null;
  saveDraft: (patch: OnboardingPatch, options?: SaveOptions) => Promise<OnboardingState>;
  retryBundle: () => Promise<unknown>;
  retryBootstrap: () => Promise<unknown>;
  submitFinal: () => Promise<OnboardingState>;
};

const OnboardingSessionContext = createContext<OnboardingSessionContextValue | null>(null);

function emptyOnboardingState(): OnboardingState {
  return {
    styleDirection: null,
    stylePicks: null,
    colorLikes: [],
    colorAvoids: [],
    occasions: [],
    avatarMode: null,
    avatarImageUrls: [],
    avatarBaseModelId: null,
    avatarSkinTonePresetId: null,
    avatarBodyTypePresetId: null,
    avatarFinalImageUrl: null,
    isComplete: false,
    status: null,
    styleStatus: null,
    avatarStatus: null,
    processingRequestId: null,
    processedAt: null,
    fullyProcessed: false,
    fullyProcessedAt: null,
    updatedAt: null,
    lastError: null,
  };
}

function mergeState(base: OnboardingState | null, override: Partial<OnboardingState> | null | undefined): OnboardingState {
  return {
    ...(base ?? emptyOnboardingState()),
    ...(override ?? {}),
  };
}

function patchToDraftState(current: OnboardingState | null, patch: OnboardingPatch): OnboardingState {
  return mergeState(current, {
    styleDirection: patch.style_direction ?? current?.styleDirection ?? null,
    stylePicks: patch.style_picks ?? current?.stylePicks ?? null,
    colorLikes: patch.color_likes ?? current?.colorLikes ?? [],
    colorAvoids: patch.color_avoids ?? current?.colorAvoids ?? [],
    occasions: patch.occasions ?? current?.occasions ?? [],
    avatarMode: patch.avatar_mode ?? current?.avatarMode ?? null,
    avatarImageUrls: patch.avatar_image_urls ?? current?.avatarImageUrls ?? [],
    avatarBaseModelId: patch.avatar_base_model_id ?? current?.avatarBaseModelId ?? null,
    avatarSkinTonePresetId: patch.avatar_skin_tone_preset_id ?? current?.avatarSkinTonePresetId ?? null,
    avatarBodyTypePresetId: patch.avatar_body_type_preset_id ?? current?.avatarBodyTypePresetId ?? null,
    avatarFinalImageUrl: patch.avatar_final_image_url ?? current?.avatarFinalImageUrl ?? null,
    isComplete: patch.is_complete ?? current?.isComplete ?? false,
    status: patch.status ?? current?.status ?? null,
    styleStatus: patch.style_status ?? current?.styleStatus ?? null,
    avatarStatus: patch.avatar_status ?? current?.avatarStatus ?? null,
    processingRequestId: patch.processing_request_id ?? current?.processingRequestId ?? null,
    lastError: patch.last_error ?? current?.lastError ?? null,
    updatedAt: new Date().toISOString(),
  });
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const { session, initialized } = useAuth();
  const authReady = initialized ?? false;
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const submitMutation = useSubmitOnboardingMutation();

  const userId = session?.user.id ?? null;
  const previousUserIdRef = useRef<string | null>(null);
  const [cachedState, setCachedState] = useState<OnboardingState | null>(null);
  const [cacheHydrated, setCacheHydrated] = useState(false);
  const [draft, setDraft] = useState<OnboardingState | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setCachedState(null);
      setDraft(null);
      setCacheHydrated(true);
      previousUserIdRef.current = null;
      return;
    }

    if (previousUserIdRef.current && previousUserIdRef.current !== userId) {
      setCachedState(null);
      setDraft(null);
    }

    previousUserIdRef.current = userId;
    setCacheHydrated(false);

    getOnboardingStateCache(userId)
      .then((value) => {
        if (!active) {
          return;
        }

        setCachedState(value);
        setCacheHydrated(true);
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setCacheHydrated(true);
        logTelemetry({
          event: 'onboarding.cache.read_failed',
          level: 'warn',
          operation: 'getOnboardingStateCache',
          userId,
          message: error instanceof Error ? error.message : 'Unknown cache read error',
        });
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const backendState = onboardingStateQuery.data ?? null;
  const backendOnboardingComplete = meQuery.data?.onboarding?.is_complete ?? backendState?.isComplete ?? false;
  const bootstrapError = useMemo(() => {
    const meError = meQuery.error instanceof Error ? meQuery.error : null;
    const onboardingError = onboardingStateQuery.error instanceof Error ? onboardingStateQuery.error : null;
    return meError ?? onboardingError;
  }, [meQuery.error, onboardingStateQuery.error]);
  const hasBootstrapData = Boolean(meQuery.data || onboardingStateQuery.data || onboardingStateQuery.status === 'success');
  const blockingBootstrapError = hasBootstrapData ? null : bootstrapError;
  const awaitingBackendTruth = Boolean(userId) && (meQuery.isLoading || onboardingStateQuery.isLoading || meQuery.isFetching || onboardingStateQuery.isFetching);
  const isBootstrapping = Boolean(userId) && (!cacheHydrated || (!hasBootstrapData && awaitingBackendTruth));
  const isRoutingReady = authReady && (!session || (!awaitingBackendTruth && (hasBootstrapData || Boolean(blockingBootstrapError))));

  useEffect(() => {
    if (!userId) {
      return;
    }

    if (backendState) {
      const canonicalState = mergeState(cachedState, backendState);
      setDraft(canonicalState);
      void setOnboardingStateCache(userId, canonicalState);
      return;
    }

    if (onboardingStateQuery.status === 'success') {
      const incompleteCachedDraft = cachedState && !cachedState.isComplete ? cachedState : null;

      if (cachedState && cachedState.isComplete && !backendOnboardingComplete) {
        logTelemetry({
          event: 'onboarding.cache.discarded',
          level: 'warn',
          operation: 'reconcileOnboardingCache',
          userId,
          fallbackUsed: false,
          message: 'Discarded stale onboarding cache because backend reported incomplete onboarding.',
        });
      }

      const nextDraft = mergeState(incompleteCachedDraft, {
        isComplete: backendOnboardingComplete,
        status: meQuery.data?.onboarding?.status ?? incompleteCachedDraft?.status ?? null,
        processingRequestId: meQuery.data?.onboarding?.processing_request_id ?? incompleteCachedDraft?.processingRequestId ?? null,
        updatedAt: meQuery.data?.onboarding?.updated_at ?? incompleteCachedDraft?.updatedAt ?? null,
      });

      setDraft(nextDraft);
      if (cachedState?.isComplete) {
        void clearOnboardingStateCache(userId);
      } else {
        void setOnboardingStateCache(userId, nextDraft);
      }
      return;
    }

    if (cachedState) {
      setDraft(cachedState);
    }
  }, [backendOnboardingComplete, backendState, cachedState, meQuery.data?.onboarding?.processing_request_id, meQuery.data?.onboarding?.status, meQuery.data?.onboarding?.updated_at, onboardingStateQuery.status, userId]);

  const styleDirection = useMemo<StyleDirection>(() => {
    const candidate = draft?.styleDirection ?? backendState?.styleDirection ?? null;
    return candidate === 'menswear' || candidate === 'womenswear' ? candidate : null;
  }, [backendState?.styleDirection, draft?.styleDirection]);

  const bundleQuery = useOnboardingBundle(styleDirection);

  const saveDraft = async (patch: OnboardingPatch, options?: SaveOptions) => {
    const optimistic = patchToDraftState(draft, patch);

    setSaveError(null);
    setDraft(optimistic);

    if (userId) {
      await setOnboardingStateCache(userId, optimistic);
    }

    logTelemetry({
      event: 'onboarding.save_draft.started',
      operation: 'saveOnboardingDraft',
      screen: options?.screen,
      step: options?.step,
      userId,
    });

    try {
      const saved = await saveMutation.mutateAsync(patch);
      setDraft(saved);
      if (userId) {
        await setOnboardingStateCache(userId, saved);
      }
      return saved;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error('Unable to save onboarding progress.');
      setSaveError(normalizedError);
      logTelemetry({
        event: 'onboarding.save_draft.failed',
        level: 'error',
        operation: 'saveOnboardingDraft',
        screen: options?.screen,
        step: options?.step,
        userId,
        message: normalizedError.message,
      });
      throw normalizedError;
    }
  };

  const submitFinal = async () => {
    const saved = await submitMutation.mutateAsync();
    setDraft(saved);
    if (userId) {
      await setOnboardingStateCache(userId, saved);
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) }),
      queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) }),
    ]);
    return saved;
  };

  const retryBootstrap = async () => {
    const tasks: Promise<unknown>[] = [];

    if (userId) {
      tasks.push(queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) }));
      tasks.push(queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) }));
      tasks.push(meQuery.refetch());
      tasks.push(onboardingStateQuery.refetch());
    }

    return Promise.all(tasks);
  };

  const routingTarget: RoutingTarget = !session ? 'auth' : backendOnboardingComplete ? 'tabs' : 'onboarding';

  const value = useMemo<OnboardingSessionContextValue>(
    () => ({
      meQuery,
      onboardingStateQuery,
      bundleQuery,
      draft,
      backendState,
      bundle: bundleQuery.data,
      styleDirection,
      backendOnboardingComplete,
      bootstrapError: blockingBootstrapError,
      hasBootstrapData,
      isBootstrapping,
      isRoutingReady,
      routingTarget,
      saveError,
      saveDraft,
      retryBundle: bundleQuery.refetch,
      retryBootstrap,
      submitFinal,
    }),
    [
      backendOnboardingComplete,
      backendState,
      blockingBootstrapError,
      bundleQuery,
      draft,
      hasBootstrapData,
      isBootstrapping,
      isRoutingReady,
      meQuery,
      onboardingStateQuery,
      routingTarget,
      saveError,
      styleDirection,
    ],
  );

  return <OnboardingSessionContext.Provider value={value}>{children}</OnboardingSessionContext.Provider>;
}

export function useOnboardingSession() {
  const context = useContext(OnboardingSessionContext);

  if (!context) {
    throw new Error('useOnboardingSession must be used within OnboardingProvider');
  }

  return context;
}
