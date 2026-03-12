import ProgressBar from '@/components/custom/progress-bar';
import { saveOnboardingState } from '@/libs/onboarding-state';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ColorChip = { name: string; color: string; textColor?: string };
type AvoidPreset = { id: string; label: string; image: string; tint: string; textColor?: string };

const NEUTRALS: ColorChip[] = [
  { name: 'Black', color: '#171717', textColor: '#FFFFFF' },
  { name: 'Soft White', color: '#F7F3EC' },
  { name: 'Gray', color: '#E2DEDE' },
  { name: 'Navy', color: '#2E3B4D', textColor: '#FFFFFF' },
  { name: 'Beige', color: '#E3D5BE' },
  { name: 'Brown', color: '#7A2E2F', textColor: '#FFFFFF' },
  { name: 'Brown', color: '#7A5539', textColor: '#FFFFFF' },
];

const ACCENTS: ColorChip[] = [
  { name: 'Brick Red', color: '#A33E38', textColor: '#FFFFFF' },
  { name: 'Burgundy', color: '#6F2634', textColor: '#FFFFFF' },
  { name: 'Dusty Rose', color: '#E2B9B3' },
  { name: 'Burnt Orange', color: '#DDA65D' },
  { name: 'Mustard', color: '#D49D55' },
  { name: 'Yellow', color: '#E2B85E' },
  { name: 'Teal', color: '#4D7E85', textColor: '#FFFFFF' },
  { name: 'Green', color: '#5A7189', textColor: '#FFFFFF' },
  { name: 'Olive', color: '#7D7D65', textColor: '#FFFFFF' },
  { name: 'Plum', color: '#3F7280', textColor: '#FFFFFF' },
  { name: 'Cobalt Blue', color: '#57527A', textColor: '#FFFFFF' },
];

const AVOID_PRESETS: AvoidPreset[] = [
  {
    id: 'no-avoids',
    label: 'No avoids',
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80',
    tint: '#FFFFFF',
  },
  {
    id: 'neons',
    label: 'Neons / very bright',
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=300&q=80',
    tint: '#FFFFFF',
  },
  {
    id: 'warm',
    label: 'Warm colors',
    image: 'https://images.unsplash.com/photo-1467043237213-65f2da53396b?auto=format&fit=crop&w=300&q=80',
    tint: '#B1574B',
    textColor: '#FFFFFF',
  },
  {
    id: 'cool',
    label: 'Cool colors',
    image: 'https://images.unsplash.com/photo-1534767624673-e8f8c13cbf79?auto=format&fit=crop&w=300&q=80',
    tint: '#8B7D60',
    textColor: '#FFFFFF',
  },
  {
    id: 'light',
    label: 'Light colors',
    image: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=300&q=80',
    tint: '#FFFFFF',
  },
  {
    id: 'dark',
    label: 'Dark colors',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=300&q=80',
    tint: '#3E3A3A',
    textColor: '#FFFFFF',
  },
];

