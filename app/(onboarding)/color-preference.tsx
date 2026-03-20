import { BrandTheme } from '@/constants/theme';
import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen } from '@/components/custom/onboarding-ui';
import { useOnboardingBundle, useOnboardingState, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

const { palette, radius } = BrandTheme;

type ColorChip = { id: string; name: string; hex: string; textColor: string };

const FALLBACK_COLORS: ColorChip[] = [
  { id: 'black', name: 'Black', hex: '#171717', textColor: '#FFFFFF' },
  { id: 'soft-white', name: 'Soft White', hex: '#F7F3EC', textColor: '#1A1A1A' },
  { id: 'navy', name: 'Navy', hex: '#2E3B4D', textColor: '#FFFFFF' },
  { id: 'beige', name: 'Beige', hex: '#E3D5BE', textColor: '#1A1A1A' },
  { id: 'burgundy', name: 'Burgundy', hex: '#6F2634', textColor: '#FFFFFF' },
  { id: 'cobalt', name: 'Cobalt', hex: '#57527A', textColor: '#FFFFFF' },
];

export default function ColorPreferenceScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const styleDirection = onboardingStateQuery.data?.styleDirection;
  const bundleQuery = useOnboardingBundle(styleDirection);
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [liked, setLiked] = useState<string[]>([]);
  const [avoided, setAvoided] = useState<string[]>([]);

  useEffect(() => {
    if (onboardingStateQuery.data) {
      setLiked(onboardingStateQuery.data.colorLikes);
      setAvoided(onboardingStateQuery.data.colorAvoids);
    }
  }, [onboardingStateQuery.data]);

  const colorOptions = useMemo<ColorChip[]>(() => {
    if (!bundleQuery.data?.colors.length) {
      return FALLBACK_COLORS;
    }

    return bundleQuery.data.colors.map((option) => ({
      id: option.id,
      name: option.name,
      hex: option.hex,
      textColor: option.family === 'accent' || option.hex === '#171717' ? '#FFFFFF' : '#1A1A1A',
    }));
  }, [bundleQuery.data?.colors]);

  const toggle = (target: string, selected: string[], setter: (next: string[]) => void) => {
    if (selected.includes(target)) {
      setter(selected.filter((item) => item !== target));
      return;
    }

    if (selected.length < 3) {
      setter([...selected, target]);
    }
  };

  const continueNext = async () => {
    await saveDraftMutation.mutateAsync({ color_likes: liked, color_avoids: avoided, status: 'saved' });
    router.push('/(onboarding)/occasions');
  };

  const skip = async () => {
    await saveDraftMutation.mutateAsync({ color_likes: [], color_avoids: [], status: 'saved' });
    router.push('/(onboarding)/occasions');
  };

  return (
    <OnboardingScreen
      step={3}
      total={6}
      title="Shape your palette"
      subtitle="Color likes and avoids are optional, but keeping them honest makes recommendations feel more precise."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryLoading={saveDraftMutation.isPending} secondaryLabel="Skip for now" onSecondaryPress={skip} />}>
      {bundleQuery.isLoading ? <LoadingNotice label="Loading color options…" /> : null}
      {bundleQuery.isError ? <ErrorNotice label="We couldn’t load colors from your onboarding bundle just now." /> : null}
      <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, gap: 12 }}>
        <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
          Colors you like
        </Text>
        <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
          Choose up to 3.
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {colorOptions.map((chip) => (
            <Pressable
              key={`like-${chip.id}`}
              onPress={() => toggle(chip.name, liked, setLiked)}
              style={{ backgroundColor: chip.hex, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, borderWidth: liked.includes(chip.name) ? 2 : 1, borderColor: liked.includes(chip.name) ? palette.burgundy : 'rgba(0,0,0,0.08)' }}>
              <Text className="font-InterMedium text-sm" style={{ color: chip.textColor }}>
                {chip.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, gap: 12 }}>
        <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
          Colors you avoid
        </Text>
        <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
          Choose up to 3.
        </Text>
        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {colorOptions.map((chip) => (
            <Pressable
              key={`avoid-${chip.id}`}
              onPress={() => toggle(chip.name, avoided, setAvoided)}
              style={{ backgroundColor: '#FFFFFF', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: avoided.includes(chip.name) ? palette.burgundy : palette.line }}>
              <Text className="font-InterMedium text-sm" style={{ color: avoided.includes(chip.name) ? palette.burgundy : palette.ink }}>
                {chip.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}
