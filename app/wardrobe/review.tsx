import { AppHeader, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { removeTrackedWardrobeImportSessionIds } from '@/libs/wardrobe-import-tracker';
import { commitWardrobeImportDecisions, getWardrobeImportDetails, ImportDetectedItem } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ReviewDecision = {
  item: ImportDetectedItem;
  include: boolean;
};

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

  const loadDetails = useCallback(async () => {
    if (!session?.access_token || !sessionId) {
      setError('Missing session details. Return to upload and try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const detail = await getWardrobeImportDetails(session.access_token, sessionId);
      setSourceImageUrl(detail.source_image?.storage_url ?? null);
      setDecisions(
        detail.detected_items.map((item) => ({
          item,
          include: true,
        })),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load import details.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, sessionId]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const selectedCount = useMemo(() => decisions.filter((decision) => decision.include).length, [decisions]);

  const onToggle = (detectedItemId: string, include: boolean) => {
    setDecisions((current) => current.map((decision) => (decision.item.detected_item_id === detectedItemId ? { ...decision, include } : decision)));
  };

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
        decisions.map((decision) => ({
          detected_item_id: decision.item.detected_item_id,
          include: decision.include,
        })),
      );

      if (session.user?.id) {
        await removeTrackedWardrobeImportSessionIds(session.user.id, [sessionId]);
      }

      router.replace('/wardrobe/complete');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to commit selected items.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Review Detected Items" />
      <Text className="mb-3 font-InterRegular text-sm text-[#6B6B6B]">Confirm each item before adding to wardrobe.</Text>
      {loading ? <Text className="mb-3 font-InterRegular text-sm text-[#6B6B6B]">Loading detected items…</Text> : null}
      {error ? <Text className="mb-3 font-InterRegular text-sm text-[#B42318]">{error}</Text> : null}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="gap-3 pb-3">
          {decisions.map((decision) => (
            <View key={decision.item.detected_item_id} className="rounded-2xl border border-[#E5E5E5] bg-white p-3">
              <View className="flex-row gap-3">
                <Image source={{ uri: decision.item.crop_storage_url ?? sourceImageUrl ?? fallbackImage }} style={{ width: 70, height: 70, borderRadius: 12 }} />
                <View className="flex-1 gap-2">
                  <TextInput defaultValue={decision.item.label ?? 'Item'} className="rounded-lg border border-[#E5E5E5] px-3 py-2" editable={false} />
                  <View className="flex-row items-center justify-between">
                    <View className="mr-2 flex-1">
                      <TextInput defaultValue={decision.item.role_suggestion ?? 'unknown'} className="rounded-lg border border-[#E5E5E5] px-3 py-2" editable={false} />
                    </View>
                    <View className="items-center">
                      <Text className="mb-1 font-InterRegular text-xs text-[#6B6B6B]">Include</Text>
                      <Switch value={decision.include} onValueChange={(next) => onToggle(decision.item.detected_item_id, next)} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="gap-2 pb-2 pt-4">
        <Pressable onPress={onCommit} disabled={saving || !decisions.length}>
          <PrimaryButton label={saving ? 'Saving…' : `Save ${selectedCount} Items`} />
        </Pressable>
        <SecondaryButton
          label="Select all"
          onPress={() => setDecisions((current) => current.map((decision) => ({ ...decision, include: true })))}
        />
        <Link href="/wardrobe/add-item" asChild>
          <View>
            <SecondaryButton label="Cancel" />
          </View>
        </Link>
      </View>
    </SafeAreaView>
  );
}
