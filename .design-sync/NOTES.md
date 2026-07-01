# Saver DS Sync Notes

## Repo shape
- Private Vite app (`"private": true`), not a published package — synth-entry mode from `src/ui/`
- No dist, no Storybook, no TypeScript (`.jsx` only)
- CSS design system: `src/saver-ui.css` (tokens + utility classes)
- Fonts: `public/fonts/` — Inter (Latin) + Cairo (Arabic + Latin)
- Components depend on `src/lib/` (i18n, format, etc.) — bundled as internal deps

## i18n / Provider
- Many components call `useT()` or `useLang()` from `src/lib/i18n.js`
- `LangProvider` (exported from i18n.js) is included via `extraEntries` and wired as `provider`
- Without `LangProvider`, `useT()` returns `(k) => k` — translation keys instead of text
- `LangProvider` auto-detects language from `navigator.language`; in headless chromium defaults to "en"

## Theme / CSS
- Light/dark tokens gated on `:root[data-theme="light/dark"]`
- Preview HTML has no `data-theme` set → `styles-entry.css` adds `:root:not([data-theme])` fallback with light theme values
- `cssEntry` = `.design-sync/styles-entry.css` (wrapper that imports `../src/saver-ui.css` then adds font + theme fixes)

## Fonts
- `saver-ui.css` has `@font-face` with absolute `/fonts/` paths (not resolvable in bundle)
- `styles-entry.css` adds correct relative-path `@font-face` declarations AFTER the import (CSS cascade makes them win)
- `[FONT_DANGLING]` warnings for the absolute-path declarations from saver-ui.css are expected and non-blocking

## Known render warns
- `[RENDER_THIN] BottomNav` — renders as a thin horizontal strip of icon labels with no props; expected, needs active/items data for meaningful content. Authored preview covers it.

## Re-sync risks
- `styles-entry.css` inlines the light-theme token values — if `saver-ui.css` token values change, update `styles-entry.css` to match
- `LangProvider` is stable but the translation dictionaries (src/lib/locales/) evolve — previews showing translation keys indicate a missing/stale LangProvider
- Synth-entry: no `.d.ts`, so props are inferred from JSX prop usage — weakly typed, check after major component changes
