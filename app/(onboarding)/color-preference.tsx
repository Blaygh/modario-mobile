import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingSession } from '@/provider/onboarding-provider';
import { OnboardingColorOption } from '@/libs/onboarding-bundle';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

type ColorChip = {
  id: string;
  name: string;
  color: string;
  family: 'neutral' | 'accent';
  textColor: string;
};

const toChip = (option: OnboardingColorOption): ColorChip => ({
  id: option.id,
  name: option.name,
  color: option.hex,
  family: option.family === 'neutral' ? 'neutral' : 'accent',
  textColor: option.family === 'accent' ? '#FFFFFF' : '#1A1A1A',
});

export default function ColorPreferenceScreen() {
  const router = useRouter();
  const { draft, bundleQuery, saveDraft } = useOnboardingSession();
  const [likedColors, setLikedColors] = useState<string[]>([]);
  const [avoidedColors, setAvoidedColors] = useState<string[]>([]);

  useEffect(() => {
    setLikedColors(draft?.colorLikes ?? []);
    setAvoidedColors(draft?.colorAvoids ?? []);
  }, [draft?.colorAvoids, draft?.colorLikes]);

  const colors = useMemo(() => bundleQuery.data?.colors.map(toChip) ?? [], [bundleQuery.data?.colors]);

  const avoidOptions = useMemo(() => {
    const fromBundle = bundleQuery.data?.avoidPresets.map((preset) => preset.label) ?? [];
    return ['No avoids', ...fromBundle];
  }, [bundleQuery.data?.avoidPresets]);

  const groupedColors = useMemo(
    () => ({
      neutrals: colors.filter((chip) => chip.family === 'neutral'),
      accents: colors.filter((chip) => chip.family === 'accent'),
    }),
    [colors],
  );

  const toggleLike = (label: string) => {
    if (likedColors.includes(label)) {
      setLikedColors((prev) => prev.filter((value) => value !== label));
      return;
    }

    if (likedColors.length < 3) {
      setLikedColors((prev) => [...prev, label]);
    }
  };

  const toggleAvoid = (label: string) => {
    if (label === 'No avoids') {
      setAvoidedColors([]);
      return;
    }

    if (avoidedColors.includes(label)) {
      setAvoidedColors((prev) => prev.filter((value) => value !== label));
      return;
    }

    if (avoidedColors.length < 3) {
      setAvoidedColors((prev) => [...prev, label]);
    }
  };

  const persistAndContinue = async (nextLikes: string[], nextAvoids: string[]) => {
    await saveDraft({ color_likes: nextLikes, color_avoids: nextAvoids, status: 'saved' }, { screen: 'color-preference', step: 'colors' });
    router.push('/(onboarding)/occasions');
  };

  const renderColorChip = (chip: ColorChip) => {
    const selected = likedColors.includes(chip.name);

    return (
      <Pressable
        key={chip.id}
        onPress={() => toggleLike(chip.name)}
        className="rounded-[14px] px-3 py-[10px]"
        style={{ width: '31%', backgroundColor: chip.color, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
        <View className="flex-row items-center justify-between" style={{ gap: 6 }}>
          <Text className="font-InterMedium text-[13px]" style={{ color: chip.textColor }}>
            {chip.name}
          </Text>
          {selected ? (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-white/30">
              <Check size={13} color={chip.textColor} />
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Colors" subtitle="Optional · save up to 3 likes and up to 3 avoids." showBack />
        <ProgressBar progress={4} total={7} />

        {bundleQuery.isLoading && (
          <View className="mt-6 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading color options…
            </Text>
          </View>
        )}

        <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false}>
          {bundleQuery.isError ? (
            <View className="mb-5 rounded-[24px] border bg-white p-4" style={{ borderColor: '#E7C9D2' }}>
              <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                We couldn’t load backend color options yet. Retry or skip this optional step.
              </Text>
            </View>
          ) : null}

          <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
            Color likes
          </Text>
          <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
            Choose up to 3 colors you gravitate toward.
          </Text>

          {!bundleQuery.isLoading && !bundleQuery.isError && !colors.length ? (
            <View className="mt-4 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                No color presets are currently available for this bundle. You can skip this step.
              </Text>
            </View>
          ) : null}

          <Text className="mt-4 font-InterMedium text-sm uppercase tracking-[1.2px]" style={{ color: palette.muted }}>
            Neutrals
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-between" style={{ rowGap: 10 }}>
            {groupedColors.neutrals.map(renderColorChip)}
          </View>

          <Text className="mt-5 font-InterMedium text-sm uppercase tracking-[1.2px]" style={{ color: palette.muted }}>
            Accents
          </Text>
          <View className="mt-2 flex-row flex-wrap justify-between" style={{ rowGap: 10 }}>
            {groupedColors.accents.map(renderColorChip)}
          </View>

          <Text className="mt-6 font-InterSemiBold text-lg" style={{ color: palette.ink }}>
            Avoids
          </Text>
          <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
            Optional presets, with “No avoids” normalized as an empty avoid list.
          </Text>
          <View className="mt-3 flex-row flex-wrap" style={{ gap: 10 }}>
            {avoidOptions.map((label) => {
              const selected = label === 'No avoids' ? avoidedColors.length === 0 : avoidedColors.includes(label);
              return (
                <Pressable
                  key={label}
                  onPress={() => toggleAvoid(label)}
                  className="rounded-full border px-4 py-2.5"
                  style={{ borderColor: selected ? palette.burgundy : palette.line, backgroundColor: selected ? palette.roseFog : palette.paper }}>
                  <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View className="pb-2 pt-3" style={{ gap: 12 }}>
          <View className="flex-row justify-between">
            <SecondaryButton label="Skip" onPress={() => persistAndContinue([], [])} />
            <Text className="self-center font-InterRegular text-sm" style={{ color: palette.muted }}>
              {likedColors.length}/3 likes · {avoidedColors.length}/3 avoids
            </Text>
          </View>
          <PrimaryButton label="Continue" fullWidth onPress={() => persistAndContinue(likedColors, avoidedColors)} />
        </View>
      </View>
    </SafeAreaView>
  );
}
