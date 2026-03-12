import ProgressBar from '@/components/custom/progress-bar';
import { defaultOnboardingProfile, ONBOARDING_PROFILE_KEY } from '@/libs/onboarding-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const skipOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_PROFILE_KEY, JSON.stringify(defaultOnboardingProfile));
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7]">
      <View className="flex-1 px-6 py-7">
        <View className="mb-4 flex-row justify-end">
          <Link href="/(onboarding)/done" asChild>
            <Pressable onPress={skipOnboarding}>
              <Text className="font-InterMedium text-sm text-[#6B6B6B]">Skip</Text>
            </Pressable>
          </Link>
        </View>

        <ProgressBar progress={1} total={7} />

        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=80' }}
          style={{ width: '100%', height: 190, borderRadius: 16, marginTop: 24 }}
          contentFit="cover"
        />

        <Text className="mt-8 text-center font-InterBold text-[30px] leading-[38px] text-[#1A1A1A]">
          Let&apos;s personalize your style in under a minute.
        </Text>
        <Text className="mt-3 px-2 text-center font-InterRegular text-base leading-6 text-[#6B6B6B]">
          Answer a few quick questions to get better outfit recommendations.
        </Text>

        <View className="mt-auto gap-3 pb-2">
          <Link href="/(onboarding)/style-direction" asChild>
            <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4">
              <Text className="font-InterMedium text-lg text-white">Start</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
