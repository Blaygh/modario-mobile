import { ErrorNotice, OnboardingFooter, OnboardingScreen, SelectionCard } from '@/components/custom/onboarding-ui';
import { BrandTheme } from '@/constants/theme';
import { useOnboardingState, useSaveOnboardingDraftMutation, useUploadAvatarReferenceMutation } from '@/hooks/use-onboarding';
import { useAuth } from '@/provider/auth-provider';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Camera, ImagePlus, Trash2 } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

const { palette } = BrandTheme;

type SlotKey = 'front' | 'side';
type SlotState = { localUri: string | null; remotePath: string | null };

export default function AvatarUploadScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const onboardingStateQuery = useOnboardingState();
  const uploadMutation = useUploadAvatarReferenceMutation();
  const saveDraftMutation = useSaveOnboardingDraftMutation();
  const [slots, setSlots] = useState<Record<SlotKey, SlotState>>({
    front: { localUri: null, remotePath: null },
    side: { localUri: null, remotePath: null },
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urls = onboardingStateQuery.data?.avatarImageUrls ?? [];
    setSlots({
      front: { localUri: typeof urls[0] === 'string' && urls[0].startsWith('http') ? urls[0] : null, remotePath: urls[0] ?? null },
      side: { localUri: typeof urls[1] === 'string' && urls[1].startsWith('http') ? urls[1] : null, remotePath: urls[1] ?? null },
    });
  }, [onboardingStateQuery.data?.avatarImageUrls]);

  const uploadedPaths = useMemo(() => Object.values(slots).flatMap((slot) => (slot.remotePath ? [slot.remotePath] : [])), [slots]);

  const updateSlot = async (slot: SlotKey, mode: 'camera' | 'gallery') => {
    if (!session?.user?.id) {
      Alert.alert('Not signed in', 'Please sign in again to continue.');
      return;
    }

    setError(null);
    const permission = mode === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', `Please allow ${mode === 'camera' ? 'camera' : 'photo'} access to continue.`);
      return;
    }

    const result =
      mode === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9, allowsMultipleSelection: false });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    setSlots((current) => ({ ...current, [slot]: { ...current[slot], localUri: asset.uri } }));

    try {
      const remotePath = await uploadMutation.mutateAsync({ userId: session.user.id, localUri: asset.uri });
      const nextSlots = { ...slots, [slot]: { localUri: asset.uri, remotePath } };
      setSlots(nextSlots);
      const nextPaths = Object.values(nextSlots).flatMap((item) => (item.remotePath ? [item.remotePath] : []));
      await saveDraftMutation.mutateAsync({ avatar_mode: 'upload', avatar_image_urls: nextPaths, status: 'saved' });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed. Please retry.');
    }
  };

  const removeSlot = async (slot: SlotKey) => {
    const nextSlots = { ...slots, [slot]: { localUri: null, remotePath: null } };
    setSlots(nextSlots);
    const nextPaths = Object.values(nextSlots).flatMap((item) => (item.remotePath ? [item.remotePath] : []));
    await saveDraftMutation.mutateAsync({ avatar_mode: 'upload', avatar_image_urls: nextPaths, status: 'saved' });
  };

  const continueNext = async () => {
    await saveDraftMutation.mutateAsync({ avatar_mode: 'upload', avatar_image_urls: uploadedPaths, status: 'saved' });
    router.push('/(onboarding)/done');
  };

  return (
    <OnboardingScreen
      step={5}
      total={6}
      title="Upload avatar photos"
      subtitle="At least 1 photo is required for this path. We strongly recommend both a front and side photo."
      onBack={() => router.back()}
      footer={<OnboardingFooter primaryLabel={uploadedPaths.length >= 2 ? 'Continue to finish' : 'Continue with 1 photo'} onPrimaryPress={continueNext} primaryDisabled={uploadedPaths.length < 1} primaryLoading={saveDraftMutation.isPending || uploadMutation.isPending} />}>
      {error ? <ErrorNotice label={error} /> : null}
      {([
        { key: 'front' as const, title: 'Front photo', description: 'Best for face and body-front alignment.' },
        { key: 'side' as const, title: 'Side photo', description: 'Helps improve silhouette understanding.' },
      ]).map((slot) => (
        <SelectionCard
          key={slot.key}
          title={slot.title}
          description={slot.description}
          selected={Boolean(slots[slot.key].remotePath)}
          media={
            slots[slot.key].localUri ? (
              <Image source={{ uri: slots[slot.key].localUri! }} style={{ width: '100%', height: 220, borderRadius: 18 }} contentFit="cover" />
            ) : (
              <View className="items-center justify-center rounded-[20px] border border-dashed bg-[#FCFAF8]" style={{ height: 200, borderColor: palette.line }}>
                <ImagePlus size={28} color={palette.burgundy} />
                <Text className="mt-3 font-InterMedium text-sm" style={{ color: palette.muted }}>
                  No photo added yet
                </Text>
              </View>
            )
          }
          trailing={
            slots[slot.key].localUri ? (
              <Pressable onPress={() => removeSlot(slot.key)} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: palette.line }}>
                <Trash2 size={16} color={palette.muted} />
              </Pressable>
            ) : null
          }
        />
      ))}
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {([
          { label: 'Choose from gallery', mode: 'gallery' as const, icon: ImagePlus },
          { label: 'Take photo', mode: 'camera' as const, icon: Camera },
        ]).map((action) => {
          const Icon = action.icon;
          return (
            <View key={action.label} className="rounded-[20px] border bg-white p-4" style={{ width: '48%', borderColor: palette.line }}>
              <Icon size={20} color={palette.burgundy} />
              <Text className="mt-3 font-InterSemiBold text-base" style={{ color: palette.ink }}>
                {action.label}
              </Text>
              <View className="mt-3" style={{ gap: 10 }}>
                <Pressable onPress={() => updateSlot('front', action.mode)} className="rounded-full border px-4 py-2" style={{ borderColor: palette.line }}>
                  <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Add front</Text>
                </Pressable>
                <Pressable onPress={() => updateSlot('side', action.mode)} className="rounded-full border px-4 py-2" style={{ borderColor: palette.line }}>
                  <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Add side</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
      <View className="rounded-[20px] border bg-white p-4" style={{ borderColor: palette.line }}>
        <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>
          Upload progress
        </Text>
        <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
          {uploadedPaths.length === 0 ? 'No photos uploaded yet.' : uploadedPaths.length === 1 ? '1 photo uploaded. Add a side photo for the preferred flow.' : 'Front and side photos uploaded.'}
        </Text>
      </View>
    </OnboardingScreen>
  );
}
