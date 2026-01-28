import ProgressBar from "@/components/custom/progress-bar";
import { Grid, GridItem } from '@/components/ui/grid';
import { Skeleton } from '@/components/ui/skeleton';
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { useGetOnboardingBundle } from "@/hooks/use-onboarding";
import { supabase } from "@/libs/supabase";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from 'react-native-loading-spinner-overlay';


export default function StylePreferenceScreen() {
    const [selectedCards, setSelectedCards] = useState<string[]>([]);
    const router = useRouter();
    const { data, status } = useGetOnboardingBundle();
    const { data: user } = useGetUser();
    const queryClient = useQueryClient();
    const toast = useToast();

    const styles = data?.style_cards || [];

    const handleSelectCard = (id: string) => {
        if (selectedCards.includes(id)) {
            setSelectedCards(selectedCards.filter(cardId => cardId !== id));
        } else {
            if (selectedCards.length < 3) {
                setSelectedCards([...selectedCards, id]);
            }
        }
    }

    const handleSaveStylePreferences = useMutation({
        mutationFn: async () => {
            const uniqueStyles = Array.from(new Set(selectedCards));
            const { error } = await supabase.from("onboarding_states")
                .update({ style_picks: uniqueStyles })
                .eq("user_id", user?.id);

            if (error) {
                console.error("Error updating style preferences:", error);
                throw new Error("Failed to update style preferences");
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['onboarding-state'] });
            setTimeout(() => {
                router.push("/(onboarding)/color-preference"); // Auto-advance to the next screen
            }, 200);
        },
        onError: (error) => {
            toast.show({
                id: "update-style-preferences-error",
                render: () => {
                    const uniqueToastId = `update-style-preferences-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>
                                Update Failed
                            </ToastTitle>
                            <ToastDescription>
                                {error instanceof Error ? error.message : "An error occurred while updating your style preference. Please try again."}
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
                visible={handleSaveStylePreferences.isPending}
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
                        <Link href="/(onboarding)/color-preference" asChild>
                            <Pressable className="">
                                <Text className="text-gray-500 font-InterMedium">Skip</Text>
                            </Pressable>
                        </Link>
                    </View>

                    {/* Progress bar */}
                    <ProgressBar progress={2} total={5} />
                    {/* Top section */}
                    <View className="flex items-center justify-center mt-10">
                        <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A]">
                            What styles feel like you?
                        </Text>
                        <Text className="mt-2 text-lg font-InterMedium text-gray-700 text-center">
                            Tap 2–3 outfits you’d wear
                        </Text>
                    </View>

                    {
                        status === "pending" && (
                            <Grid className="gap-3 mt-8" _extra={{ className: 'grid-cols-2' }}>
                                {[...Array(6)].map((_, index) => (
                                    <GridItem
                                        key={index}
                                        className="w-full h-48 bg-gray-300 rounded-lg overflow-hidden"
                                        _extra={{ className: "" }}
                                    >
                                        <Skeleton className="w-full h-full rounded-lg" />
                                    </GridItem>
                                ))}
                            </Grid>
                        )
                    }

                    {/* Grid of outfits */}
                    {status === "success" &&
                        <Grid className="gap-3 mt-8" _extra={{ className: 'grid-cols-2' }}>
                            {styles?.map((item) => (
                                <GridItem
                                    key={item.id}
                                    className="w-full h-48 bg-gray-300 rounded-lg overflow-hidden"
                                    _extra={{ className: "" }}
                                    style={{
                                        borderWidth: selectedCards.includes(item.id) ? 3 : 0,
                                        borderColor: selectedCards.includes(item.id) ? '#660033' : 'transparent',

                                    }}
                                >
                                    <TouchableOpacity
                                        className="w-full h-full relative"
                                        onPress={() => handleSelectCard(item.id)}
                                        activeOpacity={0.8}
                                    >
                                        {/* Check mark */}
                                        {selectedCards.includes(item.id) && (
                                            <View className="absolute top-2 right-2 z-10 shadow-lg">
                                                <FontAwesome name="check-circle" size={20} color="#660033" />
                                            </View>
                                        )}
                                        <Image
                                            source={{ uri: item.variant.img_url.trim() }}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="cover"
                                            alt="Outfit Image"
                                        />
                                    </TouchableOpacity>
                                </GridItem>
                            ))}
                        </Grid>}

                    {/* Continue */}
                    <View className="mt-6 mb-4">
                        <TouchableOpacity
                            onPress={() => handleSaveStylePreferences.mutate()}
                            className={`rounded-3xl py-3 px-4 items-center ${selectedCards.length >= 2 ? 'bg-primary-700' : 'bg-gray-400'}`}
                            disabled={selectedCards.length < 2}
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