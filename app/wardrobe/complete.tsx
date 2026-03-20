import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useImportSession } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function ImportCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ count?: string; sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;
  const importQuery = useImportSession(sessionId, Boolean(sessionId));
  const count = Number(params.count ?? importQuery.data?.importedCount ?? 0);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Import complete" showBack subtitle="Your wardrobe import finished successfully." />
      <View className="mt-16 items-center">
        <CheckCircle2 size={72} color="#2E7D5B" />
        <Text className="mt-4 font-InterSemiBold text-2xl" style={{ color: palette.ink }}>
          {count} item{count === 1 ? '' : 's'} imported
        </Text>
        <Text className="mt-2 px-6 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          Your wardrobe has been updated with the exact number returned for this import session.
        </Text>
      </View>
      <View className="mt-auto gap-3 pb-4">
        <PrimaryButton label="Back to wardrobe" fullWidth onPress={() => router.replace('/(tabs)/wardrobe')} />
        <SecondaryButton label="Add more" onPress={() => router.push('/wardrobe/add-item')} />
      </View>
    </SafeAreaView>
  );
}
