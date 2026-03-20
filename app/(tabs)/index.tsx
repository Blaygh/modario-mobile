import { AppHeader, EmptyState, FilterChip, InfoNotice, PrimaryButton, SectionHeader, TagPill } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { BrandTheme } from '@/constants/theme';
import { useOutfitRecommendations, usePlannedOutfits, useProfile, useSaveCandidateMutation, useWardrobeItems } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { CalendarDays } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export default function HomeScreen() {
  const router = useRouter();
  const profileQuery = useProfile();
  const recommendationsQuery = useOutfitRecommendations();
  const wardrobeQuery = useWardrobeItems({ active: 'active' });
  const archivedWardrobeQuery = useWardrobeItems({ active: 'archived' });
  const saveCandidateMutation = useSaveCandidateMutation();
  const today = getTodayKey();
  const plannedTodayQuery = usePlannedOutfits(today, today);

  const recommendations = recommendationsQuery.data ?? [];
  const wardrobeItems = wardrobeQuery.data ?? [];
  const hero = recommendations[0];
  const secondary = recommendations.slice(1, 6);
  const plannedToday = plannedTodayQuery.data ?? [];
  const greetingName = profileQuery.data?.displayName?.split(' ')[0] ?? 'there';
  const totalWardrobeCount = wardrobeItems.length + (archivedWardrobeQuery.data?.length ?? 0);
  const categoryCount = new Set(wardrobeItems.map((item) => item.role)).size;

  const onSaveRecommendation = async (candidateId: string) => {
    try {
      const savedOutfit = await saveCandidateMutation.mutateAsync({ candidateId });
      Alert.alert('Outfit saved', 'This recommendation is now part of your saved outfit library.', [
        { text: 'Keep browsing', style: 'cancel' },
        {
          text: 'View saved outfit',
          onPress: () =>
            router.push({
              pathname: '/outfit/[id]',
              params: { id: savedOutfit.id, mode: 'saved' },
            }),
        },
      ]);
    } catch (error) {
      Alert.alert('Unable to save outfit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppHeader title={`Hi, ${greetingName}`} eyebrow="your daily edit" subtitle="One real loop: wardrobe, recommendations, saved outfits, and planner." />

        {!wardrobeQuery.isLoading && !wardrobeItems.length ? (
          <EmptyState
            title="Start with your wardrobe"
            description="Add wardrobe items to unlock outfit recommendations, saving, and planning."
            action={<PrimaryButton label="Add wardrobe items" onPress={() => router.push('/wardrobe/add-item')} />}
          />
        ) : null}

        {plannedToday.length ? (
          <>
            <SectionHeader title={plannedToday.length === 1 ? 'Planned for today' : `Today’s ${plannedToday.length} planned looks`} />
            <View className="gap-3">
              {plannedToday.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push({ pathname: '/plan/day/[date]', params: { date: entry.plannedDate, planId: entry.id } })}
                  className="flex-row items-center gap-3 rounded-[22px] border bg-white p-4"
                  style={{ borderColor: palette.line, ...shadow.soft }}>
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F3E8EC]">
                    <CalendarDays size={20} color={palette.burgundy} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{entry.outfitName}</Text>
                    <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
                      Slot {entry.slotIndex + 1}{entry.notes ? ` • ${entry.notes}` : ''}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {recommendationsQuery.isLoading ? <InfoNotice title="Styling your recommendations" description="We’re gathering live outfit candidates from your wardrobe." /> : null}
        {recommendationsQuery.isError ? (
          <EmptyState title="We couldn’t load outfit candidates" description="Please refresh in a moment to see live recommendations." action={<PrimaryButton label="Retry" onPress={() => recommendationsQuery.refetch()} />} />
        ) : null}
        {!recommendationsQuery.isLoading && !recommendationsQuery.isError && wardrobeItems.length > 0 && !hero ? (
          <EmptyState
            title="Add a few more wardrobe items to unlock better outfit suggestions"
            description="Your wardrobe is connected, but it needs a little more breadth before recommendations become useful."
            action={<PrimaryButton label="Add wardrobe items" onPress={() => router.push('/wardrobe/add-item')} />}
          />
        ) : null}

        {hero ? (
          <Pressable onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: hero.id, mode: 'candidate' } })}>
            <View className="mt-6 overflow-hidden border" style={{ borderColor: palette.line, backgroundColor: palette.paper, borderRadius: radius.modal }}>
              <Image source={{ uri: hero.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 208 }} contentFit="cover" />
              <LinearGradient colors={[palette.burgundy, palette.burgundySoft]}>
                <View className="p-5">
                  <Text className="font-InterBold text-[28px] leading-[32px] text-white">Today’s Outfit</Text>
                  <Text className="mt-2 font-InterRegular text-sm leading-6 text-[#F8EAF0]">{hero.summary}</Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {hero.tags.slice(0, 3).map((tag) => (
                      <FilterChip key={tag} label={formatTag(tag)} selected tone="onDark" />
                    ))}
                  </View>
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <PrimaryButton label="View outfit" onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: hero.id, mode: 'candidate' } })} />
                    <CompactAction label="Save" onPress={() => onSaveRecommendation(hero.candidateId)} />
                    <CompactAction label="Plan" onPress={() => router.push({ pathname: '/plan/picker', params: { candidateId: hero.candidateId, sourceMode: 'candidate' } })} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        ) : null}

        {secondary.length ? <SectionHeader title="More recommendations" action={`${secondary.length} candidates`} /> : null}
        {secondary.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3 pb-2">
              {secondary.map((outfit) => (
                <Pressable
                  key={outfit.id}
                  onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'candidate' } })}
                  className="w-44 overflow-hidden border bg-white"
                  style={{ borderColor: palette.line, borderRadius: radius.card, ...shadow.soft }}>
                  <Image source={{ uri: outfit.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 132 }} contentFit="cover" />
                  <View className="p-3">
                    <View className="flex-row flex-wrap gap-2">
                      {outfit.tags.slice(0, 2).map((tag) => (
                        <TagPill key={tag} label={formatTag(tag)} />
                      ))}
                    </View>
                    <Text className="mt-3 font-InterSemiBold text-base" numberOfLines={2} style={{ color: palette.ink }}>{outfit.summary}</Text>
                    <View className="mt-3 flex-row items-center gap-2">
                      <CompactAction label="Save" onPress={() => onSaveRecommendation(outfit.candidateId)} />
                      <CompactAction label="Plan" onPress={() => router.push({ pathname: '/plan/picker', params: { candidateId: outfit.candidateId, sourceMode: 'candidate' } })} />
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}

        <SectionHeader title="Wardrobe insight" />
        <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
          <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Live wardrobe snapshot</Text>
          <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            {totalWardrobeCount} total item{totalWardrobeCount === 1 ? '' : 's'} across {categoryCount || 0} active categor{categoryCount === 1 ? 'y' : 'ies'}.
          </Text>
          <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            This section uses real wardrobe counts today. A richer backend metrics feed can replace this view-model later without changing the screen contract.
          </Text>
        </View>

        <SectionHeader title="Product recommendations" action="Editorial preview" />
        <InfoNotice title="Discover feed is intentionally partial" description="Personalized product ranking is still being finalized, so these are editorial picks rather than deceptive personalized results." />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-3 pb-2">
            {RECOMMENDED_PRODUCTS.map((item) => (
              <Pressable key={item.id} onPress={() => router.push({ pathname: '/discover/item/[id]', params: { id: item.id } })} className="w-44 overflow-hidden rounded-[22px] border bg-white" style={{ borderColor: palette.line }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: 132 }} contentFit="cover" />
                <View className="p-3">
                  <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{item.name}</Text>
                  <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>{item.price}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

function CompactAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="self-start rounded-full border bg-white px-4 py-2.5" style={{ borderColor: 'rgba(255,255,255,0.35)' }}>
      <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>{label}</Text>
    </Pressable>
  );
}

function formatTag(value: string) {
  return value.replace(/_/g, ' ');
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

const fallbackLook = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80';
