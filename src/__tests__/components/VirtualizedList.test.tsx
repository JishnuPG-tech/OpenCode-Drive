import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { VirtualizedList } from '../../components/VirtualizedList';

jest.mock('../../storage/mmkv', () => ({
  storage: {
    getTheme: jest.fn().mockReturnValue('dark'),
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
    getNumber: jest.fn(),
    getBoolean: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('@shopify/flash-list', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    FlashList: jest.fn(({ data, renderItem, keyExtractor, ListEmptyComponent, ...props }) => {
      if (!data || data.length === 0) {
        return ListEmptyComponent ? React.createElement(ListEmptyComponent) : null;
      }
      return React.createElement(View, props,
        ...data.map((item: any, index: number) => {
          const key = keyExtractor ? keyExtractor(item, index) : index.toString();
          return React.createElement(View, { key }, renderItem({ item, index }));
        })
      );
    }),
  };
});

describe('VirtualizedList', () => {
  it('should render items from data array', () => {
    const data = [{ id: '1', title: 'Item 1' }, { id: '2', title: 'Item 2' }];

    const { getByText } = render(
      <VirtualizedList
        data={data}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should render empty state when data is empty', () => {
    const { getByText } = render(
      <VirtualizedList
        data={[]}
        renderItem={() => null}
        emptyMessage="Nothing here"
      />
    );

    expect(getByText('Nothing here')).toBeTruthy();
  });

  it('should render default empty message', () => {
    const { getByText } = render(
      <VirtualizedList
        data={[]}
        renderItem={() => null}
      />
    );

    expect(getByText('No items')).toBeTruthy();
  });

  it('should pass keyExtractor to FlashList', () => {
    const data = [{ id: 'item-1', label: 'Test' }];
    const keyExtractor = jest.fn((item: any, _index: number) => item.id);

    render(
      <VirtualizedList
        data={data}
        renderItem={({ item }) => <Text>{item.label}</Text>}
        keyExtractor={keyExtractor}
      />
    );

    expect(keyExtractor).toHaveBeenCalledWith(data[0], 0);
  });
});
