# Google Play Store Listing — Saver

Copy-paste reference for Play Console. Same positioning as iOS: **privacy + 100% offline**.

## App name
Saver

## Short description (80 chars max)

- **English** (79 chars): `See what's safe to spend. Private budgeting that works fully offline.`
- **Arabic** (78 chars): `اعرف القابل للصرف فعليًا. ميزانية خاصة تعمل بلا إنترنت بالكامل.`

## Full description (4000 chars max)

Same copy as the App Store description (`store-listing.md`) works as-is for both languages — Google Play has no keyword field, so no separate keyword list is needed.

## Data Safety form

No analytics/crash/ad SDKs. Everything below is opt-in and only applies to users who turn on the Google Drive auto-backup toggle — with it off, the app collects and shares nothing (same as Apple's answers):
- Data collected: **Personal info (email address)** and **App activity (encrypted backup file)** — both only if the user connects Google Drive backup, via Google Sign-In.
- Purpose: **App functionality** only (account backup), never analytics, advertising, or profiling.
- Data shared with third parties: **Yes, with Google** — the email (via Google Sign-In) and the backup file (stored in the user's own Google Drive `appDataFolder`, not a server we run). We never see the data ourselves: the backup content is end-to-end encrypted client-side before it's uploaded.
- Data deletion: users can turn off the backup and/or disconnect the Google account at any time (revokes access at Google's account permissions page), and can wipe all local data via Reset All Data.
- Security practices: data is encrypted in transit (HTTPS to Google's servers) and at rest (client-side AES-256 encryption before upload, plus the device's own on-device storage encryption).

## Content rating questionnaire

Answer **None/No** to every category (violence, sexual content, gambling, user-generated content, location sharing, etc.) — same reasoning as Apple's 4+ rating. Expected result: **Everyone** (or PEGI 3 depending on region).

## Store assets

- Screenshots: `~/Downloads/Saver_Android_Store/screenshots/{en,ar}/` — 7 each, framed (coded Pixel-style bezel), background+headline reused from the iOS marketing pipeline, resized to fit Play's 2:1 max aspect ratio.
- Feature Graphic (1024×500): `~/Downloads/Saver_Android_Store/graphics/feature_graphic_{en,ar}.png`
- App icon (512×512, 32-bit PNG with alpha): reuse `assets/icon.png`, resize down from 1024×1024.

## Still open

- Signing key + release AAB build
- Contact details / privacy policy URL (same as iOS: `https://www.savertrack.app/{en,ar}/privacy-policy`)
