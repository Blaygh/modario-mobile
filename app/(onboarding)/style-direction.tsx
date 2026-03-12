import ProgressBar from '@/components/custom/progress-bar';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { useGetUser } from '@/hooks/use-get-user';
import { saveOnboardingState } from '@/libs/onboarding-state';
import { StyleDirection } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ChevronRight, Square } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StyleDirectionScreen() {
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<StyleDirection>(null);
  const queryClient = useQueryClient();
  const { data: user } = useGetUser();
  const toast = useToast();

  const cards = [
    {
      id: 'womenswear' as StyleDirection,
      title: 'Womenswear-leaning',
      subtext: 'Dresses, skirts, soft tailoring',
      icon: <Text className="font-InterSemiBold text-sm text-[#660033]">W</Text>,
    },
    {
      id: 'menswear' as StyleDirection,
      title: 'Menswear-leaning',
      subtext: 'Structured fits, classic silhouettes',
      icon: <Text className="font-InterSemiBold text-sm text-[#660033]">M</Text>,
    },
  ];

  const handleUpdateStyleDirection = useMutation({
    mutationFn: async (id: Exclude<StyleDirection, null>) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await saveOnboardingState({
        style_direction: id,
        status: 'saved',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });
      setTimeout(() => {
        router.push('/(onboarding)/style-preference');
      }, 200);
    },
    onError: (error) => {
      toast.show({
        id: 'update-style-direction-error',
        render: () => {
          const uniqueToastId = `update-style-direction-error-${Date.now()}`;
          return (
            <Toast nativeID={uniqueToastId} action="error" variant="solid">
              <ToastTitle>Update Failed</ToastTitle>
              <ToastDescription>{error instanceof Error ? error.message : 'Failed to update style direction.'}</ToastDescription>
            </Toast>
          );
        },
      });
    },
  });

  const handleCardPress = async (id: StyleDirection) => {
    if (!id) {
      return;
    }

    setSelectedCard(id);
    Haptics.selectionAsync();
    await handleUpdateStyleDirection.mutateAsync(id);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F6F3]">
      <Spinner visible={handleUpdateStyleDirection.isPending} textContent={'Saving...'} textStyle={{ color: '#FFF' }} overlayColor="rgba(0, 0, 0, 0.5)" />
      <View className="my-8 flex-1 px-6">
        <View className="mb-4 flex flex-row items-center justify-between">
          <Pressable onPress={() => router.back()}>
            <Text className="font-InterMedium text-gray-500">Back</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/(onboarding)/done')}>
            <Text className="font-InterMedium text-gray-500">Skip</Text>
          </Pressable>
        </View>

        <ProgressBar progress={1} total={5} />

        <View className="mt-10 flex items-center justify-center">
          <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A]">What styles should we show?</Text>
          <Text className="mt-2 text-center text-lg font-InterMedium text-gray-700">You can change this later.</Text>
        </View>

        <View className="mt-10 flex-col gap-3">
          {cards.map((card) => {
            const isSelected = selectedCard === card.id;

            return (
              <Pressable
                key={card.id}
                onPress={() => handleCardPress(card.id)}
                className="h-[72px] w-full flex-row items-center rounded-2xl border px-4"
                style={{
                  borderColor: isSelected ? '#660033' : '#E5E3DF',
                  backgroundColor: isSelected ? 'rgba(102, 0, 51, 0.04)' : '#FFFFFF',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-[#F7F6F3]">{card.icon ? card.icon : <Square size={24} color={isSelected ? '#660033' : '#1A1A1A'} />}</View>

                <View className="flex-1">
                  <Text className="text-base font-InterMedium" style={{ color: isSelected ? '#660033' : '#1A1A1A' }}>
                    {card.title}
                  </Text>
                  <Text className="font-InterRegular text-sm text-gray-600">{card.subtext}</Text>
                </View>

                <ChevronRight size={24} color="#6B6B6B" />
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}
