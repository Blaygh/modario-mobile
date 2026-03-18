import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { createWardrobeImports, uploadWardrobeImportImage } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImagePlus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

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

    if (result.canceled) {
      return;
    }

    setImageUris((previous) => Array.from(new Set([...previous, ...result.assets.map((asset) => asset.uri)])));
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
      const sessionId = result.import_sessions[0]?.id;

      if (!sessionId) {
        throw new Error('Import session was created without an id.');
      }

      router.push({ pathname: '/wardrobe/processing', params: { sessionId, count: String(result.import_sessions.length) } });
    } catch (error) {
      Alert.alert('Import failed', error instanceof Error ? error.message : 'Failed to import images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Upload items" showBack />
      <View className="mt-2 items-center rounded-[24px] border border-dashed bg-white p-8" style={{ borderColor: '#BFA9B2', borderRadius: radius.card }}>
        <ImagePlus size={40} color={palette.burgundy} />
        <Text className="mt-3 font-InterSemiBold text-lg" style={{ color: palette.ink }}>Select item photos</Text>
        <Text className="mt-1 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          Upload one or more wardrobe images and we’ll detect the pieces for review.
        </Text>
      </View>

      <ScrollView className="mt-4 max-h-56" horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3">
          {imageUris.map((uri) => (
            <Image key={uri} source={{ uri }} style={{ width: 96, height: 96, borderRadius: 16 }} contentFit="cover" />
          ))}
        </View>
      </ScrollView>

      <View className="mt-5 gap-3">
        <SecondaryButton label="Add photos" fullWidth onPress={pickImages} />
        <PrimaryButton label={uploading ? 'Uploading…' : 'Upload and detect'} fullWidth onPress={uploadAndDetect} loading={uploading} />
      </View>
    </SafeAreaView>
  );
}
