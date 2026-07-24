/**
 * Files Screen
 * Browse and manage files on the server
 */

import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Folder, File, ChevronRight, RefreshCw } from 'lucide-react-native';
import { useFiles } from '../../hooks/useApi';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';
import type { FileEntry } from '../../network/types';

export default function FilesScreen() {
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const [currentPath, setCurrentPath] = useState('.');
  const [pathHistory, setPathHistory] = useState<string[]>(['.']);

  const { data: files, isLoading, refetch, isRefetching } = useFiles(currentPath);

  const handleFilePress = (file: FileEntry) => {
    if (file.type === 'directory') {
      setPathHistory([...pathHistory, file.path]);
      setCurrentPath(file.path);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const renderItem = ({ item }: { item: FileEntry }) => (
    <TouchableOpacity
      style={[styles.fileItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
      onPress={() => handleFilePress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.bgTertiary }]}>
        {item.type === 'directory' ? (
          <Folder size={20} color={theme.primary} />
        ) : (
          <File size={20} color={theme.textMuted} />
        )}
      </View>
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.fileMeta, { color: theme.textMuted }]}>
          {item.type === 'directory' ? 'Folder' : item.size ? `${(item.size / 1024).toFixed(1)} KB` : ''}
        </Text>
      </View>
      {item.type === 'directory' && (
        <ChevronRight size={18} color={theme.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Files</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <RefreshCw size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Breadcrumb */}
      <View style={[styles.breadcrumb, { borderBottomColor: theme.border }]}>
        {pathHistory.map((path, index) => (
          <TouchableOpacity
            key={path}
            onPress={() => {
              setPathHistory(pathHistory.slice(0, index + 1));
              setCurrentPath(path);
            }}
          >
            <Text
              style={[
                styles.breadcrumbText,
                { color: index === pathHistory.length - 1 ? theme.primary : theme.textMuted },
              ]}
            >
              {path === '.' ? 'Root' : path.split('/').pop()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* File List */}
      {isLoading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={files || []}
          renderItem={renderItem}
          keyExtractor={(item) => item.path}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={theme.primary} />
          }
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
  breadcrumb: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  breadcrumbText: {
    fontSize: 13,
    fontWeight: '500',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  fileItem: {
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
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '500',
  },
  fileMeta: {
    fontSize: 12,
    marginTop: 2,
  },
});
