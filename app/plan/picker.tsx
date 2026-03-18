import { AppHeader, EmptyState, FilterChip, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import {
  useCreatePlannedOutfitMutation,
  useSaveCandidateMutation,
  useSavedOutfits,
  useUpdatePlannedOutfitMutation,
} from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function PlanOutfitPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    outfitId?: string;
    candidateId?: string;
    sourceMode?: string;
    planId?: string;
    plannedDate?: string;
    notes?: string;
  }>();
  const savedQuery = useSavedOutfits();
  const saveCandidateMutation = useSaveCandidateMutation();
  const createPlanMutation = useCreatePlannedOutfitMutation();
  const updatePlanMutation = useUpdatePlannedOutfitMutation();

  const dates = useMemo(() => getUpcomingDates(), []);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(params.outfitId ?? null);
  const [selectedDate, setSelectedDate] = useState(params.plannedDate ?? dates[0]);
  const [notes, setNotes] = useState(params.notes ?? '');
  const [slotIndex] = useState(0);

  const onSubmit = async () => {
    try {
      let stableOutfitId = selectedOutfitId;

      if (!stableOutfitId && params.sourceMode === 'candidate' && params.candidateId) {
        const saved = await saveCandidateMutation.mutateAsync({ candidateId: params.candidateId });
        stableOutfitId = saved.id;
      }

      if (!stableOutfitId) {
        Alert.alert('Choose an outfit', 'Select a saved outfit before planning it.');
        return;
      }

      const planned = params.planId
        ? await updatePlanMutation.mutateAsync({
            planId: params.planId,
            payload: { outfitId: stableOutfitId, notes, slotIndex },
          })
        : await createPlanMutation.mutateAsync({ outfitId: stableOutfitId, plannedDate: selectedDate, notes, slotIndex });

      router.replace({ pathname: '/plan/day/[date]', params: { date: selectedDate, planId: planned.id } });
    } catch (error) {
      Alert.alert('Unable to plan outfit', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const plannedFromCandidate = params.sourceMode === 'candidate' && params.candidateId;

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Plan outfit" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          {plannedFromCandidate
            ? 'This recommendation will be saved automatically before it is added to your planner.'
            : 'Pick a saved outfit, choose a day, and add an optional note.'}
        </Text>

        <Text className="mt-5 font-InterSemiBold text-base" style={{ color: palette.ink }}>Choose a day</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
          <View className="flex-row gap-2 pb-2">
            {dates.map((date) => (
              <FilterChip key={date} label={new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} selected={selectedDate === date} onPress={() => setSelectedDate(date)} />
            ))}
          </View>
        </ScrollView>

        <Text className="mt-5 font-InterSemiBold text-base" style={{ color: palette.ink }}>Saved outfits</Text>
        {savedQuery.isLoading ? <Text className="mt-3 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading saved outfits…</Text> : null}
        {!savedQuery.isLoading && !(savedQuery.data?.length ?? 0) && !plannedFromCandidate ? (
          <EmptyState title="No saved outfits" description="Save a recommendation first, then come back to plan it." />
        ) : null}
        <View className="mt-3 gap-3">
          {(savedQuery.data ?? []).map((outfit) => {
            const selected = selectedOutfitId === outfit.id;
            return (
              <Pressable
                key={outfit.id}
                onPress={() => setSelectedOutfitId(outfit.id)}
                className="rounded-[20px] border bg-white p-4"
                style={{ borderColor: selected ? palette.burgundy : palette.line, borderWidth: selected ? 1.5 : 1, borderRadius: radius.card }}>
                <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{outfit.name}</Text>
                <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Saved on {outfit.createdAt ? outfit.createdAt.slice(0, 10) : 'recently'}.</Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 font-InterSemiBold text-base" style={{ color: palette.ink }}>Note</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Dinner outfit, work meeting, travel day…"
          placeholderTextColor={palette.muted}
          multiline
          className="mt-3 rounded-[18px] border bg-white px-4 py-3"
          style={{ borderColor: palette.line, minHeight: 96, textAlignVertical: 'top', color: palette.ink }}
        />
      </ScrollView>
      <View className="gap-3 pb-2 pt-4">
        <PrimaryButton
          label={params.planId ? 'Update plan' : 'Plan outfit'}
          fullWidth
          onPress={onSubmit}
          loading={saveCandidateMutation.isPending || createPlanMutation.isPending || updatePlanMutation.isPending}
        />
        <SecondaryButton label="Cancel" fullWidth onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

function getUpcomingDates() {
  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date.toISOString().slice(0, 10);
  });
}
