import { AppHeader, TagPill } from '@/components/custom/mvp-ui';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StyleProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Style Profile" />
      <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4 gap-3">
        <Text className="font-InterSemiBold text-base text-[#1A1A1A]">Selected styles</Text>
        <View className="flex-row flex-wrap gap-2"><TagPill label="Smart Casual" /><TagPill label="Classic" /><TagPill label="Athleisure" /></View>
        <Text className="font-InterSemiBold text-base text-[#1A1A1A]">Liked colors</Text>
        <View className="flex-row flex-wrap gap-2"><TagPill label="Navy" /><TagPill label="Burgundy" /><TagPill label="Teal" /></View>
      </View>
    </SafeAreaView>
  );
}
