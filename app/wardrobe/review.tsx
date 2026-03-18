import { AppHeader, EmptyState, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { getWardrobeImportDetails, commitWardrobeImportDecisions, ImportDetectedItem } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReviewDecision = {
  item: ImportDetectedItem;
  include: boolean;
};

const { palette } = BrandTheme;
const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=240&q=80';

export default function ImportReviewScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;

  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<ReviewDecision[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!session?.access_token || !sessionId) {
        setError('Missing session details. Return to upload and try again.');
        return;
      }

      try {
        setLoading(true);
        const detail = await getWardrobeImportDetails(session.access_token, sessionId);
        setSourceImageUrl(detail.source_image?.storage_url ?? null);
        setDecisions(detail.detected_items.map((item) => ({ item, include: true })));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load import details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [session?.access_token, sessionId]);

  const selectedCount = useMemo(() => decisions.filter((decision) => decision.include).length, [decisions]);

  const onCommit = async () => {
    if (!session?.access_token || !sessionId) {
      setError('Missing session details. Return to upload and try again.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await commitWardrobeImportDecisions(
        session.access_token,
        sessionId,
        decisions.map((decision) => ({ detected_item_id: decision.item.detected_item_id, include: decision.include })),
      );
      router.replace({ pathname: '/wardrobe/complete', params: { count: String(selectedCount), sessionId } });
    } catch (commitError) {
      setError(commitError instanceof Error ? commitError.message : 'Failed to save selected items.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Review import" showBack />
      <Text className="mb-3 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
        Confirm each detected item before adding it to your wardrobe.
      </Text>
      {loading ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading detected items…</Text> : null}
      {error ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: '#B42318' }}>{error}</Text> : null}
      {!loading && !decisions.length ? <EmptyState title="No detected items" description="This import session does not have reviewable items yet." /> : null}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-3">
          {decisions.map((decision) => (
            <View key={decision.item.detected_item_id} className="rounded-[22px] border bg-white p-3" style={{ borderColor: palette.line }}>
              <View className="flex-row gap-3">
                <Image source={{ uri: decision.item.crop_storage_url ?? sourceImageUrl ?? fallbackImage }} style={{ width: 76, height: 76, borderRadius: 14 }} contentFit="cover" />
                <View className="flex-1 justify-between">
                  <View>
                    <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{decision.item.label ?? 'Detected item'}</Text>
                    <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
                      {decision.item.role_suggestion ?? 'unknown role'} • {Math.round((decision.item.confidence ?? 0) * 100)}% confidence
                    </Text>
                    <Text className="mt-2 font-InterRegular text-xs leading-5" style={{ color: palette.muted }}>
                      {Object.entries(decision.item.attributes_preview ?? {}).slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`).join(' • ') || 'No preview attributes'}
                    </Text>
                  </View>
                  <View className="mt-3 flex-row items-center justify-between">
                    <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Include item</Text>
                    <Switch value={decision.include} onValueChange={(include) => setDecisions((current) => current.map((entry) => (entry.item.detected_item_id === decision.item.detected_item_id ? { ...entry, include } : entry)))} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-3 pb-2 pt-4">
        <PrimaryButton label={saving ? 'Saving…' : `Save ${selectedCount} item${selectedCount === 1 ? '' : 's'}`} fullWidth onPress={onCommit} loading={saving} />
        <SecondaryButton label="Select all" fullWidth onPress={() => setDecisions((current) => current.map((decision) => ({ ...decision, include: true })))} />
      </View>
    </SafeAreaView>
  );
}
