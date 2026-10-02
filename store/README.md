# Míngdào store submission

Míngdào is prepared as a **paid, one-time-purchase, local-only** application.
There is no administrator CMS, account system, subscription, advertising SDK,
analytics SDK, remote database, or cloud synchronization in this release.

## Product identifiers

- App name: `Míngdào`
- Android application ID: `app.mingdao.learn`
- Apple bundle ID: `app.mingdao.learn`
- Marketing version: `1.0`
- Android version code / Apple build number: `1`
- Minimum Android SDK: `24`
- Minimum iOS version: `15.0`

Changing either bundle identifier after publishing creates a different store
application. Confirm ownership of `app.mingdao.learn` before the first upload.

## Required publisher values

These cannot be invented in source control and must be supplied before review:

- Legal publisher name
- Support email address
- Public support URL
- Public privacy-policy URL
- Apple Developer team ID
- Google Play developer account
- App Store and Play Store price tiers
- Countries/regions of sale
- Tax and banking agreements

The in-app legal notice intentionally states that publisher identity and support
contact are pending until these values are configured.

## Build commands

```sh
pnpm install
pnpm hsk:generate
pnpm test
pnpm native:sync
pnpm assets:generate
```

Android release bundle:

```sh
cp android/keystore.properties.example android/keystore.properties
# Fill in private signing values, then:
cd android
./gradlew bundleRelease
```

iOS archive:

```sh
pnpm ios:open
```

In Xcode, select the App target, configure the developer team and signing, use a
physical-device/Any iOS Device destination, then choose Product → Archive.

## Submission blockers

Do not submit until all items in `release-checklist.md` are complete. Native
release binaries cannot be produced in this Linux environment because Android
requires a configured JDK/SDK and iOS archiving requires macOS and Xcode.
