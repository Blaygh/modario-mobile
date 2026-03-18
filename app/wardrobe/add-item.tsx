import { AppHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { Camera, Upload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

const OPTIONS: { title: string; icon: typeof Camera; description: string; disabled?: boolean; href?: '/wardrobe/upload' }[] = [
  { title: 'Take photo', icon: Camera, description: 'Capture a single item once camera import is ready.', disabled: true },
  { title: 'Upload photos', icon: Upload, description: 'Import one or more wardrobe images for detection.', href: '/wardrobe/upload' },
];

export default function AddItemEntryScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Add items" showBack />
      <Text className="mb-5 font-InterRegular text-base" style={{ color: palette.muted }}>Choose how you want to add wardrobe items.</Text>
      <View className="gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <Pressable
              key={option.title}
              disabled={option.disabled}
              onPress={() => option.href && router.push(option.href)}
              className="rounded-[22px] border bg-white p-4"
              style={{ borderColor: palette.line, borderRadius: radius.card, opacity: option.disabled ? 0.6 : 1 }}>
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F3E8EC]"><Icon size={20} color={palette.burgundy} /></View>
                <View className="flex-1">
                  <Text className="font-InterMedium text-lg" style={{ color: palette.ink }}>{option.title}</Text>
                  <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>{option.description}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
