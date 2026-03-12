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