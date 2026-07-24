# Installation Guide

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js 22+** - Download from [nodejs.org](https://nodejs.org/) or install via nvm
- **npm** (comes with Node.js) - Version 10+ recommended
- **Expo CLI** - Install with `npm install -g expo-cli`
- **Android Studio** - Required for local builds and Android emulator ([download](https://developer.android.com/studio))
- **Java Development Kit (JDK) 17** - Required for Android builds, bundled with Android Studio
- **Git** - For version control

### Android SDK Requirements

When installing Android Studio, ensure the following SDK components are installed via the SDK Manager:

- Android SDK Platform 35 (or the target SDK version in app.json)
- Android SDK Build-Tools 35
- Android Emulator
- Android SDK Platform-Tools (adb)

## Step-by-Step Installation

### 1. Clone the Repository

```bash
git clone https://github.com/opencode-ai/opencode-mobile.git
cd opencode-mobile
```

### 2. Install Dependencies

```bash
npm install
```

If you encounter dependency conflicts, use the `--legacy-peer-deps` flag:

```bash
npm install --legacy-peer-deps
```

### 3. Install Expo CLI (if not already installed)

```bash
npm install -g expo-cli
```

### 4. Start the Development Server

```bash
npx expo start
```

This will start the Expo development server and open the Metro bundler interface in your browser.

## Environment Setup

### Environment Variables

Create a `.env` file in the project root (optional):

```bash
# Default server URL for quick setup (overrides onboarding)
EXPO_PUBLIC_DEFAULT_SERVER_URL=https://your-opencode-server.com
```

The app is designed to work without environment variables. Server connection is configured through the in-app onboarding and settings UI.

### Android SDK Setup

Set up the `ANDROID_HOME` environment variable. Add the following to your shell profile (~/.bashrc, ~/.zshrc, etc.):

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

For macOS, the Android SDK is typically located at `~/Library/Android/sdk`.

## Running on Device or Emulator

### Using Expo Go (Development)

1. Install Expo Go on your Android device from Google Play Store
2. Start the dev server with `npx expo start`
3. Scan the QR code displayed in terminal or Expo browser UI
4. The app will load on your device

### Using Android Emulator

1. Open Android Studio and launch a virtual device via AVD Manager
2. Ensure the emulator is running before starting the dev server
3. Start the dev server with `npx expo start`
4. Press `a` in the terminal to open the app on the emulator

### Using a Physical Device via USB

1. Enable Developer Options and USB Debugging on your Android device
2. Connect the device via USB
3. Run `adb devices` to verify the device is recognized
4. Start the dev server with `npx expo start`
5. Press `a` to open the app on the connected device

### Building a Standalone APK

#### Using EAS Build (recommended)

```bash
# Development build (with Expo Go-like functionality)
eas build -p android --profile development

# Preview APK (for testing)
eas build -p android --profile preview

# Production AAB (for Play Store)
eas build -p android --profile production
```

#### Local Build (without EAS)

```bash
# Prebuild the native project
npx expo prebuild --platform android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build release AAB
cd android && ./gradlew bundleRelease
```

The APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Troubleshooting

### Common Issues

**Metro bundler fails to start**
- Clear Metro cache: `npx expo start -c`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

**Android build fails with Gradle errors**
- Ensure JDK 17 is set as the default Java version
- Verify `ANDROID_HOME` environment variable is set correctly
- Run `cd android && ./gradlew clean` then retry the build
- Check Android SDK versions match those in `android/build.gradle`

**Expo Go cannot connect to dev server**
- Ensure both devices are on the same network
- Try using the `--tunnel` flag: `npx expo start --tunnel`
- Check firewall settings on your development machine

**Connection to OpenCode Serve fails**
- Verify the server URL uses correct protocol (http/https)
- Ensure the server is running and accessible from your network
- Check authentication credentials are correct
- Test the server health endpoint directly: `GET /api/health`

**TypeScript errors after pull**
- Run `npm install` to update dependencies
- Run `npx tsc --noEmit` to check for type errors
- Check TypeScript version matches `tsconfig.json` requirements

**App crashes on startup**
- Clear app data and cache from Android Settings
- Rebuild the app with `npx expo prebuild --clean --platform android`
- Check the Android Logcat output for crash traces: `adb logcat | grep -i opencode`

### Logging and Debugging

Enable verbose logging by checking the app's debug console output. For native logs:

```bash
# View Android device logs
adb logcat -s ReactNativeJS

# Filter OpenCode specific logs
adb logcat | grep -i opencode
```