import { AppHeader, EmptyState, InfoNotice, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { modarioQueryKeys, useBillingCheckoutMutation, useBillingEntitlement, useBillingPlans } from '@/hooks/use-modario-data';
import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function BillingScreen() {
  const queryClient = useQueryClient();
  const entitlementQuery = useBillingEntitlement();
  const plansQuery = useBillingPlans();
  const checkoutMutation = useBillingCheckoutMutation();

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: modarioQueryKeys.billingEntitlement });
  }, [queryClient]);

  const startCheckout = async (planKey: string) => {
    const checkout = await checkoutMutation.mutateAsync(planKey);
    await WebBrowser.openBrowserAsync(checkout.url);
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Billing" showBack subtitle="Plans come from the backend. Manage / cancellation stays hidden until that flow is truly supported." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {entitlementQuery.isLoading ? <InfoNotice title="Loading subscription" description="We’re refreshing your current entitlement." /> : null}
        {entitlementQuery.data ? (
          <View className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
            <Text className="font-InterSemiBold text-xl" style={{ color: palette.ink }}>Current plan</Text>
            <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>{entitlementQuery.data.planKey ?? 'free'}</Text>
            <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Status: {entitlementQuery.data.status}</Text>
            <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Entitled: {entitlementQuery.data.isEntitled ? 'Yes' : 'No'}</Text>
            {entitlementQuery.data.currentPeriodEnd ? <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Renews / ends: {new Date(entitlementQuery.data.currentPeriodEnd).toLocaleDateString()}</Text> : null}
          </View>
        ) : null}

        <View className="mt-4 gap-3">
          {plansQuery.isLoading ? <InfoNotice title="Loading plans" description="We’re requesting live billing plans from the backend." /> : null}
          {plansQuery.isError ? <EmptyState title="Plans unavailable" description="We couldn’t load billing plans right now." /> : null}
          {(plansQuery.data ?? []).map((plan) => (
            <View key={plan.key} className="rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
              <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>{plan.name}</Text>
              <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>Interval: {plan.interval}</Text>
              <Text className="mt-1 font-InterRegular text-xs" style={{ color: palette.muted }}>{plan.key}</Text>
              <View className="mt-3">
                <PrimaryButton label={checkoutMutation.isPending ? 'Opening checkout…' : `Checkout ${plan.name}`} onPress={() => startCheckout(plan.key)} disabled={checkoutMutation.isPending} />
              </View>
            </View>
          ))}
        </View>

        <View className="mt-4">
          <InfoNotice title="Manage subscription" description="Manage / cancel isn’t shown yet because that backend flow is not available. We avoid implying otherwise." />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
