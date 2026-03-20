import { AppHeader, EmptyState, FilterChip, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useUpdateWardrobeItemMutation, useWardrobeItemDetail } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;
const ROLE_OPTIONS = ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress', 'other'] as const;

export default function EditWardrobeItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const itemQuery = useWardrobeItemDetail(id);
  const updateMutation = useUpdateWardrobeItemMutation(id);

  const [role, setRole] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!itemQuery.data) {
      return;
    }

    setRole(itemQuery.data.role);
    setActive(itemQuery.data.active);
  }, [itemQuery.data]);

  const onSave = async () => {
    if (!itemQuery.data) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        role,
        active,
        itemType: itemQuery.data.itemType,
        attributes: itemQuery.data.attributes,
        metadata: itemQuery.data.metadata,
      });

      router.replace({ pathname: '/wardrobe/item/[id]', params: { id } });
    } catch (error) {
      Alert.alert('Unable to save item', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Edit item" showBack subtitle="In this MVP you can update the wardrobe role and whether the item is active or archived." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {itemQuery.isLoading ? <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>Loading current details…</Text> : null}
        {!itemQuery.isLoading && !itemQuery.data ? <EmptyState title="Wardrobe item not found" description="This item can’t be edited right now." /> : null}
        {itemQuery.data ? (
          <View className="gap-4 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
            <View>
              <Text className="mb-2 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>Role</Text>
              <View className="flex-row flex-wrap gap-2">
                {ROLE_OPTIONS.map((option) => (
                  <FilterChip key={option} label={option} selected={role === option} onPress={() => setRole(option)} />
                ))}
              </View>
            </View>

            <View>
              <Text className="mb-2 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>Status</Text>
              <View className="flex-row gap-2">
                <FilterChip label="Active" selected={active} onPress={() => setActive(true)} />
                <FilterChip label="Archived" selected={!active} onPress={() => setActive(false)} />
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
      {itemQuery.data ? <PrimaryButton label="Save changes" fullWidth onPress={onSave} loading={updateMutation.isPending} /> : null}
    </SafeAreaView>
  );
}
