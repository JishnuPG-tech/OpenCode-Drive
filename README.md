# OpenCode Mobile

A production-ready native Android client for OpenCode Serve, the AI coding assistant. Built with React Native and Expo, this app provides a full-featured mobile interface for interacting with AI-powered coding sessions, managing files, running terminals, and searching code.

[![CI](https://github.com/opencode-ai/opencode-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/opencode-ai/opencode-mobile/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-53-black)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.79-blueviolet)](https://reactnative.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)

## Features

- **Native Android Experience** - Smooth UI with Material Design 3 theming, Reanimated animations, and haptic feedback
- **Real-time Streaming** - SSE-based token streaming with instant text rendering as the AI generates responses
- **Multi-Session Management** - Create, rename, delete, fork, and organize multiple chat sessions
- **File Browser** - Navigate server-side directory structures, view file metadata, and read file contents
- **PTY Terminal Management** - List, create, and delete server-side pseudo-terminals with shell support
- **Code Search** - Search files by content and find code symbols (functions, classes, variables) across the project
- **Server Profile Management** - Configure multiple server connections with different authentication methods
- **Offline Support** - Cache conversations, models, and settings locally using MMKV
- **Theme Customization** - Dark and light themes with adjustable font sizes
- **Connection Monitoring** - Real-time connection status indicator with automatic reconnection

## Screenshots

Screenshots will be added here once the app is available on Google Play Store.

## Quick Start

### Prerequisites

- Node.js 22+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for local builds and emulator)

### Installation

```bash
# Clone the repository
git clone https://github.com/opencode-ai/opencode-mobile.git
cd opencode-mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### First Run

1. Launch the app on your device or emulator
2. Complete the onboarding flow to connect to your OpenCode Serve instance
3. Enter your server URL and select authentication method
4. Create a new chat session and start sending messages

## Architecture Overview

```
src/
  app/              # Expo Router screens and navigation structure
  components/       # Reusable UI components (AnimatedCard, VirtualizedList, TypingIndicator)
  hooks/            # Custom React hooks for API calls and SSE connection
  lib/              # Library exports (facade for core modules)
  models/           # TypeScript type definitions and models
  network/          # API client, SSE client, endpoint definitions, and types
  services/         # Business logic services
  storage/          # MMKV-based persistent storage layer
  store/            # Zustand global state management
  theme/            # Material Design 3 inspired theme configuration
  utils/            # Animation utilities, cache management, haptics, performance helpers
```

The app uses a layered architecture: screens in `app/` consume hooks from `hooks/`, which use the API client from `network/` and state from `store/`. Persistent data flows through `storage/` via MMKV. SSE connections in `network/sse-client.ts` provide real-time updates for streaming responses.

## Documentation

- [Installation Guide](INSTALL.md)
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Development Guide](DEVELOPMENT.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## License

MIT