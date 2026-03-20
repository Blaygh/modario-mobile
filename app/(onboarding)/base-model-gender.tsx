import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useAvatarFlowData, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import type { StyleDirection } from '@/types';

const { palette } = BrandTheme;

export default function BaseModelStyleDirectionScreen() {
  const router = useRouter();
  const avatarFlow = useAvatarFlowData();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [selectedDirection, setSelectedDirection] = useState<Exclude<StyleDirection, null> | null>(null);

  useEffect(() => {
    setSelectedDirection(avatarFlow.derivedSelections.styleDirection);
  }, [avatarFlow.derivedSelections.styleDirection]);

  const continueNext = async () => {
    if (!selectedDirection) {
      return;
    }

    await saveDraftMutation.mutateAsync({ avatar_mode: 'base', style_direction: selectedDirection, status: 'saved' });
    router.push('/(onboarding)/base-model-skin-tone');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Choose base model direction"
      subtitle="Start with the style direction preview using the default skin tone and body type presets."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryDisabled={!selectedDirection} primaryLoading={saveDraftMutation.isPending} />}>
      {avatarFlow.bundleQuery.isLoading || avatarFlow.baseModelsQuery.isLoading ? <LoadingNotice label="Loading base model previews…" /> : null}
      {avatarFlow.bundleQuery.isError || avatarFlow.baseModelsQuery.isError ? <ErrorNotice label="We couldn’t load base model previews. Please retry." /> : null}
      {avatarFlow.styleCards.map((card) => (
        <SelectionCard
          key={card.label}
          title={card.label}
          description={card.description}
          selected={selectedDirection === card.styleDirection}
          onPress={() => setSelectedDirection(card.styleDirection)}
          media={card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 250, borderRadius: 18 }} contentFit="cover" /> : undefined}
          trailing={<Text className="font-InterMedium text-sm" style={{ color: selectedDirection === card.styleDirection ? palette.burgundy : palette.muted }}>{selectedDirection === card.styleDirection ? 'Selected' : 'Choose'}</Text>}
        />
      ))}
    </OnboardingScreen>
  );
}
