import ProgressBar from '@/components/custom/progress-bar';
import { AppHeader, InfoNotice, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingState, useSaveOnboardingStateMutation, useUploadAvatarPhotoMutation } from '@/hooks/use-onboarding';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ImagePlus, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

type SlotKey = 'front' | 'side';

type SlotState = {
  localUri: string | null;
  uploadedPath: string | null;
};

const toPreviewUri = (value: string | null | undefined) => (value && (value.startsWith('file:') || value.startsWith('http'))) ? value : null;

const SLOT_COPY: Record<SlotKey, { title: string; subtitle: string }> = {
  front: {
    title: 'Front photo',
    subtitle: 'Required for this mode. Use a clear, full-body front-facing reference.',
  },
  side: {
    title: 'Side photo',
    subtitle: 'Strongly recommended for better downstream avatar generation.',
  },
};

export default function AvatarUploadScreen() {
  const router = useRouter();
  const onboardingStateQuery = useOnboardingState();
  const saveMutation = useSaveOnboardingStateMutation();
  const uploadMutation = useUploadAvatarPhotoMutation();
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    front: {
      localUri: toPreviewUri(onboardingStateQuery.data?.avatarImageUrls[0]),
      uploadedPath: onboardingStateQuery.data?.avatarImageUrls[0] ?? null,
    },
    side: {
      localUri: toPreviewUri(onboardingStateQuery.data?.avatarImageUrls[1]),
      uploadedPath: onboardingStateQuery.data?.avatarImageUrls[1] ?? null,
    },
  });
  const [activeSlot, setActiveSlot] = useState<SlotKey | null>(null);

  useEffect(() => {
    const state = onboardingStateQuery.data;
    if (!state) {
      return;
    }

    setSlots((current) => {
      const alreadyHydrated = Object.values(current).some((slot) => slot.localUri || slot.uploadedPath);
      if (alreadyHydrated) {
        return current;
      }

      return {
        front: {
          localUri: toPreviewUri(state.avatarImageUrls[0]),
          uploadedPath: state.avatarImageUrls[0] ?? null,
        },
        side: {
          localUri: toPreviewUri(state.avatarImageUrls[1]),
          uploadedPath: state.avatarImageUrls[1] ?? null,
        },
      };
    });
  }, [onboardingStateQuery.data]);

  const uploadedPaths = useMemo(
    () => (['front', 'side'] as SlotKey[]).map((slot) => slots[slot].uploadedPath).filter((value): value is string => Boolean(value)),
    [slots],
  );
  const canContinue = uploadedPaths.length >= 1;
  const isBusy = uploadMutation.isPending || saveMutation.isPending;

  const updateSlot = (slot: SlotKey, next: Partial<SlotState>) => {
    setSlots((current) => ({
      ...current,
      [slot]: {
        ...current[slot],
        ...next,
      },
    }));
  };

  const uploadAssetToSlot = async (slot: SlotKey, assetUri: string) => {
    try {
      setActiveSlot(slot);
      updateSlot(slot, { localUri: assetUri });
      const uploadedPath = await uploadMutation.mutateAsync(assetUri);
      updateSlot(slot, { uploadedPath });

      const nextPaths = (['front', 'side'] as SlotKey[])
        .map((slotKey) => (slotKey === slot ? uploadedPath : slots[slotKey].uploadedPath))
        .filter((value): value is string => Boolean(value));

      await saveMutation.mutateAsync({
        avatar_mode: 'upload',
        avatar_image_urls: nextPaths,
        avatar_base_model_id: null,
        avatar_skin_tone_preset_id: null,
        avatar_body_type_preset_id: null,
        avatar_status: 'saved',
        status: 'saved',
      });
    } catch (error) {
      updateSlot(slot, { uploadedPath: null });
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'We could not upload that photo. Please try again.');
    } finally {
      setActiveSlot(null);
    }
  };

  const pickFromLibrary = async (slot: SlotKey) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo library access to add an avatar reference.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const assetUri = result.assets[0]?.uri;
    if (!assetUri) {
      return;
    }

    await uploadAssetToSlot(slot, assetUri);
  };

  const takePhoto = async (slot: SlotKey) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access to capture an avatar reference.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      cameraType: ImagePicker.CameraType.back,
    });

    if (result.canceled) {
      return;
    }

    const assetUri = result.assets[0]?.uri;
    if (!assetUri) {
      return;
    }

    await uploadAssetToSlot(slot, assetUri);
  };

  const removeSlot = async (slot: SlotKey) => {
    const nextSlots = {
      ...slots,
      [slot]: {
        localUri: null,
        uploadedPath: null,
      },
    };
    setSlots(nextSlots);

    await saveMutation.mutateAsync({
      avatar_mode: nextSlots.front.uploadedPath || nextSlots.side.uploadedPath ? 'upload' : 'skip',
      avatar_image_urls: (['front', 'side'] as SlotKey[])
        .map((slotKey) => nextSlots[slotKey].uploadedPath)
        .filter((value): value is string => Boolean(value)),
      avatar_base_model_id: null,
      avatar_skin_tone_preset_id: null,
      avatar_body_type_preset_id: null,
      avatar_status: 'saved',
      status: 'saved',
    });
  };

  const persistAndContinue = async () => {
    if (!canContinue) {
      return;
    }

    await saveMutation.mutateAsync({
      avatar_mode: 'upload',
      avatar_image_urls: uploadedPaths,
      avatar_base_model_id: null,
      avatar_skin_tone_preset_id: null,
      avatar_body_type_preset_id: null,
      avatar_status: 'saved',
      status: 'saved',
    });
    router.push('/(onboarding)/done');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        <AppHeader title="Upload photos" subtitle="Add at least one image now. Two reference photos gives the backend the strongest starting point later." showBack />
        <ProgressBar progress={6} total={7} />

        <ScrollView className="mt-6 flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          <InfoNotice title="Generation waits until final submit" description="We only store your uploaded paths during onboarding. Avatar generation starts after you tap Finish, and it never blocks entry into Home." />

          <View className="mt-5" style={{ gap: 14 }}>
            {(['front', 'side'] as SlotKey[]).map((slot) => {
              const state = slots[slot];
              const isUploading = activeSlot === slot && uploadMutation.isPending;
              const hasImage = Boolean(state.localUri || state.uploadedPath);

              return (
                <View key={slot} className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card, ...shadow.soft }}>
                  <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
                    <View className="flex-1" style={{ gap: 4 }}>
                      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
                        {SLOT_COPY[slot].title}
                      </Text>
                      <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                        {SLOT_COPY[slot].subtitle}
                      </Text>
                    </View>
                    <View className="rounded-full px-3 py-1" style={{ backgroundColor: state.uploadedPath ? palette.roseFog : '#F6F2EE' }}>
                      <Text className="font-InterMedium text-xs uppercase tracking-[1.1px]" style={{ color: state.uploadedPath ? palette.burgundy : palette.muted }}>
                        {state.uploadedPath ? 'Ready' : slot === 'front' ? 'Required' : 'Optional'}
                      </Text>
                    </View>
                  </View>

                  <View className="mt-4 overflow-hidden rounded-[20px] border border-dashed" style={{ borderColor: palette.line, backgroundColor: '#F8F4F1', minHeight: 180 }}>
                    {state.localUri ? (
                      <Image source={{ uri: state.localUri }} style={{ width: '100%', height: 180 }} contentFit="cover" />
                    ) : state.uploadedPath ? (
                      <View className="items-center justify-center" style={{ minHeight: 180, gap: 10 }}>
                        <ImagePlus size={28} color={palette.burgundy} />
                        <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>
                          Photo uploaded
                        </Text>
                        <Text className="px-4 text-center font-InterRegular text-xs leading-5" style={{ color: palette.muted }}>
                          Preview unavailable on this device, but the uploaded reference is saved to your account.
                        </Text>
                      </View>
                    ) : (
                      <View className="items-center justify-center" style={{ minHeight: 180, gap: 10 }}>
                        <ImagePlus size={28} color={palette.burgundy} />
                        <Text className="font-InterMedium text-sm" style={{ color: palette.muted }}>
                          {slot === 'front' ? 'Add your front reference' : 'Add your side reference'}
                        </Text>
                      </View>
                    )}
                  </View>

                  {isUploading ? (
                    <View className="mt-4 flex-row items-center" style={{ gap: 10 }}>
                      <ActivityIndicator color={palette.burgundy} />
                      <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
                        Uploading {slot} photo…
                      </Text>
                    </View>
                  ) : null}

                  <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
                    <SecondaryButton label={hasImage ? 'Replace from gallery' : 'Choose from gallery'} onPress={() => pickFromLibrary(slot)} disabled={isBusy} />
                    <SecondaryButton label={hasImage ? 'Retake photo' : 'Take photo'} onPress={() => takePhoto(slot)} disabled={isBusy} />
                    {hasImage ? (
                      <Pressable
                        onPress={() => removeSlot(slot)}
                        className="flex-row items-center rounded-[14px] border px-4"
                        style={{ minHeight: 48, borderColor: '#E8C9CF', backgroundColor: '#FFF8F9', gap: 8 }}>
                        <Trash2 size={16} color="#B42318" />
                        <Text className="font-InterMedium text-sm" style={{ color: '#B42318' }}>
                          Remove
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View className="pb-2 pt-4" style={{ gap: 10 }}>
          <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
            {uploadedPaths.length >= 2
              ? 'Great — both front and side photos are saved.'
              : uploadedPaths.length === 1
                ? 'You can continue with one photo, but adding a side photo is strongly recommended.'
                : 'Add at least one photo to use this path.'}
          </Text>
          <PrimaryButton label="Continue" fullWidth onPress={persistAndContinue} disabled={!canContinue || isBusy} loading={saveMutation.isPending && !uploadMutation.isPending} />
        </View>
      </View>
    </SafeAreaView>
  );
}
