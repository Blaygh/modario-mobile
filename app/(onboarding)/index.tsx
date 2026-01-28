import ProgressBar from "@/components/custom/progress-bar";
import { Link } from "expo-router";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function WelcomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <View className="flex-1 px-6 my-8">
                {/* Skip */}
                <Link href="/" asChild>
                    <Pressable className="flex flex-row justify-end mb-4">
                        <Text className="text-gray-500 font-InterMedium">Skip</Text>
                    </Pressable>
                </Link>

                {/* Progress bar */}
                <ProgressBar progress={0} total={5} />

                {/* Top section */}
                <View className="flex items-center justify-center mt-10">
                    <View className="bg-primary-700 rounded-full w-14 h-14" />
                    <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A] tracking-wider">
                        Modario
                    </Text>
                    <Text className="mt-2 text-lg font-InterMedium text-gray-700 text-center">
                        Let’s personalize your style
                    </Text>
                    <Text>
                        This takes about a minute. You can change anything later.
                    </Text>
                </View>

                {/* Start Button */}
                <View className="mt-16">
                    <Link href="/(onboarding)/style-direction" asChild>
                        <TouchableOpacity className="bg-primary-700 rounded-3xl py-3 px-4 items-center">
                            <Text className="text-white font-InterMedium text-base tracking-wide">
                                Start
                            </Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </SafeAreaView>
    )
}