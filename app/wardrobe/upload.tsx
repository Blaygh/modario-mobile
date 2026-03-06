import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { Link } from 'expo-router';
import { ImagePlus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadImagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Upload Items" />
      <View className="mt-2 rounded-2xl border border-dashed border-[#BFA9B2] bg-white p-8 items-center">
        <ImagePlus size={40} color="#660033" />
        <Text className="mt-3 font-InterSemiBold text-lg text-[#1A1A1A]">Select item photos</Text>
        <Text className="mt-1 text-center font-InterRegular text-sm text-[#6B6B6B]">Upload multiple photos, then we&apos;ll detect item details.</Text>
      </View>
      <View className="mt-5 gap-3">
        <SecondaryButton label="Add more photos" />
        <Link href="/wardrobe/processing" asChild><Pressable><PrimaryButton label="Upload & detect" /></Pressable></Link>
      </View>
    </SafeAreaView>
  );
}
