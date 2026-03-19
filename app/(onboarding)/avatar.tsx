import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingState, useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { saveAvatarReferences } from '@/libs/onboarding-state';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

const OPTIONS = [
  {
    id: 'upload' as const,
    title: 'Upload photos',
    description: 'Photo upload will be added in a future phase.',
    icon: Camera,
    disabled: true,
  },
  {
    id: 'base' as const,
    title: 'Choose base model',
    description: 'Use a backend-backed base avatar now.',
    icon: UserRound,
  },
  {
    id: 'skip' as const,
    title: 'Skip for now',
    description: 'Continue without avatar setup and finish onboarding.',
    icon: ChevronRight,
  },
];

export default function AvatarScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const [choice, setChoice] = useState<'upload' | 'base' | 'skip' | null>(null);

  useEffect(() => {
    setChoice(onboardingStateQuery.data?.avatarMode ?? 'skip');
  }, [onboardingStateQuery.data?.avatarMode]);

  const continueFlow = async () => {
    const selected = choice ?? 'skip';
    await updateOnboardingProfile({ avatarChoice: selected });

    if (selected === 'upload') {
      await saveAvatarReferences([]);
      return;
    }

    await saveMutation.mutateAsync({ avatar_mode: selected, avatar_image_urls: [], status: 'saved' });

    if (selected === 'base') {
      router.push('/(onboarding)/base-model-gender');
      return;
    }

    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Avatar" subtitle="Optional · choose a base model now or skip and finish onboarding." showBack />
        <ProgressBar progress={6} total={7} />

        <View className="mt-6" style={{ gap: 12 }}>
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = choice === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => !option.disabled && setChoice(option.id)}
                disabled={option.disabled}
                className="rounded-[20px] border px-4 py-4"
                style={{
                  borderColor: selected ? palette.burgundy : palette.line,
                  backgroundColor: selected ? palette.roseFog : palette.paper,
                  borderRadius: radius.card,
                  opacity: option.disabled ? 0.55 : 1,
                  ...shadow.soft,
                }}>
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: palette.roseFog }}>
                    <Icon size={20} color={palette.burgundy} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
                      {option.title}
                    </Text>
                    <Text className="mt-1 font-InterRegular text-sm leading-5" style={{ color: palette.muted }}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-auto pb-2 pt-4">
          <PrimaryButton label="Continue" fullWidth onPress={continueFlow} disabled={!choice || saveMutation.isPending} loading={saveMutation.isPending} />
        </View>
      </View>
    </SafeAreaView>
  );
}
