import { FormControl, FormControlError, FormControlErrorIcon, FormControlErrorText } from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
} from '@/components/ui/toast';
import { VStack } from "@/components/ui/vstack";
import { supabase } from '@/libs/supabase';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Mail } from 'lucide-react-native';
import { useState } from 'react';
import { AppState, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

WebBrowser.maybeCompleteAuthSession(); // required for web only
const redirectTo = makeRedirectUri();

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


const sendMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: redirectTo,
        },
    });
    if (error) throw error;
};



export default function EmailEntryScreen() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [toastId, setToastId] = useState(0);

    const showNewToast = (title: string, description: string) => {
        const newId = Math.random();
        setToastId(newId);
        toast.show({
            id: String(newId),
            placement: 'top',
            duration: 8000,
            render: ({ id }) => {
                const uniqueToastId = 'toast-' + id;
                return (
                    <Toast nativeID={uniqueToastId} action="muted" variant="solid" className='bg-white shadow-sm border border-gray-200'>
                        <ToastTitle className='font-InterSemiBold text-gray-900'>
                            {title}
                        </ToastTitle>
                        <ToastDescription className='font-InterRegular text-gray-800'>
                            {description}
                        </ToastDescription>
                    </Toast>
                );
            },
        });
    };

    const handleToast = (title: string, description: string) => {
        if (!toast.isActive(String(toastId))) {
            showNewToast(title, description);
        }
    };

    const handleSignup = async () => {
        // Reset error
        setError(null);

        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        try {
            await sendMagicLink(email);
            handleToast(
                'Check your email',
                `We’ve sent a secure sign-in link to ${email}. Tap the link in the email to continue.`,
            );
        } catch (err) {
            console.error(err);
            setError('Failed to send magic link. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const url = Linking.useLinkingURL();
    if (url) createSessionFromUrl(url);

    return (
        <SafeAreaView className="bg-[#F7F6F3] flex-1">
            <View className="flex-1 px-6 pt-8">
                {/* Back Arrow */}
                <Pressable onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </Pressable>

                {/* Headline */}
                <View className="mt-12">
                    <Text className="text-3xl font-InterSemiBold text-center tracking-wide text-gray-800">
                        Continue with Email
                    </Text>
                </View>

                {/* Form */}
                <FormControl
                    isInvalid={!!error}
                    className="mt-8 w-full">
                    <VStack className="gap-6">
                        {/* Email */}
                        <VStack space="xs">
                            <Text className="text-typography-500 font-InterMedium">Email</Text>
                            <Input className="rounded-3xl bg-white border border-gray-300" size="xl">
                                <InputSlot className="pl-3">
                                    <InputIcon as={Mail} />
                                </InputSlot>
                                <InputField
                                    type="text"
                                    placeholder='you@gmail.com'
                                    className='font-InterRegular'
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </Input>
                            <FormControlError>
                                <FormControlErrorIcon />
                                <FormControlErrorText className="text-red-500 font-InterRegular">
                                    {error}
                                </FormControlErrorText>
                            </FormControlError>
                        </VStack>

                        {/* Button */}
                        <View>
                            <TouchableOpacity
                                disabled={loading}
                                className="bg-primary-700 rounded-3xl py-3 px-4 items-center"
                                onPress={handleSignup}
                            >
                                {loading ? (
                                    <Spinner size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-InterMedium text-base tracking-wide">
                                        Continue with Email
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </VStack>
                </FormControl>
            </View>
        </SafeAreaView>
    )
}