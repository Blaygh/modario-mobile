import { AppHeader } from '@/components/custom/mvp-ui';
import { Link } from 'expo-router';
import { LoaderCircle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImportProcessingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Analyzing Items" />
      <View className="mt-20 items-center">
        <LoaderCircle size={64} color="#660033" />
        <Text className="mt-6 font-InterSemiBold text-xl text-[#1A1A1A]">Detecting your wardrobe</Text>
        <Text className="mt-2 text-center font-InterRegular text-sm text-[#6B6B6B]">We&apos;re identifying type, color and tags so you can review before saving.</Text>
      </View>
      <View className="mt-auto mb-8">
        <Link href="/wardrobe/review" asChild><Pressable className="items-center rounded-xl bg-[#660033] py-3"><Text className="text-white font-InterSemiBold">Continue to review</Text></Pressable></Link>
      </View>
    </SafeAreaView>
  );
}
