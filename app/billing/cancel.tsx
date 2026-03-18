import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillingCancelScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Billing" />
      <View className="mt-8 rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Checkout canceled</Text>
        <Text className="mt-2 text-sm text-[#6B6B6B]">No changes were made to your subscription.</Text>
      </View>
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
