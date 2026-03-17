import ProgressBar from '@/components/custom/progress-bar';
import { getOnboardingBundle, loadBundleFiltersFromProfile } from '@/libs/onboarding-bundle';
import { saveOnboardingState } from '@/libs/onboarding-state';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FALLBACK_MODELS = [
  {
    key: 'menswear' as const,
    label: 'Menswear',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
  },
  {
    key: 'womenswear' as const,
    label: 'Womenswear',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
  },
];

export default function BaseModelGenderScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [selected, setSelected] = useState<'menswear' | 'womenswear' | null>(null);
  const [filters, setFilters] = useState<{ styleDirection: 'menswear' | 'womenswear' } | null>(null);

  useEffect(() => {
    loadBundleFiltersFromProfile().then(setFilters);
  }, []);

  const bundleQuery = useQuery({
    queryKey: ['onboarding-bundle', filters],
    enabled: !!session?.access_token && !!filters,
    queryFn: () => getOnboardingBundle(session!.access_token, filters!),
    staleTime: 5 * 60 * 1000,
  });

  const models =
    bundleQuery.data?.baseAvatarFlow?.styleDirectionCards.map((card) => ({
      key: card.key,
      label: card.label,
      imageUrl: card.defaultModel.imageUrl,
    })) ?? FALLBACK_MODELS;

  const onContinue = async () => {
    const chosen = selected ?? models[0]?.key;
    if (!chosen) {
      return;
    }

    await updateOnboardingProfile({ baseModelGender: chosen === 'menswear' ? 'male' : 'female', styleDirection: chosen });
    await saveOnboardingState({
      avatar_mode: 'base',
      style_direction: chosen,
      status: 'saved',
    });
    router.push('/(onboarding)/base-model-skin-tone');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={6} total={7} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Choose base model direction</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Pick menswear or womenswear to continue.</Text>
      {bundleQuery.isLoading && <Text className="mt-3 font-InterRegular text-sm text-[#6B6B6B]">Loading models…</Text>}

      <View className="mt-8 flex-row gap-3">
        {models.map((model) => (
          <Pressable
            key={model.key}
            onPress={() => setSelected(model.key)}
            className="flex-1 overflow-hidden rounded-2xl bg-white"
            style={{ borderWidth: 2, borderColor: selected === model.key ? '#660033' : '#E3E3E3' }}>
            <Image source={{ uri: model.imageUrl }} style={{ width: '100%', height: 220 }} contentFit="cover" />
            <Text className="py-3 text-center font-InterMedium text-lg text-[#1A1A1A]">{model.label}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-auto pb-2 pt-4">
        <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4" onPress={onContinue}>
          <Text className="font-InterMedium text-lg text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
