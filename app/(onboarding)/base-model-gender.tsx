import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useBaseAvatars } from '@/hooks/use-modario-data';
import { deriveAvatarDraftFromSelection, deriveBaseAvatarOptions } from '@/libs/avatar-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useOnboardingSession } from '@/provider/onboarding-provider';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export default function BaseModelStyleDirectionScreen() {
  const router = useRouter();
  const { draft, saveDraft } = useOnboardingSession();
  const baseModelsQuery = useBaseAvatars();
  const [selectedDirection, setSelectedDirection] = useState<'menswear' | 'womenswear' | null>(null);

  const restoredDraft = useMemo(
    () => deriveAvatarDraftFromSelection(baseModelsQuery.data ?? [], draft?.avatarBaseModelId),
    [baseModelsQuery.data, draft?.avatarBaseModelId],
  );
  const avatarOptions = useMemo(() => deriveBaseAvatarOptions(baseModelsQuery.data ?? []), [baseModelsQuery.data]);

  useEffect(() => {
    const fromState = draft?.styleDirection;
    if (restoredDraft?.styleDirection) {
      setSelectedDirection(restoredDraft.styleDirection);
      return;
    }
    if (fromState === 'menswear' || fromState === 'womenswear') {
      setSelectedDirection(fromState);
    }
  }, [draft?.styleDirection, restoredDraft?.styleDirection]);

  const handleContinue = async () => {
    if (!selectedDirection) {
      return;
    }

    await saveDraft(
      {
      avatar_mode: 'base',
      style_direction: selectedDirection,
      avatar_skin_tone_preset_id: draft?.avatarSkinTonePresetId ?? avatarOptions.defaultSkinTone?.id ?? null,
      avatar_body_type_preset_id: draft?.avatarBodyTypePresetId ?? avatarOptions.defaultBodyType?.id ?? null,
      avatar_status: 'saved',
      status: 'saved',
      },
      { screen: 'base-model-gender', step: 'avatar_style_direction' },
    );
    router.push('/(onboarding)/base-model-skin-tone');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Base model style" subtitle="Step 1 of 4 · start with the style direction preview generated from the default skin tone and body type presets." showBack />
        <ProgressBar progress={6} total={7} />

        {baseModelsQuery.isLoading ? (
          <View className="mt-8 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading backend base model previews…
            </Text>
          </View>
        ) : null}

        {baseModelsQuery.isError ? (
          <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: '#E7C9D2' }}>
            <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>
              We couldn’t load base models.
            </Text>
            <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              Retry to continue with the base-model branch.
            </Text>
            <View className="mt-4">
              <SecondaryButton label="Retry" onPress={() => baseModelsQuery.refetch()} />
            </View>
          </View>
        ) : null}

        <View className="mt-6" style={{ gap: 14 }}>
          {avatarOptions.styleDirectionOptions.map((option) => {
            const selected = option.key === selectedDirection;

            return (
              <Pressable
                key={option.id}
                onPress={() => setSelectedDirection(option.key as 'menswear' | 'womenswear')}
                className="overflow-hidden rounded-[24px] border bg-white"
                style={{
                  borderColor: selected ? palette.burgundy : palette.line,
                  borderWidth: selected ? 2 : 1,
                  borderRadius: radius.card,
                  ...shadow.soft,
                }}>
                <Image source={{ uri: option.model.imageUrl ?? fallbackBaseModel }} style={{ width: '100%', height: 220 }} contentFit="cover" cachePolicy="memory-disk" />
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
                    Previewing {option.model.skinTonePresetName ?? 'default skin tone'} with {option.model.bodyTypePresetName ?? 'default body type'}.
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-auto pb-2 pt-6" style={{ gap: 10 }}>
          <SecondaryButton label="Back to avatar choice" onPress={() => router.replace('/(onboarding)/avatar')} />
          <PrimaryButton label="Continue" fullWidth onPress={handleContinue} disabled={!selectedDirection} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const fallbackBaseModel = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80';
