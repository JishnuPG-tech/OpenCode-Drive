/**
 * Onboarding Screen
 * First-time user setup
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Server, Shield, ArrowRight } from 'lucide-react-native';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';
import { apiClient } from '../network/api-client';
import type { AuthType } from '../network/types';

const authTypes: { type: AuthType; label: string }[] = [
  { type: 'none', label: 'None' },
  { type: 'basic', label: 'Basic Auth' },
  { type: 'bearer', label: 'Bearer Token' },
  { type: 'apikey', label: 'API Key' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = getThemeColors('dark');

  const [step, setStep] = useState(0);
  const [serverName, setServerName] = useState('My Server');
  const [serverUrl, setServerUrl] = useState('');
  const [authType, setAuthType] = useState<AuthType>('none');
  const [authValue, setAuthValue] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async () => {
    if (!serverUrl.trim()) {
      setError('Server URL is required');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      apiClient.setBaseURL(serverUrl);
      const health = await apiClient.getHealth();

      if (health.healthy) {
        // Save profile
        const profile = storage.addProfile({
          name: serverName,
          url: serverUrl,
          authType,
          authValue,
          isActive: true,
        });
        storage.setActiveProfileId(profile.id);
        storage.setOnboardingComplete(true);

        router.replace('/(tabs)');
      } else {
        setError('Server is not healthy');
      }
    } catch (err) {
      setError('Failed to connect. Check the URL and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + 60 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome to OpenCode</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Connect to your OpenCode server to get started
          </Text>
        </View>

        {step === 0 ? (
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Server Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border }]}
              value={serverName}
              onChangeText={setServerName}
              placeholder="My Server"
              placeholderTextColor={theme.textMuted}
            />

            <Text style={[styles.label, { color: theme.textMuted }]}>Server URL</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border }]}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="https://your-server.com"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />

            {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                if (serverUrl.trim()) {
                  setStep(1);
                }
              }}
            >
              <Text style={[styles.nextBtnText, { color: theme.primaryText }]}>Next</Text>
              <ArrowRight size={18} color={theme.primaryText} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Authentication</Text>
            <View style={styles.authGrid}>
              {authTypes.map((a) => (
                <TouchableOpacity
                  key={a.type}
                  style={[
                    styles.authCard,
                    {
                      backgroundColor: authType === a.type ? theme.bgTertiary : theme.surface,
                      borderColor: authType === a.type ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setAuthType(a.type)}
                >
                  <Text
                    style={[
                      styles.authLabel,
                      { color: authType === a.type ? theme.text : theme.textMuted },
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {authType !== 'none' && (
              <>
                <Text style={[styles.label, { color: theme.textMuted }]}>Credentials</Text>
                <TextInput
                  style={[styles.input, { color: theme.text, backgroundColor: theme.bgTertiary, borderColor: theme.border }]}
                  value={authValue}
                  onChangeText={setAuthValue}
                  placeholder={authType === 'basic' ? 'username:password' : 'Token/Key'}
                  placeholderTextColor={theme.textMuted}
                  secureTextEntry
                />
              </>
            )}

            {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.backBtn, { borderColor: theme.border }]}
                onPress={() => setStep(0)}
              >
                <Text style={[styles.backBtnText, { color: theme.text }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.connectBtn, { backgroundColor: theme.primary }]}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                <Text style={[styles.connectBtnText, { color: theme.primaryText }]}>
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => {
        storage.setOnboardingComplete(true);
        router.replace('/(tabs)');
          }}
        >
          <Text style={[styles.skipBtnText, { color: theme.textMuted }]}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  authGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  authCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  authLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  error: {
    fontSize: 13,
    marginTop: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  connectBtn: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  connectBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipBtn: {
    marginTop: 'auto',
    marginBottom: 40,
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 14,
  },
});
