import { AppHeader, FilterChip } from '@/components/custom/mvp-ui';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Notifications" />
      <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4 gap-3">
        <View className="flex-row items-center justify-between"><Text className="text-base text-[#1A1A1A]">Planner reminders</Text><FilterChip label="On" selected /></View>
        <View className="flex-row items-center justify-between"><Text className="text-base text-[#1A1A1A]">New recommendations</Text><FilterChip label="On" selected /></View>
        <View className="flex-row items-center justify-between"><Text className="text-base text-[#1A1A1A]">Price drop alerts</Text><FilterChip label="Off" /></View>
      </View>
    </SafeAreaView>
  );
}
