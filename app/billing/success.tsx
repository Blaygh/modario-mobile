import { AppHeader, InfoNotice, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { modarioQueryKeys, useBillingEntitlement } from '@/hooks/use-modario-data';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function BillingSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const queryClient = useQueryClient();
  const entitlementQuery = useBillingEntitlement();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: modarioQueryKeys.billingEntitlement });
  }, [queryClient]);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Billing success" subtitle="We refetch entitlement automatically after checkout returns to the app." />
      <View className="mt-8 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
        <Text className="font-InterSemiBold text-xl" style={{ color: palette.ink }}>Payment complete</Text>
        <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>Your checkout was completed successfully.</Text>
        {session_id ? <Text className="mt-2 font-InterRegular text-xs" style={{ color: palette.muted }}>Session: {session_id}</Text> : null}
      </View>
      {entitlementQuery.data ? <InfoNotice title="Current entitlement" description={`${entitlementQuery.data.planKey ?? 'free'} • ${entitlementQuery.data.status}`} /> : null}
      <View className="mt-auto pb-3">
        <Link href="/profile/billing" asChild>
          <View>
            <PrimaryButton label="Back to billing" />
          </View>
        </Link>
      </View>
    </SafeAreaView>
  );
}
