import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlannedDayDetailScreen() {
  const { date, outfitId } = useLocalSearchParams<{ date: string; outfitId?: string }>();
  const outfit = STARTER_OUTFITS.find((entry) => entry.id === outfitId) ?? STARTER_OUTFITS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Planned Day" />
      <Text className="text-sm text-[#6B6B6B]">{date}</Text>
      <View className="mt-4 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white"><Image source={{ uri: outfit.image }} style={{ width: '100%', height: 220 }} /><View className="p-4"><Text className="text-xl font-InterSemiBold text-[#1A1A1A]">{outfit.title}</Text></View></View>
      <View className="mt-auto gap-3 pb-2 pt-4">
        <PrimaryButton label="Change outfit" />
        <SecondaryButton label="Remove outfit" />
        <Link href={{ pathname: '/outfit/[id]', params: { id: outfit.id, source: 'plan' } }} asChild><Pressable className="items-center py-2"><Text className="text-[#660033]">View outfit detail</Text></Pressable></Link>
      </View>
    </SafeAreaView>
  );
}
