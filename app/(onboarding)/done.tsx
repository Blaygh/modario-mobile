import ProgressBar from '@/components/custom/progress-bar';
import { STARTER_OUTFITS } from '@/constants/mock-outfits';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingDoneScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-6 py-7">
      <ProgressBar progress={6} total={6} />
      <Text className="mt-8 font-InterBold text-[34px] text-[#1A1A1A]">You&apos;re all set.</Text>
      <Text className="mt-2 font-InterRegular text-lg text-[#6B6B6B]">We&apos;ll refine your style as you use the app.</Text>

      <ScrollView horizontal className="mt-8" showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-3 pb-2">
          {STARTER_OUTFITS.map((outfit) => (
            <View key={outfit.id} className="w-[220px] overflow-hidden rounded-2xl border border-[#E4E4E4] bg-white">
              <Image source={{ uri: outfit.image }} style={{ width: '100%', height: 170 }} contentFit="cover" />
              <View className="p-3">
                <Text className="font-InterMedium text-base text-[#1A1A1A]">{outfit.title}</Text>
                <View className="mt-2 self-start rounded-full bg-[#F3E7EE] px-3 py-1">
                  <Text className="font-InterMedium text-xs text-[#660033]">{outfit.occasion}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="mt-auto gap-3 pb-2 pt-6">
        <Link href="/(tabs)" asChild>
          <TouchableOpacity className="items-center rounded-2xl bg-[#660033] py-4">
            <Text className="font-InterMedium text-lg text-white">Go to Home</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity className="items-center rounded-2xl border border-[#D7D7D7] bg-white py-4">
          <Text className="font-InterMedium text-base text-[#6B6B6B]">Improve recommendations later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
