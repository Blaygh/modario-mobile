import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, InfoNotice, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar, useOutfitRecommendations } from '@/hooks/use-modario-data';
import { useOnboardingState, useSubmitOnboardingMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function OnboardingDoneScreen() {
  const router = useRouter();
  const submitMutation = useSubmitOnboardingMutation();
  const onboardingStateQuery = useOnboardingState();
  const currentAvatarQuery = useCurrentAvatar();
  const recommendationsQuery = useOutfitRecommendations();

  const finishOnboarding = async () => {
    await submitMutation.mutateAsync();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Finish onboarding" subtitle="Submitting marks onboarding complete for your account and sends you directly to Home while anything else processes in the background." showBack />
      <ProgressBar progress={7} total={7} />

      <Text className="mt-6 font-InterBold text-[32px] leading-[38px]" style={{ color: palette.ink }}>
        You&apos;re ready to enter Modario.
      </Text>
      <Text className="mt-2 font-InterRegular text-base leading-6" style={{ color: palette.muted }}>
        Finish saves your latest onboarding state, marks completion for this account, and lets post-submit processing continue without holding you here.
      </Text>

      <View className="mt-6" style={{ gap: 12 }}>
        <InfoNotice
          title="What happens next"
          description={
            onboardingStateQuery.data?.avatarMode === 'upload'
              ? 'Your uploaded reference photos are already stored. Avatar generation begins only after submit, and any backend failure later will not revoke onboarding completion.'
              : onboardingStateQuery.data?.avatarMode === 'base'
                ? 'Your base model selection is already saved. Finish only marks onboarding complete and queues any downstream personalization work.'
                : 'You skipped avatar setup for now, and that still counts as a valid completed onboarding flow.'
          }
        />

        {currentAvatarQuery.data?.imageUrl ? (
          <View className="items-center rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
            <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 112, height: 112, borderRadius: 56 }} contentFit="cover" />
            <Text className="mt-3 font-InterSemiBold text-lg" style={{ color: palette.ink }}>
              {currentAvatarQuery.data.label ?? 'Current avatar'}
            </Text>
          </View>
        ) : null}
      </View>

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

      {submitMutation.isError ? (
        <Text className="mt-4 font-InterRegular text-sm leading-6" style={{ color: '#B42318' }}>
          {submitMutation.error instanceof Error ? submitMutation.error.message : 'We could not finish onboarding. Please retry.'}
        </Text>
      ) : null}

      <View className="mt-auto gap-3 pb-2 pt-6">
        <PrimaryButton label="Go to Home" fullWidth onPress={finishOnboarding} loading={submitMutation.isPending} disabled={submitMutation.isPending} />
      </View>
    </SafeAreaView>
  );
}

const fallbackLook = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80';
