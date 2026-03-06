import ProgressBar from '@/components/custom/progress-bar';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MODELS = [
  { id: 'male' as const, title: 'Male', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80' },
  { id: 'female' as const, title: 'Female', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80' },
];

export default function BaseModelGenderScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  const onContinue = async () => {
    if (!selected) {
      return;
    }

    await updateOnboardingProfile({ baseModelGender: selected });
    router.push('/(onboarding)/base-model-skin-tone');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={5} total={6} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Choose a base model</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Select the model that best represents you.</Text>

      <View className="mt-8 flex-row gap-3">
        {MODELS.map((model) => (
          <Pressable
            key={model.id}
            onPress={() => setSelected(model.id)}
            className="flex-1 overflow-hidden rounded-2xl bg-white"
            style={{ borderWidth: 2, borderColor: selected === model.id ? '#660033' : '#E3E3E3' }}>
            <Image source={{ uri: model.image }} style={{ width: '100%', height: 220 }} contentFit="cover" />
            <Text className="py-3 text-center font-InterMedium text-lg text-[#1A1A1A]">{model.title}</Text>
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
