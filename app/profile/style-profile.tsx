import { AppHeader, EmptyState, TagPill } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { useProfile } from '@/hooks/use-modario-data';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette, radius } = BrandTheme;

export default function StyleProfileScreen() {
  const profileQuery = useProfile();

  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Style Profile" showBack subtitle="This screen uses `/me` profile data rather than hardcoded style preferences." />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {!profileQuery.data ? <EmptyState title="Style profile unavailable" description="We couldn’t load your profile data right now." /> : null}
        {profileQuery.data ? (
          <View className="gap-4 rounded-[24px] border bg-white p-4" style={{ borderColor: palette.line, borderRadius: radius.card }}>
            <Section title="Style direction" values={profileQuery.data.styleDirection ? [profileQuery.data.styleDirection] : []} emptyLabel="No style direction saved" />
            <Section title="Selected styles" values={profileQuery.data.stylePicks} emptyLabel="No style picks saved" />
            <Section title="Liked colors" values={profileQuery.data.colorLikes} emptyLabel="No liked colors saved" />
            <Section title="Avoided colors" values={profileQuery.data.colorAvoids} emptyLabel="No color avoids saved" />
            <Section title="Occasions" values={profileQuery.data.occasions} emptyLabel="No occasion preferences saved" />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, values, emptyLabel }: { title: string; values: string[]; emptyLabel: string }) {
  return (
    <View>
      <Text className="font-InterSemiBold text-base" style={{ color: palette.ink }}>{title}</Text>
      {values.length ? (
        <View className="mt-2 flex-row flex-wrap gap-2">
          {values.map((value) => (
            <TagPill key={value} label={value.replace(/_/g, ' ')} />
          ))}
        </View>
      ) : (
        <Text className="mt-2 font-InterRegular text-sm" style={{ color: palette.muted }}>{emptyLabel}</Text>
      )}
    </View>
  );
}
