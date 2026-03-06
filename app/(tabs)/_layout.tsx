import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#660033',
        tabBarInactiveTintColor: '#8A8A8A',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E5E5' },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} /> }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe', tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} /> }} />
      <Tabs.Screen name="outfits" options={{ title: 'Outfits', tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} /> }} />
      <Tabs.Screen name="discover" options={{ title: 'Discover', tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ href: null }} />
    </Tabs>
  );
}
