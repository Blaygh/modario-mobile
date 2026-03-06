import { AppHeader } from '@/components/custom/mvp-ui';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function Row({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-row items-center justify-between border-b border-[#EFEFEF] py-4">
        <Text className="font-InterMedium text-base text-[#1A1A1A]">{title}</Text>
        <ChevronRight size={18} color="#8A8A8A" />
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Profile" />
      <View className="items-center rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Image source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80' }} style={{ width: 84, height: 84, borderRadius: 42 }} />
        <Text className="mt-3 font-InterSemiBold text-2xl text-[#1A1A1A]">Nana</Text>
        <Text className="mt-1 font-InterRegular text-sm text-[#6B6B6B]">Saved outfits 24 • Wardrobe items 86</Text>
      </View>

      <View className="mt-4 rounded-2xl border border-[#E5E5E5] bg-white px-4">
        <Row title="Style Profile" href="/profile/style-profile" />
        <Row title="Settings" href="/profile/settings" />
        <Row title="Notifications" href="/profile/notifications" />
        <Row title="Billing" href="/profile/billing" />
      </View>
    </SafeAreaView>
  );
}
