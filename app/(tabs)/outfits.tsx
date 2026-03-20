import { AppHeader, EmptyState, FilterChip, InfoNotice, PrimaryButton, SectionHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOutfitRecommendations, usePlannedOutfits, useSavedOutfits } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const tabs = ['Suggested', 'Saved'] as const;
const { palette } = BrandTheme;

export default function OutfitsLibraryScreen() {
  const router = useRouter();
  const [active, setActive] = useState<(typeof tabs)[number]>('Suggested');
  const recommendationsQuery = useOutfitRecommendations();
  const savedQuery = useSavedOutfits();
  const plannedRange = useMemo(() => getPlannerRange(), []);
  const plannedQuery = usePlannedOutfits(plannedRange.from, plannedRange.to);

  const plannedCount = plannedQuery.data?.length ?? 0;

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Outfits" eyebrow="candidate + saved library" subtitle={`${plannedCount} planned ${plannedCount === 1 ? 'look' : 'looks'} currently on your calendar.`} />
      <View className="mb-4 flex-row gap-2">
        {tabs.map((tab) => (
          <FilterChip key={tab} label={tab} selected={active === tab} onPress={() => setActive(tab)} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {active === 'Suggested' ? (
          <View className="gap-4">
            {recommendationsQuery.isLoading ? <InfoNotice title="Loading suggestions" description="We’re fetching your latest recommendation candidates." /> : null}
            {recommendationsQuery.isError ? <EmptyState title="Suggestions unavailable" description="Please retry to load live recommendations." action={<PrimaryButton label="Retry" onPress={() => recommendationsQuery.refetch()} />} /> : null}
            {!recommendationsQuery.isLoading && !recommendationsQuery.isError && !(recommendationsQuery.data?.length ?? 0) ? (
              <EmptyState title="Add a few more wardrobe items to unlock better outfit suggestions" description="Recommendation candidates appear here once your wardrobe has enough live pieces to style from." action={<PrimaryButton label="Go to wardrobe" onPress={() => router.push('/(tabs)/wardrobe')} />} />
            ) : null}
            {(recommendationsQuery.data ?? []).map((outfit) => (
              <Pressable
                key={outfit.id}
                onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'candidate' } })}
                className="overflow-hidden rounded-[22px] border bg-white"
                style={{ borderColor: palette.line }}>
                <Image source={{ uri: outfit.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 180 }} contentFit="cover" />
                <View className="p-4">
                  <Text className="font-InterSemiBold text-xl" style={{ color: palette.ink }}>{outfit.summary}</Text>
                  <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                    {outfit.tags.length ? outfit.tags.join(' • ') : 'Open the candidate to review summary, tags, and suggestions.'}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {active === 'Saved' ? (
          <View className="gap-4">
            <SectionHeader title="Saved outfits" action={plannedCount ? `${plannedCount} planned` : undefined} />
            {savedQuery.isLoading ? <InfoNotice title="Loading saved looks" description="We’re syncing the outfits you’ve already saved." /> : null}
            {savedQuery.isError ? <EmptyState title="Saved outfits unavailable" description="Please retry to load your outfit library." action={<PrimaryButton label="Retry" onPress={() => savedQuery.refetch()} />} /> : null}
            {!savedQuery.isLoading && !savedQuery.isError && !(savedQuery.data?.length ?? 0) ? (
              <EmptyState title="No saved outfits yet" description="Save a recommendation to keep it in your library and planner." action={<PrimaryButton label="Go to wardrobe" onPress={() => router.push('/(tabs)/wardrobe')} />} />
            ) : null}
            {(savedQuery.data ?? []).map((outfit) => (
              <Pressable
                key={outfit.id}
                onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'saved' } })}
                className="overflow-hidden rounded-[22px] border bg-white"
                style={{ borderColor: palette.line }}>
                <Image source={{ uri: outfit.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 180 }} contentFit="cover" />
                <View className="p-4">
                  <Text className="font-InterSemiBold text-xl" style={{ color: palette.ink }}>{outfit.name}</Text>
                  <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>Saved on {formatDate(outfit.createdAt) || 'recently'}.</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getPlannerRange() {
  const fromDate = new Date();
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 120);

  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  };
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : null;
}

const fallbackLook = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80';
