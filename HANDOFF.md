# Saver — Project Handoff & Context (send this to a new session to continue)

> Purpose: full context so any new session can continue the **redesign + code migration** without losing what we agreed.
> Two repos (branch **`claude/file-transfer-k1kui7`** in both):
> - **`saver-site`** = design system + **showcase of ~55 screens** (`screens.html`, `ds.css`, `ds.js`) → live: https://mahmoudstate.github.io/saver-site/screens.html . Also holds **`APP-LOGIC.md`** (LOCKED logic + message catalog + validation rules).
> - **`saver-test`** = the working **React/Vite** app being re-skinned to the new design. This is a **sandbox** (not live users) — clean rebuild is OK.

---

## 0. Golden rules (do NOT break)
1. **Logic is LOCKED.** All money maths/data come from the old app verbatim (see `saver-site/APP-LOGIC.md`). Never change a formula without asking. (Verified: calc matches real backup.)
2. **Don't redesign while porting — copy the showcase markup 1:1.** The bug we hit: re-authoring styles by hand → drift. Fix/Method: copy each showcase screen's HTML → convert mechanically to JSX (`class`→`className`, `style="…"`→object, `data-ico`→`<Ico>`, `data-cat`→`<CatTile>`) → inject data. `ds.css` is the single styling source.
3. **New icons only** — our showcase icons (`Ico` + `CATS`). NO legacy lucide set, NO emoji anywhere (use our drawn icons).
4. **Visual verification uses CLEAN demo data** (`saver-test/demo.json`), NOT the real user backup. Real bank colours are random and make it look “off”; the backup is only for later functional testing. (Real backup is local only, never committed.)
5. **Unify the mint hero (“cover”) size** across screens (currently `min-height:252px` via `.app .hero`). Keep covers consistent.
6. **Uniform fields/chips** — same size, consistent label↔value layout (no 2-line vs 1-line mix). Chips are single-line.
7. Work locally + verify with screenshots; push/deploy only when asked.

---

## 1. Locked logic (summary — full text in `saver-site/APP-LOGIC.md`)
Txn types: `income, expense, saving, goal_withdraw, goal_return, transfer`.
- bankBalance = Σ(income + / expense − / goal_withdraw − / transfer in+ / transfer out−)
- goalSaved = max(0, Σ saving + / goal_withdraw − / goal_return −)
- frozenForBank = max(0, per-bank Σ saving + / goal_withdraw − / goal_return −)
- safeToSpend(bank) = bankBalance − frozenForBank ; totalBalance = Σ bankBalance ; safeTotal = total − Σ frozen
- Spend blocked when amt > safeToSpend(bank); saving blocked likewise; goal spend blocked when amt > goalSaved.
- Storage = localStorage, keys `et_*` (txns, banks, expCats, incCats, groups, savings, bills, budgets, installments, currency, username, theme…). Existing user backups restore unchanged.
APP-LOGIC.md also has: full **AlertModal / ConfirmModal** message catalog (verbatim), **GoalToast** encouragement tiers, **EmptyState** messages, and the **input-validation rule** (§7).

---

## 2. Agreed design decisions (whole project)
**Brand:** Saver · mint/teal accent · rounded-square motif · “Powered by Mahmoud”. Matte text (`--text:#2B2E35` light; hero text `#1B332C`) — not glossy black.
**Nav:** bottom = Home · Activity · **[＋ squircle]** · Bills · Profile. Budgets/Goals reached from Home cards / Profile. Settings under Profile.
**Home (screen 01):**
- Greeting + **eye (privacy)** + bell. **Swipe balance** (Total ⇄ Safe, page **dots**, Apple-widget style — NO toggle buttons).
- **Accounts**: horizontal **gradient brand cards** (bank colour gradient + shine animation + contactless icon). Each shows **Available** (big) + small **“£X locked · goals”** (frozen) OR “Fully available” OR low-balance (amber down-arrow + “Below your £X alert”). Negative = dot. “All accounts” + an “All” tile.
- **“{Month} · this month”** card: Income ↑ (green) / Spent ↓ (red), divider.
- Calm section cards: **Bills** (blue icon), **Goals** (teal, mini progress bars), **Budgets** (purple, progress). 
- **Colour hierarchy:** ONLY bank cards are full-colour; everything else is calm/neutral surface + a small coloured icon. (This was a key fix — avoid rainbow.)
- Customize Dashboard = drag-reorder sections + eye-hide (sections: Accounts, Income&Expenses, Bills, Installments, Budgets, Savings goals). Also reorder cards **within** a section (long-press drag).
**Account ledger / Accounts page:** hero = the **bank’s gradient card** (continuity from tapping its card on Home). Calm ledger below.
**Subscription/Bill detail:** brand-colour hero **in OUR layout** (not a clone): left-aligned hero = back + “Active” chip + **logo tile** + name + amount + “Renews …”; then chips (£/yr · reminder · payments) + Payment history rows + “Record payment” CTA.
**Bills tab:** view-selector **Timeline / Categories / History**; month + status filters.
**Smart Filter** (entry from Activity search + funnel): compose **When** (Today/Week/Month/LastMonth/Year/**Custom from→to**) × **Show** (All/Expenses/Income/Savings/Transfers/**Bills**/**Installments**, multi-select; empty=All) × **Categories** (multi) × **Accounts** (multi). **Results** screen = summary insight (“£X · {cat} · {month} · N txns · avg”) + removable filter chips + list. Filtering Bills/Installments returns their **payment transactions**.
**Add:** segmented stays **3** (Expense/Income/Saving). **Transfer = separate screen** opened from an account’s “Move”. **Quick Add** sheet. **Source picker**: banks + **goal vaults** (a goal appears as a spend source **only when its Spending mode is ON**; money stays frozen in its banks — not double-counted).
**Installment add:** **grouped Next-step wizard** (light; group inputs by meaning, not 1-field-per-page) + **focused edit sheet**. **Smart number entry** = numeric keypad + quick-pick chips (no long +/− steppers).
**Goal detail:** **Return to bank** (returns to the banks it was frozen from) + **Spending mode** toggle (vault) + per-bank **frozen breakdown**.
**Validation (app-wide, APP-LOGIC §7):** quiet helper line + clear **inline error**; **button always tappable** (never dead); constrained controls (day **1–28**, count steppers/keypad). 
**Messages:** **hybrid** — light **friendly toasts** for success/info + **centre modals** for blocks/confirms + **GoalToast** celebration. Tone = **friendly/playful** (“Boom — logged it!”, “Whoa, hold up!”) but clear; **NO emoji**, use our icons. Insufficient-balance = **strong blocking modal + inline error**. Full real-text catalog in APP-LOGIC.md → to be rewritten in the friendly voice.
**Notifications:** system/push **lock-screen banners** + **gentle daily reminders** (e.g. “Spent anything today? Log it”, bill/installment due-soon) — no emoji.
**Scope:** Projects included; legacy Groups folded into Budgets. Deferred to LAST (finalise with latest content): Onboarding/Guide, Story Tour, Coach Tour, Help/FAQ, PWA-install, What’s New. App version bumped to **3.0**.

