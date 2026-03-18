import { AppHeader, PrimaryButton } from '@/components/custom/mvp-ui';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillingSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Billing Success" />
      <View className="mt-8 rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Payment complete</Text>
        <Text className="mt-2 text-sm text-[#6B6B6B]">Your checkout was completed successfully.</Text>
        {session_id ? <Text className="mt-2 text-xs text-[#8A8A8A]">Session: {session_id}</Text> : null}
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
