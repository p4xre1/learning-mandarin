# Store release checklist

## Identity and legal

- [ ] Confirm ownership of `app.mingdao.learn`
- [ ] Enter legal publisher identity in the in-app legal notice
- [ ] Add a monitored support email
- [ ] Publish a support page
- [ ] Publish the privacy policy at a stable public HTTPS URL
- [ ] Complete tax, banking, and paid-app agreements
- [ ] Have release-territory legal counsel review the terms and CC BY-SA use

## Content

- [ ] Editorially review all English definitions shown from CC-CEDICT
- [ ] Review Arabic and Darija interface strings with native speakers
- [ ] Verify all cultural claims and attributions
- [ ] Confirm the store listing states that only Unit 1 is interactive
- [ ] Confirm HSK packs are described as curated 250-word study packs
- [ ] Preserve MIT, CC BY-SA 4.0, and Unsplash attribution

## Android

- [ ] Install the required JDK and Android SDK
- [ ] Create and securely back up the Play upload key
- [ ] Create private `android/keystore.properties`
- [ ] Run `./gradlew test lint bundleRelease`
- [ ] Inspect the signed AAB with Android Studio APK Analyzer
- [ ] Test Android 7 through current Android on physical devices
- [ ] Test notification denial, grant, delivery, and disable flows
- [ ] Upload through Play internal testing before production

## iOS

- [ ] Configure Apple Developer team and automatic signing
- [ ] Confirm `PrivacyInfo.xcprivacy` appears in the archive
- [ ] Archive with a current supported Xcode release
- [ ] Validate the archive before upload
- [ ] Test iOS 15 through current iOS on physical iPhone and iPad
- [ ] Test notification denial, grant, delivery, and disable flows
- [ ] Test through TestFlight before App Store review

## Functional QA

- [ ] Create, lock, unlock, and delete a local profile
- [ ] Verify five failed PIN attempts trigger lockout
- [ ] Export learning data through the native share sheet
- [ ] Delete all learning data and verify a clean restart
- [ ] Complete the interactive lesson and verify duplicate XP protection
- [ ] Review cards across a date boundary
- [ ] Verify English, Arabic, Darija, LTR, and RTL layouts
- [ ] Test fully offline with airplane mode enabled
- [ ] Verify Android hardware back navigation
- [ ] Run VoiceOver and TalkBack checks
- [ ] Test reduced-motion mode and large text

## Automated quality gate

- [ ] `pnpm exec oxfmt --check src scripts capacitor.config.ts`
- [ ] `pnpm test`
- [ ] `pnpm exec tsc --noEmit`
- [ ] `pnpm build`
- [ ] `pnpm audit --prod`
- [ ] `pnpm native:sync`
- [ ] `pnpm assets:generate`
