import { CheckCircle } from "lucide-react-native";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingDoneScreen() {
    const check = useSharedValue(0);

    const checkAnimated = useAnimatedStyle(() => ({
        opacity: check.value,
        transform: [
            {
                scale: check.value,
            },
        ],
    }))

    useEffect(() => {
        check.value = withTiming(1, { 
            duration: 1000 
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <View className="flex-1 px-6 my-8 items-center justify-center">
                {/* Icon */}
                <Animated.View style={checkAnimated}>
                    <CheckCircle size={48} color="#660033" />
                </Animated.View>

                {/* Headline */}
                <Text className="mt-4 text-[22px] font-InterMedium text-[#1A1A1A] text-center">
                    You’re all set
                </Text>

                {/* Subtext */}
                <Text
                    className="mt-2 text-[15px] font-InterRegular text-[#6B6B6B] text-center"
                    style={{ maxWidth: 280 }}
                >
                    We’ll refine your recommendations as you use Modario.
                </Text>

                {/* Primary CTA */}
                <TouchableOpacity
                    className="mt-8 bg-[#660033] rounded-full py-3 px-6"
                    onPress={() => console.log("Add your wardrobe pressed")}
                >
                    <Text className="text-white font-InterMedium text-base">
                        Add your wardrobe
                    </Text>
                </TouchableOpacity>

                {/* Secondary text */}
                <Text
                    className="mt-3 text-[13px] font-InterRegular text-[#6B6B6B] text-center"
                >
                    You can adjust preferences anytime
                </Text>
            </View>
        </SafeAreaView>
    );
}