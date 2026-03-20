import { BrandTheme } from '@/constants/theme';
import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import ProgressBar from '@/components/custom/progress-bar';
import { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius, shadow } = BrandTheme;

export function OnboardingScreen({
  step,
  total,
  title,
  subtitle,
  children,
  footer,
  onBack,
  right,
  eyebrow,
  scroll = true,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  right?: ReactNode;
  eyebrow?: string;
  scroll?: boolean;
}) {
  const content = (
    <>
      <AppHeader title={title} eyebrow={eyebrow} showBack={Boolean(onBack)} left={onBack ? undefined : <View style={{ width: 40, height: 40 }} />} right={right} />
      <ProgressBar progress={step} total={total} />
      {subtitle ? (
        <Text className="mt-4 font-InterRegular text-base leading-6" style={{ color: palette.muted }}>
          {subtitle}
        </Text>
      ) : null}
      <View className="mt-6 flex-1" style={{ gap: 14 }}>
        {children}
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: palette.ivory }}>
      <View className="flex-1 px-4 py-4">
        {scroll ? <ScrollView showsVerticalScrollIndicator={false}>{content}</ScrollView> : <View className="flex-1">{content}</View>}
        {footer ? <View className="pt-4">{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

export function OnboardingFooter({
  primaryLabel,
  onPrimaryPress,
  primaryDisabled,
  primaryLoading,
  secondaryLabel,
  onSecondaryPress,
  secondaryDisabled,
}: {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  secondaryDisabled?: boolean;
}) {
  return (
    <View style={{ gap: 12 }}>
      <PrimaryButton label={primaryLabel} onPress={onPrimaryPress} disabled={primaryDisabled} loading={primaryLoading} fullWidth />
      {secondaryLabel && onSecondaryPress ? <SecondaryButton label={secondaryLabel} onPress={onSecondaryPress} disabled={secondaryDisabled} fullWidth /> : null}
    </View>
  );
}

export function SelectionCard({
  title,
  description,
  selected,
  onPress,
  media,
  trailing,
  badge,
}: {
  title: string;
  description?: string;
  selected?: boolean;
  onPress?: () => void;
  media?: ReactNode;
  trailing?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden bg-white"
      style={{
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? palette.burgundy : palette.line,
        borderRadius: radius.card,
        padding: 14,
        ...shadow.soft,
      }}>
      {badge ? <View style={{ position: 'absolute', right: 14, top: 14, zIndex: 1 }}>{badge}</View> : null}
      <View style={{ gap: 12 }}>
        {media}
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
              {title}
            </Text>
            {description ? (
              <Text className="mt-1 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
                {description}
              </Text>
            ) : null}
          </View>
          {trailing}
        </View>
      </View>
    </Pressable>
  );
}

export function LoadingNotice({ label }: { label: string }) {
  return (
    <View className="flex-row items-center rounded-[20px] border bg-white px-4 py-4" style={{ borderColor: palette.line, gap: 12 }}>
      <ActivityIndicator color={palette.burgundy} />
      <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
        {label}
      </Text>
    </View>
  );
}

export function ErrorNotice({ label }: { label: string }) {
  return (
    <View className="rounded-[20px] border bg-white px-4 py-4" style={{ borderColor: '#E6B8BD' }}>
      <Text className="font-InterMedium text-sm" style={{ color: '#B42318' }}>
        {label}
      </Text>
    </View>
  );
}
