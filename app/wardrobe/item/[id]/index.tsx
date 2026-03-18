import { AppHeader, EmptyState, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useArchiveWardrobeItemMutation, useWardrobeItemDetail } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function WardrobeItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const itemQuery = useWardrobeItemDetail(id);
  const archiveMutation = useArchiveWardrobeItemMutation(id);
  const item = itemQuery.data;

  const onArchive = () => {
    if (!item) {
      return;
    }

    Alert.alert('Archive this item?', 'This will remove it from active wardrobe styling while keeping its history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          try {
            await archiveMutation.mutateAsync();
            router.replace('/(tabs)/wardrobe');
          } catch (error) {
            Alert.alert('Unable to archive', error instanceof Error ? error.message : 'Please try again.');
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
        {!itemQuery.isLoading && !item ? <EmptyState title="Wardrobe item not found" description="This wardrobe item may have been removed or archived." /> : null}
        {item ? (
          <View>
            <View className="overflow-hidden rounded-[24px] border bg-white" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Image source={{ uri: item.imageUrl ?? fallbackItem }} style={{ width: '100%', height: 280 }} contentFit="cover" />
              <View className="p-4">
                <Text className="font-InterSemiBold text-2xl" style={{ color: palette.ink }}>{toTitle(item.itemType)}</Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <TagPill label={toTitle(item.role)} />
                  {readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description) ? (
                    <TagPill label={String(readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description))} />
                  ) : null}
                  {readableAttribute(item.attributes.fabric_guess) ? <TagPill label={String(readableAttribute(item.attributes.fabric_guess))} /> : null}
                </View>
              </View>
            </View>

            <View className="mt-5 gap-3 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
              <Field label="Role" value={toTitle(item.role)} />
              <Field label="Type" value={toTitle(item.itemType)} />
              <Field label="Color" value={toTitle(String(readableAttribute(item.attributes.color || item.attributes.color_base || item.attributes.color_description) ?? 'Not set'))} />
              <Field label="Style" value={formatMaybeArray(item.attributes.fashion_style) || 'Not set'} />
              <Field label="Fabric" value={toTitle(String(readableAttribute(item.attributes.fabric_guess) ?? 'Not set'))} />
              <Field label="Occasion" value={formatMaybeArray(item.attributes.possible_occasions) || 'Not set'} />
              <Field label="Notes" value={typeof item.metadata.notes === 'string' ? item.metadata.notes : 'No notes added'} />
            </View>
          </View>
        ) : null}
      </ScrollView>
      {item ? (
        <View className="gap-3 pb-2 pt-4">
          <PrimaryButton label="Edit item" fullWidth onPress={() => router.push({ pathname: '/wardrobe/item/[id]/edit', params: { id: item.id } })} />
          <SecondaryButton label="Archive item" fullWidth onPress={onArchive} loading={archiveMutation.isPending} />
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
