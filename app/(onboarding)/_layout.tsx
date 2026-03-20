import { Stack } from 'expo-router';

import { OnboardingProvider } from '@/provider/onboarding-provider';

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="style-direction" options={{ headerShown: false }} />
        <Stack.Screen name="style-preference" options={{ headerShown: false }} />
        <Stack.Screen name="color-preference" options={{ headerShown: false }} />
        <Stack.Screen name="occasions" options={{ headerShown: false }} />
        <Stack.Screen name="avatar" options={{ headerShown: false }} />
        <Stack.Screen name="avatar-upload" options={{ headerShown: false }} />
        <Stack.Screen name="base-model-gender" options={{ headerShown: false }} />
        <Stack.Screen name="base-model-skin-tone" options={{ headerShown: false }} />
        <Stack.Screen name="base-model-body-type" options={{ headerShown: false }} />
        <Stack.Screen name="base-model-confirm" options={{ headerShown: false }} />
        <Stack.Screen name="done" options={{ headerShown: false }} />
      </Stack>
    </OnboardingProvider>
  );
}
