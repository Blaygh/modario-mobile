import ProgressBar from '@/components/custom/progress-bar';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPTIONS = [
  {
    key: 'menswear' as const,
    label: 'Menswear',
    image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=700&q=80',
  },
  {
    key: 'womenswear' as const,
    label: 'Womenswear',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80',
  },
];

export default function StyleDirectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'menswear' | 'womenswear' | null>(null);

  const onContinue = async () => {
    const value = selected ?? 'womenswear';
    await updateOnboardingProfile({
      styleDirection: value,
      baseModelGender: value === 'menswear' ? 'male' : 'female',
    });
    router.push('/(onboarding)/style-preference');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={2} total={7} />

      <View className="mt-8 items-center">
        <Text className="font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">What&apos;s your style direction?</Text>
        <Text className="mt-2 text-center font-InterRegular text-lg text-[#6B6B6B]">Select one to get started.</Text>
      </View>

      <View className="mt-8 flex-row justify-center gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setSelected(option.key)}
              className="w-[47%] overflow-hidden rounded-2xl bg-white"
              style={{ borderWidth: 2, borderColor: isSelected ? '#660033' : '#E3E3E3' }}>
              <Image source={{ uri: option.image }} style={{ width: '100%', height: 220 }} contentFit="cover" />
              <View className="items-center bg-[#F4F4F4] px-3 pb-4 pt-3">
                <Text className="text-center font-InterMedium text-[30px] text-[#1A1A1A]">{option.label}</Text>
                <View className="mt-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: isSelected ? '#C9A884' : '#E5E5E5' }}>
                  <Check size={24} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto items-center pb-2 pt-6">
        <TouchableOpacity className="w-[62%] items-center rounded-xl bg-[#660033] py-3" onPress={onContinue}>
          <Text className="font-InterMedium text-base text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