export default function ColorPreferenceScreen() {
  const router = useRouter();
  const [neutrals, setNeutrals] = useState<string[]>([]);
  const [accents, setAccents] = useState<string[]>([]);
  const [avoidPresets, setAvoidPresets] = useState<string[]>(['no-avoids']);

  const toggle = (item: string, selected: string[], setSelected: (next: string[]) => void, max: number) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((value) => value !== item));
      return;
    }

    if (selected.length < max) {
      setSelected([...selected, item]);
    }
  };

  const toggleAvoid = (id: string) => {
    if (id === 'no-avoids') {
      setAvoidPresets(['no-avoids']);
      return;
    }

    const next = avoidPresets.filter((value) => value !== 'no-avoids');

    if (next.includes(id)) {
      const filtered = next.filter((value) => value !== id);
      setAvoidPresets(filtered.length ? filtered : ['no-avoids']);
      return;
    }

    if (next.length < 2) {
      setAvoidPresets([...next, id]);
    }
  };

  const continueNext = async () => {
    const likedColors = [...neutrals, ...accents];
    const avoidedColors = avoidPresets.includes('no-avoids') ? [] : avoidPresets;
    await updateOnboardingProfile({ likedColors, avoidedColors });
    await saveOnboardingState({ color_likes: likedColors, color_avoids: avoidedColors, status: 'saved' });
    router.push('/(onboarding)/occasions');
  };

  const skip = async () => {
    await updateOnboardingProfile({ likedColors: [], avoidedColors: [] });
    await saveOnboardingState({ color_likes: [], color_avoids: [], status: 'saved' });
    router.push('/(onboarding)/occasions');
  };

  const renderColorChip = (chip: ColorChip, selected: boolean, onPress: () => void) => (
    <Pressable
      key={`${chip.name}-${chip.color}`}
      onPress={onPress}
      className="min-w-[30.8%] rounded-[14px] px-3 py-[9px]"
      style={{ backgroundColor: chip.color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.07)' }}>
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-InterMedium text-[14px]" style={{ color: chip.textColor ?? '#1A1A1A' }}>
          {chip.name}
        </Text>
        {selected && (
          <View className="h-5 w-5 items-center justify-center rounded-full bg-white/30">
            <Check size={13} color={chip.textColor ?? '#660033'} />
          </View>
        )}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-5 py-5">
      <ProgressBar progress={3} total={6} />

      <Text className="mt-5 text-center font-InterBold text-[28px] leading-[34px] text-[#1A1A1A]">Know your style</Text>
      <Text className="mt-2 text-center font-InterRegular text-[13px] leading-5 text-[#6B6B6B]">
        Answer a few questions to help us recommend outfits you&apos;ll love.
      </Text>

      <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
        <Text className="font-InterSemiBold text-[20px] text-[#1A1A1A]">Pick your go-to neutrals</Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Choose up to 2</Text>
        <View className="flex-row flex-wrap gap-2">
          {NEUTRALS.map((chip) => renderColorChip(chip, neutrals.includes(chip.name), () => toggle(chip.name, neutrals, setNeutrals, 2)))}
        </View>

        <Text className="mt-6 font-InterSemiBold text-[20px] text-[#1A1A1A]">Choose 2 accent colors you like</Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Choose up to 2</Text>
        <View className="flex-row flex-wrap gap-2">
          {ACCENTS.map((chip) => renderColorChip(chip, accents.includes(chip.name), () => toggle(chip.name, accents, setAccents, 2)))}
        </View>

        <Text className="mt-6 font-InterSemiBold text-[20px] text-[#1A1A1A]">
          Any colors you never wear? <Text className="font-InterRegular text-[#6B6B6B]">(Optional)</Text>
        </Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Quick presets</Text>

        <View className="mb-4 flex-row flex-wrap gap-2">
          {AVOID_PRESETS.map((preset) => {
            const selected = avoidPresets.includes(preset.id);
            const cardTextColor = preset.textColor ?? '#1A1A1A';
            return (
              <Pressable
                key={preset.id}
                onPress={() => toggleAvoid(preset.id)}
                className="w-[48.6%] overflow-hidden rounded-[14px] border"
                style={{ borderColor: selected ? '#660033' : '#D8D8D8' }}>
                <View className="flex-row items-center">
                  <Image source={{ uri: preset.image }} style={{ width: 52, height: 40 }} contentFit="cover" />
                  <View className="h-10 flex-1 flex-row items-center justify-between px-3" style={{ backgroundColor: preset.tint }}>
                    <Text className="font-InterMedium text-[10px]" style={{ color: cardTextColor }}>
                      {preset.label}
                    </Text>
                    {selected && (
                      <View className="h-5 w-5 items-center justify-center rounded-full bg-white/30">
                        <Check size={12} color={cardTextColor === '#FFFFFF' ? '#FFFFFF' : '#660033'} />
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-t border-[#E9E9E9] pt-3">
        <View className="mb-3 flex-row items-center justify-between">
          <TouchableOpacity className="rounded-full border border-[#CFCFCF] px-6 py-1.5" onPress={skip}>
            <Text className="font-InterRegular text-[12px] text-[#6B6B6B]">Skip</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-1">
            <Text className="font-InterRegular text-[12px] text-[#6B6B6B]">Edit later</Text>
            <ChevronRight size={14} color="#6B6B6B" />
          </View>
        </View>
        <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-3" onPress={continueNext}>
          <Text className="font-InterMedium text-[22px] text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
