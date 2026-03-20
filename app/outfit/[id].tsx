import { AppHeader, EmptyState, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import {
  useDeleteOutfitMutation,
  useOutfitRecommendations,
  useRenameOutfitMutation,
  useSaveCandidateMutation,
  useSavedOutfitDetail,
} from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

const { palette, radius } = BrandTheme;

export default function OutfitDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; mode?: 'candidate' | 'saved' }>();
  const mode = params.mode ?? 'candidate';
  const recommendationsQuery = useOutfitRecommendations();
  const savedOutfitQuery = useSavedOutfitDetail(mode === 'saved' ? params.id : null);
  const saveCandidateMutation = useSaveCandidateMutation();
  const renameMutation = useRenameOutfitMutation();
  const deleteOutfitMutation = useDeleteOutfitMutation();
  const [draftName, setDraftName] = useState('');
  const [showRename, setShowRename] = useState(false);

  const recommendation = (recommendationsQuery.data ?? []).find((entry) => entry.id === params.id);
  const savedOutfit = savedOutfitQuery.data;
  const isLoading = mode === 'saved' ? savedOutfitQuery.isLoading : recommendationsQuery.isLoading;

  const onSaveCandidate = async () => {
    if (!recommendation) {
      return;
    }

    try {
      const saved = await saveCandidateMutation.mutateAsync({ candidateId: recommendation.candidateId });
      Alert.alert('Outfit saved', 'Your recommendation is now part of your saved outfit library.', [
        { text: 'Stay here', style: 'cancel' },
        { text: 'Open saved outfit', onPress: () => router.replace({ pathname: '/outfit/[id]', params: { id: saved.id, mode: 'saved' } }) },
      ]);
    } catch (error) {
      Alert.alert('Unable to save', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const onRename = async () => {
    if (!savedOutfit || !draftName.trim()) {
      return;
    }

    try {
      await renameMutation.mutateAsync({ outfitId: savedOutfit.id, name: draftName.trim() });
      setShowRename(false);
    } catch (error) {
      Alert.alert('Unable to rename', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const onDeleteSavedOutfit = () => {
    if (!savedOutfit) {
      return;
    }

    Alert.alert('Delete saved outfit?', 'This removes the outfit from your saved library.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteOutfitMutation.mutateAsync(savedOutfit.id);
            router.back();
          } catch (error) {
            Alert.alert('Unable to delete', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  const detailTitle = mode === 'saved' ? 'Saved outfit' : 'Recommendation';

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title={detailTitle} showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {isLoading ? <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>Loading outfit…</Text> : null}

        {!isLoading && mode === 'candidate' && !recommendation ? <EmptyState title="Recommendation unavailable" description="This outfit recommendation is no longer available." /> : null}
        {!isLoading && mode === 'saved' && !savedOutfit ? <EmptyState title="Outfit unavailable" description="We couldn’t load this saved outfit right now." /> : null}

        {mode === 'candidate' && recommendation ? (
          <View>
            <OutfitHero imageUrl={recommendation.previewImageUrl} title="Recommended look" subtitle={recommendation.summary} />
            <TagSection tags={recommendation.tags} />
            <RolesSection roles={recommendation.roles} onOpenItem={(itemId) => router.push({ pathname: '/wardrobe/item/[id]', params: { id: itemId } })} />
            <SuggestionSection title="LLM suggestions" suggestions={recommendation.suggestions.map((suggestion) => suggestion.text)} />
          </View>
        ) : null}

        {mode === 'saved' && savedOutfit ? (
          <View>
            <OutfitHero imageUrl={savedOutfit.previewImageUrl} title={savedOutfit.name} subtitle={savedOutfit.summary ?? 'Saved outfit'} />
            <TagSection tags={savedOutfit.tags} />
            <SuggestionSection title="Style notes" suggestions={savedOutfit.suggestions.map((suggestion) => suggestion.text)} />

            <View className="mt-5 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <View className="flex-row items-center justify-between">
                <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Rename outfit</Text>
                <Pressable onPress={() => { setDraftName(savedOutfit.name); setShowRename((current) => !current); }}>
                  <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>{showRename ? 'Cancel' : 'Rename'}</Text>
                </Pressable>
              </View>
              {showRename ? (
                <View className="mt-3 gap-3">
                  <TextInput
                    value={draftName}
                    onChangeText={setDraftName}
                    placeholder="Weekend layers"
                    placeholderTextColor={palette.muted}
                    className="rounded-[16px] border bg-[#FCFAF8] px-4 py-3"
                    style={{ borderColor: palette.line, color: palette.ink }}
                  />
                  <PrimaryButton label="Save name" onPress={onRename} loading={renameMutation.isPending} />
                </View>
              ) : null}
            </View>

            <View className="mt-5 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Outfit items</Text>
              <View className="mt-3 gap-3">
                {savedOutfit.items.map((item) => (
                  <Pressable
                    key={item.itemId}
                    onPress={() => router.push({ pathname: '/wardrobe/item/[id]', params: { id: item.itemId } })}
                    className="flex-row items-center gap-3 rounded-[18px] border bg-[#FCFAF8] p-3"
                    style={{ borderColor: palette.line }}>
                    <Image source={{ uri: item.previewImageUrl ?? fallbackLook }} style={{ width: 62, height: 62, borderRadius: 14 }} contentFit="cover" />
                    <View className="flex-1">
                      <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>{toTitle(item.role)}</Text>
                      <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>
                        {[item.itemType, item.color].filter(Boolean).map((value) => toTitle(String(value))).join(' • ') || 'Open wardrobe detail'}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
      {mode === 'candidate' && recommendation ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Save outfit" fullWidth onPress={onSaveCandidate} loading={saveCandidateMutation.isPending} />
          <SecondaryButton label="Plan outfit" fullWidth onPress={() => router.push({ pathname: '/plan/picker', params: { candidateId: recommendation.candidateId, sourceMode: 'candidate' } })} />
        </View>
      ) : null}
      {mode === 'saved' && savedOutfit ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Plan outfit" fullWidth onPress={() => router.push({ pathname: '/plan/picker', params: { outfitId: savedOutfit.id, sourceMode: 'saved' } })} />
          <SecondaryButton label="Delete outfit" onPress={onDeleteSavedOutfit} loading={deleteOutfitMutation.isPending} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function OutfitHero({ imageUrl, title, subtitle }: { imageUrl: string | null; title: string; subtitle: string }) {
  return (
    <View className="overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
      <Image source={{ uri: imageUrl ?? fallbackLook }} style={{ width: '100%', height: 252 }} contentFit="cover" />
      <View className="p-4">
        <Text className="font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{title}</Text>
        <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>{subtitle}</Text>
      </View>
    </View>
  );
}

function TagSection({ tags }: { tags: string[] }) {
  if (!tags.length) {
    return null;
  }

  return (
    <View className="mt-4 flex-row flex-wrap gap-2">
      {tags.map((tag) => (
        <TagPill key={tag} label={tag.replace(/_/g, ' ')} />
      ))}
    </View>
  );
}

function RolesSection({ roles, onOpenItem }: { roles: { role: string; itemId: string }[]; onOpenItem: (itemId: string) => void }) {
  if (!roles.length) {
    return null;
  }

  return (
    <View className="mt-5 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Outfit composition</Text>
      <View className="mt-3 gap-3">
        {roles.map((role) => (
          <Pressable key={`${role.role}-${role.itemId}`} onPress={() => onOpenItem(role.itemId)} className="rounded-[18px] border bg-[#FCFAF8] p-4" style={{ borderColor: palette.line }}>
            <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>{toTitle(role.role)}</Text>
            <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>Open wardrobe item</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SuggestionSection({ title, suggestions }: { title: string; suggestions: string[] }) {
  if (!suggestions.length) {
    return null;
  }

  return (
    <View className="mt-5 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{title}</Text>
      <View className="mt-3 gap-3">
        {suggestions.map((suggestion, index) => (
          <Text key={`${title}-${index}`} className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            • {suggestion}
          </Text>
        ))}
      </View>
    </View>
  );
}

function toTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

const fallbackLook = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80';
