import ProgressBar from '@/components/custom/progress-bar';
import { STYLE_TASTE_CARDS } from '@/constants/mock-outfits';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StylePreferenceScreen() {
  const router = useRouter();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (selectedCards.includes(id)) {
      setSelectedCards((prev) => prev.filter((cardId) => cardId !== id));
      return;
    }

    if (selectedCards.length < 3) {
      setSelectedCards((prev) => [...prev, id]);
    }
  };

  const continueNext = async () => {
    await updateOnboardingProfile({ styleCardIds: selectedCards });
    router.push('/(onboarding)/color-preference');
  };

  const skip = async () => {
    await updateOnboardingProfile({ styleCardIds: [] });
    router.push('/(onboarding)/color-preference');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={2} total={6} />

      <Text className="mt-7 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Your Style Taste</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Tap 2–3 outfits you&apos;d wear.</Text>

      <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-3 pb-6">
          {STYLE_TASTE_CARDS.map((card) => {
            const selected = selectedCards.includes(card.id);
            return (
              <Pressable
                key={card.id}
                onPress={() => toggle(card.id)}
                className="w-[48%] overflow-hidden rounded-2xl bg-white"
                style={{
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? '#660033' : '#E5E5E5',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Image source={{ uri: card.image }} style={{ width: '100%', height: 145 }} contentFit="cover" />
                <View className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 py-2">
                  <Text className="text-center font-InterMedium text-base text-[#1A1A1A]">{card.title}</Text>
                </View>
                {selected && (
                  <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full bg-[#660033]">
                    <Check color="#fff" size={18} />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-3 pb-2">
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
