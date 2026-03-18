import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { createBillingCheckoutSession, getBillingMe, getBillingPlans } from '@/libs/billing';
import { useAuth } from '@/provider/auth-provider';
import { useQueries } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillingScreen() {
  const { session } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [meQuery, plansQuery] = useQueries({
    queries: [
      {
        queryKey: ['billing-me'],
        enabled: Boolean(session?.access_token),
        queryFn: () => getBillingMe(session!.access_token),
        staleTime: 60 * 1000,
      },
      {
        queryKey: ['billing-plans'],
        enabled: Boolean(session?.access_token),
        queryFn: () => getBillingPlans(session!.access_token),
        staleTime: 60 * 1000,
      },
    ],
  });

  const entitlement = meQuery.data?.entitlement;
  const plans = plansQuery.data?.billing_plans ?? [];

  const startCheckout = async (planKey: string) => {
    if (!session?.access_token) {
      return;
    }

    try {
      setIsCheckingOut(true);
      const checkout = await createBillingCheckoutSession(session.access_token, planKey);
      await WebBrowser.openBrowserAsync(checkout.url);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Billing" />

      {meQuery.isLoading ? <Text className="mb-3 text-sm text-[#6B6B6B]">Loading subscription…</Text> : null}
      {meQuery.error ? <Text className="mb-3 text-sm text-[#B42318]">Failed to load billing entitlement.</Text> : null}

      <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Current Plan</Text>
        <Text className="mt-1 text-sm text-[#6B6B6B]">{entitlement?.plan_key ?? 'free'}</Text>
        <Text className="mt-2 text-sm text-[#6B6B6B]">Status: {entitlement?.status ?? 'unknown'}</Text>
        <Text className="mt-1 text-sm text-[#6B6B6B]">Entitled: {entitlement?.is_entitled ? 'Yes' : 'No'}</Text>
      </View>

      <View className="mt-3 rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Available Plans</Text>
        {plansQuery.isLoading ? <Text className="mt-2 text-sm text-[#6B6B6B]">Loading plans…</Text> : null}
        {plansQuery.error ? <Text className="mt-2 text-sm text-[#B42318]">Failed to load plans.</Text> : null}
        <View className="mt-3 gap-2">
          {plans.map((plan) => (
            <View key={plan.key} className="rounded-xl border border-[#E5E5E5] bg-[#F9F9F9] p-3">
              <Text className="font-InterSemiBold text-base text-[#1A1A1A]">{plan.name}</Text>
              <Text className="text-sm text-[#6B6B6B]">Interval: {plan.interval}</Text>
              <Text className="text-xs text-[#8A8A8A]">{plan.key}</Text>
              <View className="mt-2">
                <PrimaryButton label={isCheckingOut ? 'Opening checkout…' : `Checkout ${plan.name}`} onPress={() => startCheckout(plan.key)} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-auto gap-3 pb-3">
        <SecondaryButton label="Manage subscription" />
      </View>
    </SafeAreaView>
  );
}
