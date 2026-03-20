import { AppHeader, EmptyState, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { createWardrobeImports, uploadWardrobeImportImage } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;
const MAX_IMAGES = 3;

export default function UploadImagesScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams<{ seedUri?: string }>();
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (params.seedUri && !imageUris.includes(params.seedUri)) {
      setImageUris((previous) => [params.seedUri!, ...previous].slice(0, MAX_IMAGES));
    }
  }, [imageUris, params.seedUri]);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to import wardrobe items.');
      return;
    }

    const remaining = MAX_IMAGES - imageUris.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', 'Each import session supports up to three images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    setImageUris((previous) => Array.from(new Set([...previous, ...result.assets.map((asset) => asset.uri)])).slice(0, MAX_IMAGES));
  };

  const removeImage = (uri: string) => setImageUris((previous) => previous.filter((entry) => entry !== uri));

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
      const sessionId = result.import_sessions[0]?.id;

      if (!sessionId) {
        throw new Error('Import session was created without an id.');
      }

      router.replace({ pathname: '/wardrobe/processing', params: { sessionId } });
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Failed to import images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Upload items" showBack subtitle="Use one to three images for this import session. We’ll detect pieces and let you review each one before commit." />

      <View className="mt-4 items-center rounded-[24px] border border-dashed bg-white p-8" style={{ borderColor: '#BFA9B2', borderRadius: radius.card }}>
        <ImagePlus size={40} color={palette.burgundy} />
        <Text className="mt-3 font-InterSemiBold text-lg" style={{ color: palette.ink }}>Wardrobe import photos</Text>
        <Text className="mt-1 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          Library upload and camera capture both land here. Keep the item visible and well lit for stronger detection.
        </Text>
      </View>

      {!imageUris.length ? (
        <View className="mt-4">
          <EmptyState title="No photos selected" description="Add one to three images to start this wardrobe import session." />
        </View>
      ) : null}

      <ScrollView className="mt-4 flex-1" contentContainerStyle={{ gap: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {imageUris.map((uri, index) => (
          <View key={uri} className="overflow-hidden rounded-[22px] border bg-white" style={{ borderColor: palette.line }}>
            <Image source={{ uri }} style={{ width: '100%', height: 190 }} contentFit="cover" />
            <View className="flex-row items-center justify-between p-3">
              <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Photo {index + 1}</Text>
              <Pressable onPress={() => removeImage(uri)} className="flex-row items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: '#F9F2F4' }}>
                <Trash2 size={14} color={palette.burgundy} />
                <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="gap-3 pb-2 pt-2">
        <SecondaryButton label={imageUris.length >= MAX_IMAGES ? '3 photos selected' : 'Add photos'} onPress={pickImages} disabled={imageUris.length >= MAX_IMAGES || uploading} />
        <PrimaryButton label={uploading ? 'Uploading…' : 'Upload and detect'} fullWidth onPress={uploadAndDetect} loading={uploading} disabled={!imageUris.length || uploading} />
      </View>
    </SafeAreaView>
  );
}
