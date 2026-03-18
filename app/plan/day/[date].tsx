import { AppHeader, EmptyState, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useDeletePlannedOutfitMutation, usePlannedOutfits } from '@/hooks/use-modario-data';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function PlannedDayDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string; planId?: string }>();
  const date = params.date;
  const dayRange = { from: date, to: date };
  const plannedQuery = usePlannedOutfits(dayRange.from, dayRange.to);
  const deleteMutation = useDeletePlannedOutfitMutation();

  const entry = (plannedQuery.data ?? []).find((item) => item.id === params.planId) ?? plannedQuery.data?.[0];

  const onDelete = () => {
    if (!entry) {
      return;
    }

    Alert.alert('Remove planned outfit?', 'This will remove the outfit from your planner for this day.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(entry.id);
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
      <AppHeader title="Planned day" showBack />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>{prettyDate(date)}</Text>
        {plannedQuery.isLoading ? <Text className="mt-4 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading plan…</Text> : null}
        {!plannedQuery.isLoading && !entry ? (
          <EmptyState title="No planned outfit" description="This day is currently open in your planner." action={<PrimaryButton label="Plan an outfit" onPress={() => router.push({ pathname: '/plan/picker', params: { plannedDate: date } })} />} />
        ) : null}
        {entry ? (
          <View className="mt-4 rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
            <TagPill label={`Slot ${entry.slotIndex + 1}`} />
            <Text className="mt-3 font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{entry.outfitName}</Text>
            <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              {entry.notes || 'No note added yet. Add one when you want context for the occasion or styling reminder.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>
      {entry ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Change outfit" fullWidth onPress={() => router.push({ pathname: '/plan/picker', params: { planId: entry.id, outfitId: entry.outfitId, plannedDate: entry.plannedDate, notes: entry.notes } })} />
          <SecondaryButton label="Remove outfit" fullWidth onPress={onDelete} loading={deleteMutation.isPending} />
          <SecondaryButton label="View outfit detail" fullWidth onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: entry.outfitId, mode: 'saved' } })} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function prettyDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
