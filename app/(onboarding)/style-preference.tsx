import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingBundle, useOnboardingState, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

const { palette, radius, shadow } = BrandTheme;

export default function StylePreferenceScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const styleDirection = onboardingStateQuery.data?.styleDirection;
  const bundleQuery = useOnboardingBundle(styleDirection);
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  useEffect(() => {
    if (onboardingStateQuery.data?.stylePicks) {
      setSelectedCards(onboardingStateQuery.data.stylePicks);
    }
  }, [onboardingStateQuery.data?.stylePicks]);

  const styleCards = useMemo(() => bundleQuery.data?.styleCards ?? [], [bundleQuery.data?.styleCards]);

  const toggle = (id: string) => {
    if (selectedCards.includes(id)) {
      setSelectedCards((current) => current.filter((item) => item !== id));
      return;
    }

    if (selectedCards.length < 3) {
      setSelectedCards((current) => [...current, id]);
    }
  };

  const continueNext = async () => {
    await saveDraftMutation.mutateAsync({ style_picks: selectedCards, status: 'saved' });
    router.push('/(onboarding)/color-preference');
  };

  return (
    <OnboardingScreen
      step={2}
      total={6}
      title="Select your style taste"
      subtitle={`Pick ${selectedCards.length < 2 ? 'at least 2' : 'up to 3'} editorial looks you’d genuinely wear.`}
      onBack={() => router.back()}
      footer={
        <OnboardingFooter
          primaryLabel={selectedCards.length < 2 ? 'Choose at least 2 looks' : 'Continue'}
          onPrimaryPress={continueNext}
          primaryDisabled={selectedCards.length < 2}
          primaryLoading={saveDraftMutation.isPending}
        />
      }>
      {bundleQuery.isLoading ? <LoadingNotice label="Loading style taste cards…" /> : null}
      {bundleQuery.isError ? <ErrorNotice label="We couldn’t load your style cards. Pull to retry or go back and try again." /> : null}
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {styleCards.map((card) => {
          const selected = selectedCards.includes(card.id);
          return (
            <Pressable
              key={card.id}
              onPress={() => toggle(card.id)}
              className="overflow-hidden bg-white"
              style={{
                width: '48%',
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? palette.burgundy : palette.line,
                borderRadius: radius.card,
                ...shadow.soft,
              }}>
              <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 185 }} contentFit="cover" />
              <View className="p-3">
                <Text className="font-InterMedium text-sm leading-5" style={{ color: palette.ink }}>
                  {card.title}
                </Text>
              </View>
              {selected ? (
                <View className="absolute right-3 top-3 h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: palette.burgundy }}>
                  <Check size={16} color="#FFFFFF" />
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}
