import { AppHeader, EmptyState } from '@/components/custom/mvp-ui';
import { BrandTheme } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { palette } = BrandTheme;

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 px-4 py-4" style={{ backgroundColor: palette.ivory }}>
      <AppHeader title="Notifications" showBack subtitle="Notification settings are hidden in this MVP until the backend preferences contract exists." />
      <EmptyState title="Notifications hidden for now" description="There are no fake toggle rows here. This screen will return when notification preferences are fully wired end to end." />
    </SafeAreaView>
  );
}
