import ProgressBar from "@/components/custom/progress-bar";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { OnboardingBundle, useGetOnboardingBundle } from "@/hooks/use-onboarding";
import { supabase } from "@/libs/supabase";
import { useMutation } from "@tanstack/react-query";
import { Link, router } from "expo-router";
import { Briefcase, Dumbbell, GraduationCap, Heart, Home, PartyPopper, Plane, Shirt, Sparkles, Trees } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';

const getIconForOccasion = (key: string, color: string) => {
    const iconProps = { size: 24, color };
    switch (key) {
        case 'everyday_casual':
            return <Home {...iconProps} />;
        case 'work_office':
            return <Briefcase {...iconProps} />;
        case 'business_casual':
            return <Shirt {...iconProps} />;
        case 'school_campus':
            return <GraduationCap {...iconProps} />;
        case 'gym_active':
            return <Dumbbell {...iconProps} />;
        case 'going_out_nightlife':
            return <PartyPopper {...iconProps} />;
        case 'date_night':
            return <Heart {...iconProps} />;
        case 'formal_events':
            return <Sparkles {...iconProps} />;
        case 'travel_vacation':
            return <Plane {...iconProps} />;
        case 'outdoor_weekend':
            return <Trees {...iconProps} />;
        default:
            return <Shirt {...iconProps} />;
    }
};

export default function OccassionsScreen() {
    const [selectedOccasions, setSelectedOccasions] = React.useState<OnboardingBundle['occasions']>([]);

    const { data } = useGetOnboardingBundle();
    const { data: user } = useGetUser();
    
    const toast = useToast();
    
    const occasions = data?.occasions || [];
    const disabled = selectedOccasions.length === 0;
    
    const handleContinue = useMutation({
        mutationFn: async () => {
            const {error} = await supabase.from("onboarding_states")
                .update({ occasions: selectedOccasions })
                .eq("user_id", user?.id);

            if (error) {
                throw new Error(error.message);
            }
        },
        onSuccess: () => {
            router.push("/(onboarding)/avatar");
        },
        onError: (error) => {
            console.error("Mutation error:", error);
            toast.show({
                id: "update-occasion-preferences-error",
                render: () => {
                    const uniqueToastId = `update-occasion-preferences-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>
                                Update Failed
                            </ToastTitle>
                            <ToastDescription>
                               Failed to update your occasion preferences. Please try again.
                            </ToastDescription>
                        </Toast>
                    )
                }
            })
        }
    })

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <Spinner
                visible={handleContinue.isPending}
                textContent={'Saving...'}
                textStyle={{ color: '#FFF' }}
                overlayColor="rgba(0, 0, 0, 0.5)"
            />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="flex-1 px-6 my-8">
                    <View className="flex flex-row justify-between items-center mb-4">
                        {/* Back */}
                        <Pressable onPress={() => router.back()} className="">
                            <Text className="text-gray-500 font-InterMedium">Back</Text>
                        </Pressable>

                        {/* Skip */}
                        <Link href="/(onboarding)/avatar" asChild>
                            <Pressable className="">
                                <Text className="text-gray-500 font-InterMedium">Skip</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Progress bar */}
                    <ProgressBar progress={3} total={5} />

                    {/* Top section */}
                    <View className="flex items-center justify-center mt-10">
                        <Text className="text-2xl font-InterSemiBold text-center">
                            When do you usually get dressed?
                        </Text>
                    </View>

                    {/* Occasion selection */}
                    <View className="mt-8">
                        {occasions.map((occasion) => {
                            const isSelected = selectedOccasions.some(selected => selected.key === occasion.key);

                            return (
                                <Pressable
                                    key={occasion.key}
                                    onPress={() => {
                                        setSelectedOccasions((prev) =>
                                            prev.some(selected => selected.key === occasion.key)
                                                ? prev.filter((item) => item.key !== occasion.key)
                                                : [...prev, occasion]
                                        );
                                    }}
                                    className="p-4 h-16 border rounded-2xl mb-4 flex-row items-center"
                                    style={{
                                        borderColor: isSelected ? '#660033' : '#E5E3DF',
                                        backgroundColor: isSelected ? 'rgba(102,0,51,0.04)' : '#FFFFFF',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 4,
                                        elevation: 2, // For Android shadow
                                    }}
                                >
                                    {/* Icon with background */}
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-4"
                                        style={{
                                            backgroundColor: isSelected ? '#660033' : '#F5F5F5',
                                        }}
                                    >
                                        {getIconForOccasion(occasion.key, isSelected ? '#FFFFFF' : '#000')}
                                    </View>

                                    {/* Occasion name */}
                                    <Text
                                        className="text-base font-InterMedium"
                                        style={{
                                            color: isSelected ? '#660033' : '#333333',
                                        }}
                                    >
                                        {occasion.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Continue */}
                    <View className="mt-6 mb-4">
                            <TouchableOpacity
                                onPress={() => handleContinue.mutate()}
                                className={`rounded-3xl py-3 px-4 items-center ${!disabled ? 'bg-primary-700' : 'bg-gray-400'}`}
                                disabled={disabled}
                            >
                                <Text className="text-white font-InterMedium text-base tracking-wide">
                                    Continue
                                </Text>
                            </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}