/**
 * Splash Screen
 * Initial loading screen
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';

export default function SplashScreen() {
  const router = useRouter();
  const theme = getThemeColors('dark');

  useEffect(() => {
    const timer = setTimeout(() => {
      const isOnboardingComplete = storage.isOnboardingComplete();
      if (isOnboardingComplete) {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>OpenCode</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>AI Coding Assistant</Text>
      <ActivityIndicator color={theme.primary} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  loader: {
    marginTop: 40,
  },
});
