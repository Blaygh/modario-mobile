import ProgressBar from '@/components/custom/progress-bar';
import { getOnboardingBundle, loadBundleFiltersFromProfile, OnboardingColorOption } from '@/libs/onboarding-bundle';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Check, ChevronRight } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ColorChip = { name: string; color: string; textColor?: string };

const FALLBACK_NEUTRALS: ColorChip[] = [
  { name: 'Black', color: '#171717', textColor: '#FFFFFF' },
  { name: 'Soft White', color: '#F7F3EC' },
  { name: 'Gray', color: '#E2DEDE' },
  { name: 'Navy', color: '#2E3B4D', textColor: '#FFFFFF' },
  { name: 'Beige', color: '#E3D5BE' },
  { name: 'Brown', color: '#7A5539', textColor: '#FFFFFF' },
];

const FALLBACK_ACCENTS: ColorChip[] = [
  { name: 'Brick Red', color: '#A33E38', textColor: '#FFFFFF' },
  { name: 'Burgundy', color: '#6F2634', textColor: '#FFFFFF' },
  { name: 'Dusty Rose', color: '#E2B9B3' },
  { name: 'Mustard', color: '#D49D55' },
  { name: 'Teal', color: '#4D7E85', textColor: '#FFFFFF' },
  { name: 'Cobalt Blue', color: '#57527A', textColor: '#FFFFFF' },
];

const FALLBACK_AVOID_PRESETS = ['No avoids', 'Neons / very bright', 'Warm colors', 'Cool colors'];

const toChip = (option: OnboardingColorOption): ColorChip => ({
  name: option.name,
  color: option.hex,
  textColor: option.family === 'accent' ? '#FFFFFF' : '#1A1A1A',
});

export default function ColorPreferenceScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [filters, setFilters] = useState<{ gender: string; skinTone: string; bodyType: string } | null>(null);
  const [neutrals, setNeutrals] = useState<string[]>([]);
  const [accents, setAccents] = useState<string[]>([]);
  const [avoidPresets, setAvoidPresets] = useState<string[]>(['No avoids']);

  useEffect(() => {
    loadBundleFiltersFromProfile().then(setFilters);
  }, []);

  const bundleQuery = useQuery({
    queryKey: ['onboarding-bundle', filters],
    enabled: !!session?.access_token && !!filters,
    queryFn: () => getOnboardingBundle(session!.access_token, filters!),
    staleTime: 5 * 60 * 1000,
  });

  const neutralChips = useMemo(() => {
    const fromApi = bundleQuery.data?.colors.filter((color) => color.family === 'neutral').map(toChip) ?? [];
    return fromApi.length ? fromApi : FALLBACK_NEUTRALS;
  }, [bundleQuery.data?.colors]);

  const accentChips = useMemo(() => {
    const fromApi = bundleQuery.data?.colors.filter((color) => color.family === 'accent').map(toChip) ?? [];
    return fromApi.length ? fromApi : FALLBACK_ACCENTS;
  }, [bundleQuery.data?.colors]);

  const avoidOptions = useMemo(() => {
    const fromApi = bundleQuery.data?.avoidPresets.map((preset) => preset.label) ?? [];
    return fromApi.length ? ['No avoids', ...fromApi] : FALLBACK_AVOID_PRESETS;
  }, [bundleQuery.data?.avoidPresets]);

  const toggle = (item: string, selected: string[], setSelected: (next: string[]) => void, max: number) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((value) => value !== item));
      return;
    }

    if (selected.length < max) {
      setSelected([...selected, item]);
    }
  };

  const toggleAvoid = (label: string) => {
    if (label === 'No avoids') {
      setAvoidPresets(['No avoids']);
      return;
    }

    const next = avoidPresets.filter((value) => value !== 'No avoids');

    if (next.includes(label)) {
      const filtered = next.filter((value) => value !== label);
      setAvoidPresets(filtered.length ? filtered : ['No avoids']);
      return;
    }

    if (next.length < 2) {
      setAvoidPresets([...next, label]);
    }
  };

  const continueNext = async () => {
    const likedColors = [...neutrals, ...accents];
    const avoidedColors = avoidPresets.includes('No avoids') ? [] : avoidPresets;
    await updateOnboardingProfile({ likedColors, avoidedColors });
    router.push('/(onboarding)/occasions');
  };

  const skip = async () => {
    await updateOnboardingProfile({ likedColors: [], avoidedColors: [] });
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
      <ProgressBar progress={4} total={7} />

      <Text className="mt-5 text-center font-InterBold text-[28px] leading-[34px] text-[#1A1A1A]">Know your style</Text>
      <Text className="mt-2 text-center font-InterRegular text-[13px] leading-5 text-[#6B6B6B]">
        Answer a few questions to help us recommend outfits you&apos;ll love.
      </Text>

      <ScrollView className="mt-5" showsVerticalScrollIndicator={false}>
        {bundleQuery.isLoading && <Text className="mb-3 font-InterRegular text-sm text-[#6B6B6B]">Loading options…</Text>}
        <Text className="font-InterSemiBold text-[20px] text-[#1A1A1A]">Pick your go-to neutrals</Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Choose up to 2</Text>
        <View className="flex-row flex-wrap gap-2">
          {neutralChips.map((chip) => renderColorChip(chip, neutrals.includes(chip.name), () => toggle(chip.name, neutrals, setNeutrals, 2)))}
        </View>

        <Text className="mt-6 font-InterSemiBold text-[20px] text-[#1A1A1A]">Choose 2 accent colors you like</Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Choose up to 2</Text>
        <View className="flex-row flex-wrap gap-2">
          {accentChips.map((chip) => renderColorChip(chip, accents.includes(chip.name), () => toggle(chip.name, accents, setAccents, 2)))}
        </View>

        <Text className="mt-6 font-InterSemiBold text-[20px] text-[#1A1A1A]">
          Any colors you never wear? <Text className="font-InterRegular text-[#6B6B6B]">(Optional)</Text>
        </Text>
        <Text className="mb-2 mt-1 font-InterRegular text-[13px] text-[#6B6B6B]">Quick presets</Text>

        <View className="mb-4 flex-row flex-wrap gap-2">
          {avoidOptions.map((label) => {
            const selected = avoidPresets.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggleAvoid(label)}
                className="rounded-full border px-3 py-2"
                style={{ borderColor: selected ? '#660033' : '#D8D8D8', backgroundColor: selected ? '#F3E7EE' : '#FFFFFF' }}>
                <Text className="font-InterMedium text-[12px] text-[#1A1A1A]">{label}</Text>
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
