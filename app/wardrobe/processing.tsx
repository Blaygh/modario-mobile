import { AppHeader } from '@/components/custom/mvp-ui';
import { isReviewRequiredStatus, listWardrobeImports } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useRouter } from 'expo-router';
import { LoaderCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ImportProcessingScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkImports = async () => {
    if (!session?.access_token) {
      setError('Please sign in again to continue.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await listWardrobeImports(session.access_token, 20, 0);
      const reviewSession = data.import_sessions.find((sessionItem) => isReviewRequiredStatus(sessionItem.status));

      if (reviewSession) {
        router.replace({ pathname: '/wardrobe/review', params: { sessionId: reviewSession.id } });
        return;
      }

      router.replace('/wardrobe/complete');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check imports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkImports();
  }, [session?.access_token]);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Analyzing Items" />
      <View className="mt-20 items-center">
        <LoaderCircle size={64} color="#660033" />
        <Text className="mt-6 font-InterSemiBold text-xl text-[#1A1A1A]">Detecting your wardrobe</Text>
        <Text className="mt-2 text-center font-InterRegular text-sm text-[#6B6B6B]">We&apos;re identifying type, color and tags so you can review before saving.</Text>
        {loading ? <Text className="mt-3 font-InterRegular text-sm text-[#6B6B6B]">Checking import status…</Text> : null}
        {error ? <Text className="mt-3 text-center font-InterRegular text-sm text-[#B42318]">{error}</Text> : null}
      </View>
      <View className="mb-8 mt-auto">
        <Pressable onPress={checkImports} className="items-center rounded-xl bg-[#660033] py-3">
          <Text className="font-InterSemiBold text-white">Retry status check</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
