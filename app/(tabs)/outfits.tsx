import { AppHeader, FilterChip } from '@/components/custom/mvp-ui';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OutfitsLibraryScreen() {
  const [active, setActive] = useState('Suggested');

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Outfits" />
      <View className="mb-4 flex-row gap-2">
        {['Suggested', 'Saved', 'Planned'].map((filter) => (
          <FilterChip key={filter} label={filter} selected={active === filter} onPress={() => setActive(filter)} />
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-4 pb-6">
          {STARTER_OUTFITS.map((outfit) => (
            <Link key={outfit.id} href={{ pathname: '/outfit/[id]', params: { id: outfit.id, source: 'outfits' } }} asChild>
              <Pressable className="overflow-hidden rounded-[20px] border border-[#E5E5E5] bg-white">
                <Image source={{ uri: outfit.image }} style={{ width: '100%', height: 190 }} />
                <View className="p-4">
                  <Text className="font-InterSemiBold text-[20px] text-[#1A1A1A]">{outfit.title}</Text>
                  <Text className="mt-1 font-InterRegular text-sm text-[#6B6B6B]">{outfit.occasion} • {outfit.notes}</Text>
                  <View className="mt-3 flex-row gap-2">
                    <View className="rounded-full bg-[#F3E8EC] px-3 py-1"><Text className="text-xs text-[#660033]">Save</Text></View>
                    <Link href={{ pathname: '/plan/picker', params: { outfitId: outfit.id } }} asChild>
                      <Pressable className="rounded-full border border-[#E5E5E5] bg-white px-3 py-1"><Text className="text-xs text-[#1A1A1A]">Plan</Text></Pressable>
                    </Link>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
