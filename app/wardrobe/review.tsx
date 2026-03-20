import { AppHeader, EmptyState, PrimaryButton, SecondaryButton } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useCommitWardrobeImportReviewMutation, useImportSession } from '@/hooks/use-modario-data';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;
const fallbackImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=240&q=80';
const ROLE_OPTIONS = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories', 'dresses', 'other'] as const;

type ReviewDecision = {
  detectedItemId: string;
  include: boolean;
  roleOverride: string | null;
};

export default function ImportReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = typeof params.sessionId === 'string' ? params.sessionId : null;
  const sessionQuery = useImportSession(sessionId, Boolean(sessionId));
  const commitMutation = useCommitWardrobeImportReviewMutation(sessionId ?? '');
  const [decisions, setDecisions] = useState<Record<string, ReviewDecision>>({});

  useEffect(() => {
    if (!sessionQuery.data?.detectedItems.length) {
      return;
    }

    setDecisions((current) => {
      if (Object.keys(current).length) {
        return current;
      }

      return Object.fromEntries(
        sessionQuery.data.detectedItems.map((item) => [
          item.detectedItemId,
          {
            detectedItemId: item.detectedItemId,
            include: true,
            roleOverride: item.roleSuggestion,
          },
        ]),
      );
    });
  }, [sessionQuery.data?.detectedItems]);

  const selectedCount = useMemo(() => Object.values(decisions).filter((decision) => decision.include).length, [decisions]);

  const onCommit = async () => {
    if (!sessionId) {
      return;
    }

    const payload = Object.values(decisions);

    const result = await commitMutation.mutateAsync(payload);
    router.replace({
      pathname: '/wardrobe/complete',
      params: { sessionId, count: String(result.imported_count ?? selectedCount) },
    });
  };

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Review import" showBack subtitle="Confirm each detected item, adjust its role if needed, and decide whether to include it." />
      <Text className="mb-3 font-InterRegular text-sm leading-6" style={{ color: palette.muted }}>
        This screen reflects the backend review-required state. Nothing is committed until you confirm.
      </Text>
      {sessionQuery.isError ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: '#B42318' }}>{sessionQuery.error instanceof Error ? sessionQuery.error.message : 'Failed to load import details.'}</Text> : null}
      {!sessionQuery.isLoading && !sessionQuery.data?.detectedItems.length ? <EmptyState title="No detected items" description="This import session does not have reviewable items yet." /> : null}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="gap-3">
          {(sessionQuery.data?.detectedItems ?? []).map((item) => {
            const decision = decisions[item.detectedItemId];
            const currentRole = decision?.roleOverride ?? item.roleSuggestion ?? 'other';
            return (
              <View key={item.detectedItemId} className="rounded-[22px] border bg-white p-3" style={{ borderColor: palette.line }}>
                <View className="flex-row gap-3">
                  <Image source={{ uri: item.cropImageUrl ?? sessionQuery.data?.sourceImageUrl ?? fallbackImage }} style={{ width: 84, height: 84, borderRadius: 16 }} contentFit="cover" />
                  <View className="flex-1">
                    <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{item.label ?? 'Detected item'}</Text>
                    <Text className="mt-1 font-InterRegular text-sm" style={{ color: palette.muted }}>
                      {item.roleSuggestion ?? 'unknown role'} • {Math.round((item.confidence ?? 0) * 100)}% confidence
                    </Text>
                    <Text className="mt-2 font-InterRegular text-xs leading-5" style={{ color: palette.muted }}>
                      {Object.entries(item.attributesPreview ?? {}).slice(0, 3).map(([key, value]) => `${key}: ${String(value)}`).join(' • ') || 'No preview attributes'}
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="font-InterMedium text-sm" style={{ color: palette.ink }}>Include item</Text>
                  <Switch
                    value={decision?.include ?? true}
                    onValueChange={(include) => setDecisions((current) => ({ ...current, [item.detectedItemId]: { ...(current[item.detectedItemId] ?? { detectedItemId: item.detectedItemId, roleOverride: item.roleSuggestion, include: true }), include } }))}
                  />
                </View>

                <Text className="mt-4 font-InterMedium text-xs uppercase tracking-[1.2px]" style={{ color: palette.muted }}>Role override</Text>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const selected = currentRole === role;
                    return (
                      <Pressable
                        key={role}
                        onPress={() => setDecisions((current) => ({ ...current, [item.detectedItemId]: { ...(current[item.detectedItemId] ?? { detectedItemId: item.detectedItemId, include: true, roleOverride: null }), roleOverride: role } }))}
                        className="rounded-full border px-3 py-2"
                        style={{ borderColor: selected ? palette.burgundy : palette.line, backgroundColor: selected ? palette.roseFog : palette.paper }}>
                        <Text className="font-InterMedium text-sm" style={{ color: selected ? palette.burgundy : palette.ink }}>{role}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className="gap-3 pb-2 pt-4">
        <PrimaryButton label={commitMutation.isPending ? 'Committing…' : `Confirm ${selectedCount} item${selectedCount === 1 ? '' : 's'}`} fullWidth onPress={onCommit} loading={commitMutation.isPending} disabled={!sessionId || !Object.keys(decisions).length} />
        <SecondaryButton label="Select all" onPress={() => setDecisions((current) => Object.fromEntries(Object.values(current).map((decision) => [decision.detectedItemId, { ...decision, include: true }]))) } />
      </View>
    </SafeAreaView>
  );
}
