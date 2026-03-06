import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { WARDROBE_ITEMS } from '@/constants/mvp-data';
import { useLocalSearchParams } from 'expo-router';
import { TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditWardrobeItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = WARDROBE_ITEMS.find((entry) => entry.id === id) ?? WARDROBE_ITEMS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Edit Item" />
      <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4 gap-3">
        <TextInput defaultValue={item.name} className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Name" />
        <TextInput defaultValue={item.category} className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Category" />
        <TextInput defaultValue="Neutral" className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Color" />
        <TextInput defaultValue="Spring" className="rounded-lg border border-[#E5E5E5] px-3 py-3" placeholder="Season" />
      </View>
      <View className="mt-auto pb-4">
        <PrimaryButton label="Save Changes" />
      </View>
    </SafeAreaView>
  );
}
