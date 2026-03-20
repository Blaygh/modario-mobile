import {
  BillingPlan,
  createBillingCheckoutSession,
  createPlannedOutfit,
  CurrentAvatar,
  deletePlannedOutfit,
  deleteSavedOutfit,
  deleteWardrobeItem,
  getBillingEntitlement,
  getBillingPlans,
  getCurrentAvatar,
  getImportSession,
  getOutfitRecommendations,
  getProfile,
  getSavedOutfitDetail,
  getWardrobeItemDetail,
  listBaseAvatarModels,
  listPlannedOutfits,
  listSavedOutfits,
  listWardrobeItems,
  RecommendationCandidate,
  renameSavedOutfit,
  saveCandidate,
  SavedOutfitDetail,
  SavedOutfitSummary,
  selectBaseAvatar,
  updatePlannedOutfit,
  updateWardrobeItem,
  commitWardrobeImportReview,
} from '@/libs/modario-api';
import { useAuth } from '@/provider/auth-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const modarioQueryKeys = {
  me: ['me'] as const,
  onboardingState: ['onboardingState'] as const,
  onboardingBundle: (styleDirection?: string | null) => ['onboardingBundle', styleDirection ?? 'unknown'] as const,
  baseModels: (styleDirection?: string | null) => ['baseModels', styleDirection ?? 'all'] as const,
  currentAvatar: ['currentAvatar'] as const,
  outfitRecommendations: ['outfitRecommendations'] as const,
  savedOutfits: ['savedOutfits'] as const,
  savedOutfitDetail: (outfitId: string) => ['savedOutfitDetail', outfitId] as const,
  plannedOutfits: (from: string, to: string) => ['plannedOutfits', from, to] as const,
  wardrobeItems: (active: 'active' | 'archived', role?: string | null) => ['wardrobeItems', active, role ?? 'all'] as const,
  wardrobeItemDetail: (itemId: string) => ['wardrobeItemDetail', itemId] as const,
  wardrobeImportSession: (sessionId: string) => ['wardrobeImportSession', sessionId] as const,
  billingPlans: ['billingPlans'] as const,
  billingEntitlement: ['billingEntitlement'] as const,
};

function useAccessToken() {
  const { session } = useAuth();
  return session?.access_token;
}

function invalidateAllPlannedOutfits(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: ['plannedOutfits'] });
}

export function useProfile() {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.me,
    enabled: Boolean(accessToken),
    queryFn: () => getProfile(accessToken!),
    staleTime: 30 * 1000,
  });
}

export function useOutfitRecommendations() {
  const accessToken = useAccessToken();

  return useQuery<RecommendationCandidate[]>({
    queryKey: modarioQueryKeys.outfitRecommendations,
    enabled: Boolean(accessToken),
    queryFn: () => getOutfitRecommendations(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useSavedOutfits() {
  const accessToken = useAccessToken();

  return useQuery<SavedOutfitSummary[]>({
    queryKey: modarioQueryKeys.savedOutfits,
    enabled: Boolean(accessToken),
    queryFn: () => listSavedOutfits(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useSavedOutfitDetail(outfitId?: string | null) {
  const accessToken = useAccessToken();

  return useQuery<SavedOutfitDetail>({
    queryKey: modarioQueryKeys.savedOutfitDetail(outfitId ?? ''),
    enabled: Boolean(accessToken && outfitId),
    queryFn: () => getSavedOutfitDetail(accessToken!, outfitId!),
  });
}

export function usePlannedOutfits(from: string, to: string) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.plannedOutfits(from, to),
    enabled: Boolean(accessToken),
    queryFn: () => listPlannedOutfits(accessToken!, from, to),
  });
}

export function useWardrobeItems(options?: { role?: string | null; active?: 'active' | 'archived' }) {
  const accessToken = useAccessToken();
  const active = options?.active ?? 'active';

  return useQuery({
    queryKey: modarioQueryKeys.wardrobeItems(active, options?.role),
    enabled: Boolean(accessToken),
    queryFn: () =>
      listWardrobeItems(accessToken!, {
        active: active === 'active',
        limit: 100,
        offset: 0,
        role: options?.role ?? undefined,
      }),
    staleTime: 60 * 1000,
  });
}

export function useWardrobeItemDetail(itemId?: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.wardrobeItemDetail(itemId ?? ''),
    enabled: Boolean(accessToken && itemId),
    queryFn: () => getWardrobeItemDetail(accessToken!, itemId!),
  });
}

export function useImportSession(sessionId?: string | null, enabled = true) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.wardrobeImportSession(sessionId ?? ''),
    enabled: Boolean(accessToken && sessionId && enabled),
    queryFn: () => getImportSession(accessToken!, sessionId!),
    refetchInterval: (query) => {
      const status = query.state.data?.status?.toLowerCase();
      if (!status || ['review_required', 'committed', 'failed'].includes(status)) {
        return false;
      }
      return 2500;
    },
  });
}

