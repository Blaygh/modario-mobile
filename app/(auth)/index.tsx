import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import { Link } from 'expo-router';
import SvgUri from "expo-svg-uri";
import { AppState, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from '@/libs/supabase';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})
WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

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

const performOAuth = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo,
            skipBrowserRedirect: true,
        },
    });
    if (error) throw error;
    const res = await WebBrowser.openAuthSessionAsync(
        data?.url ?? "",
        redirectTo
    );
    if (res.type === "success") {
        const { url } = res;
        await createSessionFromUrl(url);
    }
};


const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;
    if (!access_token) return;
    const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
    });
    if (error) throw error;
    return data.session;
};


export default function AuthScreen() {
    const url = Linking.useLinkingURL();
    if (url) createSessionFromUrl(url);

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
                    <Text className="mt-3 text-2xl font-InterBold text-gray-800 tracking-wider">
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
                <View className="bg-white rounded-3xl p-6 w-full shadow-lg">
                    {/* Google */}
                    <TouchableOpacity className="bg-white border border-gray-300 rounded-3xl py-3 px-4 mb-4 flex-row items-center justify-center" onPress={performOAuth}>
                        <SvgUri
                            source={require('@/assets/svgs/google-icon-logo-svgrepo-com.svg')}
                            width={24}
                            height={24}
                        />
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
                    <Link href="/(auth)/email-entry" asChild>
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