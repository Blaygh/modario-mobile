import { AppHeader } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useCurrentAvatar, useSavedOutfits, useWardrobeItems } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { Href, Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

function Row({ title, href }: { title: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable className="flex-row items-center justify-between border-b py-4" style={{ borderColor: palette.line }}>
        <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>{title}</Text>
        <ChevronRight size={18} color={palette.muted} />
      </Pressable>
    </Link>
  );
}

export default function ProfileScreen() {
  const currentAvatarQuery = useCurrentAvatar();
  const savedOutfitsQuery = useSavedOutfits();
  const wardrobeQuery = useWardrobeItems();

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Profile" eyebrow="personal style" />
      <View className="items-center border bg-white p-5" style={{ borderColor: palette.line, borderRadius: radius.card }}>
        <Image source={{ uri: currentAvatarQuery.data?.imageUrl ?? fallbackAvatar }} style={{ width: 84, height: 84, borderRadius: 42 }} contentFit="cover" />
        <Text className="mt-3 font-InterSemiBold text-2xl" style={{ color: palette.ink }}>Your Modario profile</Text>
        <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
          Saved outfits {savedOutfitsQuery.data?.length ?? 0} • Wardrobe items {wardrobeQuery.data?.length ?? 0}
        </Text>
        {currentAvatarQuery.data?.label ? <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>{currentAvatarQuery.data.label}</Text> : null}
      </View>

      <View className="mt-4 border bg-white px-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
        <Row title="Style Profile" href="/profile/style-profile" />
        <Row title="Settings" href="/profile/settings" />
        <Row title="Notifications" href="/profile/notifications" />
        <Row title="Billing" href="/profile/billing" />
      </View>
    </SafeAreaView>
  );
}

const fallbackAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';
