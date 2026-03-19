import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar, useOutfitRecommendations } from '@/hooks/use-modario-data';
import { useSubmitOnboardingMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function OnboardingDoneScreen() {
  const router = useRouter();
  const submitMutation = useSubmitOnboardingMutation();
  const currentAvatarQuery = useCurrentAvatar();
  const recommendationsQuery = useOutfitRecommendations();

  const finishOnboarding = async () => {
    await submitMutation.mutateAsync();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Finish onboarding" subtitle="Submitting marks onboarding complete for your account. Background processing can continue after you enter Home." showBack />
      <ProgressBar progress={7} total={7} />

      <Text className="mt-6 font-InterBold text-[32px] leading-[38px]" style={{ color: palette.ink }}>
        You&apos;re all set.
      </Text>
      <Text className="mt-2 font-InterRegular text-base leading-6" style={{ color: palette.muted }}>
        We’ll save your onboarding profile now, mark it complete, and take you straight to Home. If personalization finishes later or hits an error, you can still keep using the app.
      </Text>

      {currentAvatarQuery.data?.imageUrl ? (
        <View className="mt-6 items-center rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
          <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 112, height: 112, borderRadius: 56 }} contentFit="cover" />
          <Text className="mt-3 font-InterSemiBold text-lg" style={{ color: palette.ink }}>
            {currentAvatarQuery.data.label ?? 'Selected base avatar'}
          </Text>
        </View>
      ) : null}

      <ScrollView horizontal className="mt-8" showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pb-2">
          {(recommendationsQuery.data ?? []).slice(0, 3).map((outfit) => (
            <View key={outfit.id} className="w-[220px] overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Image source={{ uri: outfit.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 170 }} contentFit="cover" />
              <View className="p-3">
                <Text className="font-InterMedium text-base" style={{ color: palette.ink }} numberOfLines={2}>
                  {outfit.summary}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="mt-auto gap-3 pb-2 pt-6">
        <PrimaryButton label="Go to Home" fullWidth onPress={finishOnboarding} loading={submitMutation.isPending} disabled={submitMutation.isPending} />
      </View>
    </SafeAreaView>
  );
}

const fallbackLook = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80';
