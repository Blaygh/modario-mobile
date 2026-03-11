import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useAppState } from '@/hooks/use-app-state';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOnlineManager } from '@/hooks/use-online-manager';
import { isOnboardingComplete } from '@/libs/onboarding-storage';
import { AuthProvider, useAuth } from '@/provider/auth-provider';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOnboardingState = async () => {
      const completed = await isOnboardingComplete();
      if (isMounted) {
        setHasCompletedOnboarding(completed);
      }
    };

    loadOnboardingState();

    return () => {
      isMounted = false;
    };
  }, [session]);

  useEffect(() => {
    if (!initialized || hasCompletedOnboarding === null) {
      return;
    }

    const rootSegment = segments[0];

    if (!session) {
      if (rootSegment !== '(auth)') {
        router.replace('/(auth)');
      }
      return;
    }

    if (!hasCompletedOnboarding) {
      if (rootSegment !== '(onboarding)') {
        router.replace('/(onboarding)');
      }
      return;
    }

    if (rootSegment !== '(tabs)') {
      router.replace('/(tabs)');
    }
  }, [hasCompletedOnboarding, initialized, router, segments, session]);

  return (
    <Stack>
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
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
      SplashScreen.hideAsync();
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
        <GluestackUIProvider mode="light">
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AppNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </GluestackUIProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
