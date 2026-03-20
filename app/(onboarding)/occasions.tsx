import { BrandTheme } from '@/constants/theme';
import { OnboardingFooter, OnboardingScreen, ErrorNotice, LoadingNotice, SelectionCard } from '@/components/custom/onboarding-ui';
import { useOnboardingBundle, useOnboardingState, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';

const { palette } = BrandTheme;

export default function OccasionsScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const bundleQuery = useOnboardingBundle(onboardingStateQuery.data?.styleDirection);
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);

  useEffect(() => {
    if (onboardingStateQuery.data?.occasions) {
      setSelectedOccasions(onboardingStateQuery.data.occasions);
    }
  }, [onboardingStateQuery.data?.occasions]);

  const occasions = useMemo(() => bundleQuery.data?.occasions ?? [], [bundleQuery.data?.occasions]);

  const toggle = (label: string) => {
    setSelectedOccasions((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  };

  const continueNext = async () => {
    await saveDraftMutation.mutateAsync({ occasions: selectedOccasions, status: 'saved' });
    router.push('/(onboarding)/avatar');
  };

  const skip = async () => {
    await saveDraftMutation.mutateAsync({ occasions: [], status: 'saved' });
    router.push('/(onboarding)/avatar');
  };

  return (
    <OnboardingScreen
      step={4}
      total={6}
      title="Pick your occasions"
      subtitle="We’ll prioritize the settings you actually dress for."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryLoading={saveDraftMutation.isPending} secondaryLabel="Skip for now" onSecondaryPress={skip} />}>
      {bundleQuery.isLoading ? <LoadingNotice label="Loading occasions from your bundle…" /> : null}
      {bundleQuery.isError ? <ErrorNotice label="We couldn’t load your occasion list. Please retry." /> : null}
      {occasions.map((occasion) => {
        const selected = selectedOccasions.includes(occasion.label);
        return (
          <SelectionCard
            key={occasion.id}
            title={occasion.label}
            description={selected ? 'Included in your profile.' : 'Tap to add this occasion.'}
            selected={selected}
            onPress={() => toggle(occasion.label)}
            trailing={selected ? <Check size={18} color={palette.burgundy} /> : <View className="h-5 w-5 rounded-full border" style={{ borderColor: palette.line }} />}
          />
        );
      })}
    </OnboardingScreen>
  );
}
