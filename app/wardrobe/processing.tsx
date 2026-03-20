import { AppHeader, EmptyState, InfoNotice, PrimaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useImportSession } from '@/hooks/use-modario-data';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LoaderCircle } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

const STATUS_COPY: Record<string, { title: string; description: string }> = {
  uploaded: { title: 'Upload received', description: 'Your images are stored. Detection will begin shortly.' },
  detecting: { title: 'Detecting items', description: 'We’re identifying each wardrobe piece from this exact import session.' },
  review_required: { title: 'Review needed', description: 'We found items that need confirmation before they are committed.' },
  committed: { title: 'Import committed', description: 'Your reviewed wardrobe items have been added successfully.' },
  failed: { title: 'Import failed', description: 'This session could not be completed. You can start a new import.' },
};

export default function ImportProcessingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;
  const importQuery = useImportSession(sessionId);
  const status = importQuery.data?.status?.toLowerCase() ?? 'uploaded';
  const copy = STATUS_COPY[status] ?? STATUS_COPY.uploaded;

  useEffect(() => {
    if (!sessionId || !importQuery.data?.status) {
      return;
    }

    if (status === 'review_required') {
      router.replace({ pathname: '/wardrobe/review', params: { sessionId } });
      return;
    }

    if (status === 'committed') {
      router.replace({
        pathname: '/wardrobe/complete',
        params: { sessionId, count: String(importQuery.data.importedCount ?? importQuery.data.detectedItems.length) },
      });
    }
  }, [importQuery.data?.detectedItems.length, importQuery.data?.importedCount, importQuery.data?.status, router, sessionId, status]);

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Analyzing items" showBack subtitle="We’re following the real backend import status for this session." />
      {!sessionId ? (
        <EmptyState title="Missing import session" description="Start a new wardrobe import to continue processing." action={<PrimaryButton label="Upload items" onPress={() => router.replace('/wardrobe/upload')} />} />
      ) : null}

      {sessionId ? (
        <View className="mt-16 items-center">
          <LoaderCircle size={64} color={palette.burgundy} />
          <Text className="mt-6 font-InterSemiBold text-xl" style={{ color: palette.ink }}>{copy.title}</Text>
          <Text className="mt-2 px-6 text-center font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>{copy.description}</Text>

          <View className="mt-6 w-full gap-3">
            <InfoNotice title={`Status: ${status}`} description={importQuery.data?.lastError ?? 'We’ll move you forward as soon as the session is ready for review or complete.'} />
            {importQuery.data ? (
              <InfoNotice
                title="Session progress"
                description={`${importQuery.data.detectedItems.length} detected item${importQuery.data.detectedItems.length === 1 ? '' : 's'} so far.`}
              />
            ) : null}
          </View>

          {importQuery.isError ? (
            <Text className="mt-4 text-center font-InterRegular text-sm" style={{ color: '#B42318' }}>
              {importQuery.error instanceof Error ? importQuery.error.message : 'Failed to check import status.'}
            </Text>
          ) : null}

          {status === 'failed' ? (
            <View className="mt-5">
              <PrimaryButton label="Try another upload" onPress={() => router.replace('/wardrobe/upload')} />
            </View>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
