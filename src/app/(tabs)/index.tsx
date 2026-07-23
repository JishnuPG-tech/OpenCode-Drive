/**
 * Home Screen
 * Main chat interface with session list
 */

import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, Wifi, WifiOff, Settings } from 'lucide-react-native';
import { useSessions, useCreateSession } from '../../hooks/useApi';
import { useConnection } from '../../hooks/useConnection';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);
  const { isConnected, connectionState } = useConnection();
  const { data: sessions, isLoading } = useSessions();
  const createSession = useCreateSession();

  const handleNewSession = async () => {
    try {
      const session = await createSession.mutateAsync({
        title: 'New Chat',
        directory: 'default',
      });
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const recentSessions = (sessions || []).slice(0, 10);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>OpenCode</Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Settings size={22} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: isConnected ? theme.bgTertiary : theme.surface,
              borderColor: isConnected ? theme.success : theme.danger,
            },
          ]}
        >
          {isConnected ? (
            <Wifi size={18} color={theme.success} />
          ) : (
            <WifiOff size={18} color={theme.danger} />
          )}
          <Text style={[styles.statusText, { color: theme.text }]}>
            {connectionState === 'connected'
              ? 'Connected'
              : connectionState === 'reconnecting'
              ? 'Reconnecting...'
              : connectionState === 'connecting'
              ? 'Connecting...'
              : 'Disconnected'}
          </Text>
        </View>

        {/* New Session Button */}
        <TouchableOpacity
          style={[styles.newSessionBtn, { backgroundColor: theme.primary }]}
          onPress={handleNewSession}
          activeOpacity={0.8}
          disabled={createSession.isPending}
        >
          {createSession.isPending ? (
            <ActivityIndicator color={theme.primaryText} size="small" />
          ) : (
            <Plus size={20} color={theme.primaryText} />
          )}
          <Text style={[styles.newSessionText, { color: theme.primaryText }]}>
            {createSession.isPending ? 'Creating...' : 'New Session'}
          </Text>
        </TouchableOpacity>

        {/* Recent Sessions */}
        {isLoading ? (
          <ActivityIndicator color={theme.primary} style={styles.loader} />
        ) : recentSessions.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Recent Sessions
            </Text>
            {recentSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                style={[styles.sessionItem, { backgroundColor: theme.surface }]}
                onPress={() => router.push(`/session/${session.id}`)}
              >
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionTitle, { color: theme.text }]} numberOfLines={1}>
                    {session.title || 'Untitled'}
                  </Text>
                  <Text style={[styles.sessionTime, { color: theme.textMuted }]}>
                    {new Date(session.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
                {session.status === 'busy' && (
                  <ActivityIndicator color={theme.primary} size="small" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>
              No sessions yet. Create one to get started!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  newSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
    marginBottom: 28,
  },
  newSessionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  sessionInfo: {
    flex: 1,
    marginRight: 10,
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 14,
  },
});
