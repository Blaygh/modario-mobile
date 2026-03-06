import ProgressBar from '@/components/custom/progress-bar';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SKIN_TONES = ['#F7D8BE', '#ECC3A1', '#DFA981', '#C68E68', '#A46A46', '#7B4D30', '#5C3821', '#3F2618'];

export default function BaseModelSkinToneScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const onContinue = async () => {
    await updateOnboardingProfile({ skinTone: selected });
    router.push('/(onboarding)/base-model-body-type');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={5} total={6} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Select your skin tone</Text>

      <View className="mt-8 flex-row flex-wrap gap-3">
        {SKIN_TONES.map((tone) => (
          <Pressable
            key={tone}
            onPress={() => setSelected(tone)}
            className="h-28 w-[23%] rounded-2xl"
            style={{
              backgroundColor: tone,
              borderWidth: 3,
              borderColor: selected === tone ? '#660033' : '#E2E2E2',
            }}
          />
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
