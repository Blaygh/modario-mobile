import { OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useSaveOnboardingDraftMutation } from '@/hooks/use-onboarding';
import type { StyleDirection } from '@/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Text, View } from 'react-native';

const { palette } = BrandTheme;

const OPTIONS: { id: Exclude<StyleDirection, null>; title: string; description: string; imageUrl: string }[] = [
  {
    id: 'menswear',
    title: 'Menswear-leaning',
    description: 'Sharper tailoring, structured layers, and classic proportions.',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'womenswear',
    title: 'Womenswear-leaning',
    description: 'Fluid silhouettes, softer tailoring, and dress-led styling.',
    imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
  },
];

export default function StyleDirectionScreen() {
  const router = useRouter();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [selectedDirection, setSelectedDirection] = useState<Exclude<StyleDirection, null> | null>(null);

  const continueNext = async () => {
    if (!selectedDirection) {
      return;
    }

    await saveDraftMutation.mutateAsync({ style_direction: selectedDirection, status: 'saved' });
    router.push('/(onboarding)/style-preference');
  };

  return (
    <OnboardingScreen
      step={1}
      total={6}
      title="Choose your style direction"
      subtitle="This first choice is required and shapes the onboarding bundle we load for you."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel="Continue" onPrimaryPress={continueNext} primaryDisabled={!selectedDirection} primaryLoading={saveDraftMutation.isPending} />}>
      {OPTIONS.map((option) => {
        const selected = option.id === selectedDirection;
        return (
          <SelectionCard
            key={option.id}
            title={option.title}
            description={option.description}
            selected={selected}
            onPress={() => setSelectedDirection(option.id)}
            badge={selected ? <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: palette.burgundy }}><Check size={16} color="#FFFFFF" /></View> : null}
            media={<Image source={{ uri: option.imageUrl }} style={{ width: '100%', height: 210, borderRadius: 18 }} contentFit="cover" />}
            trailing={<Text className="font-InterMedium text-sm" style={{ color: selected ? palette.burgundy : palette.muted }}>{selected ? 'Selected' : 'Tap to choose'}</Text>}
          />
        );
      })}
    </OnboardingScreen>
  );
}
