import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { onboardingQueryKeys, useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { getOnboardingBundle } from '@/libs/onboarding-bundle';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { StyleDirection } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

const cards = [
  {
    id: 'womenswear' as StyleDirection,
    title: 'Womenswear-leaning',
    subtext: 'Editorial silhouettes, dresses, softer tailoring, and elevated feminine cues.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'menswear' as StyleDirection,
    title: 'Menswear-leaning',
    subtext: 'Tailored layers, classic shirting, sharper structure, and modern menswear lines.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function StyleDirectionScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const [selectedDirection, setSelectedDirection] = useState<Exclude<StyleDirection, null> | null>(null);

  useEffect(() => {
    const existingDirection = onboardingStateQuery.data?.styleDirection;
    if (existingDirection === 'menswear' || existingDirection === 'womenswear') {
      setSelectedDirection(existingDirection);
    }
  }, [onboardingStateQuery.data?.styleDirection]);

  const handleContinue = async () => {
    if (!selectedDirection || !session?.access_token) {
      return;
    }

    Haptics.selectionAsync();

    await saveMutation.mutateAsync({
      style_direction: selectedDirection,
      style_picks: null,
      status: 'saved',
    });
    await updateOnboardingProfile({
      styleDirection: selectedDirection,
      baseModelGender: selectedDirection === 'menswear' ? 'male' : 'female',
    });

    void queryClient.prefetchQuery({
      queryKey: onboardingQueryKeys.onboardingBundle(session.user.id, selectedDirection),
      queryFn: () => getOnboardingBundle(session.access_token, { styleDirection: selectedDirection }),
      staleTime: 5 * 60 * 1000,
    });

    router.push('/(onboarding)/style-preference');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Style direction" subtitle="Required · choose the lens we should use for your onboarding bundle and recommendations." showBack />
        <ProgressBar progress={2} total={7} />

        <View className="mt-6" style={{ gap: 14 }}>
          {cards.map((card) => {
            const selected = selectedDirection === card.id;

            return (
              <Pressable
                key={card.id}
                onPress={() => setSelectedDirection(card.id)}
                disabled={saveMutation.isPending}
                className="overflow-hidden rounded-[26px] border"
                style={{
                  borderColor: selected ? palette.burgundy : palette.line,
                  borderWidth: selected ? 2 : 1,
                  backgroundColor: palette.paper,
                  borderRadius: radius.card,
                  opacity: saveMutation.isPending ? 0.7 : 1,
                  ...shadow.soft,
                }}>
                <Image source={{ uri: card.imageUrl }} style={{ width: '100%', height: 180 }} contentFit="cover" />
                <View className="p-4" style={{ gap: 8 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
                      {card.title}
                    </Text>
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full border"
                      style={{ borderColor: selected ? palette.burgundy : palette.line, backgroundColor: selected ? palette.burgundy : palette.paper }}>
                      {selected ? <Check size={15} color="#FFFFFF" /> : null}
                    </View>
                  </View>
                  <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                    {card.subtext}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-auto pb-2 pt-6" style={{ gap: 10 }}>
          <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
            Continue unlocks your style cards, color presets, occasions, and avatar options.
          </Text>
          <PrimaryButton
            label="Continue"
            fullWidth
            onPress={handleContinue}
            disabled={!selectedDirection || saveMutation.isPending}
            loading={saveMutation.isPending}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
