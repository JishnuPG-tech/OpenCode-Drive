/**
 * Search Screen
 * Search files and symbols
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, FileText, Code } from 'lucide-react-native';
import { apiClient } from '../../network/api-client';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';
import type { FindResult, SymbolResult } from '../../network/types';

type SearchTab = 'files' | 'symbols';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('files');
  const [fileResults, setFileResults] = useState<FindResult[]>([]);
  const [symbolResults, setSymbolResults] = useState<SymbolResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      if (activeTab === 'files') {
        const results = await apiClient.findFiles(query);
        setFileResults(results);
      } else {
        const results = await apiClient.findSymbols(query);
        setSymbolResults(results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFileResult = ({ item }: { item: FindResult }) => (
    <View style={[styles.resultItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.bgTertiary }]}>
        <FileText size={18} color={theme.primary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultFile, { color: theme.text }]} numberOfLines={1}>
          {item.file}
        </Text>
        <Text style={[styles.resultLine, { color: theme.textMuted }]}>
          Line {item.line}, Col {item.column}
        </Text>
        <Text style={[styles.resultMatch, { color: theme.accent }]} numberOfLines={2}>
          {item.match}
        </Text>
      </View>
    </View>
  );

  const renderSymbolResult = ({ item }: { item: SymbolResult }) => (
    <View style={[styles.resultItem, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.bgTertiary }]}>
        <Code size={18} color={theme.secondary} />
      </View>
      <View style={styles.resultInfo}>
        <Text style={[styles.resultSymbol, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.resultKind, { color: theme.textMuted }]}>{item.kind}</Text>
        <Text style={[styles.resultFile, { color: theme.accent }]} numberOfLines={1}>
          {item.file}:{item.line}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchContainer, { borderBottomColor: theme.border }]}>
        <View style={[styles.searchBox, { backgroundColor: theme.bgTertiary, borderColor: theme.border }]}>
          <Search size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Search files or symbols..."
            placeholderTextColor={theme.textMuted}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'files' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('files')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'files' ? theme.primary : theme.textMuted },
            ]}
          >
            Files
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'symbols' && { borderBottomColor: theme.primary }]}
          onPress={() => setActiveTab('symbols')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'symbols' ? theme.primary : theme.textMuted },
            ]}
          >
            Symbols
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : activeTab === 'files' ? (
        <FlatList
          data={fileResults}
          renderItem={renderFileResult}
          keyExtractor={(item, index) => `${item.file}-${index}`}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={symbolResults}
          renderItem={renderSymbolResult}
          keyExtractor={(item, index) => `${item.name}-${index}`}
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
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultFile: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultLine: {
    fontSize: 12,
    marginTop: 2,
  },
  resultMatch: {
    fontSize: 13,
    marginTop: 4,
  },
  resultSymbol: {
    fontSize: 15,
    fontWeight: '600',
  },
  resultKind: {
    fontSize: 12,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
