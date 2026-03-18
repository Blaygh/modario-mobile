import { AppHeader, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { getWardrobeItem } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WardrobeItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const itemId = typeof id === 'string' ? id : null;

  const itemQuery = useQuery({
    queryKey: ['wardrobe-item', session?.user?.id ?? 'anonymous', itemId],
    enabled: Boolean(session?.access_token && itemId),
    queryFn: () => getWardrobeItem(session!.access_token, itemId!),
  });

  const item = itemQuery.data;
  const itemName = (item?.attributes?.item_type as string | undefined) ?? item?.role ?? 'Item';
  const itemCategory = item?.role ?? 'unknown';
  const itemImage = item?.image?.display_url ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80';

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Wardrobe Item" />
      {itemQuery.isLoading ? <Text className="font-InterRegular text-sm text-[#6B6B6B]">Loading wardrobe item…</Text> : null}
      {itemQuery.error ? <Text className="font-InterRegular text-sm text-[#B42318]">Failed to load this wardrobe item.</Text> : null}
      {!itemQuery.isLoading && !itemQuery.error && !item ? <Text className="font-InterRegular text-sm text-[#6B6B6B]">Wardrobe item not found.</Text> : null}
      {item ? (
        <View className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden">
          <Image source={{ uri: itemImage }} style={{ width: '100%', height: 260 }} />
          <View className="p-4 gap-2">
            <Text className="font-InterSemiBold text-2xl text-[#1A1A1A]">{itemName}</Text>
            <TagPill label={itemCategory} />
            <Text className="font-InterRegular text-sm text-[#6B6B6B]">Status: {item.active ? 'Active' : 'Archived'}</Text>
          </View>
        </View>
      ) : null}
      <View className="mt-auto gap-3 pb-2 pt-4">
        {itemId ? (
          <Link href={{ pathname: '/wardrobe/item/[id]/edit', params: { id: itemId } }} asChild>
            <Pressable>
              <PrimaryButton label="Edit Item" />
            </Pressable>
          </Link>
        ) : null}
        <SecondaryButton label="Archive item" />
      </View>
    </SafeAreaView>
  );
}
