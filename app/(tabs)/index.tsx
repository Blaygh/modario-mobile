import { AppHeader, FilterChip, PrimaryButton, SectionHeader, TagPill } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Good morning, Nana" right={<Bell size={20} color="#660033" />} />

        <View className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white">
          <Image source={{ uri: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80' }} style={{ width: '100%', height: 180 }} />
          <View className="bg-[#660033] p-4">
            <Text className="font-InterBold text-[28px] text-white">Today&apos;s Outfit for You</Text>
            <Text className="mt-1 font-InterRegular text-sm text-[#F3E8EC]">Casual • 68°F</Text>
            <View className="mt-3 flex-row gap-2">
              <FilterChip label="View Outfit" selected />
              <FilterChip label="♥ Save" selected />
              <FilterChip label="✦ Plan" selected />
            </View>
          </View>
        </View>

        <SectionHeader title="Outfit Suggestions" action="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {STARTER_OUTFITS.map((outfit) => (
              <Link key={outfit.id} href={{ pathname: '/outfit/[id]', params: { id: outfit.id, source: 'home' } }} asChild>
                <View className="w-40 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
                  <Image source={{ uri: outfit.image }} style={{ width: '100%', height: 110 }} />
                  <View className="p-2">
                    <Text className="font-InterSemiBold text-sm text-[#1A1A1A]">{outfit.title}</Text>
                    <TagPill label={outfit.occasion} />
                  </View>
                </View>
              </Link>
            ))}
          </View>
        </ScrollView>

        <SectionHeader title="Item Recommendations" action="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {RECOMMENDED_PRODUCTS.map((item) => (
              <Link key={item.id} href={{ pathname: '/discover/item/[id]', params: { id: item.id } }} asChild>
                <View className="w-36 overflow-hidden rounded-2xl border border-[#E5E5E5] bg-white">
                  <Image source={{ uri: item.image }} style={{ width: '100%', height: 88 }} />
                  <View className="p-2">
                    <Text className="font-InterMedium text-xs text-[#1A1A1A]">{item.name}</Text>
                    <Text className="mt-1 font-InterSemiBold text-sm text-[#660033]">{item.price}</Text>
                  </View>
                </View>
              </Link>
            ))}
          </View>
        </ScrollView>

        <View className="mb-8 mt-5 rounded-2xl border border-[#E5E5E5] bg-white p-4">
          <Text className="font-InterSemiBold text-lg text-[#1A1A1A]">Wardrobe Insight</Text>
          <Text className="mt-1 font-InterRegular text-sm text-[#6B6B6B]">You wear neutrals 62% of the time. Add one bold accent top to diversify looks.</Text>
          <View className="mt-3">
            <PrimaryButton label="Open Wardrobe" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
