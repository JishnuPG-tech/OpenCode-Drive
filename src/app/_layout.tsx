/**
 * Root Layout
 * App entry point with providers
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryProvider } from './query-provider';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';
import { useAppStore } from '../store';

export default function RootLayout() {
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  useEffect(() => {
    const { SystemUI } = require('expo-system-ui');
    SystemUI.setBackgroundColorAsync(theme.bg);
  }, []);

  return (
    <QueryProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      />
    </QueryProvider>
  );
}
