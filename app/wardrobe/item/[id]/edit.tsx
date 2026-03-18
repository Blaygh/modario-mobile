import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { getWardrobeItem } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditWardrobeItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const itemId = typeof id === 'string' ? id : null;

  const itemQuery = useQuery({
    queryKey: ['wardrobe-item', session?.user?.id ?? 'anonymous', itemId],
    enabled: Boolean(session?.access_token && itemId),
    queryFn: () => getWardrobeItem(session!.access_token, itemId!),
  });

  const item = itemQuery.data;
  const itemName = (item?.attributes?.item_type as string | undefined) ?? item?.role ?? '';
  const itemCategory = item?.role ?? '';

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Edit Item" />
      {itemQuery.isLoading ? <Text className="mb-3 font-InterRegular text-sm text-[#6B6B6B]">Loading wardrobe item…</Text> : null}
      {itemQuery.error ? <Text className="mb-3 font-InterRegular text-sm text-[#B42318]">Failed to load this wardrobe item.</Text> : null}
      {item ? (
        <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4 gap-3">
          <TextInput defaultValue={itemName} className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Name" />
          <TextInput defaultValue={itemCategory} className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Category" />
          <TextInput defaultValue="Neutral" className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Color" />
          <TextInput defaultValue="Spring" className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Season" />
        </View>
      ) : null}
      <View className="mt-auto pb-4">
        <PrimaryButton label="Save Changes" />
      </View>
    </SafeAreaView>
  );
}
