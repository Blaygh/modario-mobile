import { BrandTheme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const { palette, radius, shadow } = BrandTheme;

type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'onDark';
};

type ButtonProps = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export function AppHeader({
  title,
  right,
  left,
  eyebrow,
  centered = true,
  showBack,
  subtitle,
  sideWidth = 48,
}: {
  title: string;
  right?: ReactNode;
  left?: ReactNode;
  eyebrow?: string;
  centered?: boolean;
  showBack?: boolean;
  subtitle?: string;
  sideWidth?: number;
}) {
  const router = useRouter();
  const leftNode =
    left ??
    (showBack ? (
      <Pressable onPress={() => router.back()} hitSlop={12} className="h-10 w-10 items-center justify-center rounded-full border" style={{ borderColor: palette.line, backgroundColor: palette.paper }}>
        <ChevronLeft size={18} color={palette.ink} />
      </Pressable>
    ) : (
      <View style={{ width: 40, height: 40 }} />
    ));

  return (
    <View className="mb-5 mt-1" style={{ gap: eyebrow ? 6 : 0 }}>
      {eyebrow ? (
        <Text className="text-xs uppercase tracking-[1.6px]" style={{ color: palette.burgundySoft, textAlign: centered ? 'center' : 'left' }}>
          {eyebrow}
        </Text>
      ) : null}
      <View className="justify-center" style={{ minHeight: subtitle ? 72 : 48, position: 'relative' }}>
        {centered ? (
          <View style={{ paddingHorizontal: sideWidth + 12 }}>
            <Text className="font-InterBold text-[28px] leading-[32px]" numberOfLines={1} style={{ color: palette.ink, textAlign: 'center' }}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-2 font-InterRegular text-sm leading-5" style={{ color: palette.muted, textAlign: 'center' }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : (
          <View>
            <Text className="font-InterBold text-[32px] leading-[36px]" style={{ color: palette.ink }}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-2 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        )}
        <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: sideWidth, justifyContent: 'center', alignItems: 'flex-start' }}>{leftNode}</View>
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: sideWidth, justifyContent: 'center', alignItems: 'flex-end' }}>
          {right ?? <View style={{ width: 40, height: 40 }} />}
        </View>
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

export function PrimaryButton({ label, onPress, disabled, loading, fullWidth }: ButtonProps) {
  const content = (
    <View
      className="items-center justify-center"
      style={{ minHeight: 46, paddingHorizontal: fullWidth ? 24 : 20, minWidth: fullWidth ? undefined : 132, alignSelf: fullWidth ? 'stretch' : 'flex-start', opacity: disabled ? 0.6 : 1 }}>
      {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="font-InterSemiBold text-base text-white">{label}</Text>}
    </View>
  );

  return (
    <Pressable disabled={disabled || loading} onPress={onPress} className="overflow-hidden self-start" style={{ borderRadius: 12, alignSelf: fullWidth ? 'stretch' : 'flex-start' }}>
      <LinearGradient colors={[palette.burgundy, palette.burgundySoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={shadow.soft}>{content}</View>
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled, loading, fullWidth }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className="items-center justify-center self-start border bg-white"
      style={{
        minHeight: 46,
        minWidth: fullWidth ? undefined : 120,
        paddingHorizontal: fullWidth ? 24 : 20,
        borderColor: palette.line,
        borderRadius: 12,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        opacity: disabled ? 0.6 : 1,
      }}>
      {loading ? <ActivityIndicator color={palette.ink} /> : <Text className="font-InterMedium text-base" style={{ color: palette.ink }}>{label}</Text>}
    </Pressable>
  );
}

export function FilterChip({ label, selected, onPress, tone = 'default' }: FilterChipProps) {
  const onDark = tone === 'onDark';

  return (
    <Pressable
      onPress={onPress}
      className="px-4"
      style={{
        minHeight: 36,
        justifyContent: 'center',
        borderRadius: radius.pill,
        backgroundColor: selected ? (onDark ? 'rgba(255, 255, 255, 0.22)' : palette.burgundy) : '#FFFFFF',
        borderWidth: selected ? (onDark ? 1 : 0) : 1,
        borderColor: onDark ? 'rgba(255, 255, 255, 0.35)' : palette.line,
      }}>
      <Text className="font-InterMedium text-sm" style={{ color: selected ? '#FFFFFF' : onDark ? palette.ink : palette.muted }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function TagPill({ label }: { label: string }) {
  return (
    <View className="self-start px-3 py-1" style={{ backgroundColor: palette.roseFog, borderRadius: radius.pill }}>
      <Text className="font-InterMedium text-xs" style={{ color: palette.burgundy }}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <View className="items-center rounded-[24px] border bg-white px-5 py-8" style={{ borderColor: palette.line }}>
      <Text className="text-center font-InterSemiBold text-xl" style={{ color: palette.ink }}>{title}</Text>
      <Text className="mt-2 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>{description}</Text>
      {action ? <View className="mt-4">{action}</View> : null}
    </View>
  );
}

export function InfoNotice({ title, description }: { title: string; description: string }) {
  return (
    <View className="rounded-[20px] border bg-white p-4" style={{ borderColor: palette.line }}>
      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{title}</Text>
      <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>{description}</Text>
    </View>
  );
}
