import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import 'react-native-reanimated';
import '../global.css';

import { PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { BrandTheme } from '@/constants/theme';
import { useAppState } from '@/hooks/use-app-state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnlineManager } from '@/hooks/use-online-manager';
import { queryClient } from '@/libs/query-client';
import { AuthProvider, useAuth } from '@/provider/auth-provider';
import { OnboardingProvider, useOnboardingSession } from '@/provider/onboarding-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

void SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { session } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { bootstrapError, isBootstrapping, isRoutingReady, retryBootstrap, routingTarget } = useOnboardingSession();

  useEffect(() => {
    if (!isRoutingReady) {
      return;
    }

    const rootSegment = segments[0];

    if (routingTarget === 'auth') {
      if (rootSegment !== '(auth)') {
        router.replace('/(auth)');
      }
      return;
    }

    if (routingTarget === 'onboarding') {
      if (rootSegment !== '(onboarding)') {
        router.replace('/(onboarding)');
      }
      return;
    }

    if (rootSegment === '(auth)' || rootSegment === '(onboarding)' || !rootSegment) {
      router.replace('/(tabs)');
    }
  }, [isRoutingReady, router, routingTarget, segments]);

  if (!isRoutingReady || isBootstrapping) {
    return <AppBootSplash message={session ? 'Loading your account…' : 'Starting Modario…'} />;
  }

  if (session && bootstrapError && routingTarget !== 'auth') {
    return <AppBootError message={bootstrapError.message} onRetry={() => void retryBootstrap()} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function AppBootSplash({ message }: { message: string }) {
  const { palette } = BrandTheme;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.ivory, paddingHorizontal: 24, gap: 16 }}>
      <ActivityIndicator size="small" color={palette.burgundy} />
      <Text style={{ color: palette.muted, fontFamily: 'Inter-Medium', fontSize: 15 }}>{message}</Text>
    </View>
  );
}

function AppBootError({ message, onRetry }: { message: string; onRetry: () => void }) {
  const { palette, radius } = BrandTheme;
  const { signOut } = useAuth();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.ivory, paddingHorizontal: 24 }}>
      <View style={{ width: '100%', maxWidth: 420, borderRadius: radius.card, backgroundColor: '#FFFFFF', padding: 24, gap: 12, borderWidth: 1, borderColor: '#E7C9D2' }}>
        <Text style={{ color: palette.ink, fontFamily: 'Inter-SemiBold', fontSize: 22 }}>We couldn’t verify your onboarding state.</Text>
        <Text style={{ color: palette.muted, fontFamily: 'Inter-Regular', fontSize: 15, lineHeight: 24 }}>
          Routing is waiting for backend truth so we do not trust stale device-only state. Retry to continue.
        </Text>
        <Text style={{ color: '#B42318', fontFamily: 'Inter-Regular', fontSize: 14, lineHeight: 20 }}>{message}</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          <PrimaryButton label="Retry" fullWidth onPress={onRetry} />
          <SecondaryButton label="Back to sign in" onPress={() => void signOut?.()} />
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded, error] = useFonts({
    'Inter-Black': require('../assets/fonts/Inter-Black.otf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.otf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.otf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
    'Inter-Light': require('../assets/fonts/Inter-Light-BETA.otf'),
    'Inter-Thin': require('../assets/fonts/Inter-Thin-BETA.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useOnlineManager();
  useAppState();

  if (!loaded && !error) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <GluestackUIProvider mode="light">
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <AppNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </GluestackUIProvider>
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
