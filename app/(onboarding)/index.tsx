import { OnboardingFooter, OnboardingScreen } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

const { palette, radius } = BrandTheme;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingScreen
      step={1}
      total={6}
      title="Let’s tailor Modario"
      subtitle="A few premium-fit questions now will make every recommendation feel more personal later."
      scroll={false}
      footer={<OnboardingFooter primaryLabel="Start onboarding" onPrimaryPress={() => router.push('/(onboarding)/style-direction')} />}>
      <View className="overflow-hidden bg-white" style={{ borderRadius: radius.card, borderWidth: 1, borderColor: palette.line }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' }}
          style={{ width: '100%', height: 250 }}
          contentFit="cover"
        />
      </View>
      <View className="rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line }}>
        <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
          What you’ll set up
        </Text>
        <View className="mt-3" style={{ gap: 12 }}>
          {[
            'Your overall style direction',
            '2–3 outfit inspirations you’d actually wear',
            'Color likes, avoids, and key occasions',
            'An avatar path: upload, base model, or skip for now',
          ].map((item) => (
            <View key={item} className="flex-row items-start" style={{ gap: 10 }}>
              <View className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: palette.burgundy }} />
              <Text className="flex-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}
