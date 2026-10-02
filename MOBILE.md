# Míngdào mobile applications

Míngdào is packaged as native iOS and Android applications with Capacitor.

## Architecture

- App identifier: `app.mingdao.learn`
- Native projects: `ios/` and `android/`
- Device preferences: `@capacitor/preferences`
- Local reminders: `@capacitor/local-notifications`
- Compiled application assets: `dist/`, copied into each native project by Capacitor

Language, bookmarks, review settings, and reminder preferences are stored in the
platform preference store. Existing browser LocalStorage values are migrated on
first launch. No server account is required.

## Synchronize native projects

After changing the React application or native plugin dependencies:

```sh
pnpm native:sync
```

This runs the production web build and `cap sync`.

## Android

Requirements:

- Android Studio with a supported Android SDK
- JDK version required by the generated Gradle project
- A release signing key stored outside the repository

Open the project:

```sh
pnpm android:open
```

For a local debug build:

```sh
cd android
./gradlew assembleDebug
```

Android 13 and newer asks for notification permission after the learner enables
daily reminders. Android backup is disabled so local learning preferences are
not copied into Android cloud backup.

## iOS

Requirements:

- macOS with the current supported Xcode version
- An Apple Developer team and signing profile for release/device builds

Open the project:

```sh
pnpm ios:open
```

Select the App target, configure the publishing team and bundle signing, then
build or archive through Xcode.

## Notifications

Reminders are opt-in and scheduled locally for 19:00 in the device time zone.
They can be disabled from the in-app settings sheet or operating-system
settings. Míngdào does not currently use remote push notifications.

## Release checklist

Before an App Store or Play Store submission:

1. Replace the generated Capacitor app and splash images with final licensed
   Míngdào artwork.
2. Configure the legal publisher name, support contact, jurisdiction, store
   privacy declarations, and public privacy-policy URL.
3. Configure Android release signing and Apple signing/team settings.
4. Test notification permission, reminder delivery, preference migration,
   RTL layouts, offline behavior, and data deletion on physical devices.
5. Review all legal copy with qualified counsel for the release territories.
6. Run `pnpm native:sync` and build signed release artifacts from Android Studio
   and Xcode.
