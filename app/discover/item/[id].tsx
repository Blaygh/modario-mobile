import { AppHeader, InfoNotice, TagPill } from '@/components/custom/mvp-ui';
import { RECOMMENDED_PRODUCTS } from '@/constants/mvp-data';
import { BrandTheme } from '@/constants/theme';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function ItemRecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = RECOMMENDED_PRODUCTS.find((entry) => entry.id === id) ?? RECOMMENDED_PRODUCTS[0];

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Editorial item" showBack subtitle="Discover stays honest in this release candidate: editorial previews remain visible, but unsupported commerce actions are hidden." />
      <View className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: palette.line }}>
        <Image source={{ uri: item.image }} style={{ width: '100%', height: 260 }} />
        <View className="gap-2 p-4">
          <Text className="font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{item.name}</Text>
          <Text className="font-InterSemiBold text-xl" style={{ color: palette.burgundy }}>{item.price}</Text>
          <TagPill label="Editorial preview" />
          <Text className="font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            This item is shown as a styling reference only while direct commerce and save-for-later flows are still being built end to end.
          </Text>
        </View>
      </View>
      <View className="mt-4">
        <InfoNotice title="Why there are no purchase actions here" description={item.note} />
      </View>
    </SafeAreaView>
  );
}
