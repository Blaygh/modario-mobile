import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, InfoNotice, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar } from '@/hooks/use-modario-data';
import { useOnboardingSession } from '@/provider/onboarding-provider';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Camera, Check, ChevronRight, UserRound } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

const OPTIONS = [
  {
    id: 'upload' as const,
    title: 'Upload photos',
    description: 'Add at least one reference photo now, with dedicated front and side slots.',
    icon: Camera,
    tone: 'Warm start · preferred with 2 photos',
  },
  {
    id: 'base' as const,
    title: 'Choose base model',
    description: 'Pick a backend-driven model by style direction, skin tone, body type, then confirm.',
    icon: UserRound,
    tone: 'Live backend cards',
  },
  {
    id: 'skip' as const,
    title: 'Skip for now',
    description: 'Finish onboarding now and add or update your avatar later without blocking Home.',
    icon: ChevronRight,
    tone: 'Non-blocking',
  },
];

export default function AvatarScreen() {
  const router = useRouter();
  const { draft, isBootstrapping, saveDraft } = useOnboardingSession();
  const currentAvatarQuery = useCurrentAvatar();
  const [choice, setChoice] = useState<'upload' | 'base' | 'skip' | null>(null);

  useEffect(() => {
    if (draft?.avatarMode) {
      setChoice(draft.avatarMode);
    }
  }, [draft?.avatarMode]);

  const currentAvatarLabel = useMemo(() => {
    if (draft?.avatarMode === 'base' && draft?.avatarBaseModelId) {
      return 'Base model already selected';
    }
    if (draft?.avatarMode === 'upload' && draft?.avatarImageUrls.length) {
      return `${draft.avatarImageUrls.length} photo${draft.avatarImageUrls.length === 1 ? '' : 's'} uploaded`;
    }
    return null;
  }, [draft?.avatarBaseModelId, draft?.avatarImageUrls.length, draft?.avatarMode]);

  const continueFlow = async () => {
    const selected = choice ?? 'skip';

    if (selected === 'upload') {
      router.push('/(onboarding)/avatar-upload');
      return;
    }

    if (selected === 'base') {
      await saveDraft({ avatar_mode: 'base', status: 'saved' }, { screen: 'avatar', step: 'avatar_choice' });
      router.push('/(onboarding)/base-model-gender');
      return;
    }

    await saveDraft({
      avatar_mode: 'skip',
      avatar_image_urls: [],
      avatar_base_model_id: null,
      avatar_skin_tone_preset_id: null,
      avatar_body_type_preset_id: null,
      avatar_status: 'saved',
      status: 'saved',
    }, { screen: 'avatar', step: 'avatar_choice' });
    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Avatar" subtitle="Optional · choose how you want Modario to understand your look, or skip without blocking completion." showBack />
        <ProgressBar progress={6} total={7} />

        {isBootstrapping ? (
          <View className="mt-6 flex-row items-center" style={{ gap: 10 }}>
            <ActivityIndicator color={palette.burgundy} />
            <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
              Loading your avatar step…
            </Text>
          </View>
        ) : null}

        {currentAvatarQuery.data?.imageUrl ? (
          <View className="mt-6 flex-row items-center rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card, gap: 14 }}>
            <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 72, height: 72, borderRadius: 36 }} contentFit="cover" />
            <View className="flex-1" style={{ gap: 4 }}>
              <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
                {currentAvatarQuery.data.label ?? 'Current avatar'}
              </Text>
              <Text className="font-InterRegular text-sm leading-5" style={{ color: palette.muted }}>
                {currentAvatarLabel ?? 'Your latest avatar is already available on this account.'}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="mt-6" style={{ gap: 14 }}>
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = choice === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => setChoice(option.id)}
                className="rounded-[24px] border bg-white px-4 py-4"
                style={{
                  borderColor: selected ? palette.burgundy : palette.line,
                  borderWidth: selected ? 2 : 1,
                  backgroundColor: selected ? palette.roseFog : palette.paper,
                  borderRadius: radius.card,
                  ...shadow.soft,
                }}>
                <View className="flex-row items-start" style={{ gap: 14 }}>
                  <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: selected ? palette.burgundy : palette.roseFog }}>
                    <Icon size={21} color={selected ? '#FFFFFF' : palette.burgundy} />
                  </View>
                  <View className="flex-1" style={{ gap: 4 }}>
                    <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
                      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
                        {option.title}
                      </Text>
                      <View
                        className="h-6 w-6 items-center justify-center rounded-full border"
                        style={{ borderColor: selected ? palette.burgundy : palette.line, backgroundColor: selected ? palette.burgundy : palette.paper }}>
                        {selected ? <Check size={14} color="#FFFFFF" /> : null}
                      </View>
                    </View>
                    <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                      {option.description}
                    </Text>
                    <Text className="font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.burgundySoft }}>
                      {option.tone}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View className="mt-6">
          <InfoNotice
            title="Processing stays in the background"
            description="If you upload photos, generation waits until you submit onboarding. After submit, you go straight to Home even if backend processing is still pending or later fails."
          />
        </View>

        <View className="mt-auto pb-2 pt-6">
          <PrimaryButton label="Continue" fullWidth onPress={continueFlow} disabled={!choice} />
        </View>
      </View>
    </SafeAreaView>
  );
}
