import ProgressBar from '@/components/custom/progress-bar';
import { saveAvatarReferences, saveOnboardingState } from '@/libs/onboarding-state';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Camera, ChevronRight, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const OPTIONS = [
  { id: 'upload' as const, title: 'Upload Photos', description: 'Create a model that resembles you.', icon: Camera },
  { id: 'base' as const, title: 'Choose Base Model', description: 'Use a default avatar.', icon: UserRound },
  { id: 'skip' as const, title: 'Skip for Now', description: 'You can set this up later.', icon: ChevronRight },
];

export default function AvatarScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<'upload' | 'base' | 'skip' | null>(null);

  const continueFlow = async () => {
    const selected = choice ?? 'skip';
    await updateOnboardingProfile({ avatarChoice: selected });

    if (selected === 'upload') {
      // upload flow can add URLs here later; keeping incremental state shape now
      await saveAvatarReferences([]);
    }

    await saveOnboardingState({ avatar_mode: selected, avatar_image_urls: [], status: 'saved' });

    if (selected === 'base') {
      router.push('/(onboarding)/base-model-gender');
      return;
    }

    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={6} total={7} />

      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">See outfits on a model like you</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Choose how you&apos;d like to preview outfits.</Text>

      <View className="mt-8 gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = choice === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => setChoice(option.id)}
              className="rounded-2xl bg-white px-4 py-4"
              style={{
                borderWidth: 1,
                borderColor: selected ? '#660033' : '#E2E2E2',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F3E7EE]">
                  <Icon size={20} color="#660033" />
                </View>
                <View className="flex-1">
                  <Text className="font-InterMedium text-lg text-[#1A1A1A]">{option.title}</Text>
                  <Text className="mt-1 font-InterRegular text-sm text-[#6B6B6B]">{option.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto gap-3 pb-2 pt-4">
        <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4" onPress={continueFlow}>
          <Text className="font-InterMedium text-lg text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
