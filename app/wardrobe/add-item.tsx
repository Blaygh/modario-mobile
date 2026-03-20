import { AppHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function AddItemEntryScreen() {
  const router = useRouter();

  const openCameraImport = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access to capture a wardrobe photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    router.push({ pathname: '/wardrobe/upload', params: { seedUri: result.assets[0].uri } });
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Add items" showBack subtitle="Bring in real wardrobe photos with camera capture or upload. One import session can include up to three images." />
      <View className="mt-6 gap-3">
        <EntryCard title="Take photo" description="Capture a wardrobe image now and move straight into import review." icon={Camera} onPress={openCameraImport} />
        <EntryCard title="Upload photos" description="Choose up to three images from your library for one import session." icon={Upload} onPress={() => router.push('/wardrobe/upload')} />
      </View>
    </SafeAreaView>
  );
}

function EntryCard({
  title,
  description,
  icon: Icon,
  onPress,
}: {
  title: string;
  description: string;
  icon: typeof Camera;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="rounded-[22px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F3E8EC]">
          <Icon size={20} color={palette.burgundy} />
        </View>
        <View className="flex-1">
          <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>{title}</Text>
          <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}
