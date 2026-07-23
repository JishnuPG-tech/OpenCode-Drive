# OpenCode Mobile

A production-ready Android application that is a native client for OpenCode Serve.

## Features

- **Native Android Experience** - Smooth, fast, and animated UI
- **Real-time Streaming** - SSE-based streaming with instant token rendering
- **Multi-Session Support** - Manage multiple chat sessions
- **File Browser** - Browse and manage files on the server
- **Terminal** - PTY terminal management
- **Search** - Search files and symbols
- **Settings** - Theme, font size, server profiles
- **Offline Support** - Cache conversations and settings

## Architecture

```
src/
├── app/              # Expo Router screens
├── components/       # Reusable UI components
├── features/         # Feature-specific logic
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── network/          # API client and SSE
├── services/         # Business logic services
├── storage/          # MMKV storage
├── store/            # Zustand state management
├── theme/            # Theme configuration
└── utils/            # Utility functions
```

## Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** Expo Router
- **State:** Zustand + React Query
- **Storage:** MMKV
- **HTTP:** Axios
- **Streaming:** EventSource (SSE)
- **UI:** Custom components with Material Design 3

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Start the app
npx expo start
```

### Build for Android

```bash
# Build APK
eas build -p android --profile preview

# Build AAB (for Play Store)
eas build -p android --profile production
```

## API Integration

The app communicates with OpenCode Serve via:

- **REST API** - Session, message, and file operations
- **SSE (Server-Sent Events)** - Real-time streaming and updates

### Endpoints

- `GET /api/health` - Health check
- `GET /session` - List sessions
- `POST /session` - Create session
- `POST /session/:id/message` - Send message
- `GET /session/:id/event` - SSE stream

## Configuration

### Server Profiles

The app supports multiple server profiles with different authentication methods:

- **None** - No authentication
- **Basic Auth** - Username/password
- **Bearer Token** - Authorization header
- **API Key** - X-API-Key header

### Environment Variables

```bash
# Optional: Default server URL
EXPO_PUBLIC_DEFAULT_SERVER_URL=https://your-server.com
```

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

## Build Process

- **Phase 1:** API Documentation ✓
- **Phase 2:** Networking Layer ✓
- **Phase 3:** Storage Layer ✓
- **Phase 4:** UI Components ✓
- **Phase 5:** Chat Interface ✓
- **Phase 6:** Settings ✓
- **Phase 7:** Streaming ✓
- **Phase 8:** Performance Optimization
- **Phase 9:** Testing
- **Phase 10:** UI Polish

## License

MIT
