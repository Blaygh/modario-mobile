import ProgressBar from "@/components/custom/progress-bar";
import { Grid, GridItem } from "@/components/ui/grid";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { AvoidPreset, ColorRow, useGetOnboardingBundle } from "@/hooks/use-onboarding";
import { supabase } from "@/libs/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';

// Helper function to determine if a color is light or dark
const isLightColor = (hex: string): boolean => {
    const color = hex.replace("#", "");
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
};

export default function ColorPreferenceScreen() {
    const [colorsYouLike, setColorsYouLike] = useState<ColorRow[]>([]);
    const [colorsYouDontLike, setColorsYouDontLike] = useState<AvoidPreset[]>([]);
    const { data, status } = useGetOnboardingBundle();
    const { data: user } = useGetUser();

    const queryClient = useQueryClient();

    const toast = useToast();

    const colors = useMemo(() => data?.colors || [], [data?.colors]);
    // const avoidPresets = data?.avoid_presets || [];

    const neutrals = useMemo(() => {
        return colors.filter(color => color.family === 'neutral');
    }, [colors]);

    const accents = useMemo(() => {
        return colors.filter(color => color.family === 'accent');
    }, [colors]);

    const router = useRouter();

    const handleSelectColorYouLike = (color: ColorRow) => {
        const isSelected = colorsYouLike.find(c => c.hex === color.hex);

        if (isSelected) {
            setColorsYouLike(colorsYouLike.filter(c => c.hex !== color.hex));
        } else {
            const neutralCount = colorsYouLike.filter(c => c.family === 'neutral').length;
            const accentCount = colorsYouLike.filter(c => c.family === 'accent').length;
            const maxReached = (color.family === 'neutral' && neutralCount >= 3) ||
                (color.family === 'accent' && accentCount >= 3);

            if (!maxReached) {
                setColorsYouLike([...colorsYouLike, color]);
            }
        }
    }

    const handleContinue = useMutation({
        mutationFn: async () => {
            const { error } = await supabase.from("onboarding_states")
                .update({ color_likes: colorsYouLike, color_avoids: colorsYouDontLike })
                .eq("user_id", user?.id);

            if (error) {
                console.error("Error updating color preferences:", error);
                throw new Error("Failed to update color preferences");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });
            router.push("/(onboarding)/occasions");
        },
        onError: (error) => {
            console.error("Error updating color preferences:", error);
            toast.show({
                id: "update-color-preferences-error",
                render: () => {
                    const uniqueToastId = `update-color-preferences-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>
                                Update Failed
                            </ToastTitle>
                            <ToastDescription>
                                {error instanceof Error ? error.message : "An error occurred while updating your color preferences. Please try again."}
                            </ToastDescription>
                        </Toast>
                    )
                }
            })
        }
    })

    // disable button if two or more neutral and accent and avoid colors are not selected
    const isContinueDisabled = colorsYouLike.filter(c => c.family === 'neutral').length < 2 ||
        colorsYouLike.filter(c => c.family === 'accent').length < 2
    // || colorsYouDontLike.length < 2;


    if (status === "pending") {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-[#F7F6F3]">
                <ActivityIndicator size="large" color="#000000" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <Spinner
                visible={handleContinue.isPending}
                textContent={'Saving...'}
                textStyle={{ color: '#FFF' }}
                overlayColor="rgba(0, 0, 0, 0.5)"
            />
            <ScrollView className="flex-1">
                <View className="flex-1 px-6 my-8">
                    <View className="flex flex-row justify-between items-center mb-4">
                        {/* Back */}
                        <Pressable onPress={() => router.back()} className="">
                            <Text className="text-gray-500 font-InterMedium">Back</Text>
                        </Pressable>

                        {/* Skip */}
                        <Link href="/" asChild>
                            <Pressable className="">
                                <Text className="text-gray-500 font-InterMedium">Skip</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Progress bar */}
                    <ProgressBar progress={2} total={5} />

                    <View className="mt-10">
                        {/* Neutrals */}
                        <View>
                            <Text className="text-2xl font-InterBold text-[#1A1A1A]">Pick your go-to neutral</Text>
                            <Text className="mt-2 text-lg font-InterMedium text-gray-700">
                                Select up to 3 colors
                            </Text>
                            <Grid className="gap-3 mt-6" _extra={{ className: 'grid-cols-4' }}>
                                {neutrals.map((color) => (
                                    <GridItem key={color.hex} _extra={{ className: "" }}>
                                        <TouchableOpacity
                                            className={`w-full h-10 rounded-lg items-center justify-center flex-row shadow-sm border-2 ${colorsYouLike.find(c => c.hex === color.hex) ? 'border-primary-700' : 'border-transparent'}`}
                                            style={{ backgroundColor: color.hex, elevation: 2 }}
                                            onPress={() => handleSelectColorYouLike(color)}
                                        >
                                            <Text className={`${isLightColor(color.hex) ? 'text-black' : 'text-white'} text-xs font-InterMedium`}>{color.label}</Text>
                                            {colorsYouLike.find(c => c.hex === color.hex) && (
                                                <Text className={`${isLightColor(color.hex) ? 'text-black' : 'text-white'} font-InterBold drop-shadow-lg`}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    </GridItem>
                                ))}
                            </Grid>
                        </View>

                        {/* Accents */}
                        <View className="mt-10">
                            <Text className="text-2xl font-InterBold text-[#1A1A1A]">Choose your go-to accent</Text>
                            <Text className="mt-2 text-lg font-InterMedium text-gray-700">
                                Select up to 3 colors
                            </Text>
                            <Grid className="gap-3 mt-6" _extra={{ className: 'grid-cols-4' }}>
                                {accents.map((color) => (
                                    <GridItem key={color.hex} _extra={{ className: "" }}>
                                        <TouchableOpacity
                                            className={`w-full h-10 rounded-lg items-center justify-center flex-row shadow-sm border-2 ${colorsYouLike.find(c => c.hex === color.hex) ? 'border-primary-700' : 'border-transparent'}`}
                                            style={{ backgroundColor: color.hex, elevation: 2 }}
                                            onPress={() => handleSelectColorYouLike(color)}
                                        >
                                            <Text className={`${isLightColor(color.hex) ? 'text-black' : 'text-white'} text-xs font-InterMedium`}>{color.label}</Text>
                                            {colorsYouLike.find(c => c.hex === color.hex) && (
                                                <Text className={`${isLightColor(color.hex) ? 'text-black' : 'text-white'} font-InterBold drop-shadow-lg`}>✓</Text>
                                            )}
                                        </TouchableOpacity>
                                    </GridItem>
                                ))}
                            </Grid>
                        </View>
                    </View>

                    {/* Continue */}
                    <View className="mt-6 mb-4">
                        <TouchableOpacity
                            disabled={isContinueDisabled || handleContinue.isPending}
                            onPress={() => handleContinue.mutate()}
                            className={`rounded-3xl py-3 px-4 items-center ${colorsYouLike.length >= 2 ? 'bg-primary-700' : 'bg-gray-400'}`}
                        >
                            {handleContinue.isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (

                                <Text className="text-white font-InterMedium text-base tracking-wide">
                                    Continue
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}