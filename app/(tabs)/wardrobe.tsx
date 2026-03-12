import { AppHeader, FilterChip } from '@/components/custom/mvp-ui';
import { WARDROBE_ITEMS } from '@/constants/mvp-data';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];
const { palette, shadow } = BrandTheme;

export default function WardrobeOverviewScreen() {
  const [active, setActive] = useState('All');
  const items = active === 'All' ? WARDROBE_ITEMS : WARDROBE_ITEMS.filter((item) => item.category === active);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="My Wardrobe" eyebrow="curated closet" right={<Search size={20} color={palette.ink} />} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2 pb-2">
          {FILTERS.map((filter) => (
            <FilterChip key={filter} label={filter} selected={active === filter} onPress={() => setActive(filter)} />
          ))}
        </View>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {items.map((item) => (
            <Link key={item.id} href={{ pathname: '/wardrobe/item/[id]', params: { id: item.id } }} asChild>
              <Pressable className="w-[48%] overflow-hidden rounded-3xl border bg-white" style={{ borderColor: palette.line }}>
                <Image source={{ uri: item.image }} style={{ width: '100%', height: 130 }} />
                <View className="p-2.5">
                  <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{item.name}</Text>
                  <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>Last worn: {item.lastWorn}</Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
        <View className="h-28" />
      </ScrollView>

      <View className="absolute bottom-6 left-4 right-4">
        <Link href="/wardrobe/add-item" asChild>
          <Pressable className="items-center rounded-full py-3.5" style={{ backgroundColor: palette.burgundy, ...shadow.soft }}>
            <Text className="font-InterSemiBold text-base text-white">+ Add Item</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
