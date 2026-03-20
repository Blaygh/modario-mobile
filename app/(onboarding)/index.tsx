import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const { palette } = BrandTheme;

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Welcome" subtitle="We’ll use a few style inputs to personalize Modario across every device." />
        <ProgressBar progress={1} total={7} />

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' }}
          style={{ width: '100%', height: 190, borderRadius: 16, marginTop: 24 }}
          contentFit="cover"
        />

        <Text className="mt-8 text-center font-InterBold text-[30px] leading-[38px]" style={{ color: palette.ink }}>
          Let&apos;s personalize your style.
        </Text>
        <Text className="mt-3 px-2 text-center font-InterRegular text-base leading-6" style={{ color: palette.muted }}>
          Style direction comes first because it determines which onboarding bundle and recommendations we request for your account.
        </Text>

        <View className="mt-auto gap-3 pb-2">
          <Link href="/(onboarding)/style-direction" asChild>
            <PrimaryButton label="Start onboarding" fullWidth />
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
