import { AppHeader, EmptyState, FilterChip, InfoNotice, PrimaryButton, SectionHeader, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOutfitRecommendations, useSaveCandidateMutation, useWardrobeItems } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export default function HomeScreen() {
  const router = useRouter();
  const recommendationsQuery = useOutfitRecommendations();
  const wardrobeQuery = useWardrobeItems();
  const saveCandidateMutation = useSaveCandidateMutation();

  const recommendations = recommendationsQuery.data ?? [];
  const hero = recommendations[0];
  const secondary = recommendations.slice(1, 6);

  const onSaveRecommendation = async (candidateId: string) => {
    try {
      const savedOutfit = await saveCandidateMutation.mutateAsync({ candidateId });
      Alert.alert('Outfit saved', 'This look is now in your saved outfits.', [
        { text: 'Keep browsing', style: 'cancel' },
        {
          text: 'View saved outfit',
          onPress: () => router.push({ pathname: '/outfit/[id]', params: { id: savedOutfit.id, mode: 'saved' } }),
        },
      ]);
    } catch (error) {
      Alert.alert('Unable to save outfit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppHeader
          title="Your Daily Edit"
          eyebrow="modario"
          right={<Bell size={20} color={palette.burgundy} />}
        />

        {recommendationsQuery.isLoading ? (
          <InfoNotice title="Styling your recommendations" description="We’re gathering live outfit suggestions from your wardrobe." />
        ) : null}

        {recommendationsQuery.isError ? (
          <EmptyState
            title="We couldn’t load your outfits"
            description="Please refresh in a moment to see today’s live recommendations."
            action={<SecondaryRefresh onPress={() => recommendationsQuery.refetch()} />}
          />
        ) : null}

        {!recommendationsQuery.isLoading && !recommendationsQuery.isError && !hero ? (
          <EmptyState
            title="No recommendations yet"
            description="Import more wardrobe pieces to unlock curated outfit suggestions."
            action={<PrimaryButton label="Add wardrobe items" onPress={() => router.push('/wardrobe/add-item')} />}
          />
        ) : null}

        {hero ? (
          <Pressable onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: hero.id, mode: 'candidate' } })}>
            <View className="overflow-hidden border" style={{ borderColor: palette.line, backgroundColor: palette.paper, borderRadius: radius.modal }}>
              <Image source={{ uri: hero.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 208 }} contentFit="cover" />
              <LinearGradient colors={[palette.burgundy, palette.burgundySoft]}>
                <View className="p-5">
                  <Text className="font-InterBold text-[28px] leading-[32px] text-white">Today&apos;s Outfit</Text>
                  <Text className="mt-2 font-InterRegular text-sm leading-6 text-[#F8EAF0]">{hero.summary}</Text>
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {hero.tags.slice(0, 2).map((tag) => (
                      <FilterChip key={tag} label={formatTag(tag)} selected tone="onDark" />
                    ))}
                  </View>
                  <View className="mt-4 flex-row flex-wrap gap-2">
                    <PrimaryButton label="View outfit" onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: hero.id, mode: 'candidate' } })} />
                    <SecondaryButtonCompact label="Save" onPress={() => onSaveRecommendation(hero.candidateId)} />
                    <SecondaryButtonCompact
                      label="Plan"
                      onPress={() =>
                        router.push({ pathname: '/plan/picker', params: { candidateId: hero.candidateId, sourceMode: 'candidate' } })
                      }
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          </Pressable>
        ) : null}

        {secondary.length ? <SectionHeader title="More recommendations" action={`${secondary.length} looks`} /> : null}
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
                    <Text className="mt-3 font-InterSemiBold text-base" numberOfLines={2} style={{ color: palette.ink }}>
                      {outfit.summary}
                    </Text>
                    <View className="mt-3 flex-row items-center gap-2">
                      <SecondaryButtonCompact label="Save" onPress={() => onSaveRecommendation(outfit.candidateId)} />
                      <Pressable onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id, mode: 'candidate' } })}>
                        <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>Details</Text>
                      </Pressable>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : null}

        <SectionHeader title="Wardrobe insight" />
        <View className="border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
          <Text className="text-xs uppercase tracking-[1.4px]" style={{ color: palette.burgundySoft }}>Live wardrobe overview</Text>
          <Text className="mt-2 font-InterSemiBold text-xl" style={{ color: palette.ink }}>
            {wardrobeQuery.data?.length ? `${wardrobeQuery.data.length} ready-to-style pieces in your wardrobe.` : 'Your wardrobe is ready for its next edit.'}
          </Text>
          <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            {wardrobeQuery.data?.length
              ? 'Keep adding recent items so recommendations feel richer and more accurate.'
              : 'Import a few pieces to unlock more confident outfit recommendations.'}
          </Text>
          <Pressable className="mt-4 flex-row items-center self-start" onPress={() => router.push('/(tabs)/wardrobe')}>
            <Text className="font-InterSemiBold text-sm" style={{ color: palette.burgundy }}>Open wardrobe</Text>
            <ChevronRight size={16} color={palette.burgundy} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SecondaryRefresh({ onPress }: { onPress: () => void }) {
  return <PrimaryButton label="Try again" onPress={onPress} />;
}

function SecondaryButtonCompact({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className="rounded-full border bg-white px-4 py-2" style={{ borderColor: palette.line }}>
      <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>{label}</Text>
    </Pressable>
  );
}

function formatTag(tag: string) {
  return tag.replace(/_/g, ' ');
}

const fallbackLook = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80';