---

## 3. Migration (Phase C) — clean architecture in `saver-test`
**Done & verified (screenshots), pushed to branch:** foundation + logic layer (calc/store, verified vs real backup) · **all 4 tabs**: Home, Activity, Bills (Subscriptions+Installments), Profile · **Account ledger** (bank-gradient hero) · **Subscription detail** (brand hero+logo) · new icons (Ico+CATS) · hero unified 252px · v3.0 · **push-navigation** (App `view` state: tapping a Home bank card → Account ledger; a Bills subscription → Subscription detail; back returns to tab).
Latest commit: `8839513` (branch `claude/file-transfer-k1kui7`).
```
src/
  lib/format.js   – fmt, currency, dates, MONTHS, darken/cardGradient, HAPTICS
  lib/calc.js     – bankBalance/goalSaved/frozenForBank/safeToSpend/totals (VERBATIM, verified vs backup)
  lib/store.js    – useStore hook: load/persist all et_* keys + restore(backup)
  ui/Ico.jsx      – icon set (paths = showcase ds.js ICONS)
  ui/cats.js      – CATS category icons (new design) + resolveCat(txn) mapper
  ui/CatTile.jsx  – neutral tile + coloured glyph (matches showcase catTile)
  ui/BottomNav.jsx– Home·Activity·[+]·Bills·Profile (squircle FAB)
  screens/Home.jsx     – ported 1:1 from showcase 01 (bank cards tap → ledger)
  screens/Activity.jsx – ported 1:1 from showcase 02 (per-type rows: saving/goal/transfer)
  screens/Bills.jsx    – ported 1:1 from 05/06 (Subscriptions+Installments seg; rows tap → sub detail)
  screens/Profile.jsx  – ported 1:1 from 23 (wired username/accounts/theme)
  screens/AccountLedger.jsx   – showcase 11 (bank-gradient hero + month ledger)
  screens/SubscriptionDetail.jsx – showcase 15 (brand hero + logo + history)
  App.jsx         – shell: useStore + tab switch + BottomNav + `view` push-nav (account/sub) + Placeholder
  saver-ui.css    – copy of ds.css + app overrides (.app shell full-screen, body=--bg, .hero min-height:252, .hscroll)
  _legacy/App.reference.jsx – OLD app, REFERENCE ONLY (not imported/built)
demo.json         – clean showcase-style data for visual verification
REWORK.md         – per-screen checklist
```
**Local verify workflow:**
```
cd saver-test && npm install
npm run build
(cd dist && python3 -m http.server 8099 &)
# puppeteer screenshot (shot.cjs, local tool — gitignored): seeds demo.json into localStorage
BK=./demo.json [TAB=activity] node shot.cjs http://localhost:8099 out.png
```
(`shot.cjs` + puppeteer are dev-only, gitignored. To screenshot a tab, click `[aria-label="activity|bills|profile"]`.)

---

