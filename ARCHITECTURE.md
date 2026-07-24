# Architecture Overview

## Project Structure

```
src/
  __tests__/                # Unit tests for network, hooks, and utils
  app/                      # Expo Router screen definitions
    _layout.tsx             # Root layout with QueryClientProvider and Stack navigator
    query-provider.tsx      # TanStack Query provider configuration
    splash.tsx              # Initial loading screen
    onboarding.tsx          # First-time server connection setup
    (tabs)/                 # Bottom tab navigator screens
      _layout.tsx           # Tab bar configuration with 5 tabs
      index.tsx             # Home screen: session list and connection status
      files.tsx             # File browser screen
      terminal.tsx          # PTY terminal management screen
      search.tsx            # File and symbol search screen
      settings.tsx          # Server profiles, theme, font size configuration
    session/
      [id].tsx             # Individual chat session screen with streaming
  components/               # Reusable UI components
    AnimatedCard.tsx        # Press-animated card with Reanimated
    TypingIndicator.tsx     # Animated typing dots indicator
    VirtualizedList.tsx     # FlashList wrapper with empty state
  features/                 # Feature-specific logic (future use)
  hooks/                    # Custom React hooks
    useApi.ts              # TanStack Query hooks for all API operations
    useConnection.ts       # SSE connection lifecycle hook
  lib/                      # Facade exports for core modules
    index.ts               # Re-exports apiClient, getSSEClient, storage, useAppStore
  models/                   # TypeScript type definitions (future use)
  network/                  # Network layer
    api-client.ts          # Axios HTTP client with auth interceptors and retry logic
    endpoints.ts           # All 45 endpoint definitions for OpenCode Serve v1.18.3
    sse-client.ts          # SSE client with health checks, heartbeat, reconnection
    types.ts               # Complete TypeScript type definitions (441 lines)
  services/                 # Business logic services (future use)
  storage/                  # Persistent storage layer
    mmkv.ts               # MMKV wrapper for profiles, settings, cache, onboarding
  store/                    # Global state management
    index.ts              # Zustand store with connection, sessions, messages, streaming state
  theme/                    # Theme configuration
    index.ts              # Material Design 3 dark, light, and system theme colors
  utils/                    # Utility functions
    animations.ts         # Reanimated spring/timing configurations and helpers
    cache.ts              # In-memory cache with TTL support
    haptics.ts            # Platform-aware haptic feedback system
    performance.ts        # Performance utilities: debounce, throttle, memoize, lazy load
```

## Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| Expo | 53.0 | Framework and build toolchain |
| React Native | 0.79.6 | Native mobile UI framework |
| Expo Router | 5.1 | File-based navigation system |
| Zustand | 5.0 | Lightweight global state management |
| TanStack Query | 5.60 | Server state management and caching |
| MMKV | 3.2 | High-performance key-value persistent storage |
| Axios | 1.7 | HTTP client with interceptor support |
| SSE (EventSource) | 1.0 | Server-Sent Events for streaming |
| Reanimated | 3.17 | Declarative animations on the UI thread |
| Gesture Handler | 2.24 | Native gesture handling |
| Flash List | 2.3 | High-performance list rendering |
| Lucide React Native | 0.460 | Icon library |
| react-native-markdown-display | 7.0 | Markdown rendering |
| expo-secure-store | 14.2 | Secure credential storage |
| expo-haptics | 57.0 | Haptic feedback API |

## Component Architecture

The app follows a layered component architecture:

1. **Screen Layer** (`src/app/`) - Defines screens using Expo Router. Each screen is a React component that composes feature components and hooks. Navigation uses file-based routing with a root Stack navigator and a bottom Tab navigator.

2. **Reusable Component Layer** (`src/components/`) - Shared UI primitives:
   - `AnimatedCard` - A pressable card with spring-based scale animation and opacity transition
   - `TypingIndicator` - Three animated dots with staggered looping animation
   - `VirtualizedList` - A `FlashList` wrapper providing efficient list rendering with empty state

3. **Hook Layer** (`src/hooks/`) - Custom hooks that encapsulate stateful logic:
   - `useApi` - TanStack Query hooks for data fetching, mutations, and cache invalidation
   - `useConnection` - SSE lifecycle management with event handling and reconnection

## Data Flow

```
User Action
    |
    v
Screen Component (e.g., ChatScreen in app/session/[id].tsx)
    |
    v
Hook (e.g., useSendMessage from hooks/useApi.ts)
    |
    v
API Client (network/api-client.ts)
    |--- Auth Interceptor adds headers from MMKV storage
    |--- Axios sends HTTP request to server
    |--- Response Interceptor handles retries on failure
    |
    v
State Updates
    |--- Zustand store updated (useAppStore)
    |--- React Query cache updated (queryClient.invalidateQueries)
    |--- UI re-renders with new data
```

For streaming:

