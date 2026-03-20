import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingSession } from '@/provider/onboarding-provider';
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

export default function OccasionsScreen() {
  const router = useRouter();
  const { draft, bundleQuery, saveDraft } = useOnboardingSession();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected(draft?.occasions ?? []);
  }, [draft?.occasions]);

  const occasions = useMemo(() => bundleQuery.data?.occasions.map((occasion) => occasion.label) ?? [], [bundleQuery.data?.occasions]);

  const toggleOccasion = (occasion: string) => {
    if (selected.includes(occasion)) {
      setSelected((prev) => prev.filter((value) => value !== occasion));
      return;
    }

    setSelected((prev) => [...prev, occasion]);
  };

  const persistAndContinue = async (nextOccasions: string[]) => {
    await saveDraft({ occasions: nextOccasions, status: 'saved' }, { screen: 'occasions', step: 'occasions' });
    router.push('/(onboarding)/avatar');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Occasions" subtitle="Optional · choose any occasions that should influence outfit recommendations." showBack />
        <ProgressBar progress={5} total={7} />

        {bundleQuery.isLoading && (
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
              We couldn’t load backend occasion options yet. Retry or go back—this step should stay bundle-driven.
            </Text>
          </View>
        ) : null}

        <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
          {!bundleQuery.isLoading && !bundleQuery.isError && !occasions.length ? (
            <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                No occasion options are currently available for this onboarding bundle. You can skip and continue.
              </Text>
            </View>
          ) : null}

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
          <SecondaryButton label="Skip" onPress={() => persistAndContinue([])} />
          <PrimaryButton label="Continue" fullWidth onPress={() => persistAndContinue(selected)} />
        </View>
      </View>
    </SafeAreaView>
  );
}
