import { AppHeader, EmptyState, FilterChip, InfoNotice } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useWardrobeItems } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = ['All', 'Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Accessories'] as const;
const ROLE_BY_FILTER: Record<(typeof FILTERS)[number], string | undefined> = {
  All: undefined,
  Tops: 'top',
  Bottoms: 'bottom',
  Shoes: 'footwear',
  Outerwear: 'outerwear',
  Accessories: 'accessory',
};
const { palette, radius } = BrandTheme;

export default function WardrobeOverviewScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('All');
  const [activeSection, setActiveSection] = useState<'active' | 'archived'>('active');
  const selectedRole = ROLE_BY_FILTER[activeFilter];
  const itemsQuery = useWardrobeItems({ role: selectedRole, active: activeSection });

  const items = useMemo(
    () =>
      (itemsQuery.data ?? []).map((item) => ({
        id: item.id,
        name: item.itemType,
        category: item.role,
        colorLabel: item.colorLabel,
        image: item.previewImageUrl ?? fallbackItem,
      })),
    [itemsQuery.data],
  );

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Wardrobe" eyebrow="live closet" subtitle="Browse active and archived wardrobe items backed by your account data." />
      <View className="mb-3 flex-row gap-2">
        <FilterChip label="Active" selected={activeSection === 'active'} onPress={() => setActiveSection('active')} />
        <FilterChip label="Archived" selected={activeSection === 'archived'} onPress={() => setActiveSection('archived')} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
        <View className="flex-row gap-2 pb-2">
          {FILTERS.map((filter) => (
            <FilterChip key={filter} label={filter} selected={activeFilter === filter} onPress={() => setActiveFilter(filter)} />
          ))}
        </View>
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {itemsQuery.isLoading ? <InfoNotice title="Loading wardrobe" description="We’re syncing your latest wardrobe items." /> : null}
        {itemsQuery.isError ? <EmptyState title="Wardrobe unavailable" description="Please retry to load your wardrobe items." /> : null}
        {!itemsQuery.isLoading && !itemsQuery.isError && !items.length ? (
          <EmptyState
            title={activeSection === 'active' ? 'No wardrobe items yet' : 'No archived items'}
            description={activeSection === 'active' ? 'Add wardrobe photos to start building real outfit recommendations.' : 'Archived items will stay recoverable here.'}
          />
        ) : null}
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => router.push({ pathname: '/wardrobe/item/[id]', params: { id: item.id } })}
              className="w-[48%] overflow-hidden border bg-white"
              style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Image source={{ uri: item.image }} style={{ width: '100%', height: 142 }} contentFit="cover" />
              <View className="p-3">
                <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{toTitle(item.name)}</Text>
                <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>
                  {[toTitle(item.category), item.colorLabel ? toTitle(item.colorLabel) : null].filter(Boolean).join(' • ')}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-6 left-4 right-4 items-end">
        <Pressable onPress={() => router.push('/wardrobe/add-item')} className="flex-row items-center gap-2 rounded-xl px-5 py-3.5" style={{ backgroundColor: palette.burgundy }}>
          <Plus size={18} color="#FFFFFF" />
          <Text className="font-InterSemiBold text-base text-white">Add item</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function toTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

const fallbackItem = 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80';
