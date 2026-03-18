import { AppHeader, EmptyState, FilterChip, InfoNotice, PrimaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOutfitRecommendations, usePlannedOutfits, useSavedOutfits } from '@/hooks/use-modario-data';
import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const tabs = ['Suggested', 'Saved', 'Planned'] as const;
const { palette } = BrandTheme;

export default function OutfitsLibraryScreen() {
  const router = useRouter();
  const [active, setActive] = useState<(typeof tabs)[number]>('Suggested');
  const recommendationsQuery = useOutfitRecommendations();
  const savedQuery = useSavedOutfits();
  const plannedRange = useMemo(() => getPlannerRange(), []);
  const plannedQuery = usePlannedOutfits(plannedRange.from, plannedRange.to);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Outfits" eyebrow="live library" />
      <View className="mb-4 flex-row gap-2">
        {tabs.map((tab) => (
          <FilterChip key={tab} label={tab} selected={active === tab} onPress={() => setActive(tab)} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {active === 'Suggested' ? (
          <View className="gap-4">
            {recommendationsQuery.isLoading ? <InfoNotice title="Loading suggestions" description="We’re fetching your latest recommendation feed." /> : null}
            {recommendationsQuery.isError ? (
              <EmptyState title="Suggestions unavailable" description="Please retry to load live recommendations." action={<PrimaryButton label="Retry" onPress={() => recommendationsQuery.refetch()} />} />
            ) : null}
            {!recommendationsQuery.isLoading && !recommendationsQuery.isError && !(recommendationsQuery.data?.length ?? 0) ? (
              <EmptyState title="No suggestions yet" description="Add more wardrobe pieces to generate recommendation candidates." />
            ) : null}
            {(recommendationsQuery.data ?? []).map((outfit) => (
              <Pressable
                key={outfit.id}
                onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'candidate' } })}
                className="rounded-[22px] border bg-white p-4"
                style={{ borderColor: palette.line }}>
                <View className="flex-row flex-wrap gap-2">
                  {outfit.tags.slice(0, 2).map((tag) => (
                    <TagPill key={tag} label={tag.replace(/_/g, ' ')} />
                  ))}
                </View>
                <Text className="mt-3 font-InterSemiBold text-xl" style={{ color: palette.ink }}>{outfit.summary}</Text>
                <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                  {outfit.roles.length ? `${outfit.roles.map((role) => role.role).join(' • ')}.` : 'Open detail to review the pieces and style notes.'}
                </Text>
                <Pressable onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'candidate' } })} className="mt-4 self-start rounded-full bg-[#F3E8EC] px-4 py-2">
                  <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>View recommendation</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : null}

        {active === 'Saved' ? (
          <View className="gap-4">
            {savedQuery.isLoading ? <InfoNotice title="Loading saved looks" description="We’re syncing the outfits you’ve saved." /> : null}
            {savedQuery.isError ? (
              <EmptyState title="Saved outfits unavailable" description="Please retry to load your outfit library." action={<PrimaryButton label="Retry" onPress={() => savedQuery.refetch()} />} />
            ) : null}
            {!savedQuery.isLoading && !savedQuery.isError && !(savedQuery.data?.length ?? 0) ? (
              <EmptyState title="No saved outfits yet" description="Save a recommendation to keep it in your library and planner." />
            ) : null}
            {(savedQuery.data ?? []).map((outfit) => (
              <Pressable
                key={outfit.id}
                onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'saved' } })}
                className="rounded-[22px] border bg-white p-4"
                style={{ borderColor: palette.line }}>
                <Text className="font-InterSemiBold text-xl" style={{ color: palette.ink }}>{outfit.name}</Text>
                <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>Saved on {formatDate(outfit.createdAt) || 'recently'}.</Text>
                <View className="mt-4 flex-row gap-2">
                  <PrimaryButton label="View outfit" onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'saved' } })} />
                  <Pressable onPress={() => router.push({ pathname: '/plan/picker', params: { outfitId: outfit.id, sourceMode: 'saved' } })} className="self-start rounded-full border bg-white px-4 py-3" style={{ borderColor: palette.line }}>
                    <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Plan</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        ) : null}

        {active === 'Planned' ? (
          <View className="gap-4">
            {plannedQuery.isLoading ? <InfoNotice title="Loading planner" description="We’re pulling your live planned outfits." /> : null}
            {plannedQuery.isError ? (
              <EmptyState title="Planner unavailable" description="Please retry to load your upcoming looks." action={<PrimaryButton label="Retry" onPress={() => plannedQuery.refetch()} />} />
            ) : null}
            {!plannedQuery.isLoading && !plannedQuery.isError && !(plannedQuery.data?.length ?? 0) ? (
              <EmptyState title="Nothing planned yet" description="Plan a saved outfit to see it here and in your calendar." />
            ) : null}
            {(plannedQuery.data ?? []).map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => router.push({ pathname: '/plan/day/[date]', params: { date: entry.plannedDate, planId: entry.id } })}
                className="flex-row items-center gap-3 rounded-[22px] border bg-white p-4"
                style={{ borderColor: palette.line }}>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F3E8EC]">
                  <CalendarDays size={20} color={palette.burgundy} />
                </View>
                <View className="flex-1">
                  <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{entry.outfitName}</Text>
                  <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
                    {prettyDate(entry.plannedDate)} • Slot {entry.slotIndex + 1}
                  </Text>
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

function prettyDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(date: string | null) {
  return date ? prettyDate(date.slice(0, 10)) : null;
}
