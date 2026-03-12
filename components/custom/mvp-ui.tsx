import { BrandTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

const { palette, shadow } = BrandTheme;

export function AppHeader({ title, right, eyebrow }: { title: string; right?: ReactNode; eyebrow?: string }) {
  return (
    <View className="mb-5 mt-1">
      {eyebrow ? <Text className="mb-1 text-xs uppercase tracking-[1.6px]" style={{ color: palette.burgundySoft }}>{eyebrow}</Text> : null}
      <View className="flex-row items-center justify-between">
        <Text className="font-InterBold text-[32px] leading-[36px]" style={{ color: palette.ink }}>{title}</Text>
        {right ? <View>{right}</View> : <View />}
      </View>
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between">
      <Text className="font-InterSemiBold text-[21px]" style={{ color: palette.ink }}>{title}</Text>
      {action ? <Text className="font-InterMedium text-sm" style={{ color: palette.burgundy }}>{action}</Text> : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="overflow-hidden rounded-full">
      <LinearGradient colors={[palette.burgundy, palette.burgundySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View className="items-center py-3.5" style={shadow.soft}>
          <Text className="font-InterSemiBold text-base text-white">{label}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="items-center rounded-full border bg-white py-3" style={{ borderColor: palette.line }}>
      <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>{label}</Text>
    </Pressable>
  );
}

export function FilterChip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full px-4 py-2"
      style={{ backgroundColor: selected ? palette.burgundy : '#FFFFFF', borderWidth: selected ? 0 : 1, borderColor: palette.line }}>
      <Text className="font-InterMedium text-sm" style={{ color: selected ? '#FFFFFF' : palette.muted }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TagPill({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full px-3 py-1" style={{ backgroundColor: palette.roseFog }}>
      <Text className="font-InterMedium text-xs" style={{ color: palette.burgundy }}>{label}</Text>
    </View>
  );
}
