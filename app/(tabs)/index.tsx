import { AppHeader, FilterChip, PrimaryButton, SectionHeader, TagPill } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, shadow } = BrandTheme;

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Your Daily Edit" eyebrow="modario" right={<Bell size={20} color={palette.burgundy} />} />

        <View className="overflow-hidden rounded-3xl border" style={{ borderColor: palette.line, backgroundColor: palette.paper }}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=80' }} style={{ width: '100%', height: 192 }} />
          <LinearGradient colors={[palette.burgundy, palette.burgundySoft]}>
            <View className="p-5">
              <Text className="font-InterBold text-[30px] leading-[34px] text-white">Today&apos;s Signature Look</Text>
              <Text className="mt-1 font-InterRegular text-sm text-[#F8EAF0]">Casual • 68°F • Curated for your palette</Text>
              <View className="mt-3 flex-row gap-2">
                <FilterChip label="View Outfit" selected />
                <FilterChip label="♥ Save" selected />
                <FilterChip label="✦ Plan" selected />
              </View>
            </View>
          </LinearGradient>
        </View>

        <SectionHeader title="Outfit Suggestions" action="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {STARTER_OUTFITS.map((outfit) => (
              <Link key={outfit.id} href={{ pathname: '/outfit/[id]', params: { id: outfit.id, source: 'home' } }} asChild>
                <View className="w-40 overflow-hidden rounded-3xl border" style={{ borderColor: palette.line, backgroundColor: palette.paper, ...shadow.soft }}>
                  <Image source={{ uri: outfit.image }} style={{ width: '100%', height: 110 }} />
                  <View className="p-3">
                    <Text className="font-InterSemiBold text-sm" style={{ color: palette.ink }}>{outfit.title}</Text>
                    <TagPill label={outfit.occasion} />
                  </View>
                </View>
              </Link>
            ))}
          </View>
        </ScrollView>

        <SectionHeader title="Item Recommendations" action="View all" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-3">
            {RECOMMENDED_PRODUCTS.map((item) => (
              <Link key={item.id} href={{ pathname: '/discover/item/[id]', params: { id: item.id } }} asChild>
                <View className="w-36 overflow-hidden rounded-3xl border" style={{ borderColor: palette.line, backgroundColor: palette.paper }}>
                  <Image source={{ uri: item.image }} style={{ width: '100%', height: 88 }} />
                  <View className="p-3">
                    <Text className="font-InterMedium text-xs" style={{ color: palette.ink }}>{item.name}</Text>
                    <Text className="mt-1 font-InterSemiBold text-sm" style={{ color: palette.burgundy }}>{item.price}</Text>
                  </View>
                </View>
              </Link>
            ))}
          </View>
        </ScrollView>

        <View className="mb-8 mt-6 rounded-3xl border p-5" style={{ borderColor: palette.line, backgroundColor: palette.paper }}>
          <Text className="text-xs uppercase tracking-[1.4px]" style={{ color: palette.burgundySoft }}>Wardrobe Insight</Text>
          <Text className="mt-2 font-InterSemiBold text-xl" style={{ color: palette.ink }}>Your neutrals are beautifully balanced.</Text>
          <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>You wear neutrals 62% of the time. Add one bold accent top to diversify upcoming looks.</Text>
          <View className="mt-4">
            <PrimaryButton label="Open Wardrobe" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
