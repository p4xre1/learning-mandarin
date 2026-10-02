# Store privacy and data-safety declarations

This document describes the current `1.0` source. Re-check it after every SDK or
network change.

## Apple App Privacy

Recommended declaration: **Data Not Collected**.

Rationale:

- The developer does not receive profile, progress, PIN, notification, or usage
  data.
- There is no analytics, advertising, account, crash-reporting, or remote
  database SDK.
- Export occurs only after the learner invokes the native share sheet.
- All photographs and fonts are bundled.
- Local notifications are scheduled on the device.

The iOS privacy manifest declares:

- Tracking: false
- Collected data types: none
- Required-reason API: UserDefaults, reason `CA92.1`

If crash reporting, support uploads, cloud backup, remote audio, or analytics is
added, this declaration must be updated before release.

## Google Play Data safety

Recommended answers for the current build:

- Does the app collect or share required user data? **No**
- Is all user data encrypted in transit? **Not applicable; no app data is sent**
- Can users request deletion? **Yes, directly on device through Settings**
- Account creation: **No account system**
- Advertising ID: **Not used**
- Location: **Not collected**
- Contacts: **Not collected**
- Photos/files: **Not collected**
- App activity: **Stored locally only; not collected by developer**
- Personal information: **Display name is optional and encrypted locally**

## Permissions

Android application manifest requests no network, location, storage, contacts,
camera, or microphone permission. The Local Notifications library adds
notification permission where the Android version requires it.

iOS requests notification permission only after the learner enables reminders.

## Local security boundary

The PIN protects the local profile record but does not replace the operating
system passcode or protect a rooted/jailbroken device. This limitation is
disclosed in the app.
