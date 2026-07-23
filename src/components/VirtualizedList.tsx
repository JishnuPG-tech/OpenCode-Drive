/**
 * Virtualized List Component
 * FlashList wrapper for optimal performance
 */

import { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ViewToken } from 'react-native';
import { FlashList, FlashListProps } from '@shopify/flash-list';
import { getThemeColors } from '../theme';
import { storage } from '../storage/mmkv';

interface VirtualizedListProps<T> extends Omit<FlashListProps<T>, 'estimatedItemSize'> {
  data: T[];
  renderItem: FlashListProps<T>['renderItem'];
  estimatedItemSize?: number;
  emptyMessage?: string;
}

export function VirtualizedList<T>({
  data,
  renderItem,
  estimatedItemSize = 80,
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
      estimatedItemSize={estimatedItemSize}
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
