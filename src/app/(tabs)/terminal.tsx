/**
 * Terminal Screen
 * PTY terminal management
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Terminal, Plus, Trash2, RefreshCw } from 'lucide-react-native';
import { apiClient } from '../../network/api-client';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';
import type { PTY } from '../../network/types';

export default function TerminalScreen() {
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const [terminals, setTerminals] = useState<PTY[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTerminals = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPTYs();
      setTerminals(data);
    } catch (error) {
      console.error('Failed to load terminals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTerminals();
  }, []);

  const handleCreateTerminal = async () => {
    try {
      const pty = await apiClient.createPTY();
      setTerminals([pty, ...terminals]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create terminal');
    }
  };

  const handleDeleteTerminal = async (id: string) => {
    Alert.alert('Delete Terminal', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.deletePTY(id);
            setTerminals(terminals.filter((t) => t.id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete terminal');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: PTY }) => (
    <View style={[styles.terminalItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.bgTertiary }]}>
        <Terminal size={20} color={theme.primary} />
      </View>
      <View style={styles.terminalInfo}>
        <Text style={[styles.terminalShell, { color: theme.text }]}>{item.shell}</Text>
        <Text style={[styles.terminalCwd, { color: theme.textMuted }]} numberOfLines={1}>
          {item.cwd}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteTerminal(item.id)}>
        <Trash2 size={18} color={theme.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Terminal</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={loadTerminals} style={styles.headerBtn}>
            <RefreshCw size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCreateTerminal} style={styles.headerBtn}>
            <Plus size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : terminals.length === 0 ? (
        <View style={styles.emptyState}>
          <Terminal size={48} color={theme.textMuted} />
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            No terminals yet. Create one to get started!
          </Text>
        </View>
      ) : (
        <FlatList
          data={terminals}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    padding: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  terminalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  terminalInfo: {
    flex: 1,
  },
  terminalShell: {
    fontSize: 15,
    fontWeight: '500',
  },
  terminalCwd: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
  },
});
