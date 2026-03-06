import { AppHeader } from '@/components/custom/mvp-ui';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const UPCOMING_DATES = ['2026-03-07', '2026-03-08', '2026-03-09', '2026-03-10'];

export default function PlanOutfitPickerScreen() {
  const { outfitId } = useLocalSearchParams<{ outfitId?: string }>();
  const selectedOutfit = STARTER_OUTFITS.find((entry) => entry.id === outfitId) ?? STARTER_OUTFITS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Plan Outfit" />
      <Text className="text-base text-[#6B6B6B]">Choose a day for {selectedOutfit.title}</Text>
      <View className="mt-6 gap-3">
        {UPCOMING_DATES.map((date) => (
          <Link key={date} href={{ pathname: '/plan/day/[date]', params: { date, outfitId: selectedOutfit.id } }} asChild>
            <Pressable className="rounded-2xl border border-[#E5E5E5] bg-white px-4 py-4"><Text className="font-InterMedium text-[#1A1A1A]">{date}</Text></Pressable>
          </Link>
        ))}
      </View>
    </SafeAreaView>
  );
}
