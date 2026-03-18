import { AppHeader } from '@/components/custom/mvp-ui';
import { removeTrackedWardrobeImportSessionIds } from '@/libs/wardrobe-import-tracker';
import { getWardrobeImportDetails, isImportCompleteStatus, isImportFailedStatus, isImportProcessingStatus, isReviewRequiredStatus } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LoaderCircle } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROCESSING_POLL_INTERVAL_MS = 8000;

export default function ImportProcessingScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionIds?: string }>();
  const userId = session?.user?.id ?? null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionIds = useMemo(
    () => (typeof params.sessionIds === 'string' ? params.sessionIds.split(',').map((value) => value.trim()).filter(Boolean) : []),
    [params.sessionIds],
  );

  const checkImports = useCallback(async () => {
    if (!session?.access_token) {
      setError('Please sign in again to continue.');
      return;
    }

    if (!sessionIds.length) {
      setError('Missing import session details. Return to upload and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const importDetails = await Promise.all(sessionIds.map((sessionId) => getWardrobeImportDetails(session.access_token, sessionId)));
      const reviewSession = importDetails.find((detail) => isReviewRequiredStatus(detail.import_session.status));

      if (reviewSession) {
        if (userId) {
          await removeTrackedWardrobeImportSessionIds(userId, [reviewSession.import_session.id]);
        }

        router.replace({ pathname: '/wardrobe/review', params: { sessionId: reviewSession.import_session.id } });
        return;
      }

      if (importDetails.some((detail) => isImportProcessingStatus(detail.import_session.status))) {
        return;
      }

      if (importDetails.every((detail) => isImportCompleteStatus(detail.import_session.status))) {
        if (userId) {
          await removeTrackedWardrobeImportSessionIds(
            userId,
            importDetails.map((detail) => detail.import_session.id),
          );
        }

        router.replace('/wardrobe/complete');
        return;
      }

      const failedSession = importDetails.find((detail) => isImportFailedStatus(detail.import_session.status));

      if (failedSession) {
        if (userId) {
          await removeTrackedWardrobeImportSessionIds(userId, [failedSession.import_session.id]);
        }

        setError('One of your wardrobe imports failed. Please upload the images again.');
        return;
      }

      setError('Imports are still updating. Please retry in a moment.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to check imports.');
    } finally {
      setLoading(false);
    }
  }, [router, session?.access_token, sessionIds, userId]);

  useEffect(() => {
    checkImports();
  }, [checkImports]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      checkImports();
    }, PROCESSING_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [checkImports]);

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Analyzing Items" />
      <View className="mt-20 items-center">
        <LoaderCircle size={64} color="#660033" />
        <Text className="mt-6 font-InterSemiBold text-xl text-[#1A1A1A]">Detecting your wardrobe</Text>
        <Text className="mt-2 text-center font-InterRegular text-sm text-[#6B6B6B]">We&apos;re identifying type, color and tags so you can review before saving.</Text>
        {loading ? <Text className="mt-3 font-InterRegular text-sm text-[#6B6B6B]">Checking import status…</Text> : null}
        {!loading && !error ? <Text className="mt-3 font-InterRegular text-sm text-[#6B6B6B]">We&apos;ll keep checking in the background while you browse.</Text> : null}
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
