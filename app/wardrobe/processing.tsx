import { AppHeader, EmptyState, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useImportSession } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LoaderCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function ImportProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string; count?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;
  const importQuery = useImportSession(sessionId);

  useEffect(() => {
    const status = importQuery.data?.status?.toLowerCase();

    if (!status || !sessionId) {
      return;
    }

    if (status === 'review_required') {
      router.replace({ pathname: '/wardrobe/review', params: { sessionId } });
      return;
    }

    if (status === 'completed') {
      router.replace({ pathname: '/wardrobe/complete', params: { sessionId, count: String(importQuery.data?.detectedItems.length ?? 0) } });
    }
  }, [importQuery.data?.detectedItems.length, importQuery.data?.status, router, sessionId]);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Analyzing items" showBack />
      {!sessionId ? (
        <EmptyState title="Missing import session" description="Start a new wardrobe import to continue processing." action={<PrimaryButton label="Upload items" onPress={() => router.replace('/wardrobe/upload')} />} />
      ) : null}
      {sessionId ? (
        <View className="mt-20 items-center">
          <LoaderCircle size={64} color={palette.burgundy} />
          <Text className="mt-6 font-InterSemiBold text-xl" style={{ color: palette.ink }}>Reviewing your wardrobe import</Text>
          <Text className="mt-2 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
            {importQuery.data
              ? `${importQuery.data.detectedItems.length} detected item${importQuery.data.detectedItems.length === 1 ? '' : 's'} so far.`
              : 'We’re polling this exact import session and will move you forward as soon as results are ready.'}
          </Text>
          {importQuery.data?.lastError ? <Text className="mt-3 text-center font-InterRegular text-sm" style={{ color: '#B42318' }}>{importQuery.data.lastError}</Text> : null}
          {importQuery.isError ? (
            <Text className="mt-3 text-center font-InterRegular text-sm" style={{ color: '#B42318' }}>
              {importQuery.error instanceof Error ? importQuery.error.message : 'Failed to check import status.'}
            </Text>
          ) : null}
          {importQuery.data?.status?.toLowerCase() === 'failed' ? (
            <View className="mt-5">
              <PrimaryButton label="Try another upload" onPress={() => router.replace('/wardrobe/upload')} />
            </View>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
