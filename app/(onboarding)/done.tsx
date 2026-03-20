import { BrandTheme } from '@/constants/theme';
import { ErrorNotice, OnboardingFooter, OnboardingScreen } from '@/components/custom/onboarding-ui';
import { useCurrentAvatar, useMe, modarioQueryKeys } from '@/hooks/use-modario-data';
import { onboardingQueryKeys, useOnboardingState, useSubmitOnboardingMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Text, View } from 'react-native';

const { palette, radius } = BrandTheme;

export default function OnboardingDoneScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const onboardingStateQuery = useOnboardingState();
  const currentAvatarQuery = useCurrentAvatar();
  const meQuery = useMe();
  const submitMutation = useSubmitOnboardingMutation();

  const finishOnboarding = async () => {
    await submitMutation.mutateAsync();
    queryClient.setQueryData(onboardingQueryKeys.state, (current: any) => (current ? { ...current, isComplete: true, status: 'saved' } : current));
    queryClient.setQueryData(modarioQueryKeys.me, (current: any) => (current ? { ...current, onboardingComplete: true, onboardingStatus: 'saved' } : current));
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.state }),
      queryClient.invalidateQueries({ queryKey: modarioQueryKeys.me }),
    ]);
    router.replace('/(tabs)');
  };

  return (
    <OnboardingScreen
      step={6}
      total={6}
      title="Finish onboarding"
      subtitle="Submitting marks onboarding complete, takes you straight home, and leaves any downstream processing running in the background."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Finish" onPrimaryPress={finishOnboarding} primaryLoading={submitMutation.isPending} />}>
      {submitMutation.isError ? <ErrorNotice label={submitMutation.error instanceof Error ? submitMutation.error.message : 'Failed to finish onboarding.'} /> : null}
      <View className="rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
        <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
          Ready to save
        </Text>
        <View className="mt-4" style={{ gap: 10 }}>
          <SummaryRow label="Style direction" value={onboardingStateQuery.data?.styleDirection ?? 'Not selected'} />
          <SummaryRow label="Style taste" value={`${onboardingStateQuery.data?.stylePicks.length ?? 0} looks selected`} />
          <SummaryRow label="Colors" value={`${onboardingStateQuery.data?.colorLikes.length ?? 0} likes · ${onboardingStateQuery.data?.colorAvoids.length ?? 0} avoids`} />
          <SummaryRow label="Occasions" value={onboardingStateQuery.data?.occasions.length ? onboardingStateQuery.data.occasions.join(', ') : 'Skipped'} />
          <SummaryRow label="Avatar path" value={onboardingStateQuery.data?.avatarMode ?? 'skip'} />
        </View>
      </View>
      {currentAvatarQuery.data?.imageUrl ? (
        <View className="rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line }}>
          <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
            Current avatar
          </Text>
          <View className="mt-3 flex-row items-center" style={{ gap: 12 }}>
            <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 88, height: 88, borderRadius: 44 }} contentFit="cover" />
            <Text className="flex-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              {currentAvatarQuery.data.label ?? 'Your current avatar is already associated with this account.'}
            </Text>
          </View>
        </View>
      ) : null}
      {meQuery.data?.onboardingStatus === 'failed' ? <ErrorNotice label="A prior processing attempt failed, but finishing onboarding still takes you into the app." /> : null}
    </OnboardingScreen>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between" style={{ gap: 16 }}>
      <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
        {label}
      </Text>
      <Text className="flex-1 text-right font-InterMedium text-sm" style={{ color: palette.ink }}>
        {value}
      </Text>
    </View>
  );
}
