import ProgressBar from '@/components/custom/progress-bar';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { BriefcaseBusiness, CalendarCheck2, Check, Dumbbell, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const OCCASIONS = [
  { id: 'Everyday', icon: Sparkles },
  { id: 'Work', icon: BriefcaseBusiness },
  { id: 'Night Out', icon: CalendarCheck2 },
  { id: 'Events', icon: CalendarCheck2 },
  { id: 'Fitness', icon: Dumbbell },
];

export default function OccasionsScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleOccasion = (occasion: string) => {
    if (selected.includes(occasion)) {
      setSelected((prev) => prev.filter((value) => value !== occasion));
      return;
    }

    setSelected((prev) => [...prev, occasion]);
  };

  const continueNext = async () => {
    await updateOnboardingProfile({ occasions: selected });
    router.push('/(onboarding)/avatar');
  };

  const skip = async () => {
    await updateOnboardingProfile({ occasions: [] });
    router.push('/(onboarding)/avatar');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={4} total={6} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Where will you wear these outfits?</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Choose the occasions you care about.</Text>

      <View className="mt-7 gap-3">
        {OCCASIONS.map((occasion) => {
          const active = selected.includes(occasion.id);
          const Icon = occasion.icon;
          return (
            <Pressable
              key={occasion.id}
              onPress={() => toggleOccasion(occasion.id)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4"
              style={{
                borderWidth: 1,
                borderColor: active ? '#660033' : '#E2E2E2',
                backgroundColor: active ? '#F3E7EE' : '#FFFFFF',
              }}>
              <View className="flex-row items-center gap-3">
                <Icon size={20} color={active ? '#660033' : '#6B6B6B'} />
                <Text className="font-InterMedium text-lg text-[#1A1A1A]">{occasion.id}</Text>
              </View>
              {active ? <Check size={20} color="#660033" /> : <View className="h-5 w-5 rounded-full border border-[#C8C8C8]" />}
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto gap-3 pb-2 pt-4">
        <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4" onPress={continueNext}>
          <Text className="font-InterMedium text-lg text-white">Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center rounded-2xl border border-[#D7D7D7] bg-white py-4" onPress={skip}>
          <Text className="font-InterMedium text-base text-[#6B6B6B]">Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
