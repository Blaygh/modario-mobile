import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Billing" />
      <View className="rounded-2xl border border-[#E5E5E5] bg-white p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Modario Free</Text>
        <Text className="mt-1 text-sm text-[#6B6B6B]">Basic recommendations and wardrobe management.</Text>
      </View>
      <View className="mt-3 rounded-2xl border border-[#E5E5E5] bg-[#F3E8EC] p-4">
        <Text className="font-InterSemiBold text-xl text-[#1A1A1A]">Modario Pro</Text>
        <Text className="mt-1 text-sm text-[#6B6B6B]">Advanced planning, avatar preview, and premium recommendations.</Text>
      </View>
      <View className="mt-auto gap-3 pb-3"><PrimaryButton label="Upgrade to Pro" /><SecondaryButton label="Manage subscription" /></View>
    </SafeAreaView>
  );
}
