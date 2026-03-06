import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { Link } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImportCompleteScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Import Complete" />
      <View className="mt-16 items-center">
        <CheckCircle2 size={72} color="#2E7D5B" />
        <Text className="mt-4 font-InterSemiBold text-2xl text-[#1A1A1A]">3 items added</Text>
        <Text className="mt-2 font-InterRegular text-sm text-[#6B6B6B]">Your wardrobe is updated and ready for better recommendations.</Text>
      </View>
      <View className="mt-auto gap-3 pb-4">
        <Link href="/(tabs)/wardrobe" asChild><Pressable><PrimaryButton label="View Wardrobe" /></Pressable></Link>
        <Link href="/wardrobe/add-item" asChild><Pressable><SecondaryButton label="Add More" /></Pressable></Link>
      </View>
    </SafeAreaView>
  );
}
