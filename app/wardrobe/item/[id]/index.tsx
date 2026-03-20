import { AppHeader, EmptyState, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useUpdateWardrobeItemMutation, useWardrobeItemDetail } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function WardrobeItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const itemQuery = useWardrobeItemDetail(id);
  const updateMutation = useUpdateWardrobeItemMutation(id);
  const item = itemQuery.data;

  const toggleArchive = () => {
    if (!item) {
      return;
    }

    const nextActive = !item.active;

    Alert.alert(nextActive ? 'Restore this item?' : 'Archive this item?', nextActive ? 'This item will return to your active wardrobe.' : 'This item will move to Archived, but remain recoverable in wardrobe.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: nextActive ? 'Restore' : 'Archive',
        onPress: async () => {
          try {
            await updateMutation.mutateAsync({
              role: item.role,
              active: nextActive,
              itemType: item.itemType,
              attributes: item.attributes,
              metadata: item.metadata,
            });
            router.replace({ pathname: '/(tabs)/wardrobe' });
          } catch (error) {
            Alert.alert('Unable to update item', error instanceof Error ? error.message : 'Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Wardrobe item" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {itemQuery.isLoading ? <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>Loading wardrobe item…</Text> : null}
        {!itemQuery.isLoading && !item ? <EmptyState title="Wardrobe item not found" description="This wardrobe item may have been removed." /> : null}
        {item ? (
          <View>
            <View className="overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Image source={{ uri: item.imageUrl ?? fallbackItem }} style={{ width: '100%', height: 280 }} contentFit="cover" />
              <View className="p-4">
                <Text className="font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{toTitle(item.itemType)}</Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <TagPill label={toTitle(item.role)} />
                  <TagPill label={item.active ? 'Active' : 'Archived'} />
                  {readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description) ? (
                    <TagPill label={String(readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description))} />
                  ) : null}
                </View>
              </View>
            </View>

            <View className="mt-5 gap-3 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <Field label="Role" value={toTitle(item.role)} />
              <Field label="Type" value={toTitle(item.itemType)} />
              <Field label="Color" value={toTitle(String(readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description) ?? 'Not set'))} />
              <Field label="Style" value={formatMaybeArray(item.attributes.fashion_style) || 'Not set'} />
              <Field label="Occasion" value={formatMaybeArray(item.attributes.possible_occasions) || 'Not set'} />
              <Field label="Status" value={item.active ? 'Active in wardrobe' : 'Archived and recoverable'} />
              {item.imageError ? <Field label="Image processing" value={item.imageError} /> : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
      {item ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Edit item" onPress={() => router.push({ pathname: '/wardrobe/item/[id]/edit', params: { id: item.id } })} />
          <SecondaryButton label={item.active ? 'Archive item' : 'Restore item'} onPress={toggleArchive} loading={updateMutation.isPending} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>{label}</Text>
      <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.ink }}>{value}</Text>
    </View>
  );
}

function readableAttribute(value: unknown) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function formatMaybeArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => toTitle(String(item))).join(', ');
  }
  return typeof value === 'string' ? toTitle(value) : null;
}

function toTitle(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

const fallbackItem = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80';
