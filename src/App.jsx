// Saver — clean app shell (new design). Logic from lib/*, UI rebuilt from the design showcase.
import { useState, useRef, useEffect, useCallback } from "react";
import { App as CapApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useStore } from "./lib/store.js";
import { useNativeStatusBar } from "./lib/useNativeStatusBar.js";
import { useAppLock } from "./lib/useAppLock.js";
import { useAmountMaskLifecycle } from "./lib/amountMask.js";
import { HAPTICS, currentMonth, APP_VERSION } from "./lib/format.js";
import { useKeyboardInsets } from "./lib/useKeyboardInsets.js";
import { useLocalNotifications } from "./lib/useLocalNotifications.js";
import { useNotificationTaps } from "./lib/useNotificationTaps.js";
import { useICloudRestoreCheck } from "./hooks/useICloudRestoreCheck.js";
import { useAndroidDriveRestoreCheck } from "./hooks/useAndroidDriveRestoreCheck.js";
import { useNativeLangCorrection } from "./hooks/useNativeLangCorrection.js";
import iconUrl from "../icon.png";
import NotifPrompt from "./ui/NotifPrompt.jsx";
import WidgetGuide from "./ui/WidgetGuide.jsx";
import LockScreen from "./ui/LockScreen.jsx";
import BottomNav from "./ui/BottomNav.jsx";
import Overlays from "./ui/Modal.jsx";
import Home from "./screens/Home.jsx";
import Activity from "./screens/Activity.jsx";
import Bills from "./screens/Bills.jsx";
import Profile from "./screens/Profile.jsx";
import ProfileEdit from "./screens/ProfileEdit.jsx";
import AccountLedger from "./screens/AccountLedger.jsx";
import SubscriptionDetail from "./screens/SubscriptionDetail.jsx";
import InstallmentDetail from "./screens/InstallmentDetail.jsx";
import Goals from "./screens/Goals.jsx";
import GoalDetail from "./screens/GoalDetail.jsx";
import Budgets from "./screens/Budgets.jsx";
import BudgetDetail from "./screens/BudgetDetail.jsx";
import ProjectDetail from "./screens/ProjectDetail.jsx";
import Add from "./screens/Add.jsx";
import Transfer from "./screens/Transfer.jsx";
import EditTxn from "./screens/EditTxn.jsx";
import Accounts from "./screens/Accounts.jsx";
import AccountEditor from "./screens/AccountEditor.jsx";
import GoalEditor from "./screens/GoalEditor.jsx";
import BudgetEditor from "./screens/BudgetEditor.jsx";
import Categories from "./screens/Categories.jsx";
import CategoryEditor from "./screens/CategoryEditor.jsx";
import DatePicker from "./screens/DatePicker.jsx";
import SmartFilter from "./screens/SmartFilter.jsx";
import FilterResults from "./screens/FilterResults.jsx";
import Appearance from "./screens/Appearance.jsx";
import PrivacyBackup from "./screens/PrivacyBackup.jsx";
import Manual from "./screens/Manual.jsx";
import GuideTopic from "./screens/GuideTopic.jsx";
import Tour, { APP_TOUR } from "./ui/Tour.jsx";
import About from "./screens/About.jsx";
import QuickActions from "./screens/QuickActions.jsx";
import QuickActionEditor from "./screens/QuickActionEditor.jsx";
import QuickAddSheet from "./ui/QuickAddSheet.jsx";
import SubscriptionEditor from "./screens/SubscriptionEditor.jsx";
import InstallmentEditor from "./screens/InstallmentEditor.jsx";
import Notifications from "./screens/Notifications.jsx";
import CustomizeDashboard from "./screens/CustomizeDashboard.jsx";
import Onboarding from "./screens/Onboarding.jsx";
import LangPrompt from "./screens/LangPrompt.jsx";
import Celebration from "./screens/Celebration.jsx";
import WhatsNew from "./ui/WhatsNew.jsx";
import AllAccounts from "./screens/AllAccounts.jsx";
import Breakdown from "./screens/Breakdown.jsx";
import { useEdgeSwipeBack } from "./hooks/useEdgeSwipeBack.js";
import { useWidgetSync } from "./hooks/useWidgetSync.js";

