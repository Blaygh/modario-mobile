import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useSelectBaseAvatarMutation } from '@/hooks/use-modario-data';
import { useAvatarFlowData, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Text } from 'react-native';

const { palette } = BrandTheme;

export default function BaseModelConfirmScreen() {
  const router = useRouter();
  const avatarFlow = useAvatarFlowData();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const selectBaseAvatarMutation = useSelectBaseAvatarMutation();
  const styleDirection = avatarFlow.derivedSelections.styleDirection;
  const skinTonePresetId = avatarFlow.derivedSelections.skinTonePresetId;
  const bodyTypePresetId = avatarFlow.derivedSelections.bodyTypePresetId;
  const [selectedBaseModelId, setSelectedBaseModelId] = useState<string | null>(avatarFlow.derivedSelections.selectedModel?.id ?? null);

  const matchingModels = useMemo(() => {
    if (!skinTonePresetId || !bodyTypePresetId) {
      return [];
    }

    return avatarFlow.getMatchingBaseModels(styleDirection, skinTonePresetId, bodyTypePresetId);
  }, [avatarFlow, bodyTypePresetId, skinTonePresetId, styleDirection]);

  useEffect(() => {
    if (!selectedBaseModelId && matchingModels[0]?.id) {
      setSelectedBaseModelId(matchingModels[0].id);
    }
  }, [matchingModels, selectedBaseModelId]);

  const confirmSelection = async () => {
    if (!selectedBaseModelId || !skinTonePresetId || !bodyTypePresetId) {
      return;
    }

    await selectBaseAvatarMutation.mutateAsync(selectedBaseModelId);
    await saveDraftMutation.mutateAsync({
      avatar_mode: 'base',
      avatar_skin_tone_preset_id: skinTonePresetId,
      avatar_body_type_preset_id: bodyTypePresetId,
      avatar_base_model_id: selectedBaseModelId,
      status: 'saved',
    });
    router.push('/(onboarding)/done');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Confirm your base model"
      subtitle="Selecting here saves the base model immediately, then returns you to onboarding finish."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Confirm base model" onPrimaryPress={confirmSelection} primaryDisabled={!selectedBaseModelId} primaryLoading={saveDraftMutation.isPending || selectBaseAvatarMutation.isPending} />}>
      {avatarFlow.baseModelsQuery.isLoading ? <LoadingNotice label="Loading matching base model…" /> : null}
      {avatarFlow.baseModelsQuery.isError ? <ErrorNotice label="We couldn’t load matching base models. Please retry." /> : null}
      {selectBaseAvatarMutation.isError ? <ErrorNotice label={selectBaseAvatarMutation.error instanceof Error ? selectBaseAvatarMutation.error.message : 'Failed to save base model.'} /> : null}
      {matchingModels.map((model) => (
        <SelectionCard
          key={model.id}
          title={model.displayName ?? model.name}
          description={model.description ?? 'A backend-provided base model for your selected preset combination.'}
          selected={selectedBaseModelId === model.id}
          onPress={() => setSelectedBaseModelId(model.id)}
          media={model.imageUrl ? <Image source={{ uri: model.imageUrl }} style={{ width: '100%', height: 280, borderRadius: 18 }} contentFit="cover" /> : undefined}
          trailing={<Text className="font-InterMedium text-sm" style={{ color: selectedBaseModelId === model.id ? palette.burgundy : palette.muted }}>{selectedBaseModelId === model.id ? 'Selected' : 'Choose'}</Text>}
        />
      ))}
      {!matchingModels.length && !avatarFlow.baseModelsQuery.isLoading ? <ErrorNotice label="No base model matched this preset combination yet. Please go back and try another combination." /> : null}
    </OnboardingScreen>
  );
}
