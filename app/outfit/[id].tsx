import { AppHeader, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OutfitDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const outfit = STARTER_OUTFITS.find((entry) => entry.id === id) ?? STARTER_OUTFITS[0];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Outfit Details" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white">
          <Image source={{ uri: outfit.image }} style={{ width: '100%', height: 250 }} />
          <View className="p-4">
            <Text className="font-InterSemiBold text-2xl text-[#1A1A1A]">{outfit.title}</Text>
            <Text className="mt-1 text-sm text-[#6B6B6B]">From {source ?? 'home'} • {outfit.occasion}</Text>
          </View>
          <View className="border-t border-[#EFEFEF] px-4 py-3 gap-2">
            {outfit.items.map((item) => <Text key={item.id} className="text-base text-[#1A1A1A]">• {item.label}</Text>)}
          </View>
        </View>
        <View className="mt-3 flex-row gap-2"><TagPill label="Work" /><TagPill label="Burgundy & Beige" /><TagPill label="Spring" /></View>
      </ScrollView>
      <View className="gap-3 pb-2 pt-3">
        <PrimaryButton label="Save Outfit" />
        <Link href={{ pathname: '/plan/picker', params: { outfitId: outfit.id } }} asChild><Pressable><SecondaryButton label="Plan Outfit" /></Pressable></Link>
        <SecondaryButton label="Add missing items to wardrobe" />
      </View>
    </SafeAreaView>
  );
}
