import ProgressBar from '@/components/custom/progress-bar';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Broad', 'Curvy'];

export default function BaseModelBodyTypeScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const onContinue = async () => {
    await updateOnboardingProfile({ bodyType: selected });
    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={5} total={6} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Choose your body type</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">This helps outfits fit better.</Text>

      <View className="mt-7 gap-3">
        {BODY_TYPES.map((type) => {
          const active = selected === type;
          return (
            <Pressable
              key={type}
              onPress={() => setSelected(type)}
              className="rounded-2xl px-4 py-4"
              style={{ borderWidth: 1, borderColor: active ? '#660033' : '#E2E2E2', backgroundColor: active ? '#F3E7EE' : '#FFFFFF' }}>
              <Text className="font-InterMedium text-lg text-[#1A1A1A]">{type}</Text>
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
