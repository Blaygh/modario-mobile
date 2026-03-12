import ProgressBar from "@/components/custom/progress-bar";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { supabase } from "@/libs/supabase";
import { StyleDirection } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { ChevronRight, Square } from "lucide-react-native"; // Neutral icons
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';

export default function StyleDirectionScreen() {
    const router = useRouter();
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { data: user } = useGetUser()
    const toast = useToast();

    const cards = [
        {
            id: "womenswear" as StyleDirection,
            title: "Womenswear-leaning",
            subtext: "Dresses, skirts, soft tailoring",
            icon: <Text className="font-InterSemiBold text-sm text-[#660033]">W</Text>
        },
        {
            id: "menswear" as StyleDirection,
            title: "Menswear-leaning",
            subtext: "Structured fits, classic silhouettes",
            icon: <Text className="font-InterSemiBold text-sm text-[#660033]">M</Text>
        },
        {
            id: "mixed" as StyleDirection,
            title: "Mixed / Show both",
            subtext: "A blend of styles",
            icon: <Text className="font-InterSemiBold text-sm text-[#660033]">MX</Text>
        },
    ];

    const handleUpdateStyleDirection = useMutation({
        mutationFn: async (id: StyleDirection) => {
            const { error } = await supabase.from("onboarding_states")
                .upsert({
                    style_direction: id,
                    user_id: user?.id,
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id", ignoreDuplicates: false });

            if (error) {
                console.error("Error updating style direction:", error);
                throw new Error("Failed to update style direction");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });
            setTimeout(() => {
                router.push("/(onboarding)/style-preference"); // Auto-advance to the next screen
            }, 200);
        },
        onError: (error) => {
            toast.show({
                id: "update-style-direction-error",
                render: () => {
                    const uniqueToastId = `update-style-direction-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>
                                Update Failed
                            </ToastTitle>
                            <ToastDescription>
                                {error instanceof Error ? error.message : "An error occurred while updating your style direction. Please try again."}
                            </ToastDescription>
                        </Toast>
                    )
                }
            })
        }
    })

  const onContinue = async () => {
    const value = selected ?? 'womenswear';
    await updateOnboardingProfile({
      styleDirection: value,
      baseModelGender: value === 'menswear' ? 'male' : 'female',
    });
    router.push('/(onboarding)/style-preference');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={2} total={7} />

      <View className="mt-8 items-center">
        <Text className="font-InterBold text-[34px] leading-[40px] text-[#1A1A1A]">What&apos;s your style direction?</Text>
        <Text className="mt-2 text-center font-InterRegular text-lg text-[#6B6B6B]">Select one to get started.</Text>
      </View>

      <View className="mt-8 flex-row justify-center gap-3">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setSelected(option.key)}
              className="w-[47%] overflow-hidden rounded-2xl bg-white"
              style={{ borderWidth: 2, borderColor: isSelected ? '#660033' : '#E3E3E3' }}>
              <Image source={{ uri: option.image }} style={{ width: '100%', height: 220 }} contentFit="cover" />
              <View className="items-center bg-[#F4F4F4] px-3 pb-4 pt-3">
                <Text className="text-center font-InterMedium text-[30px] text-[#1A1A1A]">{option.label}</Text>
                <View className="mt-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: isSelected ? '#C9A884' : '#E5E5E5' }}>
                  <Check size={24} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-auto items-center pb-2 pt-6">
        <TouchableOpacity className="w-[62%] items-center rounded-xl bg-[#660033] py-3" onPress={onContinue}>
          <Text className="font-InterMedium text-base text-white">Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
