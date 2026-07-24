# Versioning Strategy

## Semantic Versioning Scheme

This project follows [Semantic Versioning 2.0.0](https://semver.org/). Version numbers are structured as follows:

```
MAJOR.MINOR.PATCH
```

- **MAJOR**: Incremented when there are incompatible API changes or significant rewrites.
- **MINOR**: Incremented when new features are added in a backwards-compatible manner.
- **PATCH**: Incremented when backwards-compatible bug fixes are made.

Pre-release versions may use the suffix `-rc.X` (e.g., `1.2.0-rc.1`).

The version is defined in `package.json` field `version` and mirrored in `app.json` field `expo.version`.

## Build Number Automation Using EAS

EAS Build automatically manages build numbers for both iOS and Android.

### Android
The Android `versionCode` is managed via the `autoIncrement` flag in `eas.json`:

```json
"production": {
  "autoIncrement": true,
  "android": {
    "buildType": "app-bundle"
  }
}
```

This increments the versionCode automatically on each EAS build, so the Google Play Console always receives a unique build number.

### iOS
The iOS `buildNumber` is also automatically incremented by EAS based on the option specified in the build profile options. When `autoIncrement` is set to `true`, EAS reads the current build number from the most recent build on App Store Connect, or from the local `ios/` directory (if prebuild was run), and increments it by one.

### In the event of a failed build
If a build fails after auto-incrementing, simply restart the build; EAS doesn't commit the increment until the build succeeds.

## Version Bump Process

### Automated bump
Use `npm version` to bump all references:

```bash
# Patch bump (bugfix)
npm version patch

# Minor bump (new feature)
npm version minor

# Major bump (breaking change)
npm version major
```

This will:
- Update `package.json` version.
- Update `app.json` version (if set up with a version sync script).
- Create a git commit and tag automatically.

### Manual bump
If you cannot use the above command, update the version in both:

1. `package.json`
2. `app.json` (`expo.version` field)

Make sure versionCode and buildNumber are not set in `app.json`—they should be left to EAS to auto-increment.

### Release branches (optionally)
For larger projects, create a release branch before bumping version:

```bash
git checkout -b release/v1.x.x
npm version patch
git push --set-upstream origin release/v1.x.x
```

After the release branch is tested and approved, merge into `main` and tag.

### Triggering a production build with new version
After the version bump and merge to `main`:

```bash
npx eas build --profile production --platform all
```

This will produce a new AAB (Android) and IPA (iOS) with the new version and build numbers.

### Versioning with pre-releases
For testing purposes, create a release candidate build without bumping production version:

```bash
npm version 1.2.0-rc.1
npx eas build --profile preview
```

After testing, bump the production version and create the final build.
