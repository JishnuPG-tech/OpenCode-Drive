# Development Guide

## Development Setup

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/opencode-ai/opencode-mobile.git
cd opencode-mobile

# Install dependencies
npm install

# Verify the setup
npm run typecheck    # Should pass with no errors
npm run lint        # Should pass with no errors
npm test            # Should pass all tests
```

### Development Workflow

1. Start the Expo development server:
   ```bash
   npx expo start
   ```

2. Open the app on an Android emulator (press `a`) or scan the QR code with Expo Go.

3. Edit files and see instant reload via Metro bundler's Fast Refresh.

### Recommended Tools

- **Visual Studio Code** with ESLint and Prettier extensions
- **Android Studio** with AVD Manager for emulator management
- **Expo Orbit** (optional) for managing builds and devices
- **React Native DevTools** for component debugging

## Code Conventions

### TypeScript

- All code must be written in TypeScript. Strict mode is enabled in `tsconfig.json`.
- Use explicit type annotations for function parameters and return types.
- Prefer interfaces over type aliases for object shapes.
- Use `as const` for literal types and constant objects.
- Avoid `any` type. Use `unknown` when the type is not known at definition time.

### Naming Conventions

- **Files**: PascalCase for components (e.g., `AnimatedCard.tsx`), camelCase for utilities and hooks (e.g., `useConnection.ts`, `api-client.ts`).
- **Components**: PascalCase (e.g., `TypingIndicator`, `VirtualizedList`).
- **Functions**: camelCase (e.g., `getMessages`, `handleSend`).
- **Variables**: camelCase.
- **Types and Interfaces**: PascalCase (e.g., `ServerProfile`, `HealthResponse`).
- **Constants**: UPPER_SNAKE_CASE for exported constants (e.g., `API_ENDPOINTS`, `STORAGE_KEYS`).

### React Conventions

- Use functional components with hooks. No class components.
- Use `useCallback` and `useMemo` for expensive computations and stable callbacks.
- Keep components focused and single-responsibility. Extract reusable logic into custom hooks.
- Use `StyleSheet.create` for styles. Do not use inline styles except for dynamic values (theme colors).
- Use optional chaining and nullish coalescing instead of `&&` for conditional rendering where falsy values could cause issues.

### Imports Order

1. React and React Native core
2. Expo modules
3. Third-party libraries (zustand, axios, tanstack)
4. Internal modules (network, storage, store, theme, utils, hooks)
5. Types

## Testing Guidelines

The project uses Jest with `@testing-library/react-native` for unit and integration tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/__tests__/network/api-client.test.ts
```

### Test Structure

Tests are co-located in `src/__tests__/` mirroring the source structure:

```
src/__tests__/
  network/
    api-client.test.ts
  utils/
    cache.test.ts
  hooks/
    (future test files)
```

### Writing Tests

- Use `describe` blocks for grouping related tests by module.
- Use `it` blocks for individual test cases with descriptive names.
- Mock external dependencies (MMKV, Expo Router, Axios) using the mocks in `jest.setup.js`.
- Test both success and error paths.
- For React Query hooks, mock the query client and test the hook logic.
- Coverage thresholds are set at 70% for branches, functions, lines, and statements.

### Mocking

Global mocks are defined in `jest.setup.js`:

- **MMKV** - Mocked with `getString`, `set`, `delete`, `getNumber`, `getBoolean`, `getAllKeys`
- **Expo Router** - Mocked with `useRouter` and `useLocalSearchParams`
- **Safe Area** - Mocked with `useSafeAreaInsets` returning zero insets
- **Axios** - Mocked with HTTP method spies
- **React Query** - Mocked with `useQuery`, `useMutation`, `useQueryClient`
- **fetch** - Mocked globally for SSE client tests

## Build Process

### Development Build

```bash
# Start with development build
npx expo start --dev-client
```

### Android Debug APK

```bash
# Using Expo prebuild and Gradle
npx expo prebuild --platform android --no-install
cd android && ./gradlew assembleDebug
```

### EAS Build Profiles

The `eas.json` file defines three build profiles:

| Profile | Type | Use Case |
|---|---|---|
| development | Debug APK | Development testing with Expo Go-like features |
| preview | Release APK | Internal distribution and testing |
| production | Release AAB | Google Play Store submission |

```bash
# Preview build
eas build -p android --profile preview

# Production build
eas build -p android --profile production
```

### TypeScript and Lint Checks

Run these before committing:

```bash
npm run typecheck   # TypeScript compiler check
npm run lint        # ESLint code quality check
```

## Debugging Tips

### Console Logging

Use `console.log` for basic debugging. Output appears in the Metro bundler terminal. For production, avoid excessive logging.

### React Native Debugger

1. Open the developer menu (shake device or press `Ctrl+M` in emulator).
2. Select "Open React DevTools" for component tree inspection.
3. Select "Debug JS Remotely" to open Chrome DevTools with breakpoints and profiling.

### Network Inspection

To inspect API requests and SSE traffic:

```bash
# Use mitmproxy or Charles proxy for HTTPS inspection
# Set the proxy on your Android emulator:
adb shell settings put global http_proxy 10.0.2.2:8080
```

### Native Logs

```bash
# View React Native JavaScript logs
adb logcat -s ReactNativeJS

# View all app logs
adb logcat | grep -i opencode

# Filter by log level
adb logcat *:E  # Only errors
```

### SSE Stream Debugging

The SSE client logs warnings on connection errors. Enable debug mode by checking the SSE client's internal state via `getSSEClient().getState()`.

## Performance Profiling

### Using React Native Performance Monitor

Enable the performance monitor from the developer menu to track:
- FPS (frames per second)
- JS thread usage
- Native thread usage
- RAM usage

### Using Reanimated Profiler

Reanimated 3 includes a profiler that can be enabled to track animation frame drops:

```bash
# Enable Reanimated profiler in code
import { enableLayoutAnimations } from 'react-native-reanimated';
enableLayoutAnimations(true);
```

### Using Flipper (deprecated but functional)

For detailed performance analysis, use the Flipper desktop tool with plugins for React Native, layout inspection, and network monitoring.

### Performance Checklist

- Use `FlashList` instead of `FlatList` for large lists.
- Avoid inline functions in render callbacks for list items.
- Use `InteractionManager.runAfterInteractions` for non-critical operations.
- Profile component re-renders with React DevTools profiler.
- Monitor JS thread usage for expensive operations during streaming.
- Use the `measurePerformance` utility in `utils/performance.ts` for targeted profiling.
- Verify that Reanimated animations run on the UI thread and do not trigger JS thread work.