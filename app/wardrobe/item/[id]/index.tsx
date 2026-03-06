import { AppHeader, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { WARDROBE_ITEMS } from '@/constants/mvp-data';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WardrobeItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = WARDROBE_ITEMS.find((entry) => entry.id === id) ?? WARDROBE_ITEMS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Wardrobe Item" />
      <View className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden">
        <Image source={{ uri: item.image }} style={{ width: '100%', height: 260 }} />
        <View className="p-4 gap-2">
          <Text className="font-InterSemiBold text-2xl text-[#1A1A1A]">{item.name}</Text>
          <TagPill label={item.category} />
          <Text className="font-InterRegular text-sm text-[#6B6B6B]">Last worn: {item.lastWorn}</Text>
        </View>
      </View>
      <View className="mt-auto gap-3 pb-2 pt-4">
        <Link href={{ pathname: '/wardrobe/item/[id]/edit', params: { id: item.id } }} asChild><Pressable><PrimaryButton label="Edit Item" /></Pressable></Link>
        <SecondaryButton label="Archive item" />
      </View>
    </SafeAreaView>
  );
}
