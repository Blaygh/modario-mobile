import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useAvatarFlowData, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

const { palette } = BrandTheme;

export default function BaseModelSkinToneScreen() {
  const router = useRouter();
  const avatarFlow = useAvatarFlowData();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const styleDirection = avatarFlow.derivedSelections.styleDirection;
  const [selectedSkinTone, setSelectedSkinTone] = useState<string | null>(null);

  useEffect(() => {
    setSelectedSkinTone(avatarFlow.derivedSelections.skinTonePresetId);
  }, [avatarFlow.derivedSelections.skinTonePresetId]);

  const cards = avatarFlow.getSkinToneCards(styleDirection);

  const continueNext = async () => {
    if (!selectedSkinTone) {
      return;
    }

    await saveDraftMutation.mutateAsync({ avatar_mode: 'base', avatar_skin_tone_preset_id: selectedSkinTone, status: 'saved' });
    router.push('/(onboarding)/base-model-body-type');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Choose skin tone"
      subtitle="Each card uses your selected style direction with the default body type preset."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryDisabled={!selectedSkinTone} primaryLoading={saveDraftMutation.isPending} />}>
      {avatarFlow.bundleQuery.isLoading || avatarFlow.baseModelsQuery.isLoading ? <LoadingNotice label="Loading skin tone options…" /> : null}
      {avatarFlow.bundleQuery.isError || avatarFlow.baseModelsQuery.isError ? <ErrorNotice label="We couldn’t load skin tone previews. Please retry." /> : null}
      {cards.map((card) => (
        <SelectionCard
          key={card.label}
          title={card.label}
          selected={selectedSkinTone === card.skinTonePresetId}
          onPress={() => setSelectedSkinTone(card.skinTonePresetId)}
          media={card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 235, borderRadius: 18 }} contentFit="cover" /> : undefined}
          trailing={<Text className="font-InterMedium text-sm" style={{ color: selectedSkinTone === card.skinTonePresetId ? palette.burgundy : palette.muted }}>{selectedSkinTone === card.skinTonePresetId ? 'Selected' : 'Choose'}</Text>}
        />
      ))}
    </OnboardingScreen>
  );
}
