import { PLANNED_OUTFITS } from '@/constants/mock-planning';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Link } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F6F3] px-6 py-6">
      <Text className="font-InterBold text-3xl text-[#1A1A1A]">Planning</Text>
      <Text className="mt-2 font-InterRegular text-gray-600">Your upcoming outfit plan</Text>

      <ScrollView className="mt-6" showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-4">
          {PLANNED_OUTFITS.map((entry) => {
            const outfit = STARTER_OUTFITS.find((item) => item.id === entry.outfitId) ?? STARTER_OUTFITS[0];
            return (
              <Link key={`${entry.date}-${entry.outfitId}`} href={{ pathname: '/plan/day/[date]', params: { date: entry.date, outfitId: entry.outfitId } }} asChild>
                <Pressable className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <Image source={{ uri: outfit.image }} className="h-32 w-full" />
                  <View className="p-4">
                    <Text className="font-InterMedium text-[#1A1A1A]">{entry.date}</Text>
                    <Text className="mt-1 text-sm text-gray-600">{outfit.title}</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
