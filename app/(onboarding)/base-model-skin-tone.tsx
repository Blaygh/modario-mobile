import ProgressBar from '@/components/custom/progress-bar';
import { getOnboardingBundle, loadBundleFiltersFromProfile } from '@/libs/onboarding-bundle';
import { getOnboardingProfile, updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BaseModelSkinToneScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [styleDirection, setStyleDirection] = useState<'menswear' | 'womenswear'>('womenswear');
  const [selected, setSelected] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ styleDirection: 'menswear' | 'womenswear' } | null>(null);

  useEffect(() => {
    loadBundleFiltersFromProfile().then(setFilters);
    getOnboardingProfile().then((profile) => {
      if (profile.styleDirection === 'menswear' || profile.styleDirection === 'womenswear') {
        setStyleDirection(profile.styleDirection);
      }
      setSelected(profile.skinTone);
    });
  }, []);

  const bundleQuery = useQuery({
    queryKey: ['onboarding-bundle', filters],
    enabled: !!session?.access_token && !!filters,
    queryFn: () => getOnboardingBundle(session!.access_token, filters!),
    staleTime: 5 * 60 * 1000,
  });

  const toneOptions = useMemo(
    () => bundleQuery.data?.baseAvatarFlow?.skinToneOptionsByStyleDirection?.[styleDirection] ?? [],
    [bundleQuery.data?.baseAvatarFlow?.skinToneOptionsByStyleDirection, styleDirection],
  );

  const onContinue = async () => {
    const choice = selected ?? toneOptions[0]?.skinToneKey;
    await updateOnboardingProfile({ skinTone: choice ?? 'medium' });
    router.push('/(onboarding)/base-model-body-type');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={6} total={7} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Select your skin tone</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Preview is based on your style direction.</Text>

      <View className="mt-7 gap-3">
        {toneOptions.map((option) => {
          const active = selected === option.skinToneKey;
          return (
            <Pressable
              key={option.skinToneKey}
              onPress={() => setSelected(option.skinToneKey)}
              className="overflow-hidden rounded-2xl bg-white"
              style={{ borderWidth: 2, borderColor: active ? '#660033' : '#E2E2E2' }}>
              <Image source={{ uri: option.previewModel.imageUrl }} style={{ width: '100%', height: 160 }} contentFit="cover" />
              <Text className="py-3 text-center font-InterMedium text-base text-[#1A1A1A]">{option.skinToneDisplayName}</Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto pb-2 pt-4">
        <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4" onPress={onContinue}>
          <Text className="font-InterMedium text-lg text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
