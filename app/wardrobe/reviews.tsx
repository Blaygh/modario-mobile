import { AppHeader, PrimaryButton, SecondaryButton, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { isReviewRequiredStatus, listWardrobeImports } from '@/libs/wardrobe-imports';
import { useAuth } from '@/provider/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { ClipboardList } from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export default function WardrobeReviewsScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? 'anonymous';

  const reviewSessionsQuery = useQuery({
    queryKey: ['wardrobe-review-sessions', userId],
    enabled: Boolean(session?.access_token),
    queryFn: async () => {
      const result = await listWardrobeImports(session!.access_token, 50, 0);
      return result.import_sessions.filter((sessionItem) => isReviewRequiredStatus(sessionItem.status));
    },
    refetchInterval: 15000,
  });

  const reviewSessions = reviewSessionsQuery.data ?? [];

  return (
    <SafeAreaView className="flex-1 bg-[#F7F7F7] px-4 py-4">
      <AppHeader title="Pending Reviews" eyebrow="wardrobe imports" />
      <Text className="mb-4 font-InterRegular text-sm" style={{ color: palette.muted }}>
        Review each processed upload before the detected items are committed to your wardrobe.
      </Text>

      {reviewSessionsQuery.isLoading ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: palette.muted }}>Loading pending reviews…</Text> : null}
      {reviewSessionsQuery.error ? <Text className="mb-3 font-InterRegular text-sm" style={{ color: '#B42318' }}>Failed to load pending reviews.</Text> : null}

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {reviewSessions.length ? (
          <View className="gap-3 pb-4">
            {reviewSessions.map((reviewSession, index) => (
              <View
                key={reviewSession.id}
                className="rounded-2xl border bg-white p-4"
                style={{ borderColor: palette.line, borderRadius: radius.card }}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-2">
                    <Text className="font-InterSemiBold text-lg" style={{ color: palette.ink }}>
                      Import review {index + 1}
                    </Text>
                    <TagPill label={reviewSession.status.replace(/_/g, ' ')} />
                    <Text className="font-InterRegular text-sm" style={{ color: palette.muted }}>
                      Created {formatDate(reviewSession.created_at)}
                    </Text>
                    <Text className="font-InterRegular text-xs" style={{ color: palette.muted }}>
                      Session ID: {reviewSession.id}
                    </Text>
                  </View>
                </View>
                <View className="mt-4">
                  <Link href={{ pathname: '/wardrobe/review', params: { sessionId: reviewSession.id } }} asChild>
                    <View>
                      <PrimaryButton label="Review import" />
                    </View>
                  </Link>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-10 items-center rounded-3xl border border-dashed border-[#D9CDD2] bg-white px-6 py-10">
            <ClipboardList size={42} color={palette.burgundy} />
            <Text className="mt-4 text-center font-InterSemiBold text-xl" style={{ color: palette.ink }}>
              No reviews waiting
            </Text>
            <Text className="mt-2 text-center font-InterRegular text-sm" style={{ color: palette.muted }}>
              We&apos;ll surface new import reviews here as soon as they&apos;re ready.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="gap-3 pb-2 pt-4">
        <Link href="/(tabs)/wardrobe" asChild>
          <View>
            <SecondaryButton label="Back to wardrobe" />
          </View>
        </Link>
      </View>
    </SafeAreaView>
  );
}