export function useBaseAvatars(styleDirection?: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.baseModels(styleDirection),
    enabled: Boolean(accessToken),
    queryFn: () => listBaseAvatarModels(accessToken!, styleDirection),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentAvatar() {
  const accessToken = useAccessToken();

  return useQuery<CurrentAvatar>({
    queryKey: modarioQueryKeys.currentAvatar,
    enabled: Boolean(accessToken),
    queryFn: () => getCurrentAvatar(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useBillingPlans() {
  const accessToken = useAccessToken();

  return useQuery<BillingPlan[]>({
    queryKey: modarioQueryKeys.billingPlans,
    enabled: Boolean(accessToken),
    queryFn: () => getBillingPlans(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useBillingEntitlement() {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.billingEntitlement,
    enabled: Boolean(accessToken),
    queryFn: () => getBillingEntitlement(accessToken!),
    staleTime: 30 * 1000,
  });
}

export function useSaveCandidateMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, name }: { candidateId: string; name?: string | null }) => saveCandidate(accessToken!, candidateId, name),
    onSuccess: async (savedOutfit) => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.savedOutfits });
      queryClient.setQueryData(modarioQueryKeys.savedOutfitDetail(savedOutfit.id), undefined);
    },
  });
}

export function useRenameOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ outfitId, name }: { outfitId: string; name: string }) => renameSavedOutfit(accessToken!, outfitId, name),
    onSuccess: async (savedOutfit) => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.savedOutfits });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.savedOutfitDetail(savedOutfit.id) });
      await invalidateAllPlannedOutfits(queryClient);
    },
  });
}

export function useDeleteOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: string) => deleteSavedOutfit(accessToken!, outfitId),
    onSuccess: async (_, outfitId) => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.savedOutfits });
      queryClient.removeQueries({ queryKey: modarioQueryKeys.savedOutfitDetail(outfitId) });
      await invalidateAllPlannedOutfits(queryClient);
    },
  });
}

export function useCreatePlannedOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { outfitId: string; plannedDate: string; slotIndex?: number; notes?: string }) =>
      createPlannedOutfit(accessToken!, payload),
    onSuccess: async () => {
      await invalidateAllPlannedOutfits(queryClient);
    },
  });
}

export function useUpdatePlannedOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: { outfitId: string; slotIndex?: number; notes?: string } }) =>
      updatePlannedOutfit(accessToken!, planId, payload),
    onSuccess: async () => {
      await invalidateAllPlannedOutfits(queryClient);
    },
  });
}

export function useDeletePlannedOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => deletePlannedOutfit(accessToken!, planId),
    onSuccess: async () => {
      await invalidateAllPlannedOutfits(queryClient);
    },
  });
}

export function useUpdateWardrobeItemMutation(itemId: string) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updateWardrobeItem>[2]) => updateWardrobeItem(accessToken!, itemId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.wardrobeItemDetail(itemId) });
      await queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.outfitRecommendations });
    },
  });
}

export function useDeleteWardrobeItemMutation(itemId: string) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteWardrobeItem(accessToken!, itemId),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: modarioQueryKeys.wardrobeItemDetail(itemId) });
      await queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.outfitRecommendations });
    },
  });
}

export function useCommitWardrobeImportReviewMutation(sessionId: string) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (decisions: Array<{ detectedItemId: string; include: boolean; roleOverride: string | null }>) =>
      commitWardrobeImportReview(accessToken!, sessionId, decisions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.wardrobeImportSession(sessionId) });
      await queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.outfitRecommendations });
    },
  });
}

export function useSelectBaseAvatarMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (baseModelId: string) => selectBaseAvatar(accessToken!, baseModelId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.currentAvatar });
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.me });
    },
  });
}

export function useBillingCheckoutMutation() {
  const accessToken = useAccessToken();

  return useMutation({
    mutationFn: (planKey: string) => createBillingCheckoutSession(accessToken!, planKey),
  });
}
