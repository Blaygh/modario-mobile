import {
    GoogleSignin,
    // GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { supabase } from '@/libs/supabase';
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

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
    const router = useRouter();
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const signInWithGoogle = async () => {
        try {
            setIsLoading(true);
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                    provider: "google",
                    token: userInfo.data.idToken,
                });

                if (error) {
                    console.error(error);
                }

                const user = data?.user;

                if (user) {
                    router.replace("/(onboarding)");
                }
            }
        } catch (error) {
            console.error(` ❌ Error during Google sign-in: `, error);
            toast.show({
                id: "google-signin-error",
                render: () => {
                    const uniqueToastId = `google-signin-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>Sign-in Failed</ToastTitle>
                            <ToastDescription>
                                An error occurred during Google sign-in. Please try again.
                            </ToastDescription>
                        </Toast>
                    )
                }
            })
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // User is already signed in, redirect to onboarding or main app
                // Here we assume onboarding is needed; adjust as necessary
                // Using expo-router's router.replace would be ideal here
                console.log("User already signed in, redirecting...");
                router.push("/(onboarding)")
            }
        })();
    }, [router])

    return (
        <SafeAreaView className="bg-[#F7F6F3] flex-1">
            {/* Fabric Background */}
            <FabricBackground />
            <View className="flex-1 px-6 pt-8 justify-start items-center">
                {/* Top Section */}
                <View className="mt-5 flex justify-start items-center mb-8">
                    {/* Logo */}
                    <View className="bg-primary-700 rounded-full w-14 h-14" />
                    {/* App name */}
                    <Text className="mt-3 text-2xl font-InterBold text-[#1A1A1A] tracking-wider">
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
                    <TouchableOpacity
                        disabled={isLoading}
                        className="bg-white border border-gray-300 rounded-3xl py-3 px-4 mb-4 flex-row items-center justify-center"
                        onPress={signInWithGoogle}>
                        <View className="h-6 w-6 items-center justify-center rounded-full bg-[#F7F6F3]">
                            <Text className="font-InterBold text-sm text-[#660033]">G</Text>
                        </View>
                        <Text className="ml-4 text-gray-700 font-InterMedium text-base tracking-wide">
                            Continue with Google
                        </Text>
                    </TouchableOpacity>

                    {/* Or */}
                    <View className="flex-row items-center my-4">
                        {/* Left Gradient Line */}
                        <LinearGradient
                            colors={['#E0E0E0', 'transparent']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1, height: 1 }}
                        />
                        {/* "Or" Text */}
                        <Text className="mx-2 text-gray-500 font-InterRegular">or</Text>
                        {/* Right Gradient Line */}
                        <LinearGradient
                            colors={['transparent', '#E0E0E0']}
                            start={{ x: 0, y: 0.5 }}
                            end={{ x: 1, y: 0.5 }}
                            style={{ flex: 1, height: 1 }}
                        />
                    </View>

                    {/* Continue with Email */}
                    <Link href="/(onboarding)" asChild>
                        <TouchableOpacity className="bg-primary-700 rounded-3xl py-3 px-4 items-center">
                            <Text className="text-white font-InterMedium text-base tracking-wide">
                                Continue with Email
                            </Text>
                        </TouchableOpacity>
                    </Link>
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