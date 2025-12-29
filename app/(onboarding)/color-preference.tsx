import ProgressBar from "@/components/custom/progress-bar";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const placeholderColors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#9B59B6', // Purple
    '#E67E22', // Orange
    '#1ABC9C', // Teal
    '#E74C3C', // Crimson
    '#2ECC71', // Emerald
    '#3498DB', // Sky Blue
];

export default function ColorPreferenceScreen() {
    const [colorsYouLike, setColorsYouLike] = useState<string[]>([]);
    const [colorsYouDontLike, setColorsYouDontLike] = useState<string[]>([]);

    const router = useRouter();

    const handleColorLikePress = (color: string) => {
        if (colorsYouLike.includes(color)) {
            setColorsYouLike(colorsYouLike.filter(c => c !== color));
        } else {
            if (colorsYouLike.length < 3) {
                setColorsYouLike([...colorsYouLike, color]);
            }
        }
    }

    const handleColorDontLikePress = (color: string) => {
        if (colorsYouDontLike.includes(color)) {
            setColorsYouDontLike(colorsYouDontLike.filter(c => c !== color));
        } else {
            if (colorsYouDontLike.length < 3) {
                setColorsYouDontLike([...colorsYouDontLike, color]);
            }
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
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


                {/* Color You Like Section */}
                <View className="mt-8">
                    <Text className="text-2xl font-InterSemiBold mb-4">What colors do you like?</Text>
                    <Text className="text-gray-600 font-InterRegular mb-6">Select up to 3 colors</Text>
                    <View className="flex flex-row flex-wrap justify-between">
                        {placeholderColors.map((color, index) => (
                            <Pressable
                                key={index}
                                className="w-20 h-20 mb-4 rounded-lg shadow-sm"
                                style={{
                                    backgroundColor: color,
                                    opacity: 0.8,
                                    borderWidth: colorsYouLike.includes(color) ? 4 : 0,
                                    borderColor: colorsYouLike.includes(color) ? '#000' : 'transparent',
                                }}
                                onPress={() => handleColorLikePress(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* Colors You Don't Like Section */}
                <View className="mt-8">
                    <Text className="text-2xl font-InterSemiBold mb-4">What colors do you not like?</Text>
                    <Text className="text-gray-600 font-InterRegular mb-6">Select up to 3 colors</Text>
                    <View className="flex flex-row flex-wrap justify-between">
                        {placeholderColors.map((color, index) => (
                            <Pressable
                                key={index}
                                className="w-20 h-20 mb-4 rounded-lg shadow-sm"
                                style={{
                                    backgroundColor: color,
                                    opacity: 0.8,
                                    borderWidth: colorsYouDontLike.includes(color) ? 4 : 0,
                                    borderColor: colorsYouDontLike.includes(color) ? '#000' : 'transparent',
                                }}
                                onPress={() => handleColorDontLikePress(color)}
                            />
                        ))}
                    </View>
                </View>

                {/* Continue */}
                <View className="mt-6 mb-4">
                    <Link href="/(onboarding)/occasions" asChild>
                        <TouchableOpacity
                            className={`rounded-3xl py-3 px-4 items-center ${(colorsYouLike.length + colorsYouDontLike.length) >= 2 ? 'bg-primary-700' : 'bg-gray-400'}`}
                            disabled={(colorsYouLike.length + colorsYouDontLike.length) < 2}
                        >
                            <Text className="text-white font-InterMedium text-base tracking-wide">
                                Continue
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    );
}