import { AppHeader, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ItemRecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = RECOMMENDED_PRODUCTS.find((entry) => entry.id === id) ?? RECOMMENDED_PRODUCTS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Item Recommendation" />
      <View className="overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
        <Image source={{ uri: item.image }} style={{ width: '100%', height: 260 }} />
        <View className="p-4 gap-2">
          <Text className="font-InterSemiBold text-2xl text-[#1A1A1A]">{item.name}</Text>
          <Text className="font-InterSemiBold text-xl text-[#660033]">{item.price}</Text>
          <TagPill label="Matches your beige + burgundy looks" />
          <Text className="font-InterRegular text-sm text-[#6B6B6B]">This item complements your saved outfits and preferred neutral palette.</Text>
        </View>
      </View>
      <View className="mt-auto gap-3 pb-2 pt-4">
        <PrimaryButton label="Open Product Link" />
        <SecondaryButton label="Save for later" />
      </View>
    </SafeAreaView>
  );
}
