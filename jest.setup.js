/**
 * Jest Setup
 */

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      getString: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clearAll: jest.fn(),
      getNumber: jest.fn(),
      getBoolean: jest.fn(),
      getAllKeys: jest.fn().mockReturnValue([]),
    })),
  };
});

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn().mockReturnValue({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn().mockReturnValue({}),
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

// Mock React Native Safe Area
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
  SafeAreaProvider: 'SafeAreaProvider',
}));

// Mock Axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: {
      baseURL: '',
      headers: {
        common: {},
      },
    },
  }),
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn().mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  }),
  useMutation: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  }),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
  }),
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryClientProvider: 'QueryClientProvider',
}));

// Global fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    body: {
      getReader: jest.fn().mockReturnValue({
        read: jest.fn().mockResolvedValue({ done: true, value: null }),
      }),
    },
  })
);
