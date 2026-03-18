import { AppHeader, EmptyState, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useUpdateWardrobeItemMutation, useWardrobeItemDetail } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function EditWardrobeItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const itemQuery = useWardrobeItemDetail(id);
  const updateMutation = useUpdateWardrobeItemMutation(id);

  const [role, setRole] = useState('');
  const [itemType, setItemType] = useState('');
  const [color, setColor] = useState('');
  const [style, setStyle] = useState('');
  const [fabric, setFabric] = useState('');
  const [occasion, setOccasion] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!itemQuery.data) {
      return;
    }

    setRole(itemQuery.data.role);
    setItemType(itemQuery.data.itemType);
    setColor(String(itemQuery.data.attributes.color ?? itemQuery.data.attributes.color_base ?? itemQuery.data.attributes.color_description ?? ''));
    setStyle(arrayToText(itemQuery.data.attributes.fashion_style));
    setFabric(String(itemQuery.data.attributes.fabric_guess ?? ''));
    setOccasion(arrayToText(itemQuery.data.attributes.possible_occasions));
    setNotes(typeof itemQuery.data.metadata.notes === 'string' ? itemQuery.data.metadata.notes : '');
  }, [itemQuery.data]);

  const onSave = async () => {
    if (!itemQuery.data) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        role,
        itemType,
        active: itemQuery.data.active,
        attributes: {
          ...itemQuery.data.attributes,
          color,
          color_description: color,
          fabric_guess: fabric,
          fashion_style: textToArray(style),
          possible_occasions: textToArray(occasion),
        },
        metadata: {
          ...itemQuery.data.metadata,
          notes,
          source: 'manual_edit',
        },
      });

      router.replace({ pathname: '/wardrobe/item/[id]', params: { id } });
    } catch (error) {
      Alert.alert('Unable to save item', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Edit item" showBack />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {itemQuery.isLoading ? <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>Loading current details…</Text> : null}
        {!itemQuery.isLoading && !itemQuery.data ? <EmptyState title="Wardrobe item not found" description="This item can’t be edited right now." /> : null}
        {itemQuery.data ? (
          <View className="gap-3 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line }}>
            <InputField label="Role" value={role} onChangeText={setRole} />
            <InputField label="Type" value={itemType} onChangeText={setItemType} />
            <InputField label="Color" value={color} onChangeText={setColor} />
            <InputField label="Style" value={style} onChangeText={setStyle} helper="Separate multiple styles with commas." />
            <InputField label="Fabric" value={fabric} onChangeText={setFabric} />
            <InputField label="Occasion" value={occasion} onChangeText={setOccasion} helper="Separate multiple occasions with commas." />
            <InputField label="Notes" value={notes} onChangeText={setNotes} multiline />
          </View>
        ) : null}
      </ScrollView>
      {itemQuery.data ? <PrimaryButton label="Save changes" fullWidth onPress={onSave} loading={updateMutation.isPending} /> : null}
    </SafeAreaView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  helper,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  helper?: string;
  multiline?: boolean;
}) {
  return (
    <View>
      <Text className="mb-2 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        placeholder={label}
        placeholderTextColor={palette.muted}
        className="rounded-[16px] border bg-[#FCFAF8] px-4 py-3"
        style={{ borderColor: palette.line, minHeight: multiline ? 96 : undefined, textAlignVertical: multiline ? 'top' : 'center', color: palette.ink }}
      />
      {helper ? <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>{helper}</Text> : null}
    </View>
  );
}

function arrayToText(value: unknown) {
  return Array.isArray(value) ? value.join(', ') : typeof value === 'string' ? value : '';
}

function textToArray(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