export default function App() {
  useNativeStatusBar();
  useKeyboardInsets();
  useNativeLangCorrection();
  const store = useStore();
  useLocalNotifications(store);
  useWidgetSync(store);
  const checkingICloudRestore = useICloudRestoreCheck(store);
  const checkingAndroidDriveRestore = useAndroidDriveRestoreCheck(store);
  const lock = useAppLock(store.appLock);
  // Lives here, not in Home: the lock screen unmounts Home, and the amount mask
  // has to keep tracking foreground/background across that.
  useAmountMaskLifecycle();
  const [tab, setTab] = useState("home");
  // Navigation stack of pushed detail screens; the top one renders as an overlay.
  // A real stack (not a single slot) so Back always returns to the previous screen.
  const [stack, setStack] = useState([]);
  const view = stack[stack.length - 1] || null;
  const [tabKey, setTabKey] = useState(0); // bump to force-remount the current tab (nav re-tap → fresh from top)
  const [billsSeg, setBillsSeg] = useState(null); // initial Bills segment when arriving from a Home shortcut
  const [budgetsSeg, setBudgetsSeg] = useState("monthly"); // remembered Budgets/Projects tab (survives detail back)
  const [budgetsMonth, setBudgetsMonth] = useState(currentMonth()); // remembered viewed month (survives detail back, resets on fresh entry)
  const [quickAdd, setQuickAdd] = useState(false);
  const [activityDate, setActivityDate] = useState(null); // Activity date filter (month / day range)
  const [breakdownDate, setBreakdownDate] = useState(null); // Breakdown date filter (independent of Activity's)
  const homeScroll = useRef(0); // remember Home scroll across tab switches (restore on first return, reset on re-tap)
  const [whatsNew, setWhatsNew] = useState(false);
  const [notifPrompt, setNotifPrompt] = useState(false);
  const [widgetGuide, setWidgetGuide] = useState(false);
  const [tour, setTour] = useState(false); // interactive coach-mark tour over Home
  const push = (v) => setStack((s) => [...s, v]);          // open a deeper screen
  useNotificationTaps(store, push, setBreakdownDate);
  // NOTE: back is wired straight to onClick/onClose in screens, so it must take NO
  // numeric arg (the click event would land there). Use popN for multi-level pops.
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []); // pop back to the previous screen
  const popN = (n) => setStack((s) => s.slice(0, -n));      // pop several at once
  const replace = (v) => setStack((s) => [...s.slice(0, -1), v]); // swap the top (sideways nav)
  // Edge-swipe-back gesture: only the dragged (front) screen moves. Every
  // screen in the stack stays mounted in its own layer beneath it, so the one
  // revealed on release is never rebuilt (no re-run entrance animation = no
  // shake) and nothing deeper can peek through. Returns a callback ref that
  // rebinds to whichever layer is currently on top.
  // iOS only: Android relies on its own system/hardware back button (see the
  // backButton listener below), so the swipe gesture would only fight Android's
  // native edge-back. Web has no use for it either.
  const swipeBack = useEdgeSwipeBack({ enabled: !!view && Capacitor.getPlatform() === "ios", onCommit: back });
  // Android hardware/gesture back button: pop the nav stack like the in-app
  // back buttons, or exit the app when already at a tab root (no listener
  // means Capacitor's default no-op, since this SPA has no browser history).
  useEffect(() => {
    const sub = CapApp.addListener("backButton", () => {
      setStack((s) => {
        if (s.length) return s.slice(0, -1);
        CapApp.exitApp();
        return s;
      });
    });
    return () => { sub.then((s) => s.remove()); };
  }, []);
  // Home screen widget deep links (savertrack://…): the + button and each
  // widget face route straight to the matching screen. Always reset the stack
  // first so we land cleanly wherever the user tapped from.
  const launchUrlHandled = useRef(false);
  useEffect(() => {
    const handleUrl = (url) => {
      if (!url || !url.startsWith("savertrack://")) return;
      const [action, arg] = url.slice("savertrack://".length).split("/");
      setStack([]);
      if (action === "add") push({ type: "add" });
      else if (action === "home") setTab("home");
      else if (action === "bills") setTab("bills");
      else if (action === "account" && arg) {
        const bank = (store.banks || []).find((b) => b.id === arg);
        if (bank) push({ type: "account", bank });
      } else if (action === "quick" && arg) {
        // A widget quick-action shortcut: open Add pre-filled, same as picking
        // it from the in-app quick-add sheet.
        const q = (store.quickActions || []).find((x) => x.id === arg);
        if (q) push({ type: "add", initial: { type: "expense", amount: +q.amount, bankId: q.bankId, expCatId: q.catId }, quickId: q.id });
        else push({ type: "add" });
      }
    };
    const sub = CapApp.addListener("appUrlOpen", ({ url }) => handleUrl(url));
    // Cold start: if a widget tap launched the app, the listener above was
    // registered too late to catch it, so appUrlOpen never fires. Pick up that
    // initial URL directly (this is why quick-action taps did nothing when the
    // app was fully closed). Guard it so it fires exactly once: getLaunchUrl keeps
    // returning the same launch URL, and this effect re-runs whenever banks or
    // quickActions change — without the guard, editing a shortcut re-handled the
    // launch URL and bounced you to the Add sheet.
    if (!launchUrlHandled.current) {
      launchUrlHandled.current = true;
      CapApp.getLaunchUrl().then((r) => { if (r?.url) handleUrl(r.url); }).catch(() => {});
    }
    return () => { sub.then((s) => s.remove()); };
  }, [store.banks, store.quickActions]);
  // Show "What's New" once after an update, never for a fresh install: a
  // first-ever launch has no stored version yet, so it just records the
  // baseline silently instead of popping the sheet.
  // The notification pre-permission sheet and the widget how-to each show once,
  // ever, one at a time, in this order: notifications, then the widget guide,
  // right away for a fresh install (no What's New to queue behind), or right
  // after What's New closes for an updating user. Either step is skipped if
  // it was already shown (or, for notifications, already enabled), so the
  // next one in line offers immediately instead of leaving a permanent gap.
  const canOfferNotif = () => Capacitor.isNativePlatform() && !store.notificationsEnabled && !localStorage.getItem("et_notifPromptShown");
  const canOfferWidgetGuide = () => Capacitor.isNativePlatform() && !localStorage.getItem("et_widgetGuideShown");
  const offerNotifOrWidgetGuide = () => {
    if (canOfferNotif()) setNotifPrompt(true);
    else if (canOfferWidgetGuide()) setWidgetGuide(true);
  };
  useEffect(() => {
    try {
      const seen = localStorage.getItem("et_lastSeenAppVersion");
      if (seen === null) {
        localStorage.setItem("et_lastSeenAppVersion", APP_VERSION);
        offerNotifOrWidgetGuide();
      } else if (seen !== APP_VERSION) {
        setWhatsNew(true);
      }
    } catch {}
  }, []);
  // Bottom-nav tap: clear the stack and land on a fresh tab (re-tapping Home resets it to the top).
  const navTab = (t) => {
    setBillsSeg(null); setStack([]);
    // Home: first tap from another tab restores the saved scroll (no remount); a second tap (already on Home) resets to the top.
    if (t === "home" && tab !== "home") { setTab("home"); return; }
    if (t === "home") { HAPTICS.light(); homeScroll.current = 0; } // re-tap Home while already there: snap to top
    setTab(t); setTabKey((k) => k + 1);
  };
  // Switch tab from inside a screen (e.g. Home's Bills card) without forcing a reset.
  const openTab = (t) => { setBillsSeg(null); setStack([]); setTab(t); };

  if (lock.locked) return <div className="app"><LockScreen onUnlock={lock.unlock} tryBiometric={lock.tryBiometric} biometryState={lock.biometryState} /></div>;
  // Hold off on Onboarding/LangPrompt until we know whether there's a previous
  // iCloud backup to offer, avoiding a flash of Onboarding interrupted a
  // moment later by a restore dialog.
  if (checkingICloudRestore || checkingAndroidDriveRestore) return <div className="app" style={{ alignItems: "center", justifyContent: "center" }}><img src={iconUrl} alt="" style={{ width: 64, height: 64, borderRadius: 18 }} /></div>;
  if (store.needsLangChoice) return <div className="app"><LangPrompt onDone={() => store.set("needsLangChoice", false)} /></div>;
  if (!store.seenWelcome) return <div className="app"><Onboarding onDone={() => { store.set("seenWelcome", true); setTour(true); }} /></div>;

  // The underlying tab — stays mounted under any pushed view so returning restores scroll/state.
  let tabScreen;
  if (tab === "home") tabScreen = <Home store={store} onTab={openTab} onAdd={() => push({ type: "add" })} onAddAccount={() => push({ type: "editAccount", account: null })} onAddBill={() => push({ type: "editSub", bill: null })} onAddGoal={() => push({ type: "editGoal", goal: null })} onOpenBank={(bank) => push({ type: "account", bank })} onOpenGoals={() => push({ type: "goals" })} onOpenGoal={(g) => push({ type: "goal", goalId: g.id })} onOpenBudgets={() => { setBudgetsSeg("monthly"); setBudgetsMonth(currentMonth()); push({ type: "budgets" }); }} onOpenBudget={(b) => push({ type: "budget", budgetId: b.id })} onOpenProjects={() => { setBudgetsSeg("projects"); setBudgetsMonth(currentMonth()); push({ type: "budgets" }); }} onOpenProject={(p) => push({ type: "project", projectId: p.id })} onOpenInstallments={() => { setBillsSeg("inst"); setTab("bills"); }} onOpenInst={(i) => push({ type: "inst", instId: i.id })} onOpenBill={(b) => push({ type: "sub", bill: b })} onOpenNotifications={() => push({ type: "notifications" })} onOpenAllAccounts={() => push({ type: "allAccounts" })} onOpenBreakdown={() => push({ type: "breakdown" })} onCustomize={() => push({ type: "customize" })} initialScroll={homeScroll.current} onScrollChange={(v) => { homeScroll.current = v; }} />;
  else if (tab === "activity") tabScreen = <Activity store={store} dateFilter={activityDate} onPickDate={() => push({ type: "datePicker" })} onFilter={() => push({ type: "filter", hidePeriod: true, dateFilter: activityDate })} onEdit={(t) => push({ type: "edit", txn: t })} onAdd={() => push({ type: "add" })} onLearn={() => push({ type: "guideTopic", topicId: "add" })} />;
  else if (tab === "bills") tabScreen = <Bills store={store} initialSeg={billsSeg} onAdd={(seg) => push(seg === "inst" ? { type: "editInst", plan: null } : { type: "editSub", bill: null })} onOpenSub={(bill) => push({ type: "sub", bill })} onOpenInst={(i) => push({ type: "inst", instId: i.id })} />;
  else if (tab === "profile") tabScreen = <Profile store={store} go={(d) => { if (d === "accounts") push({ type: "accounts" }); else if (d === "goals") push({ type: "goals" }); else if (d === "budgets") { setBudgetsSeg("monthly"); setBudgetsMonth(currentMonth()); push({ type: "budgets" }); } else if (d === "categories") push({ type: "categories" }); else if (d === "appearance") push({ type: "appearance" }); else if (d === "privacy") push({ type: "privacy" }); else if (d === "manual") push({ type: "manual" }); else if (d === "quickactions") push({ type: "quickactions" }); else if (d === "customize") push({ type: "customize" }); else if (d === "editProfile") push({ type: "editProfile" }); else if (d === "about") push({ type: "about" }); else if (d === "whatsnew") setWhatsNew(true); else if (d === "plan") { try { window.location.href = "itms-apps://apps.apple.com/account/subscriptions"; } catch {} } }} />;

  // Resolves a stack entry to its screen element. Called for the top of the
  // stack (the interactive view) and, one level down, purely so the edge-
  // swipe-back gesture has something real to reveal underneath as it drags.
  const screenFor = (v) => {
    if (v?.type === "add") return <Add store={store} initial={v.initial} onSaved={v.quickId ? (val) => store.set("quickActions", (l = []) => l.map((a) => (a.id === v.quickId ? { ...a, amount: val.amount, bankId: val.bankId } : a))) : undefined} onClose={back} onReached={(g, saved) => push({ type: "celebrate", goalId: g.id, goal: g.name, saved })} />;
    if (v?.type === "transfer") return <Transfer store={store} fromBankId={v.fromBankId} onClose={back} />;
    if (v?.type === "edit") return <EditTxn store={store} txn={v.txn} onClose={back} />;
    if (v?.type === "accounts") return <Accounts store={store} back={back} onOpen={(b) => push({ type: "account", bank: b })} onAdd={() => push({ type: "editAccount", account: null })} />;
    if (v?.type === "editAccount") return <AccountEditor store={store} account={v.account} onClose={back} onDeleted={() => popN(2)} />;
    if (v?.type === "categories") return <Categories store={store} back={back} onAdd={() => push({ type: "editCategory", category: null })} onEdit={(c) => push({ type: "editCategory", category: c })} />;
    if (v?.type === "editCategory") return <CategoryEditor store={store} category={v.category} onClose={back} />;
    if (v?.type === "editProfile") return <ProfileEdit store={store} back={back} />;
    if (v?.type === "appearance") return <Appearance store={store} back={back} />;
    if (v?.type === "privacy") return <PrivacyBackup store={store} back={back} />;
    if (v?.type === "manual") return <Manual store={store} back={back} onOpenTopic={(id) => push({ type: "guideTopic", topicId: id })} onStartTour={() => { setStack([]); setTab("home"); setTour(true); }} />;
    if (v?.type === "guideTopic") return <GuideTopic topicId={v.topicId} back={back} />;
    if (v?.type === "about") return <About back={back} />;
    if (v?.type === "notifications") return <Notifications store={store} back={back} onOpen={(nav) => push(nav)} />;
    if (v?.type === "customize") return <CustomizeDashboard store={store} back={back} />;
    if (v?.type === "celebrate") return <Celebration goal={v.goal} saved={v.saved} onKeep={() => back()} onArchive={() => { if (v.saved > 0) store.addTxn({ type: "goal_return", amount: v.saved, date: new Date().toISOString().slice(0, 10), bankId: store.banks[0]?.id, goalId: v.goalId, goalName: v.goal, catName: "Goal archived", catIcon: "saving" }); store.set("savings", (l) => l.map((s) => (s.id === v.goalId ? { ...s, status: "archived", spendingMode: false } : s))); popN(2); }} />;
    if (v?.type === "quickactions") return <QuickActions store={store} back={back} onEdit={(q) => push({ type: "editQuick", action: q })} />;
    if (v?.type === "editQuick") return <QuickActionEditor store={store} action={v.action} onClose={back} />;
    if (v?.type === "account") return <AccountLedger store={store} bank={v.bank} back={back} onMove={(b) => push({ type: "transfer", fromBankId: b.id })} onEdit={(b) => push({ type: "editAccount", account: b })} onEditTxn={(t) => push({ type: "edit", txn: t })} />;
    if (v?.type === "sub") return <SubscriptionDetail store={store} bill={v.bill} back={back} onEdit={(b) => push({ type: "editSub", bill: b })} />;
    if (v?.type === "editSub") return <SubscriptionEditor store={store} bill={v.bill} onClose={back} />;
    if (v?.type === "editInst") return <InstallmentEditor store={store} plan={v.plan} onClose={back} />;
    if (v?.type === "inst") return <InstallmentDetail store={store} instId={v.instId} back={back} onEdit={(p) => push({ type: "editInst", plan: p })} />;
    if (v?.type === "goals") return <Goals store={store} back={back} onAdd={() => push({ type: "editGoal", goal: null })} onOpenGoal={(g) => push({ type: "goal", goalId: g.id })} />;
    if (v?.type === "goal") return <GoalDetail store={store} goalId={v.goalId} back={back} onReached={(g, saved) => push({ type: "celebrate", goalId: g.id, goal: g.name, saved })} onEdit={(g) => push({ type: "editGoal", goal: g })} onEditTxn={(t) => push({ type: "edit", txn: t })} />;
    if (v?.type === "editGoal") return <GoalEditor store={store} goal={v.goal} onClose={back} />;
    if (v?.type === "budgets") return <Budgets store={store} initialSeg={budgetsSeg} onSegChange={setBudgetsSeg} initialMonth={budgetsMonth} onMonthChange={setBudgetsMonth} back={back} onAdd={(seg) => push({ type: "editBudget", budget: null, kind: seg === "projects" ? "project" : "monthly" })} onOpenBudget={(b) => push({ type: "budget", budgetId: b.id, viewMonth: b._anchor })} onOpenProject={(p) => push({ type: "project", projectId: p.id })} />;
    if (v?.type === "editBudget") return <BudgetEditor store={store} budget={v.budget} initialKind={v.kind} onClose={back} />;
    if (v?.type === "budget") return <BudgetDetail store={store} budgetId={v.budgetId} viewMonth={v.viewMonth} back={back} onEdit={(b) => push({ type: "editBudget", budget: b })} onEditTxn={(t) => push({ type: "edit", txn: t })} />;
    if (v?.type === "project") return <ProjectDetail store={store} projectId={v.projectId} back={back} onEdit={(p) => push({ type: "editBudget", budget: p })} onEditTxn={(t) => push({ type: "edit", txn: t })} />;
    if (v?.type === "allAccounts") return <AllAccounts store={store} back={back} onOpenBank={(b) => push({ type: "account", bank: b })} onAdd={() => push({ type: "editAccount", account: null })} />;
    if (v?.type === "breakdown") return <Breakdown store={store} back={back} dateFilter={breakdownDate} onPickDate={() => push({ type: "datePicker", initial: breakdownDate, onApply: setBreakdownDate })} />;
    if (v?.type === "datePicker") return <DatePicker initial={v.initial !== undefined ? v.initial : activityDate} onApply={v.onApply || ((d) => setActivityDate(d.mode === "all" ? null : d))} back={back} />;
    if (v?.type === "filter") return <SmartFilter store={store} initial={v.filter} dateFilter={v.dateFilter} hidePeriod={v.hidePeriod} back={back} onApply={(f) => replace({ type: "results", filter: f })} />;
    if (v?.type === "results") return <FilterResults store={store} filter={v.filter} back={back} onEditFilter={() => replace({ type: "filter", filter: v.filter })} onEdit={(t) => push({ type: "edit", txn: t })} />;
    return null;
  };
  return (
    <div className="app">
      <div key={tab + tabKey} className="tabhost">{tabScreen}</div>
      {/* Every pushed screen is its own persistent layer (keyed by depth), stacked
          in DOM order. Only the top one carries the swipe-back gesture; the rest
          sit still underneath, keeping their state and never re-animating. */}
      {stack.map((v, i) => (
        <div key={i} className="pushview" ref={i === stack.length - 1 ? swipeBack : undefined}>
          {screenFor(v)}
        </div>
      ))}
      {!view && <BottomNav active={tab} onTab={navTab} onAdd={() => push({ type: "add" })} onQuickAdd={() => setQuickAdd(true)} />}
      {quickAdd && <QuickAddSheet store={store} onClose={() => setQuickAdd(false)} onSetup={() => { setQuickAdd(false); push({ type: "quickactions" }); }} onPick={(q) => { setQuickAdd(false); push({ type: "add", initial: { type: "expense", amount: +q.amount, bankId: q.bankId, expCatId: q.catId }, quickId: q.id }); }} />}
      {whatsNew && <WhatsNew onClose={() => {
        try { localStorage.setItem("et_lastSeenAppVersion", APP_VERSION); offerNotifOrWidgetGuide(); } catch {}
        setWhatsNew(false);
      }} />}
      {notifPrompt && <NotifPrompt store={store} onClose={() => {
        try { localStorage.setItem("et_notifPromptShown", "1"); if (canOfferWidgetGuide()) setWidgetGuide(true); } catch {}
        setNotifPrompt(false);
      }} />}
      {widgetGuide && <WidgetGuide onClose={() => { try { localStorage.setItem("et_widgetGuideShown", "1"); } catch {} setWidgetGuide(false); }} />}
      {tour && <Tour steps={APP_TOUR} onClose={() => setTour(false)} onNavigate={(g) => { if (g?.tab) { setStack([]); setTab(g.tab); } }} />}
      <Overlays store={store} />
    </div>
  );
}
