import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function ImportCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ count?: string }>();
  const count = Number(params.count ?? 0);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Import complete" showBack />
      <View className="mt-16 items-center">
        <CheckCircle2 size={72} color="#2E7D5B" />
        <Text className="mt-4 font-InterSemiBold text-2xl" style={{ color: palette.ink }}>
          {count || 'Your'} item{count === 1 ? '' : 's'} {count ? 'added' : 'processed'}
        </Text>
        <Text className="mt-2 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          Your wardrobe has been updated and is ready for more trustworthy recommendations.
        </Text>
      </View>
      <View className="mt-auto gap-3 pb-4">
        <PrimaryButton label="View wardrobe" fullWidth onPress={() => router.replace('/(tabs)/wardrobe')} />
        <SecondaryButton label="Add more" fullWidth onPress={() => router.push('/wardrobe/add-item')} />
      </View>
    </SafeAreaView>
  );
}
