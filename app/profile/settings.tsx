import { AppHeader, EmptyState, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useProfile } from '@/hooks/use-modario-data';
import * as Linking from 'expo-linking';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function SettingsScreen() {
  const profileQuery = useProfile();

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Settings" eyebrow="account" subtitle="Notifications are intentionally hidden until a real preferences contract exists." showBack />
      {!profileQuery.data ? <EmptyState title="Settings unavailable" description="We couldn’t load account settings right now." /> : null}
      {profileQuery.data ? (
        <View className="gap-4 border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
          <InfoRow label="Locale" value={profileQuery.data.locale ?? 'Unavailable'} />
          <InfoRow label="Timezone" value={profileQuery.data.timezone ?? 'Unavailable'} />
          <InfoRow label="Country" value={profileQuery.data.country ?? 'Unavailable'} />
          <InfoRow label="Gender" value={profileQuery.data.gender ?? 'Unavailable'} />
          <View className="gap-3 pt-2">
            <PrimaryButton label="Open Terms of Service" onPress={() => Linking.openURL('https://modario.io/terms')} />
            <PrimaryButton label="Open Privacy Policy" onPress={() => Linking.openURL('https://modario.io/privacy')} />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>{label}</Text>
      <Text className="mt-1 font-InterRegular text-base" style={{ color: palette.ink }}>{value}</Text>
    </View>
  );
}
