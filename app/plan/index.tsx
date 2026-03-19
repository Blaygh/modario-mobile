import {
  AppHeader,
  EmptyState,
  FilterChip,
  InfoNotice,
  PrimaryButton,
  SectionHeader,
} from "@/components/custom/mvp-ui";
import { BrandTheme } from "@/constants/theme";
import { usePlannedOutfits } from "@/hooks/use-modario-data";
import { formatLocalCalendarDate } from "@/libs/local-date";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { palette, radius } = BrandTheme;

export default function PlannerCalendarScreen() {
  const router = useRouter();
  const range = useMemo(() => getPlannerRange(), []);
  const plannedQuery = usePlannedOutfits(range.from, range.to);
  const dayOptions = useMemo(() => getUpcomingDayOptions(), []);
  const [selectedDate, setSelectedDate] = useState(
    dayOptions[0]?.value ?? range.from,
  );

  const plannedForSelectedDate = (plannedQuery.data ?? []).filter(
    (entry) => entry.plannedDate === selectedDate,
  );

  return (
    <SafeAreaView
      className="flex-1 px-4 py-4"
      style={{ backgroundColor: palette.ivory }}
    >
      <AppHeader title="Planner" eyebrow="upcoming looks" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2 pb-2">
          {dayOptions.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={option.value === selectedDate}
              onPress={() => setSelectedDate(option.value)}
            />
          ))}
        </View>
      </ScrollView>
      <SectionHeader
        title="Planned outfits"
        action={prettyDate(selectedDate)}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {plannedQuery.isLoading ? (
          <InfoNotice
            title="Loading planner"
            description="We’re fetching your live plan for the coming weeks."
          />
        ) : null}
        {plannedQuery.isError ? (
          <EmptyState
            title="Planner unavailable"
            description="We couldn’t load your planned outfits right now."
            action={
              <PrimaryButton
                label="Retry"
                onPress={() => plannedQuery.refetch()}
              />
            }
          />
        ) : null}
        {!plannedQuery.isLoading &&
        !plannedQuery.isError &&
        !(plannedQuery.data?.length ?? 0) ? (
          <EmptyState
            title="No planned outfits"
            description="Save an outfit, then plan it for a date that matters."
          />
        ) : null}
        {!plannedQuery.isLoading &&
        !plannedQuery.isError &&
        (plannedQuery.data?.length ?? 0) > 0 &&
        !plannedForSelectedDate.length ? (
          <EmptyState
            title="Nothing planned that day"
            description="Pick another date above or plan a saved outfit to fill this day."
            action={
              <PrimaryButton
                label="Plan an outfit"
                onPress={() => router.push("/plan/picker")}
              />
            }
          />
        ) : null}
        <View className="gap-3">
          {plannedForSelectedDate.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() =>
                router.push({
                  pathname: "/plan/day/[date]",
                  params: { date: entry.plannedDate, planId: entry.id },
                })
              }
              className="rounded-[22px] border bg-white p-4"
              style={{ borderColor: palette.line, borderRadius: radius.card }}
            >
              <Text
                className="font-InterSemiBold text-lg"
                style={{ color: palette.ink }}
              >
                {entry.outfitName}
              </Text>
              <Text
                className="mt-1 font-InterRegular text-sm"
                style={{ color: palette.muted }}
              >
                Slot {entry.slotIndex + 1}
                {entry.notes ? ` • ${entry.notes}` : ""}
              </Text>
              <Text
                className="mt-3 font-InterMedium text-sm"
                style={{ color: palette.burgundy }}
              >
                Open day detail
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getPlannerRange() {
  const fromDate = new Date();
  const toDate = new Date();
  toDate.setDate(toDate.getDate() + 120);

  return {
    from: formatLocalCalendarDate(fromDate),
    to: formatLocalCalendarDate(toDate),
  };
}

function getUpcomingDayOptions() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: formatLocalCalendarDate(date),
      label: date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "numeric",
        day: "numeric",
      }),
    };
  });
}

function prettyDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
