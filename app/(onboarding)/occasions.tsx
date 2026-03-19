import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingBundle, useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useRouter } from 'expo-router';
import { BriefcaseBusiness, CalendarCheck2, Check, Dumbbell, Sparkles } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

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
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const styleDirection = onboardingStateQuery.data?.styleDirection ?? null;
  const bundleQuery = useOnboardingBundle(styleDirection);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(onboardingStateQuery.data?.occasions ?? []);
  }, [onboardingStateQuery.data?.occasions]);

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

  const persistAndContinue = async (nextOccasions: string[]) => {
    await updateOnboardingProfile({ occasions: nextOccasions });
    await saveMutation.mutateAsync({ occasions: nextOccasions, status: 'saved' });
    router.push('/(onboarding)/avatar');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Occasions" subtitle="Optional · choose any occasions that should influence outfit recommendations." showBack />
        <ProgressBar progress={5} total={7} />

        {(bundleQuery.isLoading || onboardingStateQuery.isLoading) && (
          <View className="mt-6 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading occasion options…
            </Text>
          </View>
        )}

        {bundleQuery.isError ? (
          <View className="mt-6 rounded-[24px] border bg-white p-4" style={{ borderColor: '#E7C9D2' }}>
            <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              We couldn’t load the full backend bundle, so a limited fallback occasion list is shown for now.
            </Text>
          </View>
        ) : null}

        <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12 }}>
            {occasions.map((occasion) => {
              const active = selected.includes(occasion);
              const Icon = ICON_BY_LABEL[occasion] ?? Sparkles;
              return (
                <Pressable
                  key={occasion}
                  onPress={() => toggleOccasion(occasion)}
                  className="flex-row items-center justify-between rounded-[20px] border px-4 py-4"
                  style={{ borderColor: active ? palette.burgundy : palette.line, backgroundColor: active ? palette.roseFog : palette.paper }}>
                  <View className="flex-row items-center" style={{ gap: 12 }}>
                    <Icon size={20} color={active ? palette.burgundy : palette.muted} />
                    <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>
                      {occasion}
                    </Text>
                  </View>
                  {active ? <Check size={18} color={palette.burgundy} /> : <View className="h-[18px] w-[18px] rounded-full border" style={{ borderColor: palette.line }} />}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="pb-2 pt-3" style={{ gap: 12 }}>
          <SecondaryButton label="Skip" onPress={() => persistAndContinue([])} disabled={saveMutation.isPending} />
          <PrimaryButton label="Continue" fullWidth onPress={() => persistAndContinue(selected)} disabled={saveMutation.isPending} loading={saveMutation.isPending} />
        </View>
      </View>
    </SafeAreaView>
  );
}
