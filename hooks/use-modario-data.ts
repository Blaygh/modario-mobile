import {
  archiveWardrobeItem,
  createPlannedOutfit,
  CurrentAvatar,
  deletePlannedOutfit,
  deleteSavedOutfit,
  getCurrentAvatar,
  getImportSession,
  getOutfitRecommendations,
  getSavedOutfitDetail,
  getWardrobeItemDetail,
  listBaseAvatarModels,
  listPlannedOutfits,
  listSavedOutfits,
  listWardrobeItems,
  saveCandidate,
  selectBaseAvatar,
  updatePlannedOutfit,
  updateWardrobeItem,
} from '@/libs/modario-api';
import { useAuth } from '@/provider/auth-provider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const modarioQueryKeys = {
  recommendations: ['outfitRecommendations'] as const,
  savedOutfits: ['savedOutfits'] as const,
  savedOutfitDetail: (outfitId: string) => ['savedOutfitDetail', outfitId] as const,
  plannedOutfits: (from: string, to: string) => ['plannedOutfits', from, to] as const,
  wardrobeItemDetail: (itemId: string) => ['wardrobeItemDetail', itemId] as const,
  importSession: (sessionId: string) => ['importSession', sessionId] as const,
  baseAvatars: (styleDirection?: string | null) => ['baseAvatars', styleDirection ?? 'all'] as const,
  currentAvatar: ['currentAvatar'] as const,
  wardrobeItems: (role?: string | null) => ['wardrobeItems', role ?? 'all'] as const,
};

function useAccessToken() {
  const { session } = useAuth();
  return session?.access_token;
}

export function useOutfitRecommendations() {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.recommendations,
    enabled: Boolean(accessToken),
    queryFn: () => getOutfitRecommendations(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useSavedOutfits() {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.savedOutfits,
    enabled: Boolean(accessToken),
    queryFn: () => listSavedOutfits(accessToken!),
    staleTime: 60 * 1000,
  });
}

export function useSavedOutfitDetail(outfitId?: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
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

export function useWardrobeItems(role?: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.wardrobeItems(role),
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const data = await listWardrobeItems(accessToken!, { active: true, limit: 50, offset: 0, role: role ?? undefined });
      return data.items;
    },
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
    queryKey: modarioQueryKeys.importSession(sessionId ?? ''),
    enabled: Boolean(accessToken && sessionId && enabled),
    queryFn: () => getImportSession(accessToken!, sessionId!),
    refetchInterval: (query) => {
      const status = query.state.data?.status?.toLowerCase();
      if (!status || ['review_required', 'completed', 'failed'].includes(status)) {
        return false;
      }
      return 3000;
    },
  });
}

export function useBaseAvatars(styleDirection?: string | null) {
  const accessToken = useAccessToken();

  return useQuery({
    queryKey: modarioQueryKeys.baseAvatars(styleDirection),
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

export function useDeleteOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (outfitId: string) => deleteSavedOutfit(accessToken!, outfitId),
    onSuccess: async (_, outfitId) => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.savedOutfits });
      queryClient.removeQueries({ queryKey: modarioQueryKeys.savedOutfitDetail(outfitId) });
      await queryClient.invalidateQueries({ queryKey: ['plannedOutfits'] });
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
      await queryClient.invalidateQueries({ queryKey: ['plannedOutfits'] });
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
      await queryClient.invalidateQueries({ queryKey: ['plannedOutfits'] });
    },
  });
}

export function useDeletePlannedOutfitMutation() {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: string) => deletePlannedOutfit(accessToken!, planId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['plannedOutfits'] });
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
    },
  });
}

export function useArchiveWardrobeItemMutation(itemId: string) {
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => archiveWardrobeItem(accessToken!, itemId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: modarioQueryKeys.wardrobeItemDetail(itemId) });
      await queryClient.invalidateQueries({ queryKey: ['wardrobeItems'] });
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
    },
  });
}
