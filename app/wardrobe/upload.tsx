import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { trackWardrobeImportSessionIds } from '@/libs/wardrobe-import-tracker';
import { createWardrobeImports, uploadWardrobeImportImage } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImagePlus } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadImagesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to import wardrobe items.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 10,
    });

    if (result.canceled) return;

    setImageUris((prev) => {
      const next = [...prev, ...result.assets.map((asset) => asset.uri)];
      return Array.from(new Set(next));
    });
  };

  const uploadAndDetect = async () => {
    if (!session?.access_token || !session.user?.id) {
      Alert.alert('Not signed in', 'Please sign in again and retry.');
      return;
    }

    if (!imageUris.length) {
      Alert.alert('No photos selected', 'Add at least one image to continue.');
      return;
    }

    try {
      setUploading(true);

      const uploadedPaths = await Promise.all(imageUris.map((uri) => uploadWardrobeImportImage(session.user.id, uri)));
      const result = await createWardrobeImports(session.access_token, uploadedPaths);
      const importSessionIds = result.import_sessions.map((importSession) => importSession.id);

      await trackWardrobeImportSessionIds(session.user.id, importSessionIds);

      router.push({
        pathname: '/wardrobe/processing',
        params: {
          count: String(result.import_sessions.length),
          sessionIds: importSessionIds.join(','),
        },
      });
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Failed to import images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Upload Items" />
      <View className="mt-2 items-center rounded-2xl border border-dashed border-[#BFA9B2] bg-white p-8">
        <ImagePlus size={40} color="#660033" />
        <Text className="mt-3 font-InterSemiBold text-lg text-[#1A1A1A]">Select item photos</Text>
        <Text className="mt-1 text-center font-InterRegular text-sm text-[#6B6B6B]">Upload multiple photos, then we&apos;ll detect item details.</Text>
      </View>

      <ScrollView className="mt-4 max-h-56" horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {imageUris.map((uri) => (
            <Image key={uri} source={{ uri }} style={{ width: 90, height: 90, borderRadius: 12 }} contentFit="cover" />
          ))}
        </View>
      </ScrollView>

      <View className="mt-5 gap-3">
        <SecondaryButton label="Add more photos" onPress={pickImages} />
        <Pressable onPress={uploadAndDetect} disabled={uploading}>
          <PrimaryButton label={uploading ? 'Uploading…' : 'Upload & detect'} />
          {uploading ? (
            <View className="absolute inset-0 items-center justify-center">
              <ActivityIndicator color="#FFFFFF" />
            </View>
          ) : null}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
