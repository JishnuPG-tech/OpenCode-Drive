# Changelog

## [1.0.0] - 2026-07-23

### Added
- `src/utils/constants.ts` exporting `NICKNAMES`, `DEFAULT_GREETING`, `SKETCH_INSTRUCTIONS`, `HEALING_DAYS`.
- Android native scaffold: `android/` Gradle project with Hermes + new-architecture enabled, debug + release signing configs, ProGuard, VERSION_NAME/VERSION_CODE.
- `ANDROID.md` documenting local build, signing env vars, EAS Build, and Play submission.

### Fixed
- Removed unused `useQueryClient` / `useUpdateConfig` imports from `src/__tests__/hooks/useApi.test.ts`.
- Renamed unused `index` parameter to `_index` in `src/__tests__/components/VirtualizedList.test.tsx`.

## v1.0.0 (Initial Release)

### Features

#### Chat and Sessions
- Full chat interface with message history and real-time streaming
- Create, rename, delete, and fork chat sessions
- Session list with recent sessions display
- Markdown rendering for AI responses
- Copy and share actions on messages
- Message abort during generation
- Session status indicators (idle, busy, error)

#### Real-time Streaming
- SSE-based streaming with instant token rendering
- Health check verification before connection
- Heartbeat mechanism for connection health monitoring
- Exponential backoff reconnection with configurable retry limits
- Session-specific and global event stream subscriptions
- Stream state management (disconnected, connecting, connected, reconnecting, error)

#### Server Profile Management
- Multiple server profiles with independent configuration
- Four authentication methods: None, Basic Auth, Bearer Token, API Key
- Active profile switching with automatic API client reconfiguration
- Profile CRUD operations (add, edit, delete, test connection)
- Server health validation during onboarding

#### File Browser
- Server-side directory navigation with breadcrumb path
- File and folder listing with type icons
- File metadata display (name, size)
- Pull-to-refresh for directory contents

#### PTY Terminal Management
- List, create, and delete pseudo-terminals
- PTY metadata display (shell type, working directory)
- Connection token generation for terminal access

#### Code Search
- File content search with line and column references
- Symbol search (functions, classes, variables) with kind classification
- Tab-based switching between file and symbol results

#### Theme System
- Dark and light themes with Material Design 3 inspired colors
- System theme option (follows device setting)
- Adjustable font size (12px to 20px)
- Consistent color tokens across all UI components

#### Application State
- Zustand-based global state management
- TanStack Query for server state with caching and revalidation
- MMKV persistent storage for settings, profiles, and cached data
- In-memory cache with TTL support for API responses
- Onboarding flow for first-time setup

#### Performance
- FlashList for efficient list rendering
- Reanimated 3 for UI thread animations
- InteractionManager-based deferred operations
- Debounce, throttle, and memoize utilities
- Lazy loading support for modules

#### Build and CI
- Expo 53 managed workflow
- EAS Build profiles for development, preview, and production
- CI pipeline with TypeScript checks, ESLint, Jest tests, Expo Doctor, and Android builds
- Jest unit tests with mock setup for MMKV, Expo Router, Axios, and React Query

#### Error Handling
- Automatic request retry with exponential backoff (up to 3 retries)
- Authentication error detection (401/403 bypass retry)
- Network timeout handling
- SSE connection error recovery
- User-facing error messages for connection failures

#### Haptic Feedback
- Impact, notification, and selection haptic types
- Platform-aware fallback to Vibration API on Android
- Context-specific haptics for buttons, navigation, forms, and streaming events