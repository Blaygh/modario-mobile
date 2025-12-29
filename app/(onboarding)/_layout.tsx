import { Stack } from "expo-router";


export default function OnboardingLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="color-preference"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="style-preference"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="occasions"
                options={{ headerShown: false }}
                />
        </Stack>
    )
}