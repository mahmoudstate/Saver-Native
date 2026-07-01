# Saver Design System — Conventions

## Accent color
`--ac` (`#5FE3C0`) is the primary brand accent — mint/teal. Use it for active states, CTAs, positive amounts (savings/goals), and selection indicators. Never substitute another color for interactive affordances.

## Color tokens (always use tokens, never raw hex)
- `--bg` / `--surface` / `--surface2` — page background, cards, secondary surface
- `--text` / `--muted` / `--faint` — primary, secondary, tertiary text
- `--red` / `--redDim` — error, expense amounts, destructive actions
- `--yellow` / `--yellowDim` — warning, budget near-limit
- `--blue` / `--blueDim` — transfer transactions, info
- `--ac` / `--acText` / `--acDim` — brand accent for active UI

## Transaction amounts
Show amounts with `<Money>` — it renders the currency code (`EGP`) smaller than the number so long codes don't dominate the layout. Use `sign="+"` / `sign="−"` and color `var(--ac)` for income, `var(--red)` for expenses, `var(--blue)` for transfers.

## Category icons
Use `<CatTile>` for every transaction category — it resolves the correct colored glyph from the category key or `catName`. Pass `cat=` the key directly (`food`, `shopping`, `transport`, etc.) or a `txn` object and it resolves automatically.

## Bottom navigation
`<BottomNav>` floats over the page content (`position: absolute`) — always place it inside a `position: relative` container. The FAB (+) in the middle triggers `onAdd`; long-press fires `onQuickAdd`.

## Sheets (bottom drawers)
`<MenuSheet>`, `<OptionSheet>`, `<AmountSheet>`, `<DateSheet>`, etc. are bottom-anchored sheets. They include a dim backdrop and a grab handle. They require `onClose` and render inside `.app` in the real app (which provides `position: relative` scoping).

## Icon system (`<Ico>`)
All icons are inline SVG via `<Ico name="…" size={N} color="…" />`. Available names: `search`, `plus`, `minus`, `cal`, `back`, `transfer`, `chev`, `close`, `check`, `note`, `more`, `lock`, `bell`, `eye`, `eyeOff`, `wallet`, `zap`, `card`, `target`, `layers`, `home`, `activity`, `you`, `bills`, `shield`, `sparkles`, `palette`, `download`, `trash`, `grip`, `pencil`, `link`, `moon`, `sun`, `crown`, `mail`, `share`, `book`, `arrowUp`, `arrowDown`, `down`, `funnel`, `contactless`, `gear`, `camera`, `device`, `coins`, `user`, `info`. `back` and `chev` auto-mirror under RTL.

## Bilingual / RTL
The app is fully bilingual (Arabic + English). All strings come from `useT()`. Component layouts adapt automatically to RTL via `useLang()`. When designing, assume LTR (English default in preview) but ensure layouts work mirrored.

## Utility classes
- `.icard` — transaction/list-item card row (flex, border, radius, padding)
- `.card` — surface card with shadow and border
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-full` — buttons
- `.seg` / `.segx` — segmented control container
- `.fab` — the circular add button
- `.nav` — bottom navigation bar (pill-shaped floating bar)
- `.field` — input field with label
- `.hero` — mint-gradient hero/header section
