import { AppHeader, FilterChip, SectionHeader } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiscoverScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Discover" />
      <View className="flex-row gap-2">
        <FilterChip label="All" selected />
        <FilterChip label="Complete your look" />
        <FilterChip label="Work" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Recommended for you" />
        <View className="gap-3 pb-8">
          {RECOMMENDED_PRODUCTS.map((item) => (
            <Link key={item.id} href={{ pathname: '/discover/item/[id]', params: { id: item.id } }} asChild>
              <View className="flex-row overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
                <Image source={{ uri: item.image }} style={{ width: 110, height: 110 }} />
                <View className="flex-1 p-3">
                  <Text className="font-InterSemiBold text-lg text-[#1A1A1A]">{item.name}</Text>
                  <Text className="mt-1 font-InterRegular text-sm text-[#6B6B6B]">Selected to complete your saved beige/blazer looks.</Text>
                  <Text className="mt-2 font-InterSemiBold text-base text-[#660033]">{item.price}</Text>
                </View>
              </View>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
