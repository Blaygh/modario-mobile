import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export function AppHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <View className="mb-4 mt-1 flex-row items-center justify-between">
      <Text className="font-InterBold text-[28px] text-[#1A1A1A]">{title}</Text>
      {right ? <View>{right}</View> : <View />}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 mt-5 flex-row items-center justify-between">
      <Text className="font-InterSemiBold text-[20px] text-[#1A1A1A]">{title}</Text>
      {action ? <Text className="font-InterMedium text-sm text-[#660033]">{action}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center rounded-xl bg-[#660033] py-3">
      <Text className="font-InterSemiBold text-base text-white">{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center rounded-xl border border-[#E5E5E5] bg-white py-3">
      <Text className="font-InterMedium text-base text-[#1A1A1A]">{label}</Text>
    </Pressable>
  );
}

export function FilterChip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full px-4 py-1.5"
      style={{ backgroundColor: selected ? '#660033' : '#FFFFFF', borderWidth: selected ? 0 : 1, borderColor: '#E5E5E5' }}>
      <Text className="font-InterMedium text-sm" style={{ color: selected ? '#FFFFFF' : '#6B6B6B' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TagPill({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-[#F3E8EC] px-3 py-1">
      <Text className="font-InterMedium text-xs text-[#660033]">{label}</Text>
    </View>
  );
}
