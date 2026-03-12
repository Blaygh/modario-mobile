import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { BrandTheme } from '@/constants/theme';
import { supabase } from '@/libs/supabase';
import { AntDesign } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

function FabricBackground() {
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
        overflow: 'hidden',
      }}>
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: palette.ivory,
        }}
      />

      <LinearGradient colors={['rgba(102, 0, 51, 0.16)', 'rgba(102, 0, 51, 0.04)', 'rgba(102, 0, 51, 0.00)']} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFillObject} />

      <Image
        source={require('@/assets/textures/close-up-texture-linen-fabric.png')}
        resizeMode="repeat"
        contentFit="cover"
        contentPosition={{ left: 0, top: 0 }}
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: 0.05,
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
          provider: 'google',
          token: userInfo.data.idToken,
        });

        if (error) {
          console.error(error);
        }

        if (data?.user) {
          router.replace('/(onboarding)');
        }
      }
    } catch (error) {
      console.error(` ❌ Error during Google sign-in: `, error);
      toast.show({
        id: 'google-signin-error',
        render: () => {
          const uniqueToastId = `google-signin-error-${Date.now()}`;
          return (
            <Toast nativeID={uniqueToastId} action="error" variant="solid">
              <ToastTitle>Sign-in Failed</ToastTitle>
              <ToastDescription>An error occurred during Google sign-in. Please try again.</ToastDescription>
            </Toast>
          );
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push('/(onboarding)');
      }
    })();
  }, [router]);

  return (
    <SafeAreaView style={{ backgroundColor: palette.ivory }} className="flex-1">
      <FabricBackground />
      <View className="flex-1 items-center justify-start px-6 pt-8">
        <View className="mb-9 mt-5 flex items-center justify-start">
          <View className="h-14 w-14 rounded-full" style={{ backgroundColor: palette.burgundy }} />
          <Text className="mt-3 text-2xl tracking-wider" style={{ color: palette.ink, fontFamily: 'Inter-Bold' }}>
            Modario
          </Text>
          <Text className="mt-1 text-xs uppercase tracking-[1.6px]" style={{ color: palette.burgundySoft }}>
            personal style assistant
          </Text>
          <Text className="mt-2 text-center text-lg" style={{ color: palette.muted, fontFamily: 'Inter-Medium' }}>
            Dress with clarity
          </Text>
          <Text className="mt-2 max-w-sm text-center text-base" style={{ color: palette.muted, fontFamily: 'Inter-Regular' }}>
            Turn your wardrobe into an intelligent system — outfits, planning, and confidence.
          </Text>
        </View>

        <View className="w-full bg-white p-6" style={{ borderRadius: radius.modal, ...shadow.soft }}>
          <TouchableOpacity
            disabled={isLoading}
            className="mb-4 flex-row items-center justify-center border bg-white px-4 py-3"
            style={{ borderColor: palette.line, borderRadius: radius.pill }}
            onPress={signInWithGoogle}>
            <AntDesign name="google" size={19} color="#DB4437" />
            <Text className="ml-3 text-base tracking-wide" style={{ color: palette.ink, fontFamily: 'Inter-Medium' }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View className="my-4 flex-row items-center">
            <LinearGradient colors={['#E0E0E0', 'transparent']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, height: 1 }} />
            <Text className="mx-2" style={{ color: palette.muted, fontFamily: 'Inter-Regular' }}>
              or
            </Text>
            <LinearGradient colors={['transparent', '#E0E0E0']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={{ flex: 1, height: 1 }} />
          </View>

          <Link href="/(auth)/email-entry" asChild>
            <TouchableOpacity className="items-center px-4 py-3" style={{ backgroundColor: palette.burgundy, borderRadius: radius.pill }}>
              <Text className="text-base tracking-wide text-white" style={{ fontFamily: 'Inter-Medium' }}>
                Continue with Email
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mt-6 px-4">
          <Text className="text-center text-sm" style={{ color: palette.muted, fontFamily: 'Inter-Light' }}>
            By continuing, you agree to our <Text className="underline">Terms of Service</Text> and <Text className="underline">Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
