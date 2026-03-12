import { AppHeader, FilterChip, SectionHeader } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function DiscoverScreen() {
  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Discover" eyebrow="editorial picks" />
      <View className="flex-row gap-2">
        <FilterChip label="All" selected />
        <FilterChip label="Complete your look" />
        <FilterChip label="Work" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="Recommended for you" />
        <View className="gap-3 pb-8">
          {RECOMMENDED_PRODUCTS.map((item) => (
            <Link key={item.id} href={{ pathname: '/discover/item/[id]', params: { id: item.id } }} asChild>
              <View className="flex-row overflow-hidden rounded-3xl border bg-white" style={{ borderColor: palette.line }}>
                <Image source={{ uri: item.image }} style={{ width: 110, height: 110 }} />
                <View className="flex-1 p-3">
                  <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>{item.name}</Text>
                  <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Selected to complete your saved beige/blazer looks.</Text>
                  <Text className="mt-2 font-InterSemiBold text-base" style={{ color: palette.burgundy }}>{item.price}</Text>
                </View>
              </View>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
