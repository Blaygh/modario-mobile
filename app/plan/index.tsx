import { AppHeader, FilterChip, SectionHeader } from '@/components/custom/mvp-ui';
import { PLANNED_OUTFITS } from '@/constants/mock-planning';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlannerCalendarScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Planner" />
      <View className="flex-row gap-2">
        {['Mon 7', 'Tue 8', 'Wed 9', 'Thu 10', 'Fri 11'].map((d, i) => <FilterChip key={d} label={d} selected={i === 1} />)}
      </View>
      <SectionHeader title="Planned outfits" />
      <ScrollView>
        <View className="gap-3 pb-8">
          {PLANNED_OUTFITS.map((entry) => {
            const outfit = STARTER_OUTFITS.find((item) => item.id === entry.outfitId) ?? STARTER_OUTFITS[0];
            return (
              <Link key={entry.date} href={{ pathname: '/plan/day/[date]', params: { date: entry.date, outfitId: entry.outfitId } }} asChild>
                <View className="flex-row overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
                  <Image source={{ uri: outfit.image }} style={{ width: 110, height: 110 }} />
                  <View className="flex-1 p-3"><Text className="font-InterSemiBold text-base text-[#1A1A1A]">{entry.date}</Text><Text className="mt-1 text-sm text-[#6B6B6B]">{outfit.title}</Text></View>
                </View>
              </Link>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
