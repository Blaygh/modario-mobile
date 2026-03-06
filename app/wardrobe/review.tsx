import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { IMPORT_DETECTIONS } from '@/constants/mvp-data';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImportReviewScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Review Detected Items" />
      <Text className="mb-3 font-InterRegular text-sm text-[#6B6B6B]">Confirm each item before adding to wardrobe.</Text>
      <View className="gap-3">
        {IMPORT_DETECTIONS.map((item) => (
          <View key={item.id} className="rounded-2xl border border-[#E5E5E5] bg-white p-3">
            <View className="flex-row gap-3">
              <Image source={{ uri: item.image }} style={{ width: 70, height: 70, borderRadius: 12 }} />
              <View className="flex-1 gap-2">
                <TextInput defaultValue={item.name} className="rounded-lg border border-[#E5E5E5] px-3 py-2" />
                <View className="flex-row gap-2">
                  <TextInput defaultValue={item.category} className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2" />
                  <TextInput defaultValue={item.color} className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2" />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      <View className="mt-auto gap-2 pb-2 pt-4">
        <Link href="/wardrobe/complete" asChild><View><PrimaryButton label="Save 3 Items" /></View></Link>
        <SecondaryButton label="Remove selected" />
      </View>
    </SafeAreaView>
  );
}
