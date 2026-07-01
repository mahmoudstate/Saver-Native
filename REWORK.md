# Saver — Code Re-skin Tracker (Phase C)
Re-skin the **working** React app (`saver-test`) with the **new design** (`saver-site` showcase + `ds.css`).
**Rule:** UI only. Do NOT change logic/formulas/data (see `saver-site/APP-LOGIC.md`). Verify each slice with `npm run build` (+ local run for visual/functional test).

## Foundation
- [ ] `saver-ui.css` (design system: vars + component classes, body=--bg for full-screen app) imported in `main.jsx`
- [ ] Theme wired: `documentElement[data-theme]` follows app theme state
- [ ] Icon parity: map showcase icons → app `<Ico>` (extend as needed)
- [~] Helpers: category tile, bank-card, chip done; dialog/toast done (ui/Modal.jsx); sheet/field to come with Add flows

## Screens / flows to re-skin (from showcase)
- [ ] App shell: phone-less full screen + **bottom nav** (Home·Activity·[+]·Bills·Profile, squircle FAB)
- [ ] Home: swipe balance (Total/Safe + dots) · gradient account cards (carousel, reorder) · June income/spent · Bills/Goals/Budgets calm cards · Customize entry
- [ ] Activity: search + filter entry · grouped list · row states
- [x] Smart Filter sheet + Results (when/show/categories/accounts, multi-select)
- [ ] Bills — Subscriptions / Installments (view selector, month/status filter)
- [x] Subscription detail (brand hero + logo) · [x] Installment detail (ring · schedule · pay/undo, wired)
- [x] Budgets · Budget detail · Projects · Project detail (tabbed Monthly/Projects; spend = expense+goal_withdraw in cats; project mark-complete)
- [x] Goals · Goal detail (return-to-bank, spending-mode, frozen breakdown) — wired; Add money + Return to bank via reusable AmountSheet (keypad)
- [x] Account ledger (bank gradient hero) · Accounts list
- [~] Add: Expense/Income/Saving DONE (screen + keypad + pickers, wired to addTxn) · Transfer · Quick Add · Source picker (vault) · Edit txn pending
- [x] Installment add (form editor; grouped-wizard polish later)
- [x] Editors: account/category/goal/budget · Quick Actions · Customize Dashboard (dnd + hide)
- [x] Profile/Settings · Appearance (theme+accents) · Privacy · Backup & Restore
- [~] Messages: friendly toasts (success/info) + center dialogs (block/confirm) wired via store (AlertModal/ConfirmModal/Toast in ui/Modal.jsx); GoalToast + inline validation still to do
- [~] System: Notifications DONE; Onboarding · Help/FAQ · What's New · Empty/Celebration deferred (content)
- [ ] Push/reminder notifications copy (design ref only)

## Design QA (carry over)
- [ ] Uniform field/chip sizes + consistent label↔value arrangement (no 2-line vs 1-line mix)

## Verify each slice
`cd saver-test && npm run build` → green. Then `npm run dev` / `preview` for manual test → collect notes.
