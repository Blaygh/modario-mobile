import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import SvgUri from "expo-svg-uri";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function FabricBackground() {
    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 260,
                overflow: "hidden", // important
            }}
        >
            {/* Base */}
            <View
                style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: "#F7F6F3",
                }}
            />

            {/* Soft wine glow */}
            <LinearGradient
                colors={[
                    "rgba(102, 0, 51, 0.12)",
                    "rgba(102, 0, 51, 0.04)",
                    "rgba(102, 0, 51, 0.00)",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Fabric grain overlay */}
            <Image
                source={require("@/assets/textures/close-up-texture-linen-fabric.png")}
                resizeMode="repeat"
                contentFit="cover"
                contentPosition={{ left: 0, top: 0 }}
                style={{
                    ...StyleSheet.absoluteFillObject,
                    opacity: 0.05, // 🔥 critical value
                }}
            />
        </View>
    );
}



export default function AuthScreen() {
    return (
        <SafeAreaView className="bg-[#F7F6F3] flex-1">
                    {/* Fabric Background */}
                    <FabricBackground />
            <View className="flex-1 px-6 pt-8 justify-start items-center">
                {/* Top Section */}
                <View className="mt-5 flex justify-start items-center mb-8">
                    {/* Logo */}
                    <View className="bg-primary-700 rounded-full w-16 h-16" />
                    {/* App name */}
                    <Text className="mt-3 text-2xl font-InterBold text-gray-800">
                        Modario
                    </Text>
                    {/* Headline */}
                    <Text className="mt-2 text-lg font-InterMedium text-gray-700 text-center">
                        Dress with clarity
                    </Text>
                    {/* Subtext */}
                    <Text className="mt-2 text-center text-gray-600 font-InterRegular text-base max-w-sm">
                        Turn your wardrobe into an intelligent system — outfits, planning, and confidence.
                    </Text>
                </View>

                {/* Middle Section */}
                <View className="bg-white rounded-3xl p-6 w-full shadow-sm">
                    {/* Google */}
                    <TouchableOpacity className="bg-white border border-gray-300 rounded-3xl py-3 px-4 mb-4 flex-row items-center justify-center">
                        <SvgUri
                            source={require('@/assets/svgs/google-icon-logo-svgrepo-com.svg')}
                            width={24}
                            height={24}
                            />
                        <Text className="ml-4 text-gray-700 font-InterMedium text-base">
                            Continue with Google
                        </Text>
                    </TouchableOpacity>
                    
                    {/* Or */}
                    <View className="flex-row items-center my-4">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-2 text-gray-500 font-InterRegular">or</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    {/* Continue with Email */}
                    <TouchableOpacity className="bg-primary-700 rounded-3xl py-3 px-4 items-center">
                        <Text className="text-white font-InterMedium text-base">
                            Continue with Email
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Terms & Privacy */}
                <View className="mt-6 px-4">
                    <Text className="text-center text-gray-600 font-InterLight text-sm">
                        By continuing, you agree to our{' '}
                        <Text className="underline">Terms of Service</Text> and{' '}
                        <Text className="underline">Privacy Policy</Text>.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    )
}