```
Server SSE Stream
    |
    v
SSEClient (network/sse-client.ts)
    |--- Parses event stream
    |--- Emits parsed ServerEvent objects
    |
    v
useConnection Hook
    |--- Dispatches to Zustand store actions
    |--- appendStreamingContent for text parts
    |--- addMessage / updateMessagePart for new messages
    |
    v
ChatScreen Renders
    |--- Reads streamingContent from store
    |--- Displays real-time token text in message bubble
    |--- FlatList scrolls to end on content update
```

## Navigation Structure

The app uses Expo Router with a nested navigation structure:

```
Root Stack
  /splash              -> SplashScreen (initial loading, routes to onboarding or tabs)
  /onboarding          -> OnboardingScreen (first-time setup, skipped if already configured)
  /(tabs)              -> TabNavigator (bottom tabs)
    /index             -> HomeScreen (session list, connection status, new session button)
    /files             -> FilesScreen (directory browser with breadcrumb navigation)
    /terminal          -> TerminalScreen (PTY list with create/delete)
    /search            -> SearchScreen (file content and symbol search tabs)
    /settings          -> SettingsScreen (server profiles, theme, font size, cache)
  /session/[id]        -> ChatScreen (individual session messages with streaming input)
```

Navigation events trigger haptic feedback via the haptics utility (tab switches, back navigation, modal open/close).

## State Management

The app uses two complementary state management systems:

### Zustand (Client State)
Defined in `src/store/index.ts`, the `useAppStore` manages:
- **Connection** - Current SSE connection state (disconnected, connecting, connected, reconnecting, error)
- **Server Profile** - Currently active server profile
- **Sessions** - Array of session objects with add/update/remove operations
- **Active Session** - Currently selected session ID
- **Messages** - Map of session ID to message arrays
- **Streaming** - Currently streaming message ID and accumulated content
- **Models** - Available AI models list and selected model ID
- **Permissions** - Pending permission requests (add/remove)
- **Questions** - Pending question requests (add/remove)
- **Loading States** - Boolean flags for session and message loading
- **UI State** - Sidebar and settings panel open/close flags

### TanStack Query (Server State)
Defined in `src/hooks/useApi.ts`, query hooks manage:
- Query keys for sessions, messages, models, providers, config, health, files, permissions, questions
- Automatic caching with configurable `staleTime` values
- Optimistic updates via `onSuccess` callbacks that sync to Zustand store
- Mutation hooks for all write operations (create, update, delete, send)

### MMKV (Persistent State)
Defined in `src/storage/mmkv.ts`, the storage layer persists:
- Server profiles (name, URL, auth type, auth value)
- App settings (theme, font size, streaming speed, connection timeout)
- Cached data (sessions, messages, models)
- Onboarding completion status

## API Integration

The network layer consists of three main files:

- **endpoints.ts** - Centralized endpoint definitions as string constants and template literal functions. All 45 endpoints are defined in one place for maintainability.

- **api-client.ts** - Singleton Axios-based HTTP client with:
  - Request interceptor that injects authentication headers based on the active server profile's auth type (none, basic, bearer, apikey)
  - Response interceptor with automatic retry logic (up to 3 retries with exponential backoff)
  - Typed methods for every API operation (48 total methods across health, config, sessions, messages, actions, history, permissions, questions, providers, models, agents, files, search, VCS, and PTY)

- **sse-client.ts** - Singleton SSE client with:
  - Health check before connection establishment
  - Heartbeat mechanism with periodic health checks
  - Exponential backoff reconnection (configurable base delay, max delay, and max retries)
  - SSE line parsing for event/ data pairs
  - Ability to switch between session-specific and global event streams
  - Listener-based architecture for state changes and events

- **types.ts** - Complete TypeScript type definitions covering all API request/response shapes, SSE event types, and app-specific types (themes, server profiles, connection states).

## Theme System

Defined in `src/theme/index.ts`, the theme system provides:

- **Three themes**: dark (default), light, and system (follows device setting)
- **Consistent color palette** across themes: background (4 levels), text (3 levels), primary, secondary, danger, success, warning, accent
- **Material Design 3 inspired** colors with smooth contrast ratios
- **Importable** via `getThemeColors(themeName)` function
- **Persistent** selection stored in MMKV

All screens read theme colors dynamically using `storage.getTheme()` and `getThemeColors()`, passing colors directly to StyleSheet styles.

## Performance Considerations

- **FlashList** (`@shopify/flash-list`) used in `VirtualizedList` for efficient list rendering
- **Reanimated 3** animations run on the UI thread, avoiding JS thread blocking
- **InteractionManager** used for deferring heavy operations after navigation transitions
- **Debounce and throttle** utilities in `performance.ts` for frequent event handlers
- **Memoize** utility for expensive computations
- **Lazy load** utility for deferring module imports
- **Cache Manager** in `utils/cache.ts` with TTL-based eviction and max size limits
- **Memory-mapped MMKV** storage provides sub-millisecond read times compared to AsyncStorage
- **Zustand** store uses shallow equality for minimal re-renders
- **TanStack Query** stale time configuration reduces unnecessary network requests
- **Batch state updates** utility for grouping multiple state changes