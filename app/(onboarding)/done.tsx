import ProgressBar from '@/components/custom/progress-bar';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar, useOutfitRecommendations } from '@/hooks/use-modario-data';
import { saveOnboardingState, triggerOnboardingProcessing } from '@/libs/onboarding-state';
import { setOnboardingComplete } from '@/libs/onboarding-storage';
import { useAuth } from '@/provider/auth-provider';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function OnboardingDoneScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const currentAvatarQuery = useCurrentAvatar();
  const recommendationsQuery = useOutfitRecommendations();

  const finishOnboarding = async () => {
    await saveOnboardingState({ is_complete: true, status: 'saved', last_error: null });
    try {
      await triggerOnboardingProcessing();
    } catch (error) {
      console.error('Failed to trigger onboarding processing:', error);
    }
    if (session?.user?.id) {
      await setOnboardingComplete(session.user.id, true);
    }
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 px-6 py-7" style={{ backgroundColor: palette.ivory }}>
      <ProgressBar progress={7} total={7} />
      <Text className="mt-8 font-InterBold text-[34px]" style={{ color: palette.ink }}>You&apos;re all set.</Text>
      <Text className="mt-2 font-InterRegular text-lg" style={{ color: palette.muted }}>Your styling profile is ready to power real recommendations.</Text>

      {currentAvatarQuery.data?.imageUrl ? (
        <View className="mt-6 items-center rounded-[24px] border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
          <Image source={{ uri: currentAvatarQuery.data.imageUrl }} style={{ width: 112, height: 112, borderRadius: 56 }} contentFit="cover" />
          <Text className="mt-3 font-InterSemiBold text-lg" style={{ color: palette.ink }}>{currentAvatarQuery.data.label ?? 'Selected base avatar'}</Text>
        </View>
      ) : null}

      <ScrollView horizontal className="mt-8" showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pb-2">
          {(recommendationsQuery.data ?? []).slice(0, 3).map((outfit) => (
            <View key={outfit.id} className="w-[220px] overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Image source={{ uri: outfit.previewImageUrl ?? fallbackLook }} style={{ width: '100%', height: 170 }} contentFit="cover" />
              <View className="p-3">
                <Text className="font-InterMedium text-base" style={{ color: palette.ink }} numberOfLines={2}>{outfit.summary}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="mt-auto gap-3 pb-2 pt-6">
        <TouchableOpacity className="items-center rounded-[16px] py-4" style={{ backgroundColor: palette.burgundy }} onPress={finishOnboarding}>
          <Text className="font-InterMedium text-lg text-white">Go to home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const fallbackLook = 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80';
