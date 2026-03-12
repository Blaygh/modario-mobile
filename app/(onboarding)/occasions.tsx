import ProgressBar from '@/components/custom/progress-bar';
import { getOnboardingBundle, loadBundleFiltersFromProfile } from '@/libs/onboarding-bundle';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { BriefcaseBusiness, CalendarCheck2, Check, Dumbbell, Sparkles } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ICON_BY_LABEL: Record<string, any> = {
  Everyday: Sparkles,
  Work: BriefcaseBusiness,
  'Night Out': CalendarCheck2,
  Events: CalendarCheck2,
  Fitness: Dumbbell,
};

const FALLBACK_OCCASIONS = ['Everyday', 'Work', 'Night Out', 'Events', 'Fitness'];

export default function OccasionsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ gender: string; skinTone: string; bodyType: string } | null>(null);

  useEffect(() => {
    loadBundleFiltersFromProfile().then(setFilters);
  }, []);

  const bundleQuery = useQuery({
    queryKey: ['onboarding-bundle', filters],
    enabled: !!session?.access_token && !!filters,
    queryFn: () => getOnboardingBundle(session!.access_token, filters!),
    staleTime: 5 * 60 * 1000,
  });

  const occasions = useMemo(() => {
    const labels = bundleQuery.data?.occasions.map((occasion) => occasion.label) ?? [];
    return labels.length ? labels : FALLBACK_OCCASIONS;
  }, [bundleQuery.data?.occasions]);

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
      <ProgressBar progress={5} total={7} />
      <Text className="mt-8 font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">Where will you wear these outfits?</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">Choose the occasions you care about.</Text>
      {bundleQuery.isLoading && <Text className="mt-4 font-InterRegular text-sm text-[#6B6B6B]">Loading options…</Text>}

      <View className="mt-7 gap-3">
        {occasions.map((occasion) => {
          const active = selected.includes(occasion);
          const Icon = ICON_BY_LABEL[occasion] ?? Sparkles;
          return (
            <Pressable
              key={occasion}
              onPress={() => toggleOccasion(occasion)}
              className="flex-row items-center justify-between rounded-2xl px-4 py-4"
              style={{
                borderWidth: 1,
                borderColor: active ? '#660033' : '#E2E2E2',
                backgroundColor: active ? '#F3E7EE' : '#FFFFFF',
              }}>
              <View className="flex-row items-center gap-3">
                <Icon size={20} color={active ? '#660033' : '#6B6B6B'} />
                <Text className="font-InterMedium text-lg text-[#1A1A1A]">{occasion}</Text>
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
