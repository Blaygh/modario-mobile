import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/provider/auth-provider';
import {
  onboardingQueryKeys,
  useMe,
  useOnboardingBundle,
  useOnboardingState,
  useSaveOnboardingStateMutation,
  useSubmitOnboardingMutation,
} from '@/hooks/use-onboarding';
import { setOnboardingComplete, setOnboardingStateCache, getOnboardingStateCache } from '@/libs/onboarding-storage';
import { logTelemetry } from '@/libs/telemetry';
import { OnboardingPatch, OnboardingState } from '@/libs/onboarding-service';
import { OnboardingBundle } from '@/libs/onboarding-bundle';
import { StyleDirection } from '@/types';

type SaveOptions = {
  screen?: string;
  step?: string;
};

type OnboardingSessionContextValue = {
  meQuery: ReturnType<typeof useMe>;
  onboardingStateQuery: ReturnType<typeof useOnboardingState>;
  bundleQuery: ReturnType<typeof useOnboardingBundle>;
  draft: OnboardingState | null;
  backendState: OnboardingState | null;
  bundle: OnboardingBundle | undefined;
  styleDirection: StyleDirection;
  isBootstrapping: boolean;
  saveError: Error | null;
  saveDraft: (patch: OnboardingPatch, options?: SaveOptions) => Promise<OnboardingState>;
  retryBundle: () => Promise<unknown>;
  submitFinal: () => Promise<OnboardingState>;
};

const OnboardingSessionContext = createContext<OnboardingSessionContextValue | null>(null);

function mergeState(base: OnboardingState | null, override: Partial<OnboardingState> | null | undefined): OnboardingState | null {
  if (!base && !override) {
    return null;
  }

  const seed: OnboardingState = base ?? {
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

  return {
    ...seed,
    ...(override ?? {}),
  };
}

export function OnboardingProvider({ children }: PropsWithChildren) {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const submitMutation = useSubmitOnboardingMutation();

  const userId = session?.user.id ?? null;
  const [cachedState, setCachedState] = useState<OnboardingState | null>(null);
  const [draft, setDraft] = useState<OnboardingState | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    if (!userId) {
      setCachedState(null);
      setDraft(null);
      return;
    }

    getOnboardingStateCache(userId)
      .then((value) => {
        if (active) {
          setCachedState(value);
        }
      })
      .catch((error) => {
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

  useEffect(() => {
    const backendState = onboardingStateQuery.data ?? null;
    const next = mergeState(backendState, cachedState);
    setDraft(next);
  }, [cachedState, onboardingStateQuery.data]);

  useEffect(() => {
    if (!userId || !draft) {
      return;
    }

    void setOnboardingStateCache(userId, draft);
    void setOnboardingComplete(userId, draft.isComplete);
  }, [draft, userId]);

  const styleDirection = useMemo<StyleDirection>(() => {
    if (draft?.styleDirection === 'menswear' || draft?.styleDirection === 'womenswear') {
      return draft.styleDirection;
    }
    return null;
  }, [draft?.styleDirection]);

  const bundleQuery = useOnboardingBundle(styleDirection);

  const saveDraft = async (patch: OnboardingPatch, options?: SaveOptions) => {
    const optimistic = mergeState(draft, {
      styleDirection: patch.style_direction ?? draft?.styleDirection ?? null,
      stylePicks: patch.style_picks ?? draft?.stylePicks ?? null,
      colorLikes: patch.color_likes ?? draft?.colorLikes ?? [],
      colorAvoids: patch.color_avoids ?? draft?.colorAvoids ?? [],
      occasions: patch.occasions ?? draft?.occasions ?? [],
      avatarMode: patch.avatar_mode ?? draft?.avatarMode ?? null,
      avatarImageUrls: patch.avatar_image_urls ?? draft?.avatarImageUrls ?? [],
      avatarBaseModelId: patch.avatar_base_model_id ?? draft?.avatarBaseModelId ?? null,
      avatarSkinTonePresetId: patch.avatar_skin_tone_preset_id ?? draft?.avatarSkinTonePresetId ?? null,
      avatarBodyTypePresetId: patch.avatar_body_type_preset_id ?? draft?.avatarBodyTypePresetId ?? null,
      avatarFinalImageUrl: patch.avatar_final_image_url ?? draft?.avatarFinalImageUrl ?? null,
      isComplete: patch.is_complete ?? draft?.isComplete ?? false,
      status: patch.status ?? draft?.status ?? null,
      styleStatus: patch.style_status ?? draft?.styleStatus ?? null,
      avatarStatus: patch.avatar_status ?? draft?.avatarStatus ?? null,
      processingRequestId: patch.processing_request_id ?? draft?.processingRequestId ?? null,
      lastError: patch.last_error ?? draft?.lastError ?? null,
      updatedAt: new Date().toISOString(),
    });

    setSaveError(null);
    setDraft(optimistic);

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
        await setOnboardingComplete(userId, saved.isComplete);
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
      await setOnboardingComplete(userId, true);
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.onboardingState(userId) }),
      queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.me(userId) }),
    ]);
    return saved;
  };

  const value = useMemo<OnboardingSessionContextValue>(
    () => ({
      meQuery,
      onboardingStateQuery,
      bundleQuery,
      draft,
      backendState: onboardingStateQuery.data ?? null,
      bundle: bundleQuery.data,
      styleDirection,
      isBootstrapping: onboardingStateQuery.isLoading && !draft,
      saveError,
      saveDraft,
      retryBundle: bundleQuery.refetch,
      submitFinal,
    }),
    [bundleQuery, draft, meQuery, onboardingStateQuery, saveError, styleDirection],
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
