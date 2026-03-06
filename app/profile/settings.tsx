import { AppHeader } from '@/components/custom/mvp-ui';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Row({ label }: { label: string }) {
  return <View className="flex-row items-center justify-between border-b border-[#EFEFEF] py-4"><Text className="text-base text-[#1A1A1A]">{label}</Text><ChevronRight size={16} color="#8A8A8A" /></View>;
}

export default function SettingsScreen() {
  return <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4"><AppHeader title="Settings" /><View className="rounded-2xl border border-[#E5E5E5] bg-white px-4"><Row label="Notifications" /><Row label="Style Preferences" /><Row label="Privacy" /><Row label="Help" /></View></SafeAreaView>;
}
