import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BrandTheme } from '@/constants/theme';

const { palette } = BrandTheme;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: palette.burgundy,
        tabBarInactiveTintColor: '#8A8A8A',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: palette.paper,
          borderTopColor: palette.line,
          height: 68,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: 'Inter-Medium', fontSize: 12 },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe', tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} /> }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfits', tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} /> }} />
      <Tabs.Screen name="plan" options={{ title: 'Planner', tabBarIcon: ({ color }) => <IconSymbol size={24} name="calendar" color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
