import ProgressBar from "@/components/custom/progress-bar";
import { Toast, ToastDescription, ToastTitle, useToast } from "@/components/ui/toast";
import { useGetUser } from "@/hooks/use-get-user";
import { supabase } from "@/libs/supabase";
import { useMutation } from "@tanstack/react-query";
import { decode } from 'base64-arraybuffer';
import { readAsStringAsync } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from "expo-router";
import { Plus, SkipForward, Upload, X } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Spinner from 'react-native-loading-spinner-overlay';
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Uploads an image to Supabase Storage and returns the file path.
 * @param uri 
 * @param userId 
 * @returns {Promise<string>} The path of the uploaded image in Supabase Storage.
 */
async function uploadImageAsync(uri: string, userId: string): Promise<string> {
    const base64 = await readAsStringAsync(uri, {
        encoding: 'base64',
    });
    
    const fileExt = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `${Date.now()}_${uri.split('/').pop()}`;
    const filePath = `${userId}/onboarding/${fileName}`;
    const contentType = `image/${fileExt === 'png' ? 'png' : 'jpeg'}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
            contentType,
        });

    if (error) {
        console.error("Error uploading image:", error);
        throw new Error("Image upload failed");
    }

    return data?.path || '';
}

export default function AvatarScreen() {
    const router = useRouter();
    const [uploadedPhotos, setUploadedPhotos] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const { data: user } = useGetUser();

    const toast = useToast()

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library.
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access the media library is required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setUploadedPhotos((prev) => {
                const combined = [...prev, ...result.assets];
                return combined.slice(0, 3);
            });
        }
    };

    const removePhoto = (index: number) => {
        setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const actionCards = [
        {
            title: "Upload more photos",
            subtext: "Add up to 3 photos",
            icon: <Upload size={24} color="#000" />,
            onPress: pickImage,
        },
        {
            title: "Skip for now",
            subtext: "You can add photos later",
            icon: <SkipForward size={24} color="#000" />,
            onPress: () => router.push("/"), // Navigate to the next screen
        },
    ];

    const disabled = uploadedPhotos.length === 0;

    const handleContinue = useMutation({
        mutationFn: async () => {
            // Upload each photo and get their paths
            const result = await Promise.all(
                uploadedPhotos.map(async (photo) => {
                    if (photo.uri && user?.id) {
                        return await uploadImageAsync(photo.uri, user.id);
                    }
                    return null;
                })
            );

            // Filter out any null paths
            const photoPaths = result.filter((path): path is string => path !== null);

            // Update onboarding state with photo paths
            const { data, error } = await supabase.from("onboarding_states")
                .update({ avatar_image_urls: photoPaths, is_complete: true })
                .eq("user_id", user?.id)
                .select("id");

            if (error) {
                console.error("Error updating avatar photos:", error);
                throw new Error("Failed to update avatar photos");
            }

            // call to process
            await supabase.functions.invoke('process-onboarding', {
                body: { user_id: user?.id, onboarding_state_id: data?.[0]?.id }
            })
        },
        onSuccess: () => {
            router.push("/(onboarding)/done");
        },
        onError: (error) => {
            console.error("Failed to upload avatar photos:", error);
            toast.show({
                id: "upload-avatar-photos-error",
                render: () => {
                    const uniqueToastId = `upload-avatar-photos-error-${Date.now()}`;
                    return (
                        <Toast nativeID={uniqueToastId} action="error" variant="solid">
                            <ToastTitle>
                                Upload Failed
                            </ToastTitle>
                            <ToastDescription>
                                {error instanceof Error ? error.message : "An error occurred while uploading your photos. Please try again."}
                            </ToastDescription>
                        </Toast>
                    )
                }
            })
        }
    })

    return (
        <SafeAreaView className="flex-1 bg-[#F7F6F3]">
            <Spinner
                visible={handleContinue.isPending}
                textContent={'Saving...'}
                textStyle={{ color: '#FFF' }}
                overlayColor="rgba(0, 0, 0, 0.5)"
            />
            <View className="flex-1 my-6 flex flex-col">
                {/* Top navigation */}
                <View className="flex flex-row justify-between items-center mb-4 px-6">
                    <Pressable onPress={() => router.back()}>
                        <Text className="text-gray-500 font-InterMedium">Back</Text>
                    </Pressable>
                    <Link href="/(onboarding)/done" asChild>
                        <Pressable>
                            <Text className="text-gray-500 font-InterMedium">Skip</Text>
                        </Pressable>
                    </Link>
                </View>

                {/* Progress bar */}
                <View className="px-6">
                <ProgressBar progress={4} total={5} />
                </View>

                {/* Top section */}
                <View className="flex items-center justify-center mt-8 mb-2 px-6">
                    <Text className="text-3xl font-InterBold text-[#1A1A1A] text-center leading-tight">
                        See outfits on a
                        <Text className="text-primary-700"> model like you</Text>?
                    </Text>
                    <Text className="mt-3 text-base font-InterRegular text-gray-700 text-center">
                        Upload 2-3 photos from different angles for the best results
                    </Text>
                </View>

                {/* Photo Previews */}
                {uploadedPhotos.length > 0 && (
                    <View className="mt-8 mb-2">
                        <View className="flex-row items-center justify-between mb-4 px-6">
                            <Text className="text-lg font-InterMedium text-[#1A1A1A]">
                                Your Photos
                            </Text>
                            <View className="bg-primary-100 px-3 py-1 rounded-full">
                                <Text className="text-sm font-InterMedium text-primary-700">
                                    {uploadedPhotos.length}/3
                                </Text>
                            </View>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row px-6">
                            {uploadedPhotos.map((photo, index) => (
                                <View key={index} className="mr-4">
                                    <View className="relative pt-3 pr-3">
                                        <Image
                                            source={{ uri: photo.uri }}
                                            style={{
                                                width: 110,
                                                height: 140,
                                                borderRadius: 16,
                                                borderWidth: 3,
                                                borderColor: "#660033",
                                            }}
                                        />
                                        <Pressable
                                            onPress={() => removePhoto(index)}
                                            className="absolute top-0 right-0 bg-red-500 rounded-full p-2 shadow-lg"
                                            style={{
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 3,
                                                elevation: 5,
                                            }}
                                        >
                                            <X size={16} color="#FFFFFF" strokeWidth={3} />
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Empty State Upload Prompt */}
                {uploadedPhotos.length === 0 && (
                    <Pressable
                        onPress={pickImage}
                        className="mt-8 mb-2 p-8 rounded-3xl border-2 border-dashed items-center justify-center mx-6"
                        style={{
                            borderColor: "#660033",
                            backgroundColor: "rgba(102, 0, 51, 0.02)",
                        }}
                    >
                        <View className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center mb-4">
                            <Upload size={32} color="#660033" />
                        </View>
                        <Text className="text-lg font-InterMedium text-[#1A1A1A] text-center">
                            Upload Your Photos
                        </Text>
                        <Text className="mt-2 text-sm font-InterRegular text-gray-600 text-center">
                            Tap to select images from your library
                        </Text>
                    </Pressable>
                )}

                {/* Action cards - Add more photos button */}
                {uploadedPhotos.length > 0 && uploadedPhotos.length < 3 && (
                    <Pressable
                        onPress={pickImage}
                        className="mt-8 mb-2 mx-6 flex-row items-center justify-center p-4 rounded-2xl border-2 border-dashed"
                        style={{
                            borderColor: "#660033",
                            backgroundColor: "rgba(102, 0, 51, 0.03)",
                        }}
                    >
                        <Plus size={24} color="#660033" />
                        <Text className="ml-2 text-base font-InterMedium text-primary-700">
                            Add more photos
                        </Text>
                    </Pressable>
                )}

                {/* Skip card */}
                {uploadedPhotos.length > 0 && (
                    <View className="mt-3 flex flex-col gap-2 mx-6">
                        {actionCards.slice(1).map((card, index) => (
                        <Pressable
                            key={index}
                            onPress={card.onPress}
                            className="flex-row items-center p-4 h-16 bg-white rounded-2xl border"
                            style={{
                                borderColor: "#E5E3DF",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2, // For Android shadow
                            }}
                        >
                            {/* Icon */}
                            <View className="w-10 h-10 rounded-full bg-[#F7F6F3] items-center justify-center mr-3">
                                {card.icon}
                            </View>

                            {/* Text */}
                            <View className="flex-1">
                                <Text className="text-base font-InterMedium text-[#1A1A1A]">
                                    {card.title}
                                </Text>
                                <Text className="text-sm font-InterRegular text-gray-600">
                                    {card.subtext}
                                </Text>
                            </View>
                        </Pressable>
                        ))}
                    </View>
                )}

                <View className="mt-auto pt-6 pb-4 mx-6">
                        <TouchableOpacity
                            className={`rounded-full py-4 px-6 items-center ${
                                !disabled ? 'bg-primary-700' : 'bg-gray-300'
                            }`}
                            disabled={disabled || handleContinue.isPending}
                            activeOpacity={disabled ? 1 : 0.8}
                            onPress={() => handleContinue.mutate()}
                        >
                            {handleContinue.isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text className="text-white font-InterMedium text-base tracking-wide">
                                    {uploadedPhotos.length > 0 ? 'Continue' : 'Skip'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    {uploadedPhotos.length > 0 && (
                        <Text className="mt-3 text-center text-sm font-InterRegular text-gray-600">
                            Great! You have {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} ready
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}