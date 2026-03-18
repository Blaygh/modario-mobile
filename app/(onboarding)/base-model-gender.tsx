import ProgressBar from '@/components/custom/progress-bar';
import { BrandTheme } from '@/constants/theme';
import { useBaseAvatars, useCurrentAvatar, useSelectBaseAvatarMutation } from '@/hooks/use-modario-data';
import { saveOnboardingState } from '@/libs/onboarding-state';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;
const directions = ['menswear', 'womenswear'] as const;

export default function BaseModelSelectionScreen() {
  const router = useRouter();
  const [styleDirection, setStyleDirection] = useState<(typeof directions)[number]>('womenswear');
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const baseModelsQuery = useBaseAvatars(styleDirection);
  const currentAvatarQuery = useCurrentAvatar();
  const selectAvatarMutation = useSelectBaseAvatarMutation();

  const models = baseModelsQuery.data ?? [];
  const activeModelId = selectedModelId ?? currentAvatarQuery.data?.id ?? models[0]?.id ?? null;
  const selectedModel = models.find((model) => model.id === activeModelId) ?? models[0] ?? null;

  const onContinue = async () => {
    if (!selectedModel) {
      return;
    }

    await updateOnboardingProfile({ baseModelGender: styleDirection === 'menswear' ? 'male' : 'female', styleDirection });
    await saveOnboardingState({ avatar_mode: 'base', style_direction: styleDirection, status: 'saved' });
    await selectAvatarMutation.mutateAsync(selectedModel.id);
    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1 px-6 py-7" style={{ backgroundColor: palette.ivory }}>
      <ProgressBar progress={6} total={7} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px]" style={{ color: palette.ink }}>Choose your base model</Text>
      <Text className="mt-2 font-InterRegular text-lg" style={{ color: palette.muted }}>Select a live avatar model to use throughout Modario.</Text>

      <View className="mt-6 flex-row gap-2">
        {directions.map((direction) => {
          const selected = direction === styleDirection;
          return (
            <Pressable
              key={direction}
              onPress={() => {
                setStyleDirection(direction);
                setSelectedModelId(null);
              }}
              className="rounded-full px-4 py-2"
              style={{ backgroundColor: selected ? palette.burgundy : '#FFFFFF', borderWidth: selected ? 0 : 1, borderColor: palette.line }}>
              <Text className="font-InterMedium text-sm" style={{ color: selected ? '#FFFFFF' : palette.ink }}>{direction === 'menswear' ? 'Menswear' : 'Womenswear'}</Text>
            </Pressable>
          );
        })}
      </View>

      {baseModelsQuery.isLoading ? <Text className="mt-4 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading base avatars…</Text> : null}
      {baseModelsQuery.isError ? <Text className="mt-4 font-InterRegular text-sm" style={{ color: '#B42318' }}>We couldn’t load base avatars right now.</Text> : null}

      <View className="mt-6 gap-3">
        {models.map((model) => (
          <Pressable
            key={model.id}
            onPress={() => setSelectedModelId(model.id)}
            className="overflow-hidden rounded-[22px] bg-white"
            style={{ borderWidth: activeModelId === model.id ? 2 : 1, borderColor: activeModelId === model.id ? palette.burgundy : palette.line, borderRadius: radius.card }}>
            <Image source={{ uri: model.imageUrl ?? fallbackModel }} style={{ width: '100%', height: 180 }} contentFit="cover" />
            <View className="p-4">
              <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>{model.name}</Text>
              {model.description ? <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>{model.description}</Text> : null}
            </View>
          </Pressable>
        ))}
      </View>

      <View className="mt-auto pb-2 pt-4">
        <Pressable onPress={onContinue} disabled={!selectedModel || selectAvatarMutation.isPending} className="items-center rounded-[16px] py-4" style={{ backgroundColor: palette.burgundy, opacity: !selectedModel ? 0.6 : 1 }}>
          <Text className="font-InterMedium text-lg text-white">{selectAvatarMutation.isPending ? 'Saving…' : 'Continue'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const fallbackModel = 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80';
