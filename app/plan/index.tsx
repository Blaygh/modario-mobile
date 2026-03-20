import { AppHeader, EmptyState, FilterChip, InfoNotice, PrimaryButton, SectionHeader, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { usePlannedOutfits } from '@/hooks/use-modario-data';
import { formatLocalDateKey } from '@/libs/date';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function PlannerCalendarScreen() {
  const router = useRouter();
  const [monthOffset, setMonthOffset] = useState(0);
  const month = useMemo(() => getMonthData(monthOffset), [monthOffset]);
  const selectedDateDefault = formatLocalDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(selectedDateDefault);
  const plannedQuery = usePlannedOutfits(month.range.from, month.range.to);
  const plannedMap = useMemo(() => groupPlansByDate(plannedQuery.data ?? []), [plannedQuery.data]);
  const selectedDatePlans = plannedMap[selectedDate] ?? [];
  const weeklyStrip = useMemo(() => getWeekStrip(selectedDate), [selectedDate]);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Planner" eyebrow="weekly + monthly" subtitle="Navigate quickly by week, then expand into the full monthly grid with multiple slots per day." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <SectionHeader title="Week" action={formatMonthLabel(selectedDate)} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2 pb-2">
            {weeklyStrip.map((date) => (
              <FilterChip key={date.value} label={date.label} selected={date.value === selectedDate} onPress={() => setSelectedDate(date.value)} />
            ))}
          </View>
        </ScrollView>

        <SectionHeader title={month.label} action="Month view" />
        <View className="mb-3 flex-row items-center justify-between">
          <PrimaryButton label="Previous" onPress={() => setMonthOffset((current) => current - 1)} />
          <PrimaryButton label="Next" onPress={() => setMonthOffset((current) => current + 1)} />
        </View>
        <MonthGrid month={month} selectedDate={selectedDate} plannedMap={plannedMap} onSelect={setSelectedDate} />

        {plannedQuery.isLoading ? <InfoNotice title="Loading planner" description="We’re pulling your real planned outfits for this month." /> : null}
        {plannedQuery.isError ? <EmptyState title="Planner unavailable" description="We couldn’t load your planned outfits right now." action={<PrimaryButton label="Retry" onPress={() => plannedQuery.refetch()} />} /> : null}
        {!plannedQuery.isLoading && !plannedQuery.isError && !(plannedQuery.data?.length ?? 0) ? (
          <EmptyState title="No planned outfits yet" description="Once you save an outfit, you can plan it here across multiple day slots." action={<PrimaryButton label="Go to outfits" onPress={() => router.push('/(tabs)/outfits')} />} />
        ) : null}

        <SectionHeader title={prettyDate(selectedDate)} action={`${selectedDatePlans.length} slot${selectedDatePlans.length === 1 ? '' : 's'}`} />
        {!selectedDatePlans.length ? (
          <EmptyState title="Nothing planned that day" description="Plan a saved outfit into one of this day’s visible slots." action={<PrimaryButton label="Go to outfits" onPress={() => router.push('/(tabs)/outfits')} />} />
        ) : null}
        <View className="gap-3">
          {selectedDatePlans.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push({ pathname: '/plan/day/[date]', params: { date: entry.plannedDate, planId: entry.id } })}
              className="rounded-[22px] border bg-white p-4"
              style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <View className="flex-row items-center justify-between">
                <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>{entry.outfitName}</Text>
                <TagPill label={`Slot ${entry.slotIndex + 1}`} />
              </View>
              <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                {entry.notes || 'No notes yet.'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-6 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
          <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>Reminder architecture</Text>
          <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            Planner entries carry a reminder state in the view model already. Delivery is intentionally not faked until a real backend or local scheduling contract is finalized.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MonthGrid({
  month,
  selectedDate,
  plannedMap,
  onSelect,
}: {
  month: ReturnType<typeof getMonthData>;
  selectedDate: string;
  plannedMap: Record<string, { id: string; slotIndex: number; outfitName: string; plannedDate: string; notes: string; reminderState: string }[]>;
  onSelect: (date: string) => void;
}) {
  return (
    <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
      <View className="mb-3 flex-row justify-between">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <Text key={label} className="w-[13.5%] text-center font-InterMedium text-xs" style={{ color: palette.muted }}>{label}</Text>
        ))}
      </View>
      <View className="flex-row flex-wrap gap-y-2">
        {month.days.map((day) => {
          const isSelected = day.value === selectedDate;
          const slotCount = plannedMap[day.value]?.length ?? 0;
          return (
            <Pressable key={day.value} onPress={() => onSelect(day.value)} className="w-[13.5%] items-center">
              <View className="h-12 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: isSelected ? palette.burgundy : day.inMonth ? '#FCFAF8' : 'transparent' }}>
                <Text className="font-InterMedium text-sm" style={{ color: isSelected ? '#FFFFFF' : day.inMonth ? palette.ink : '#C6B9BE' }}>{day.dayLabel}</Text>
                {slotCount ? <Text className="font-InterRegular text-[10px]" style={{ color: isSelected ? '#F8EAF0' : palette.burgundy }}>{slotCount}</Text> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getMonthData(offset: number) {
  const reference = new Date();
  reference.setUTCDate(1);
  reference.setUTCMonth(reference.getUTCMonth() + offset);

  const firstDay = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  const lastDay = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0));
  const gridStart = new Date(firstDay);
  gridStart.setUTCDate(firstDay.getUTCDate() - firstDay.getUTCDay());
  const gridEnd = new Date(lastDay);
  gridEnd.setUTCDate(lastDay.getUTCDate() + (6 - lastDay.getUTCDay()));

  const days = [] as { value: string; dayLabel: string; inMonth: boolean }[];
  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    days.push({
      value: cursor.toISOString().slice(0, 10),
      dayLabel: String(cursor.getUTCDate()),
      inMonth: cursor.getUTCMonth() === firstDay.getUTCMonth(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return {
    label: firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' }),
    days,
    range: {
      from: gridStart.toISOString().slice(0, 10),
      to: gridEnd.toISOString().slice(0, 10),
    },
  };
}

function getWeekStrip(selectedDate: string) {
  const base = new Date(`${selectedDate}T12:00:00Z`);
  const start = new Date(base);
  start.setUTCDate(base.getUTCDate() - base.getUTCDay());

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'numeric', day: 'numeric', timeZone: 'UTC' }),
    };
  });
}

function groupPlansByDate(entries: { plannedDate: string; id: string; slotIndex: number; outfitName: string; notes: string; reminderState: string }[]) {
  return entries.reduce<Record<string, { id: string; slotIndex: number; outfitName: string; plannedDate: string; notes: string; reminderState: string }[]>>((accumulator, entry) => {
    accumulator[entry.plannedDate] = [...(accumulator[entry.plannedDate] ?? []), entry].sort((a, b) => a.slotIndex - b.slotIndex);
    return accumulator;
  }, {});
}

function prettyDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatMonthLabel(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}
