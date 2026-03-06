import { AppHeader } from '@/components/custom/mvp-ui';
import { Camera, Upload } from 'lucide-react-native';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const OPTIONS = [
  { title: 'Take Photo', icon: Camera },
  { title: 'Upload Photos', icon: Upload, href: '/wardrobe/upload' },
];

export default function AddItemEntryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Add Items" />
      <Text className="mb-5 font-InterRegular text-base text-[#6B6B6B]">Choose how you want to add wardrobe items.</Text>
      <View className="gap-3">
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const card = (
            <Pressable className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-[#F3E8EC]"><Icon size={20} color="#660033" /></View>
                <Text className="font-InterMedium text-lg text-[#1A1A1A]">{option.title}</Text>
              </View>
            </Pressable>
          );
          return option.href ? <Link key={option.title} href={option.href as '/wardrobe/upload'} asChild>{card}</Link> : <View key={option.title}>{card}</View>;
        })}
      </View>
    </SafeAreaView>
  );
}
