import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingBundle, useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, shadow } = BrandTheme;

export default function StylePreferenceScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const styleDirection = onboardingStateQuery.data?.styleDirection ?? null;
  const bundleQuery = useOnboardingBundle(styleDirection);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    const picks = onboardingStateQuery.data?.stylePicks;
    if (Array.isArray(picks)) {
      setSelectedCards(picks);
    }
  }, [onboardingStateQuery.data?.stylePicks]);

  const styleCards = useMemo(() => bundleQuery.data?.styleCards.filter((card) => card.imageUrl) ?? [], [bundleQuery.data?.styleCards]);
  const selectionCount = selectedCards.length;
  const canContinue = selectionCount >= 2 && selectionCount <= 3;

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
    if (!canContinue) {
      return;
    }

    await saveMutation.mutateAsync({ style_picks: selectedCards, status: 'saved' });
    router.push('/(onboarding)/color-preference');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Style taste" subtitle="Required · pick 2 to 3 looks you’d actually wear." showBack />
        <ProgressBar progress={3} total={7} />

        {!styleDirection ? (
          <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
            <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              We need your style direction before we can request the right onboarding bundle.
            </Text>
            <View className="mt-4">
              <SecondaryButton label="Back to style direction" onPress={() => router.replace('/(onboarding)/style-direction')} />
            </View>
          </View>
        ) : (
          <>
            {bundleQuery.isLoading || onboardingStateQuery.isLoading ? (
              <View className="mt-8 flex-row items-center" style={{ gap: 10 }}>
                <ActivityIndicator color={palette.burgundy} />
                <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
                  Loading your style cards…
                </Text>
              </View>
            ) : null}

            {bundleQuery.isError ? (
              <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: '#E7C9D2' }}>
                <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>
                  We couldn’t load the onboarding bundle.
                </Text>
                <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                  Retry so you can choose from backend-provided style cards.
                </Text>
                <View className="mt-4">
                  <SecondaryButton label="Retry" onPress={() => bundleQuery.refetch()} />
                </View>
              </View>
            ) : null}

            <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
              <Text className="mb-3 font-InterRegular text-sm" style={{ color: palette.muted }}>
                {selectionCount}/3 selected
              </Text>
              <View className="flex-row flex-wrap justify-between pb-6" style={{ rowGap: 12 }}>
                {styleCards.map((card) => {
                  const selected = selectedCards.includes(card.id);
                  return (
                    <Pressable
                      key={card.id}
                      onPress={() => toggle(card.id)}
                      disabled={saveMutation.isPending}
                      style={{
                        width: '48%',
                        borderWidth: selected ? 2 : 1,
                        borderColor: selected ? palette.burgundy : palette.line,
                        borderRadius: 20,
                        backgroundColor: palette.paper,
                        overflow: 'hidden',
                        ...shadow.soft,
                      }}>
                      <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 160 }} contentFit="cover" />
                      <View className="p-3">
                        <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>
                          {card.title}
                        </Text>
                      </View>
                      {selected ? (
                        <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: palette.burgundy }}>
                          <Check color="#fff" size={18} />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            <View className="pb-2 pt-3" style={{ gap: 12 }}>
              {!canContinue ? (
                <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
                  Select at least 2 looks before continuing.
                </Text>
              ) : null}
              <PrimaryButton label="Continue" fullWidth onPress={continueNext} disabled={!canContinue || saveMutation.isPending} loading={saveMutation.isPending} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
