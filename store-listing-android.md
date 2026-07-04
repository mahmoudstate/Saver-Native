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

Maps 1:1 to the App Privacy answers already given to Apple — no analytics/crash/ad SDKs, nothing collected:
- Data collection: **No data collected**
- Data sharing: **No data shared with third parties**
- Security practices: data is encrypted in transit (n/a — no network calls) and at rest (local encrypted backup only); users can request data deletion (Reset all data, on-device).

## Content rating questionnaire

Answer **None/No** to every category (violence, sexual content, gambling, user-generated content, location sharing, etc.) — same reasoning as Apple's 4+ rating. Expected result: **Everyone** (or PEGI 3 depending on region).

## Store assets

- Screenshots: `~/Downloads/Saver_Android_Store/screenshots/{en,ar}/` — 7 each, framed (coded Pixel-style bezel), background+headline reused from the iOS marketing pipeline, resized to fit Play's 2:1 max aspect ratio.
- Feature Graphic (1024×500): `~/Downloads/Saver_Android_Store/graphics/feature_graphic_{en,ar}.png`
- App icon (512×512, 32-bit PNG with alpha): reuse `assets/icon.png`, resize down from 1024×1024.

## Still open

- Signing key + release AAB build
- Contact details / privacy policy URL (same as iOS: `https://www.savertrack.app/{en,ar}/privacy-policy`)
