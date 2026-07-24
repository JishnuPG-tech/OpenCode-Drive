/**
 * Tab Layout
 * Main navigation with bottom tabs
 */

import { Tabs } from 'expo-router';
import { MessageSquare, Folder, Terminal, Search, Settings } from 'lucide-react-native';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';

export default function TabLayout() {
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.bgSecondary,
          borderTopColor: theme.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: 'Files',
          tabBarIcon: ({ color, size }) => (
            <Folder size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="terminal"
        options={{
          title: 'Terminal',
          tabBarIcon: ({ color, size }) => (
            <Terminal size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