## 4. Remaining work (port each 1:1 from showcase, then verify)
- [x] All 4 tabs · Account ledger · Subscription detail (DONE)
- [x] **Installment detail** (ring, schedule, pay/undo) — DONE: showcase 37 ported (`screens/InstallmentDetail.jsx`), opens from Bills installment rows; pay logs an expense + advances the ring + success toast; tap a paid row to undo (confirm dialog). Verified light+dark, block + success paths.
- [x] **Budgets** + Budget detail · **Projects** + Project detail — DONE: `screens/Budgets.jsx` (tabbed Monthly/Projects, showcase 03+36), `screens/BudgetDetail.jsx` (showcase 12, monthly category ledger), `screens/ProjectDetail.jsx` (showcase 42, cross-month + mark-complete). Calc helpers `budgetSpentMonth/projectSpent/budgetTxns` in calc.js (spend = expense+goal_withdraw in the budget's cats; monthly resets per month, projects accumulate from startMonth). Opens from the Home Budgets card. Added one demo project ("Apartment setup") for verification. Verified light+dark.
- [x] **Goals** + Goal detail (return-to-bank, spending-mode, frozen breakdown) — DONE: `screens/Goals.jsx` (showcase 04) + `screens/GoalDetail.jsx` (showcase 13). Add money (saving) + Return to bank (goal_return, auto-splits across frozen banks) via reusable `ui/AmountSheet.jsx` (keypad + source picker); spending-mode toggle + complete/archive wired. Opens from the Home Goals card. Verified light+dark + a real add (£600→£800, progress + frozen + contribution + toast).
- [x] **Accounts list** — DONE: `screens/Accounts.jsx` (showcase 40), total/frozen hero + per-bank rows (frozen / low-balance) + dashed Add account; tap a row opens its ledger. (reorder still TODO)
- [x] **Add** Expense/Income/Saving · **Transfer** · **Quick Add** · **Source picker** (vault) · **Edit txn** — DONE: `screens/Add.jsx` (segmented, keypad via `AmountSheet`, account/category/goal via `PickerSheet`, vault sources for spending-mode goals → goal_withdraw), `screens/Transfer.jsx` (from Account ledger “Move”), `ui/QuickAddSheet.jsx` (long-press the + FAB), `screens/EditTxn.jsx` (amend/delete from Activity rows). Add CTA always tappable + inline helper.
- [~] **Installment add** — `screens/InstallmentEditor.jsx` (grouped form: item/months/amount/day/account → installments). Grouped multi-step wizard + back-fill (down payment / already-paid via addTxns) still TODO.
- [x] **Editors**: `AccountEditor` (17, opening-balance income), `CategoryEditor`+`Categories` (18/41), `GoalEditor` (19), `BudgetEditor` (20, name+amount+cats model), `SubscriptionEditor` (38), `InstallmentEditor`, **Quick Actions** (`QuickActions`+`QuickActionEditor`, 21), **Customize Dashboard** (`CustomizeDashboard`, 22, dnd-kit reorder + eye-hide; Home renders sections by saved order).
- [x] **Profile/Settings** · **Appearance** (`Appearance.jsx`, 24 — theme + 6 calm accents, live `--ac` retint, persisted) · **Privacy & Backup** (`PrivacyBackup.jsx`, 25+39 — real JSON download + restore-from-file via `store.restore`).
- [x] **Messages**: `ui/Modal.jsx` (`AlertModal` block + `ConfirmModal` + `Toast`) driven by store (`alert/confirm/toast/flash`); **GoalToast = `Celebration.jsx`** (goal-reached confetti, archive/keep); inline validation on Add. Full friendly copy catalog still a polish item.
- [x] **Smart Filter** sheet + **Results** — `lib/filter.js` (pure period/show/cats/accounts match + summary), `screens/SmartFilter.jsx` (live count·total), `screens/FilterResults.jsx` (summary hero + chips + list → edit). Activity search/funnel opens it.
- [x] System: **Onboarding** (27, first-run, gated on `seenWelcome`), **What’s New** (28, sheet, also Profile), **Empty state** (`ui/EmptyState.jsx`, 32, used in Activity), **Goal celebration** (33), **Notifications** (29, data-driven from bills/goals/low-balance/backup; Home bell). DEFERRED (per user): **Guide/Manual** (`Manual.jsx` empty scaffold) + Help/FAQ.
- [ ] **Design QA pass**: uniform field/chip sizes + consistent label↔value layout
- [x] Wire real **CRUD/actions** into `lib/store.js` — `addTxn` (incl. goal split), `addTxns`, `delTxn` (+ `reconcileLinked`), `updateTxn`, ported verbatim with locked validation; installment pay/undo, goal add/return/spend, transfer, quick-add all wired.
- [x] **Functional test (logic)**: 17/17 locked-math invariants pass (total=Σbank, safe=bal−frozen, expense/income/saving/goal_return/transfer/clamp); 0 console errors across all screens. **Still TODO: final test with the real backup, then user deploys.**

### Still open (next session)
- ~~Installment grouped wizard + back-fill; smart number entry quick-picks~~ — **DONE this session** (see §8).
- ~~Bills view-selector~~ — **DONE** (Active grouped-by-category / History; Active / Completed for installments).
- Reorder accounts/cards within sections (53). (Subscription drag-reorder was built then removed for a cleaner UI per Mahmoud — `SegToggle` + category grouping replaced it.)
- Guide/Manual + Help/FAQ content (deferred). Friendly message copy catalog. Design QA pass (uniform fields/chips).
- Final functional test with the **real backup**, then deploy.

---

## 5. Quick status one-liner
Clean React rebuild on the new design — **largely feature-complete**: 4 tabs + all detail screens (account ledger, subscription, installment, budget/project, goal) + full Add/Transfer/Quick-Add/Edit + every editor (account/category/goal/budget/subscription/installment/quick-actions) + Smart Filter + Appearance (theme+accents) + Privacy & Backup + Notifications + Customize Dashboard + onboarding/what's-new/empty/celebration. Locked CRUD wired in `lib/store.js`; **17/17 logic invariants pass, 0 console errors**. Open: installment grouped wizard, reorder, Bills view-selector, Guide/Help content, design-QA pass, final test with the real backup. Method in §0. Logic locked. No emoji. Work locally; push at checkpoints.

## 6. How to resume in a NEW session
1. Clone `saver-test`, checkout `claude/file-transfer-k1kui7`, `npm install`.
2. Read this file + `saver-site/APP-LOGIC.md` (locked logic/messages) + open the showcase https://mahmoudstate.github.io/saver-site/screens.html.
3. Pick the next screen from §4 → open its showcase markup in `saver-site/screens.html` → port 1:1 to a React screen (classes + `<Ico>`/`<CatTile>`) → wire to `store` → verify: `npm run build`, serve `dist` (`python3 -m http.server 8099`), screenshot with puppeteer seeding `demo.json` into localStorage (click `[aria-label="…"]` / `.seg b` / `.bankcard` to reach a view).
4. Keep heroes at 252px, new icons only, no emoji, logic untouched.

---

## 7. Real-device QA & Sign-off Plan (LIVE — work top to bottom)

> **How this works:** Mahmoud tests the built app for real and reviews it **page by page, section by section**. For each page he lists notes → Claude fixes & re-verifies (build + screenshot, both themes) → iterate until Mahmoud says it's good → Claude marks that page **✅ CONFIRMED** and asks for the **next** page. After all pages, we do the **General / cross-cutting** tasks the same way. **Nothing is ✅ until Mahmoud explicitly confirms it.** Claude must NOT reopen a ✅ item without being asked.
>
> **Status legend:** ☐ not started / awaiting notes · 🔄 notes being addressed · ✅ CONFIRMED (locked).
> Keep each task's notes inline under it (bullet list) so history is preserved.

### A · Pages — review one at a time
**Core tabs**
- 🔄 A1. Home (greeting, balance swipe Total/Safe, account cards, this-month, Bills/Goals/Budgets cards, customize)
  - Customize button: removed the right chevron, centered icon+label as a button. (done, verified light+dark)
  - Navigation memory: sections opened from Home now render as an overlay over the still-mounted Home tab, so the in-screen Back restores Home at the same scroll/state; tapping the Home nav button remounts it fresh from the top. (App.jsx `.tabhost`/`.pushview` + `tabKey`)
  - New Home cards: **Installments** (orange, → Bills tab · Installments seg) + **Projects** (purple, → Budgets · Projects seg), both gated on having data, both added to Customize Dashboard + dash order (existing saved layouts auto-merge the new sections). (done, verified light+dark)
  - Uniform 13px gap below every section card (Budgets was missing its `marginBottom`). (done)
  - Bank-card carousel: **full-bleed to the screen edge** (negative margins on the `.hscroll`, first card aligned at 20px) + tightened the card drop-shadow (negative spread) so each card reads as separate instead of one merged shadow band. (done, verified)
  - **Toast** now slides down from the TOP (below the safe-area) as a clean card, instead of popping from the bottom near the nav. (`saver-ui.css .app .toast` + `toastIn` keyframe)
  - **Customize** button restyled as a centered accent pill (`.customize-cta`, acDim bg + grip-in-badge). (done)
  - NOTE: accent-text contrast was fixed app-wide this session — see B2 (new `--acText` token).
  - **Budgets card is now expandable**: the right **`>` chevron stays for navigation** (tap header → Budgets screen) and a **bottom disclosure** — *"Show all N"* / *"Show less"* in accent text, divider above, app's own `chev` icon rotated 90° — toggles the inline breakdown. **Collapsed shows the total bar; expanded shows the per-item rows ONLY (no total bar)** — Mahmoud noted the same-coloured total bar above the rows read like another budget; the header keeps the aggregate `{spent} of {limit}`. Each budget row shows name + **percentage**, a purple bar (red if over), and a numbers line **"£X spent · £Y left (or £Z over) · of £total"**. Tapping a budget row opens its detail (`onOpenBudget` → budget detail). (`budgetsOpen` state + `d.budgetsList` via `budgetSpentMonth`.) (done, verified light+dark) — NOTE: first pass used a top down-arrow that clashed with the style + dropped the nav chevron; replaced per Mahmoud with this disclosure pattern.
  - **Goals card got the same expand pattern** (`goalsOpen`), now **structurally identical to Budgets**: header shows `{saved} of {totalTarget}` + nav `>` chevron, a single accent **total bar when collapsed only** (the old 2-goal preview rows were removed per Mahmoud), and the bottom *"Show all N"* / *"Show less"* disclosure. Open = every goal with name + **percentage** + accent bar + **"£X saved · £Y left (or Reached) · of £target"**. Tapping a goal row opens its detail (`onOpenGoal`). (`d.goalsTarget` = Σ goal targets.) (done, verified light+dark)
  - **More Home tidy-ups:** removed the redundant **"All accounts"** link from the Accounts section header (the trailing "All" tile already covers it); removed the **"{n} accounts"** sub-line under Total balance and **vertically centred the balance swipe block** in the 252px hero so the freed space reads balanced (swipe pages = flex column, `justify-content:center`, `minHeight:124`). (done, verified)
  - **Income/Expenses card redesigned:** dropped the separate "Net this month" row (Mahmoud found it disconnected/unprofessional); **Net is now a coloured pill in the header** (`Net +£X`, green / `redDim` when negative) next to the month label, body stays the two Income/Spent columns. Shorter + cleaner. (done, verified)
  - **Bills, Installments & Projects cards now expandable too** (`billsOpen`/`instOpen`/`projOpen`), same pattern as Goals/Budgets via a shared `Disclosure` helper + nav `>` chevron. Collapsed = header + a summary **progress bar** (Bills = paid-count ratio, blue; Installments = paid/total amount, orange; Projects = spent/limit, purple). Expanded rows: **Installments** name + `paid/total` count + orange bar + "£paid · £left · of £total" (→ `onOpenInst`); **Projects** like Budgets (→ `onOpenProject`); **Bills** use the app's **subscription-row anatomy** — colour brand tile + name + "note · monthly · day N" sub + amount + **Paid/Due** status, with a **light `var(--line)` divider between rows** (per Mahmoud), unpaid sorted first (→ `onOpenBill`). New `d.instList`/`d.billsList`/`d.projList`; App wires `onOpenInst`/`onOpenBill`/`onOpenProject`. (done, verified light)
  - **All section cards unified to one collapsed height (~146px)** for a consistent look: each = header + summary bar/row + disclosure; Income gets `minHeight:146` + centred content (it has no disclosure). (done, verified — measured 144–146 across all)
  - **Home scroll memory across tab switches:** tapping the Bills/Installments Home cards switches to that tab (Home unmounts); the **first** Home-nav tap afterwards **restores Home's previous scroll position**, a **second** tap resets to the top. `homeScroll` ref in App (fed by Home `onScrollChange`, restored via `useLayoutEffect` on mount) + special-cased `navTab("home")`. (done, verified 520→Bills→Home=520→Home=0)
- 🔄 A2. Activity (month summary, search/filter entry, grouped list, row states, empty)  ← **cursor here**
  - **Date button now functional**: the top-right month chip opens a new `screens/DatePicker.jsx` (our style — hero + segmented **Month / Specific days**). Month = year ‹›  + 12-month grid (current month tinted). Specific days = a calendar with prev/next month + tap a start day then an end day for a range (endpoints = accent, middle = acDim) + "All time" to clear. Picking filters the Activity list **and** the hero summary to that range; the chip shows the chosen label. (App.jsx holds `activityDate`.) (done, verified light+dark, month + range + empty)
  - **Filter now defers dates to the top picker**: opening the funnel from Activity passes the active range and **hides the "When" period chips**, replacing them with a read-only "Dates · {label} · Set on Activity" chip; Show/Categories/Accounts stay. Results respect the range (`lib/filter.js` now honours explicit `from`/`to` over the named period). (done, verified)
  - **Search is live**: the search box is a real input that filters the list as you type (matches note/category/bank/goal/type/amount) with a × to clear. Funnel is now a separate button. (done, verified — "salary" → 1 row)
  - **Row subtitle**: stopped repeating the category after the bank; now shows **bank · {weekday, day month year}** in the same light `.mt` font. (done, verified)
  - **History redesign (Mahmoud's call):** the green hero + Spent/Income/Net totals were **removed** — Activity is now a history page with a compact header (title + date button) so the flat list takes the whole screen. **Day-group headers dropped → flat list, newest first**, each card carries its own dated subtitle (cleaner when search/date filters scatter results). Under the date button a light line summarises the view: *"Showing Jun 2026 · 7 transactions"* / *"All time"* → *"7 transactions"*. The date button itself goes accent when a filter is active. (done, verified light+dark) — NOTE: this makes Activity an **exception to golden-rule #5** (unified 252px hero); Mahmoud approved.
  - Smart-filter "what am I filtered on": FilterResults already lists the active filters as chips (date + show + cats + accounts) with an Edit chip.
- ☐ A3. Bills · Subscriptions (hero, segment, rows, statuses, +)
- ☐ A4. Bills · Installments (hero, segment, rows, progress, +)
- 🔄 A5. Profile (header, Your money rows, App rows, version footer)
  - **Hero icon = gear** (was the search lens) → opens a NEW **Edit profile** screen (`screens/ProfileEdit.jsx`, App view `editProfile`): edit **name**, **upload a photo** (centre-cropped + downscaled to 256px JPEG, stored in new `et_avatar` scalar; falls back to the initial; Add/Remove photo), **Currency** picker (sheet, code+name, no emoji — first place currency is selectable), **Plan** card (Free plan · Saver One, display-only), **About** (version + Powered by Mahmoud). Hero avatar shows the photo if set. (done, verified light+dark)
  - **Renames:** "Accounts" → **"Bank accounts"**; "Categories & groups" → **"Categories"** (the word "group/groups" dropped everywhere visible).
  - **New "Your money" rows:** **Savings goals** (→ goals) + **Budgets & projects** (→ budgets), next to Bank accounts / Categories / Quick actions.
  - Appearance row value now shows the theme label (System / Light / Dark).
  - Suggested-but-NOT-built (awaiting Mahmoud): clear/reset-all-data action, "member since" (needs a stored created-date), mock upgrade/plans screen.

**Detail screens**
- 🔄 A6. Account ledger (bank-gradient hero, Move, month ledger)
  - Ledger now reads the bank fresh from the store (by id), so an edited colour/name shows immediately. (done)
- ☐ A7. Subscription detail (brand hero+logo, chips, history, record payment, edit)
- ☐ A8. Installment detail (ring, schedule, pay/undo)
- ☐ A9. Goals list + A10. Goal detail (progress, add/return, spending-mode, frozen breakdown, contributions, archive)
- ☐ A11. Budgets/Projects list + A12. Budget detail + A13. Project detail
- 🔄 A14. Accounts list / All accounts
  - **All accounts**: bank cards now in a **2-up grid** (BankCard `grid` mode) instead of one full-width per row. (done)
  - **Delete account** (in the editor): soft-delete — blocked while the account holds money (clear "Empty it first" dialog), else confirms and sets `archived:true`. Archived banks are filtered from every banks list/picker app-wide (`banks.filter(b=>!b.archived)`) but the record stays so historical txns/totals don't break. After delete it returns to the accounts list (popN(2)). (done, verified)
  - Reorder accounts: still TODO.

**Add / input**
- 🔄 A15. Add (Expense/Income/Saving — keypad, pickers, vault source)
  - **Fixed: the center FAB did nothing** — App wired it to an undefined `setView`; now `push({type:"add"})` (also fixed the Quick-Add "Set up" link). Tapping + opens New expense again. (done, verified)
  - `Add` now accepts an `initial` prefill ({type, amount, bankId, expCatId}) + an `onSaved` callback (used by Quick Add — see A17). (done)
  - **Field order + available badge:** the fields now read **Category (or To-goal) first, then Account** (was Account first). The Account row shows the **safe-to-spend** for the chosen bank as a small accent pill next to the name (*"£163.35 available"*, turns `pill-red` at ≤0) — same `safeToSpend = bankBalance − frozenForBank` the store uses for the block check. The **account picker sheet** also shows each bank's available as a sub-line under its name. Both hidden for Income (To-account); the field pill also hidden for goal-vault sources. (done, verified expense + saving)
- ☐ A16. Transfer
- 🔄 A17. Quick Add sheet (long-press +)
  - **Shortcuts now open the Add screen pre-filled instead of logging instantly** — so the amount/bank can be tweaked before saving (was committing the spend on tap). (done, verified)
  - **Each shortcut remembers its last-used amount + bank**: after saving from a shortcut, App updates that quick action's `amount`/`bankId` to what was actually used, so the next open pre-fills the last values. (done, verified — £50/HSBC → saved £75/Revolut → reopens £75/Revolut)
- ☐ A18. Edit / delete transaction

**Editors & setup**
- 🔄 A19. Account editor · A20. Category editor + list · A21. Goal editor · A22. Budget editor · A23. Subscription editor
  - **Colour picker rebuilt as a shared component** (this session). `ui/ColorSheet.jsx` = the picker sheet: a **colour wheel** (drag the dot: angle=hue, distance=vividness) + a brightness slider + Add; **your colours** above (tap to use, × to remove) with NO fixed presets (seeded with 6 calm removable starters, persisted shared key `et_customColors`). `ui/ColorField.jsx` = the form row used by every editor (label + up to **6** of your colours + a + that opens the sheet). Wired into Account/Category/Goal/Subscription editors (each lost its local `COLORS` array). Account editor hero is a live colour preview; low-balance alert has an explicit "Alert me below" amount field. (done, verified) — Budget/Installment editors have no colour choice.
  - **Colour picker polish (this session):** ColorSheet wheel now **opens ON the current colour** (`hexToHsv`) instead of a fixed blue, and the dot tracks tap/drag. ColorField's 6 swatches are now in **stable order** so the **select ring moves to the swatch you tap** (was prepending the picked colour to the front, which felt like the colour jumped to the ring); if the current colour isn't among the 6 it's surfaced in the last slot only.
  - **A20 Category editor — icons reworked (this session):**
    - **Icons split by type:** an **Expense category shows expense icons, an Income category shows income icons** (header reads "Expense icon" / "Income icon"; switching the segment swaps the set and resets the glyph if it doesn't belong). Lists live in `CategoryEditor.jsx` (`EXPENSE_ICONS` 46, `INCOME_ICONS` 15, plus curated `QUICK_EXP`/`QUICK_INC` of 11 shown inline).
    - **"All" sheet:** inline shows ~11 curated glyphs + a dashed **All** tile that opens a bottom sheet with every icon for that type (so the grid never floods the screen). Titled "Expense icons" / "Income icons".
    - **Icon library expanded 13 → 62 glyphs** in `ui/cats.js` (each `[colour, innerSVG]`). Added groceries, health, fitness, pet, education, entertainment, gift, fuel, beauty, kids, gaming, utilities, savings, clothing, subscription, insurance, charity, repairs, taxes, business, freelance, investment, refund, rental, sales, bonus, **car, parking, ticket, hotel, electricity, water, wifi, electronics, furniture, laundry, garden, pharmacy, sports, books, movie, music, drinks, jewelry, bank, creditcard, crypto, interest, tips, pension**. All keys validated against CATS (no missing keys).
    - **Colour-change bug fixed** in `ui/CatTile.jsx`: a known glyph used to force its hard-coded CATS colour and ignore the picked colour — now an explicit `color` prop **always wins** (falls back to glyph colour, then txn colour). So the category's chosen colour shows on the tile + in the list. NOTE: CatTile is also used by Bills/Budgets with `color` — re-verify those tint as intended if touched.
  - Remove the "group" subtitle from the Categories list (`screens/Categories.jsx`).
- ☐ A23. Subscription editor · A24. Installment editor · A25. Quick Actions setup
- ☐ A26. Customize Dashboard (drag + hide)

**System / settings**
- ☐ A27. Smart Filter + A28. Filter Results
- 🔄 A29. Appearance (theme + accents) · A30. Privacy & Backup
  - **Theme now has 3 options: System / Light / Dark, and System is the DEFAULT** (`SCALARS.theme = "system"`). `theme:"system"` follows `prefers-color-scheme` and live-updates when the OS flips (matchMedia listener in `store.js`'s data-theme effect); Light/Dark force it. Existing saved themes are unaffected. (done, verified — System resolved to dark on an OS-dark preview)
- ☐ A31. Notifications · A32. Onboarding · A33. What’s New · A34. Empty state · A35. Goal celebration
- ☐ A36. Guide / Manual (currently a deferred empty scaffold — confirm when content lands)

### B · General / cross-cutting — after the pages
- ☐ B1. Typography (DM Sans Latin · IBM Plex Sans Arabic; sizes/weights/line-heights consistent)
- 🔄 B2. Colour & accents (calm palette, semantic in/out/warn/info, dark+light parity per element)
  - Fixed: bright mint accent used as TEXT was invisible on white in light theme. Added `--acText` token (light = darkened accent that passes AA; dark = `--ac`) and swapped all accent text/icon usages to it app-wide. Fills/bars/buttons keep `--ac`. (done)
  - Fixed (this session): `CatTile` ignored a picked category colour when the glyph was a known CATS icon — explicit `color` now wins. See A20.
- ☐ B3. Hero / cover consistency (unified 252px, gradient, orbs)
- ☐ B4. Buttons (sizes, primary/secondary/ghost/danger, pressed/disabled states)
- ☐ B5. Fields & chips (uniform size, consistent label↔value, single-line chips)
- ☐ B6. Cards / list rows / tiles (padding, radius, elevation, dividers)
- ☐ B7. Icons (one set, no emoji, stroke/size consistency, category tiles)
- ☐ B8. Bank cards (gradient, shine, contactless, available/frozen/low-balance)
- ☐ B9. Bottom nav + FAB (squircle, long-press, active states)
- ☐ B10. Overlays (dialog / confirm / toast / sheet — spacing, motion, scrim)
- ☐ B11. Motion (reveal, count-up, transitions; reduced-motion)
- ☐ B12. Spacing / radius / elevation scale (4pt grid)
- ☐ B13. Empty / loading / error states across lists
- ☐ B14. Currency & number formatting (multi-currency, tabular nums)
- ☐ B15. RTL / Arabic readiness (logical props, mirroring)
- ☐ B16. Native readiness (safe-areas, ≥44px touch targets, status/nav bars)
- ☐ B17. Light/Dark parity full pass
- ☐ B18. Copy / tone (friendly voice, no emoji, message catalog)
- ☐ B19. Performance / no console errors / build clean

### C · Sign-off
- ☐ C1. Final functional test with the **real backup** (calc vs real data)
- ☐ C2. Mahmoud final approval → merge to `main` / deploy

---

## 8. Session state / how to resume (updated this session)

**Done THIS session (NOT pushed yet — local working copy only; builds clean):**
- **Installments:** Bills hero title switches **Bills↔Installments** per seg. New **`ui/StepSheet.jsx`** counter (− value + with chips) replaces the keypad for **Pay ahead**, **months**, **already-paid**. **Pay button** now: re-entrancy guard (no double-pay) + settles **only the current month's due** (`paidThisMonth`) → shows a disabled "This month is paid" once covered. **Pay ahead** moved into the kebab `MenuSheet` **with a confirm dialog**. Installment-editor step-1 "paying off" icon now reflects the picked glyph+colour (`CatTile`).
- **Edit/Delete consistency:** removed the duplicate "Edit" item from the kebab in Subscription / Installment / **Goal** / **Budget** / **Project** details — **pencil = edit, kebab = secondary/delete only**.
- **Bills:** category sections sorted by **urgency** (soonest-due/overdue first; fully-paid groups sink). **Bill categories = fixed taxonomy** (`lib/services.js BILL_TYPES` → streaming·music·software·telecom·utilities·health·shopping·other, CATS glyphs, **single accent colour `--ac`**). Removed user "New category" creation in `SubscriptionEditor` + the `billTypes` lookup in `Bills` (legacy custom ids fall back to "Other").
- **Profile icons:** semantic colours; Categories → orange (removed the purple dup with Budgets).
- **Dark mode:** `--bg`/`--stage` tinted ~8% toward the accent (`color-mix`), re-tints with the chosen accent; **cards stay neutral** (Mahmoud wanted the tint on the background only).
- **Buttons:** removed the glowing coloured shadow on `.btn-primary` → calm neutral shadow + inset highlight + pressed-inset (real-button feel). FAB shadow softened + tactile press; nav items press-scale.
- **Bottom nav (`ui/BottomNav.jsx`):** order now **Home · Bills · [+] · Activity · Profile**. New **activity** icon (list + dots) and **bills** icon (receipt) in `Ico.jsx`; added **`minus`** glyph.
- **Add screen (`screens/Add.jsx`):** new **Date** field (before Note) via **`ui/DateSheet.jsx`** (single-day calendar, app-styled, future days disabled) to **back-date** txns; type switch uses the animated `SegToggle`. (Activity already sorts by date desc, so back-dated txns land in place.)
- **Goals:** `GoalEditor` got an **IconField** (saves `glyph`) and the picked **colour now shows** on every `CatTile`. `Goals` list has an **Active/Archived** toggle. `GoalDetail` has pencil + kebab; **Delete** returns any frozen money to banks (releases the freeze) then removes the goal, **keeping its txns**. Complete button → `btn-secondary`.
- **Confetti:** **`ui/ConfettiBurst.jsx`** — transparent, non-blocking confetti **rain from the top** (drift + spin + flutter). Triggered globally via **`store.fireConfetti()`** (counter in `store`, rendered in `ui/Modal.jsx` Overlays) so it shows even after a screen closes. Fires on **Add money** (GoalDetail) and **Saving** (Add). **`Celebration.jsx` rewritten:** no decision buttons, strong confetti, friendly fixed line **"Boom — {goal} is in the bag!"** + amount, tap anywhere to dismiss (Archive/Keep saving stay calm in GoalDetail).
- **Budgets & Projects:** `BudgetEditor` now does **Monthly *or* Project** (SegToggle) with **icon + colour**; monthly has **Every month (from a start month) / One month** + a month stepper; **project amount is optional** + start month. `Budgets` page: **month filter** (stepper, capped at current), a **live infographic** = animated **`ui/BudgetRing.jsx`** donut (spent/limit %, health colour) + ranked animated category bars (most-used first); removed the green "on track" row; projects show optional-amount state + **Active/Completed** toggle. `BudgetDetail` + `ProjectDetail` got pencil + kebab **Delete** (keeps the expense txns — budgets/projects are just trackers); ProjectDetail's dead "note" button replaced; **Reopen** added for completed projects. `App.jsx` wires `onEdit` + `onAdd(seg)`/`initialKind`.
- **New shared this session:** `ui/StepSheet.jsx`, `ui/DateSheet.jsx`, `ui/ConfettiBurst.jsx`, `ui/BudgetRing.jsx`. New CSS: `.stepbtn`, `.confetti-layer`/`.confetti-pc` + `@keyframes confettiFall`, dark accent tint, button-shadow rework, nav press.
- **Open / next:** Mahmoud is reviewing the **Budgets infographic** and will give remaining tweaks. Possible cleanup: the now-unused `onArchive` path in App's `celebrate` view. **Nothing pushed this session** — when asked, rsync working `src/` → `/tmp/saver-push` and push to `Saver-New/main` (see git note below).

**Where we are (prior):** Bills (Subscriptions + Installments) fully reworked + a multi-round design polish on the **New-subscription editor** (Mahmoud reviewed it closely). All pushed. **Project now lives on a NEW remote `Saver-New`, branch `main`** (see git note). A1 · Home done; A5 · Profile + A20 · Category editor done earlier.

**Done LATEST rounds (PUSHED — `Saver-New/main` @ `05f0370`; built clean, verified in preview):**
- **New-subscription editor polish (per Mahmoud's notes):** standard mint hero that takes the chosen colour; **Custom icon = its own button ABOVE the companies** → opens `ui/CustomIconSheet.jsx` (icon + colour [+ optional name], one Done); company logos in an even row (5 + always-visible **All**), select-ring no longer clipped; picking a brand **always updates the name**; brand colour locked (no colour control for brands); hero logo keeps its own bg, separated only by a hairline + soft shadow.
- **Billing/Due day → `ui/DayGridSheet.jsx`** (calendar-style 1–28 grid, not a keypad). **Reminder → `ui/OptionSheet.jsx`** (Off / 1–3 days / 1 week list, no keypad). Applied to BOTH subscription + installment editors.
- **Category at the end as a row → picker sheet** (built-ins + **user-created custom categories**: `store.billTypes` / `et_billTypes`, "New category" with name+icon+colour, persisted; `Bills.jsx resolveType` groups by them). `TYPE_GLYPH` maps built-in `BILL_TYPES` to CATS icons (their legacy lucide glyph names aren't in CATS).
- **NumberSheet:** backspace moved to bottom-right; quick-picks accept `{value,label}`.
- **Bug fixes:** (1) `darken()`/`cardGradient` now handle 3-digit hex (e.g. Apple TV `#555`) so the hero colour changes for those brands. (2) **Editing a category from an old backup blank-crashed** — `CategoryEditor` did `CATS[g][0]` on a legacy/emoji glyph; now falls back to a valid default + `Glyph` guards unknown keys. (3) Expense decimals: our `AmountSheet` already allows 2 decimals (the 1-decimal issue was only in the old deployed build).
- **New shared UI this round:** `ui/CustomIconSheet.jsx`, `ui/DayGridSheet.jsx`, `ui/OptionSheet.jsx`.
- **Repo tidy:** removed `src/_legacy/App.reference.jsx` (was 457KB, unused), `demo.json`, `REWORK.md`; cleaned `.gitignore`.

**Done THIS session (PUSHED — commit `ccf0836`; built clean, verified in preview light+dark, 0 console errors):**
- **Service logos:** `lib/services.js` (88 services + 47 Simple-Icons-style brand glyphs, ported verbatim from old app) + `ui/ServiceLogo.jsx` (offline glyph→monogram). `ui/ServicePicker.jsx` = inline popular logos + "All" sheet (search, grouped by category) + Custom (own icon+colour).
- **A3 Subscription editor (`screens/SubscriptionEditor.jsx`) redesigned** into sections **Service / Category / Plan / Appearance**: brand picker, bill **Category type** grid (`BILL_TYPES`, glyphs mapped to CATS via `TYPE_GLYPH`), **Reminder** field, **keypad** billing day, smaller hero logo, gradient hero, icon+colour grouped under Appearance.
- **A7 Subscription detail (`SubscriptionDetail.jsx`):** wired the dead **Record-payment** button (real expense txn + payment); **Stop/Resume** (keeps history) + **Delete** (keeps past txns) moved into a kebab **MenuSheet**; bottom = primary action only; ServiceLogo in hero + history.
- **A3/A4 Bills list (`Bills.jsx`):** Subs **Active (grouped by category, headers) / History (by month)**; Installments **Active / Completed**; main switch + sub-views use the animated **SegToggle**. Removed the sort-chip clutter.
- **Installment editor (`InstallmentEditor.jsx`):** 3-step grouped wizard (showcase 49–51) — provider, colour, **icon picker** (`ui/IconField.jsx`), down-payment + already-paid **back-fill** (verbatim locked logic, deduct toggles default **on**), bidirectional **total↔monthly**, **keypad** (`ui/NumberSheet.jsx`) for months/day/paid/remind.
- **A8 Installment detail (`InstallmentDetail.jsx`):** edit pencil, **deposit shown on ring card**, **pay-N-ahead** (keypad), Stop/Delete in kebab MenuSheet, Active/Completed split via list.
- **New shared UI:** `ui/NumberSheet.jsx` (keypad+quick-picks), `ui/IconField.jsx`, `ui/ServicePicker.jsx`, `ui/ServiceLogo.jsx`, `ui/MenuSheet.jsx`, `ui/SegToggle.jsx` (animated, CSS `.segx`/`.seg-thumb`), `ui/Ico.jsx` (`more` kebab mark).
- Data: bills gained `domain`/`glyph`/`typeId`/`reminderDays`/`stoppedMonth`; installments gained `glyph`/`reminderDays`/`downPayment`/`stopped`.

**Done PRIOR session (also pushed in `ccf0836`):**
- **A5 Profile:** gear → **Edit profile** (`screens/ProfileEdit.jsx`: name, photo→`et_avatar`, currency, plan, about) · renamed Accounts→Bank accounts, Categories&groups→Categories · added Savings goals + Budgets & projects rows.
- **Theme:** added **System** option, made it the default (`store.js` `theme:"system"` + matchMedia live-resolve).
- **A20 Category editor:** icons split by type · inline + "All" sheet · library 13→62 glyphs in `ui/cats.js` · removed "group" subtitle. **Colour fixes:** `CatTile` honours picked colour · `ColorSheet` opens on current colour · `ColorField` stable swatch ring. Plus `screens/DatePicker.jsx` (Activity date picker).

**Done EARLIER (all pushed):** A1 Home polish (customize pill, push-nav back-stack, Installments/Projects cards, uniform gaps, full-bleed + tightened bank-card shadow, top toast) · app-wide accent-text contrast fix (`--acText`) · Accounts area (2-up All-accounts grid, soft-delete account, fresh-bank ledger) · **shared colour picker** (`ui/ColorSheet.jsx` + `ui/ColorField.jsx`).

**Navigation:** `App.jsx` uses a real **back-stack** (`stack` array; `push`/`back`/`popN`/`replace`). Detail screens render as an overlay (`.pushview`) over the still-mounted tab (`.tabhost`); Back returns to the previous screen, bottom-nav tap resets the tab fresh (`tabKey`). NOTE: `back` must stay arg-less (it's wired to onClick) — use `popN(n)` for multi-level pops.

**New shared components:** `ui/ColorSheet.jsx`, `ui/ColorField.jsx` (colour); `ui/NumberSheet.jsx` (number keypad), `ui/IconField.jsx` (icon picker), `ui/ServicePicker.jsx` + `ui/ServiceLogo.jsx` (brand logos), `ui/MenuSheet.jsx` (kebab actions), `ui/SegToggle.jsx` (animated segmented control) — reuse these. Soft-deleted banks carry `archived:true`; stopped bills carry `stoppedMonth`, stopped installments carry `stopped:true` — keep filtering them from active lists.

**Git / deploy workflow (IMPORTANT — repo is NOT this folder):** This working folder is a file-transfer copy, not a git repo. A clone lives at `/tmp/saver-push`. **The live remote is now `Saver-New` → `https://github.com/mahmoudstate/Saver-New.git`, branch `main`** (Mahmoud switched to this; the old `saver-test` remote/`claude/file-transfer-k1kui7` branch is retired). The clone's local `main` tracks `saver-new/main`. Flow each time: `rsync -a --exclude=node_modules <thisfolder>/src/ /tmp/saver-push/src/`, then in `/tmp/saver-push`: `git add -A && git commit && git push saver-new main:main`. GitHub auth (PAT) in the macOS keychain → non-interactive. `/tmp/saver-push` has **no node_modules** (can't build there — rely on the working-copy build). If gone (reboot): re-clone `Saver-New`, `git fetch`, checkout `main`, re-copy `src/`. **Latest pushed commit: `05f0370`** (`Saver-New/main`). NOTE: `demo.json` is now gitignored/dev-only — keep a copy in the working folder for screenshot verification but don't re-commit it.

**Build/verify locally:** `npm run build` → serve `dist` on :8099 (or use the running Vite dev server / preview tools) → seed `demo.json` into localStorage (theme via `et_theme`). Verify light+dark. The preview console buffer does NOT clear on reload — old HMR error timestamps can linger; only a NEW `?t=` timestamp = a real current error (and a truly-throwing component blanks the app rather than rendering).

**Rules to honour:** logic LOCKED · no emoji · **never change app visual style unprompted — ask first** (memory: no-style-changes) · **plan-first: send a short bulleted plan and wait for OK before implementing; change only what's asked** (memory: plan-before-execute) · **don't send screenshots in change reports** (memory: no-screenshots-in-reports) · keep replies very short (CLAUDE.md).

> **Current cursor:** Big polish pass on **Installments, Goals, Add, Bottom nav, Dark mode, Buttons, Confetti, and Budgets/Projects** (see "Done THIS session" in §8 for the full list). **Everything is local in the working copy only — NOT pushed** (last pushed commit is still `05f0370`); push to `Saver-New/main` when Mahmoud asks. Immediately next: Mahmoud is reviewing the **Budgets month-infographic** (`ui/BudgetRing.jsx` donut + ranked animated bars) and will give remaining tweaks; then continue any other section. Open polish noted by Claude: unused `onArchive` path in App's `celebrate` view; no "pause" glyph for Stop (uses `back`); legacy demo bills lack `domain`/`typeId` (monogram + "Other"). Nothing is ✅ until Mahmoud says so.
