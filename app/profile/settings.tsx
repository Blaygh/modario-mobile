import { AppHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { ChevronRight } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

function Row({ label }: { label: string }) {
  return (
    <View className="flex-row items-center justify-between border-b py-4" style={{ borderColor: palette.line }}>
      <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>{label}</Text>
      <ChevronRight size={16} color={palette.muted} />
    </View>
  );
}

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Settings" eyebrow="account" />
      <View className="rounded-3xl border bg-white px-4" style={{ borderColor: palette.line }}>
        <Row label="Notifications" />
        <Row label="Style Preferences" />
        <Row label="Privacy" />
        <Row label="Help" />
      </View>
    </SafeAreaView>
  );
}
