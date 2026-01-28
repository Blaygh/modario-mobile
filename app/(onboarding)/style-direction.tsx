import ProgressBar from "@/components/custom/progress-bar";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { supabase } from "@/libs/supabase";
import { StyleDirection } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import SvgUri from "expo-svg-uri";
import { ChevronRight, Square } from "lucide-react-native"; // Neutral icons
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';

const womenswearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <!-- neckline -->
  <path d="M9 5.5c1.2 1 2.1 1.5 3 1.5s1.8-.5 3-1.5"/>
  <!-- soft drape / coat outline -->
  <path d="M7.5 6.5c-1.2 1.6-2 4.2-2 7.6 0 3.3 1.6 5.4 4.3 6.2 1.5.5 3.1.7 5.2.7s3.7-.2 5.2-.7c2.7-.8 4.3-2.9 4.3-6.2 0-3.4-.8-6-2-7.6"/>
  <!-- inner drape -->
  <path d="M10 8c-.8 2.2-1.2 4.4-1.2 6.8 0 2.2.6 3.9 1.8 5"/>
  <!-- hem hint -->
  <path d="M8.2 21c1.2-1 2.4-1.5 3.8-1.5h0c1.4 0 2.6.5 3.8 1.5"/>
</svg>
`

const menswearSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <!-- collar -->
  <path d="M8.5 6.5 12 4l3.5 2.5"/>
  <!-- structured jacket -->
  <path d="M6.5 8.2c-.7 1.3-1.1 3.1-1.1 5.7 0 3.8 1.7 6.3 5 7.3 1 .3 2.1.4 3.6.4s2.6-.1 3.6-.4c3.3-1 5-3.5 5-7.3 0-2.6-.4-4.4-1.1-5.7"/>
  <!-- lapels -->
  <path d="M9.2 8.6 12 12l2.8-3.4"/>
  <!-- center seam -->
  <path d="M12 12v9"/>
  <!-- pocket hints -->
  <path d="M8.5 16.8h2.2"/>
  <path d="M13.3 16.8h2.2"/>
</svg>
`

const mixedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
     viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <!-- left silhouette -->
  <path d="M7.2 7.2c-1 1.3-1.6 3.4-1.6 6.1 0 3 1.2 5 3.5 5.8 1 .3 2.1.5 3.5.5"/>
  <path d="M8.7 6.2c.9.7 1.7 1 2.5 1"/>
  <!-- right silhouette -->
  <path d="M16.8 7.2c1 1.3 1.6 3.4 1.6 6.1 0 3-1.2 5-3.5 5.8-1 .3-2.1.5-3.5.5"/>
  <path d="M15.3 6.2c-.9.7-1.7 1-2.5 1"/>
  <!-- overlap mark -->
  <path d="M12 10.5v10.5"/>
  <path d="M10.3 12.6 12 14.3l1.7-1.7"/>
</svg>
`

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
            icon: <SvgUri
                xml={womenswearSvg}
                width={24}
                height={24}
            />
        },
        {
            id: "menswear" as StyleDirection,
            title: "Menswear-leaning",
            subtext: "Structured fits, classic silhouettes",
            icon: <SvgUri
                xml={menswearSvg}
                width={24}
                height={24}
            />
        },
        {
            id: "mixed" as StyleDirection,
            title: "Mixed / Show both",
            subtext: "A blend of styles",
            icon: < SvgUri
                xml={mixedSvg}
                width={24}
                height={24}
            />
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

    const handleCardPress = async (id: StyleDirection) => {
        setSelectedCard(id);
        Haptics.selectionAsync();
        await handleUpdateStyleDirection.mutateAsync(id);
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <Spinner
                visible={handleUpdateStyleDirection.isPending}
                textContent={'Saving...'}
                textStyle={{ color: '#FFF' }}
                overlayColor="rgba(0, 0, 0, 0.5)"
            />
            <View className="flex-1 px-6 my-8">
                {/* Top navigation */}
                <View className="flex flex-row justify-between items-center mb-4">
                    <Pressable onPress={() => router.back()}>
                        <Text className="text-gray-500 font-InterMedium">Back</Text>
                    </Pressable>
                    <Pressable onPress={() => router.push("/(onboarding)/done")}>
                        <Text className="text-gray-500 font-InterMedium">Skip</Text>
                    </Pressable>
                </View>

                {/* Progress bar */}
                <ProgressBar progress={1} total={5} />

                {/* Top section */}
                <View className="flex items-center justify-center mt-10">
                    <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A]">
                        What styles should we show?
                    </Text>
                    <Text className="mt-2 text-lg font-InterMedium text-gray-700 text-center">
                        You can change this later.
                    </Text>
                </View>

                {/* Cards */}
                <View className="mt-10 flex-col gap-3">
                    {cards.map((card) => {
                        const isSelected = selectedCard === card.id;

                        return (
                            <Pressable
                                key={card.id}
                                onPress={() => handleCardPress(card.id)}
                                className="flex-row items-center w-full h-[72px] rounded-2xl border px-4"
                                style={{
                                    borderColor: isSelected ? "#660033" : "#E5E3DF",
                                    backgroundColor: isSelected ? "rgba(102, 0, 51, 0.04)" : "#FFFFFF",
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 4,
                                    elevation: 2, // For Android shadow
                                }}
                            >
                                {/* Left Icon */}
                                <View className="w-10 h-10 rounded-full bg-[#F7F6F3] items-center justify-center mr-4">
                                    {card.icon ? card.icon : (
                                        <Square size={24} color={isSelected ? "#660033" : "#1A1A1A"} />
                                    )}
                                </View>

                                {/* Title and Subtext */}
                                <View className="flex-1">
                                    <Text
                                        className="text-base font-InterMedium"
                                        style={{
                                            color: isSelected ? "#660033" : "#1A1A1A",
                                        }}
                                    >
                                        {card.title}
                                    </Text>
                                    <Text className="text-sm font-InterRegular text-gray-600">
                                        {card.subtext}
                                    </Text>
                                </View>

                                {/* Chevron */}
                                <ChevronRight size={24} color="#6B6B6B" />
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}