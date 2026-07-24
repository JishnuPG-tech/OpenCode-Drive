import { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';

interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactElement | null;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string;
  showsVerticalScrollIndicator?: boolean;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  emptyMessage = 'No items',
  ...props
}: VirtualizedListProps<T>) {
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>{emptyMessage}</Text>
      </View>
    ),
    [theme.textMuted, emptyMessage]
  );

  const keyExtractor = useCallback((item: T, index: number) => {
    if (typeof item === 'object' && item !== null && 'id' in item) {
      return (item as { id: string }).id;
    }
    return index.toString();
  }, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
