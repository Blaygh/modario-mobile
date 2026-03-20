import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, InfoNotice, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useBaseAvatars, useCurrentAvatar, useSelectBaseAvatarMutation } from '@/hooks/use-modario-data';
import { useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { deriveAvatarDraftFromSelection, getMatchingBaseModels } from '@/libs/avatar-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export default function BaseModelConfirmScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const selectMutation = useSelectBaseAvatarMutation();
  const currentAvatarQuery = useCurrentAvatar();
  const baseModelsQuery = useBaseAvatars();
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

  const restoredDraft = useMemo(
    () => deriveAvatarDraftFromSelection(baseModelsQuery.data ?? [], onboardingStateQuery.data?.avatarBaseModelId),
    [baseModelsQuery.data, onboardingStateQuery.data?.avatarBaseModelId],
  );
  const styleDirection =
    restoredDraft?.styleDirection ??
    (onboardingStateQuery.data?.styleDirection === 'menswear' || onboardingStateQuery.data?.styleDirection === 'womenswear'
      ? onboardingStateQuery.data.styleDirection
      : null);
  const skinTonePresetId = restoredDraft?.skinTonePresetId ?? onboardingStateQuery.data?.avatarSkinTonePresetId ?? null;
  const bodyTypePresetId = restoredDraft?.bodyTypePresetId ?? onboardingStateQuery.data?.avatarBodyTypePresetId ?? null;

  const matchingModels = useMemo(
    () =>
      styleDirection && skinTonePresetId && bodyTypePresetId
        ? getMatchingBaseModels(baseModelsQuery.data ?? [], { styleDirection, skinTonePresetId, bodyTypePresetId })
        : [],
    [baseModelsQuery.data, bodyTypePresetId, skinTonePresetId, styleDirection],
  );

  useEffect(() => {
    const preferred = onboardingStateQuery.data?.avatarBaseModelId ?? currentAvatarQuery.data?.baseModelId ?? matchingModels[0]?.id ?? null;
    if (preferred) {
      setSelectedModelId(preferred);
    }
  }, [currentAvatarQuery.data?.baseModelId, matchingModels, onboardingStateQuery.data?.avatarBaseModelId]);

  const handleConfirm = async () => {
    if (!selectedModelId || !skinTonePresetId || !bodyTypePresetId) {
      return;
    }

    await selectMutation.mutateAsync(selectedModelId);
    await saveMutation.mutateAsync({
      avatar_mode: 'base',
      avatar_base_model_id: selectedModelId,
      avatar_skin_tone_preset_id: skinTonePresetId,
      avatar_body_type_preset_id: bodyTypePresetId,
      avatar_image_urls: [],
      avatar_status: 'saved',
      status: 'saved',
    });
    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Confirm base model" subtitle="Step 4 of 4 · choose the exact backend base model and save it immediately before finishing onboarding." showBack />
        <ProgressBar progress={6} total={7} />

        {!styleDirection || !skinTonePresetId || !bodyTypePresetId ? (
          <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
            <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              Complete the style direction, skin tone, and body type steps first so we can show the matching backend model.
            </Text>
            <View className="mt-4">
              <SecondaryButton label="Back to body type" onPress={() => router.replace('/(onboarding)/base-model-body-type')} />
            </View>
          </View>
        ) : null}

        {(baseModelsQuery.isLoading || currentAvatarQuery.isLoading) ? (
          <View className="mt-8 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading matching base models…
            </Text>
          </View>
        ) : null}

        <View className="mt-6 flex-1" style={{ gap: 14 }}>
          {matchingModels.map((model) => {
            const selected = model.id === selectedModelId;

            return (
              <Pressable
                key={model.id}
                onPress={() => setSelectedModelId(model.id)}
                className="overflow-hidden rounded-[24px] border bg-white"
                style={{ borderColor: selected ? palette.burgundy : palette.line, borderWidth: selected ? 2 : 1, borderRadius: radius.card, ...shadow.soft }}>
                <Image source={{ uri: model.imageUrl ?? fallbackBaseModel }} style={{ width: '100%', height: 260 }} contentFit="cover" />
                <View className="p-4" style={{ gap: 8 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
                      {model.displayName}
                    </Text>
                    <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: selected ? palette.burgundy : palette.roseFog }}>
                      {selected ? <Check size={15} color="#FFFFFF" /> : null}
                    </View>
                  </View>
                  <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                    {model.styleDirection === 'menswear' ? 'Menswear-leaning' : 'Womenswear-leaning'} · {model.skinTonePresetName ?? 'Skin tone preset'} · {model.bodyTypePresetName ?? 'Body type preset'}
                  </Text>
                </View>
              </Pressable>
            );
          })}

          {!baseModelsQuery.isLoading && !matchingModels.length ? (
            <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: '#E7C9D2' }}>
              <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>
                No base model matched this combination.
              </Text>
              <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                Retry, or go back and change your skin tone or body type preset.
              </Text>
            </View>
          ) : null}
        </View>

        {selectMutation.isError || saveMutation.isError ? (
          <Text className="mt-4 font-InterRegular text-sm leading-6" style={{ color: '#B42318' }}>
            {(selectMutation.error instanceof Error && selectMutation.error.message) ||
              (saveMutation.error instanceof Error && saveMutation.error.message) ||
              'We could not save this base model. Please retry.'}
          </Text>
        ) : null}

        <View className="pb-2 pt-4" style={{ gap: 12 }}>
          <InfoNotice title="Saved immediately" description="Confirming here calls the base model select endpoint right away so the choice feels persistent across devices." />
          <View style={{ gap: 10 }}>
            <SecondaryButton label="Back" onPress={() => router.back()} disabled={saveMutation.isPending || selectMutation.isPending} />
            <PrimaryButton
              label="Confirm and continue"
              fullWidth
              onPress={handleConfirm}
              disabled={!selectedModelId || saveMutation.isPending || selectMutation.isPending}
              loading={saveMutation.isPending || selectMutation.isPending}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const fallbackBaseModel = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80';
