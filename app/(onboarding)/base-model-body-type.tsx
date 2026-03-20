import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useAvatarFlowData, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

const { palette } = BrandTheme;

export default function BaseModelBodyTypeScreen() {
  const router = useRouter();
  const avatarFlow = useAvatarFlowData();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const styleDirection = avatarFlow.derivedSelections.styleDirection;
  const skinTonePresetId = avatarFlow.derivedSelections.skinTonePresetId;
  const [selectedBodyType, setSelectedBodyType] = useState<string | null>(null);

  useEffect(() => {
    setSelectedBodyType(avatarFlow.derivedSelections.bodyTypePresetId);
  }, [avatarFlow.derivedSelections.bodyTypePresetId]);

  const cards = skinTonePresetId ? avatarFlow.getBodyTypeCards(styleDirection, skinTonePresetId) : [];

  const continueNext = async () => {
    if (!selectedBodyType) {
      return;
    }

    await saveDraftMutation.mutateAsync({ avatar_mode: 'base', avatar_skin_tone_preset_id: skinTonePresetId, avatar_body_type_preset_id: selectedBodyType, status: 'saved' });
    router.push('/(onboarding)/base-model-confirm');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Choose body type"
      subtitle="These cards keep your selected style direction and skin tone, then swap body type presets."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryDisabled={!selectedBodyType} primaryLoading={saveDraftMutation.isPending} />}>
      {avatarFlow.bundleQuery.isLoading || avatarFlow.baseModelsQuery.isLoading ? <LoadingNotice label="Loading body type options…" /> : null}
      {avatarFlow.bundleQuery.isError || avatarFlow.baseModelsQuery.isError ? <ErrorNotice label="We couldn’t load body type previews. Please retry." /> : null}
      {cards.map((card) => (
        <SelectionCard
          key={card.label}
          title={card.label}
          selected={selectedBodyType === card.bodyTypePresetId}
          onPress={() => setSelectedBodyType(card.bodyTypePresetId)}
          media={card.imageUrl ? <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 235, borderRadius: 18 }} contentFit="cover" /> : undefined}
          trailing={<Text className="font-InterMedium text-sm" style={{ color: selectedBodyType === card.bodyTypePresetId ? palette.burgundy : palette.muted }}>{selectedBodyType === card.bodyTypePresetId ? 'Selected' : 'Choose'}</Text>}
        />
      ))}
    </OnboardingScreen>
  );
}
