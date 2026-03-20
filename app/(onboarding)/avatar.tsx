import { ErrorNotice, LoadingNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar } from '@/hooks/use-modario-data';
import { useOnboardingState, useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Camera, ChevronRight, UserRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

const { palette } = BrandTheme;

const OPTIONS = [
  { id: 'upload' as const, title: 'Upload photos', description: 'Add 1–2 reference images, ideally a front and side view.', icon: Camera },
  { id: 'base' as const, title: 'Choose base model', description: 'Select a real backend model using style, skin tone, and body type.', icon: UserRound },
  { id: 'skip' as const, title: 'Skip for now', description: 'Finish onboarding without blocking the avatar step.', icon: ChevronRight },
];

export default function AvatarScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const currentAvatarQuery = useCurrentAvatar();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [selectedChoice, setSelectedChoice] = useState<'upload' | 'base' | 'skip' | null>(null);

  useEffect(() => {
    setSelectedChoice(onboardingStateQuery.data?.avatarMode ?? null);
  }, [onboardingStateQuery.data?.avatarMode]);

  const continueNext = async () => {
    const choice = selectedChoice ?? 'skip';

    if (choice === 'skip') {
      await saveDraftMutation.mutateAsync({ avatar_mode: 'skip', avatar_image_urls: [], avatar_base_model_id: null, status: 'saved' });
      router.push('/(onboarding)/done');
      return;
    }

    if (choice === 'upload') {
      router.push('/(onboarding)/avatar-upload');
      return;
    }

    router.push('/(onboarding)/base-model-gender');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Set up your avatar path"
      subtitle="You can upload photos, choose a base model, or skip without blocking onboarding completion."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryDisabled={!selectedChoice && !onboardingStateQuery.data?.avatarMode} primaryLoading={saveDraftMutation.isPending} />}>
      {onboardingStateQuery.isLoading ? <LoadingNotice label="Loading your saved avatar state…" /> : null}
      {onboardingStateQuery.isError ? <ErrorNotice label="We couldn’t load your avatar onboarding state. Please retry." /> : null}
      {currentAvatarQuery.data?.imageUrl ? (
        <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
          <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
            Current avatar
          </Text>
          <View className="mt-3 flex-row items-center" style={{ gap: 12 }}>
            <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 72, height: 72, borderRadius: 36 }} contentFit="cover" />
            <Text className="flex-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
              {currentAvatarQuery.data.label ?? 'Existing avatar loaded from your account.'}
            </Text>
          </View>
        </View>
      ) : null}
      {OPTIONS.map((option) => {
        const selected = (selectedChoice ?? onboardingStateQuery.data?.avatarMode) === option.id;
        const Icon = option.icon;
        return (
          <SelectionCard
            key={option.id}
            title={option.title}
            description={option.description}
            selected={selected}
            onPress={() => setSelectedChoice(option.id)}
            media={<View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: '#F7EDF1' }}><Icon size={22} color={palette.burgundy} /></View>}
            trailing={<Text className="font-InterMedium text-sm" style={{ color: selected ? palette.burgundy : palette.muted }}>{selected ? 'Selected' : 'Choose'}</Text>}
          />
        );
      })}
    </OnboardingScreen>
  );
}
