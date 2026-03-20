import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useBaseAvatars } from '@/hooks/use-modario-data';
import { useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { deriveAvatarDraftFromSelection, getSkinTonePreviewOptions } from '@/libs/avatar-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export default function BaseModelSkinToneScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const baseModelsQuery = useBaseAvatars();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const restoredDraft = useMemo(
    () => deriveAvatarDraftFromSelection(baseModelsQuery.data ?? [], onboardingStateQuery.data?.avatarBaseModelId),
    [baseModelsQuery.data, onboardingStateQuery.data?.avatarBaseModelId],
  );
  const styleDirection =
    restoredDraft?.styleDirection ??
    (onboardingStateQuery.data?.styleDirection === 'menswear' || onboardingStateQuery.data?.styleDirection === 'womenswear'
      ? onboardingStateQuery.data.styleDirection
      : null);
  const previewOptions = useMemo(
    () => (styleDirection ? getSkinTonePreviewOptions(baseModelsQuery.data ?? [], styleDirection) : []),
    [baseModelsQuery.data, styleDirection],
  );

  useEffect(() => {
    const restoredPresetId = restoredDraft?.skinTonePresetId ?? onboardingStateQuery.data?.avatarSkinTonePresetId ?? previewOptions[0]?.id ?? null;
    if (restoredPresetId) {
      setSelectedPresetId(restoredPresetId);
    }
  }, [onboardingStateQuery.data?.avatarSkinTonePresetId, previewOptions, restoredDraft?.skinTonePresetId]);

  const handleContinue = async () => {
    if (!styleDirection || !selectedPresetId) {
      return;
    }

    await saveMutation.mutateAsync({
      avatar_mode: 'base',
      style_direction: styleDirection,
      avatar_skin_tone_preset_id: selectedPresetId,
      avatar_status: 'saved',
      status: 'saved',
    });
    router.push('/(onboarding)/base-model-body-type');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Skin tone" subtitle="Step 2 of 4 · each card keeps your selected style direction while swapping skin tone presets." showBack />
        <ProgressBar progress={6} total={7} />

        {!styleDirection ? (
          <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
            <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              Pick a base model style direction first so we can show the correct backend previews.
            </Text>
            <View className="mt-4">
              <SecondaryButton label="Back to style step" onPress={() => router.replace('/(onboarding)/base-model-gender')} />
            </View>
          </View>
        ) : null}

        {baseModelsQuery.isLoading ? (
          <View className="mt-8 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading skin tone previews…
            </Text>
          </View>
        ) : null}

        <View className="mt-6 flex-1" style={{ gap: 14 }}>
          {previewOptions.map((option) => {
            const selected = option.id === selectedPresetId;

            return (
              <Pressable
                key={option.id}
                onPress={() => setSelectedPresetId(option.id)}
                className="overflow-hidden rounded-[24px] border bg-white"
                style={{ borderColor: selected ? palette.burgundy : palette.line, borderWidth: selected ? 2 : 1, borderRadius: radius.card, ...shadow.soft }}>
                <Image source={{ uri: option.model.imageUrl ?? fallbackBaseModel }} style={{ width: '100%', height: 200 }} contentFit="cover" />
                <View className="p-4" style={{ gap: 8 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
                      {option.label}
                    </Text>
                    <View className="h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: selected ? palette.burgundy : palette.roseFog }}>
                      {selected ? <Check size={15} color="#FFFFFF" /> : null}
                    </View>
                  </View>
                  <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                    Body type stays on {option.model.bodyTypePresetName ?? 'the default preset'} for this preview.
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="pb-2 pt-4" style={{ gap: 10 }}>
          <SecondaryButton label="Back" onPress={() => router.back()} disabled={saveMutation.isPending} />
          <PrimaryButton label="Continue" fullWidth onPress={handleContinue} disabled={!selectedPresetId || saveMutation.isPending} loading={saveMutation.isPending} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const fallbackBaseModel = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80';
