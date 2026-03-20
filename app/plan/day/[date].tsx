import { AppHeader, EmptyState, FilterChip, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useDeletePlannedOutfitMutation, usePlannedOutfits, useUpdatePlannedOutfitMutation } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;
const SLOT_OPTIONS = [0, 1, 2, 3];

export default function PlannedDayDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string; planId?: string }>();
  const date = params.date;
  const plannedQuery = usePlannedOutfits(date, date);
  const updateMutation = useUpdatePlannedOutfitMutation();
  const deleteMutation = useDeletePlannedOutfitMutation();

  const entries = useMemo(() => (plannedQuery.data ?? []).sort((a, b) => a.slotIndex - b.slotIndex), [plannedQuery.data]);
  const initialEntry = entries.find((item) => item.id === params.planId) ?? entries[0] ?? null;
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(initialEntry?.id ?? null);
  const selectedEntry = entries.find((entry) => entry.id === selectedPlanId) ?? initialEntry;
  const [notes, setNotes] = useState(selectedEntry?.notes ?? '');
  const [slotIndex, setSlotIndex] = useState(selectedEntry?.slotIndex ?? 0);

  useEffect(() => {
    if (initialEntry && !selectedPlanId) {
      setSelectedPlanId(initialEntry.id);
      setNotes(initialEntry.notes);
      setSlotIndex(initialEntry.slotIndex);
    }
  }, [initialEntry, selectedPlanId]);

  const syncSelected = (planId: string) => {
    const next = entries.find((entry) => entry.id === planId);
    setSelectedPlanId(planId);
    setNotes(next?.notes ?? '');
    setSlotIndex(next?.slotIndex ?? 0);
  };

  const onSave = async () => {
    if (!selectedEntry) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        planId: selectedEntry.id,
        payload: {
          outfitId: selectedEntry.outfitId,
          notes,
          slotIndex,
        },
      });
    } catch (error) {
      Alert.alert('Unable to update plan', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const onDelete = () => {
    if (!selectedEntry) {
      return;
    }

    Alert.alert('Remove planned outfit?', 'This will remove the outfit from your planner for this day.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(selectedEntry.id);
            router.replace('/plan');
          } catch (error) {
            Alert.alert('Unable to remove outfit', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Planned day" showBack subtitle={prettyDate(date)} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {plannedQuery.isLoading ? <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>Loading plan…</Text> : null}
        {!plannedQuery.isLoading && !entries.length ? <EmptyState title="No planned outfit" description="This day is currently open in your planner." action={<PrimaryButton label="Plan an outfit" onPress={() => router.push({ pathname: '/plan/picker', params: { plannedDate: date } })} />} /> : null}

        {entries.length ? (
          <View className="gap-3">
            <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Slots for this day</Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {entries.map((entry) => (
                  <FilterChip key={entry.id} label={`Slot ${entry.slotIndex + 1}`} selected={entry.id === selectedPlanId} onPress={() => syncSelected(entry.id)} />
                ))}
              </View>
            </View>

            {selectedEntry ? (
              <View className="rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
                <TagPill label={`Slot ${selectedEntry.slotIndex + 1}`} />
                <Text className="mt-3 font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{selectedEntry.outfitName}</Text>
                <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                  Reminder state: {selectedEntry.reminderState === 'unsupported' ? 'Architecture ready, delivery pending.' : selectedEntry.reminderState}
                </Text>

                <Text className="mt-5 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>Move to slot</Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {SLOT_OPTIONS.map((option) => (
                    <FilterChip key={option} label={`Slot ${option + 1}`} selected={slotIndex === option} onPress={() => setSlotIndex(option)} />
                  ))}
                </View>

                <Text className="mt-5 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>Notes</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Dinner, meeting, travel day…"
                  placeholderTextColor={palette.muted}
                  multiline
                  className="mt-2 rounded-[18px] border bg-[#FCFAF8] px-4 py-3"
                  style={{ borderColor: palette.line, minHeight: 96, textAlignVertical: 'top', color: palette.ink }}
                />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
      {selectedEntry ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Save changes" fullWidth onPress={onSave} loading={updateMutation.isPending} />
          <SecondaryButton label="View outfit detail" onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: selectedEntry.outfitId, mode: 'saved' } })} />
          <SecondaryButton label="Remove outfit" onPress={onDelete} loading={deleteMutation.isPending} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function prettyDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
