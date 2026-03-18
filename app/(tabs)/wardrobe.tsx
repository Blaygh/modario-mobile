import { AppHeader, FilterChip } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { listWardrobeItems } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'];

const ROLE_BY_FILTER: Record<string, string | undefined> = {
  All: undefined,
  Tops: 'top',
  Bottoms: 'bottom',
  Shoes: 'footwear',
  Outerwear: 'outerwear',
  Accessories: 'accessory',
};
const { palette, radius, shadow } = BrandTheme;

export default function WardrobeOverviewScreen() {
  const { session } = useAuth();
  const [active, setActive] = useState('All');

  const selectedRole = ROLE_BY_FILTER[active];

  const itemsQuery = useQuery({
    queryKey: ['wardrobe-items', selectedRole ?? 'all'],
    enabled: Boolean(session?.access_token),
    queryFn: () => listWardrobeItems(session!.access_token, { limit: 50, offset: 0, active: true, role: selectedRole }),
    staleTime: 60 * 1000,
  });

  const allItems = useMemo(
    () =>
      (itemsQuery.data?.items ?? []).map((item) => ({
        id: item.id,
        name: (item.attributes?.item_type as string | undefined) ?? item.role ?? 'Item',
        category:
          item.role === 'top'
            ? 'Tops'
            : item.role === 'bottom'
              ? 'Bottoms'
              : item.role === 'footwear'
                ? 'Shoes'
                : item.role === 'outerwear'
                  ? 'Outerwear'
                  : item.role === 'accessory'
                    ? 'Accessories'
                    : 'All',
        image: item.image?.display_url ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
        lastWorn: 'Recently',
      })),
    [itemsQuery.data?.items],
  );

  const items = allItems;

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
        {itemsQuery.isLoading ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading wardrobe…</Text> : null}
        {itemsQuery.error ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: '#B42318' }}>Failed to load wardrobe items.</Text> : null}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {items.map((item) => (
            <Link key={item.id} href={{ pathname: '/wardrobe/item/[id]', params: { id: item.id } }} asChild>
              <Pressable className="w-[48%] overflow-hidden border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
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
