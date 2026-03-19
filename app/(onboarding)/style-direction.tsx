import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useSaveOnboardingStateMutation } from '@/hooks/use-onboarding';
import { updateOnboardingProfile } from '@/libs/onboarding-storage';
import { StyleDirection } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

const cards = [
  {
    id: 'womenswear' as StyleDirection,
    title: 'Womenswear-leaning',
    subtext: 'Dresses, skirts, softer tailoring, and feminine styling cues.',
    glyph: 'W',
  },
  {
    id: 'menswear' as StyleDirection,
    title: 'Menswear-leaning',
    subtext: 'Structured fits, classic shirting, tailoring, and sharper lines.',
    glyph: 'M',
  },
];

export default function StyleDirectionScreen() {
  const router = useRouter();
  const saveMutation = useSaveOnboardingStateMutation();

  const handleSelect = async (id: Exclude<StyleDirection, null>) => {
    Haptics.selectionAsync();
    await updateOnboardingProfile({ styleDirection: id, baseModelGender: id === 'menswear' ? 'male' : 'female' });
    await saveMutation.mutateAsync({
      style_direction: id,
      style_picks: null,
      status: 'saved',
    });
    router.push('/(onboarding)/style-preference');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Style direction" subtitle="Required · this determines which style cards and occasion bundle we load for you." showBack />
        <ProgressBar progress={2} total={7} />

        <View className="mt-8" style={{ gap: 12 }}>
          {cards.map((card) => (
            <Pressable
              key={card.id}
              onPress={() => card.id && handleSelect(card.id)}
              disabled={saveMutation.isPending}
              className="w-full flex-row items-center rounded-3xl border px-4 py-4"
              style={{
                borderColor: palette.line,
                backgroundColor: palette.paper,
                borderRadius: radius.card,
                opacity: saveMutation.isPending ? 0.7 : 1,
                ...shadow.soft,
              }}>
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: palette.roseFog }}>
                <Text className="font-InterSemiBold text-base" style={{ color: palette.burgundy }}>
                  {card.glyph}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
                  {card.title}
                </Text>
                <Text className="mt-1 font-InterRegular text-sm leading-5" style={{ color: palette.muted }}>
                  {card.subtext}
                </Text>
              </View>

              <ChevronRight size={20} color={palette.muted} />
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
