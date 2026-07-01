// Saver — single source of truth for the notifications inbox. Used by the
// Notifications screen (full list) and the Home bell (unread badge). Items are
// derived live from bills, installments, goals, budgets & accounts; read state
// persists per stable item key in store.notifReadKeys.
import { fmt, currentMonth, today } from "./format.js";
import { calcBankBalance, calcFrozenForBank, calcGoalSaved, budgetSpentMonth } from "./calc.js";
import { billPeriod, isBillPaidForKey } from "./billfreq.js";

export function buildNotifications(store, tr = (k, vars, fallback) => fallback) {
  const { bills = [], installments = [], budgets = [], savings = [], banks = [], txns = [], notifReadKeys = [] } = store;
  const cm = currentMonth();
  const day = new Date().getDate();
  const todayISO = today();
  const items = [];

  // bills due soon (unpaid, within 3 days) — period-aware for every frequency
  bills.forEach((b) => {
    const { key, dueIn } = billPeriod(b, todayISO);
    if (isBillPaidForKey(b, key)) return;
    if (dueIn == null) return;
    if (dueIn >= 0 && dueIn <= 3) items.push({ key: `bill-${b.id}-${key}`, icon: "bell", bg: "var(--yellowDim)", col: "var(--yellow)", nm: dueIn === 0 ? tr("notif.billDueToday", { name: b.name }, `${b.name}’s knocking — due today`) : dueIn === 1 ? tr("notif.billDueTomorrow", { name: b.name }, `${b.name}’s knocking — due tomorrow`) : tr("notif.billDueDays", { name: b.name, n: dueIn }, `${b.name}’s knocking — due in ${dueIn} days`), mt: tr("notif.catBills", null, "Bills"), nav: { type: "sub", bill: b } });
  });
  // installment payments due this month (active plan, not yet paid)
  installments.forEach((i) => {
    if (i.stopped || i.status === "completed") return;
    if ((i.paidInstallments || 0) >= (i.totalInstallments || 0)) return;
    if (i.payments?.some((p) => p.month === cm)) return;
    const label = i.name || i.company || tr("notif.instFallback", null, "Installment");
    items.push({ key: `inst-${i.id}-${cm}`, icon: "card", bg: "var(--orangeDim)", col: "var(--orange)", nm: tr("notif.instDue", { name: label }, `${label} — this month’s payment is due`), mt: tr("notif.instSub", { amt: fmt(i.installmentAmount) }, `${fmt(i.installmentAmount)} · Installments`), nav: { type: "inst", instId: i.id } });
  });
  // goals reached
  savings.filter((s) => s.status !== "archived").forEach((s) => {
    if (s.goal > 0 && calcGoalSaved(s.id, txns) >= s.goal) items.push({ key: `goal-${s.id}`, icon: "target", bg: "var(--acDim)", col: "var(--ac)", nm: tr("notif.goalDone", { name: s.name }, `You smashed it — ${s.name} goal done!`), mt: tr("notif.catGoals", null, "Goals"), nav: { type: "goal", goalId: s.id } });
  });
  // budgets overspent this month
  budgets.filter((b) => b.kind !== "project" && (b.month ? b.month === cm : (!b.startMonth || cm >= b.startMonth))).forEach((b) => {
    const limit = b.amount || 0;
    if (limit <= 0) return;
    const spent = budgetSpentMonth(b, txns, cm);
    if (spent > limit) items.push({ key: `budget-${b.id}-${cm}`, icon: "layers", bg: "var(--purpleDim)", col: "var(--purple)", nm: tr("notif.budgetOver", { name: b.name }, `${b.name} budget is over`), mt: tr("notif.budgetSub", { amt: fmt(spent - limit), cap: fmt(limit) }, `${fmt(spent - limit)} past your ${fmt(limit)} cap`), nav: { type: "budget", budgetId: b.id } });
  });
  // low-balance accounts
  banks.forEach((b) => {
    if (b.lowBalanceThreshold == null) return;
    const safe = calcBankBalance(b.id, txns) - Math.max(0, calcFrozenForBank(b.id, savings, txns));
    if (safe <= b.lowBalanceThreshold) items.push({ key: `bank-low-${b.id}`, icon: "wallet", bg: "var(--redDim)", col: "var(--red)", nm: tr("notif.lowRunning", { name: b.name }, `${b.name}’s running low`), mt: tr("notif.lowSub", { amt: fmt(safe) }, `${fmt(safe)} left`), nav: { type: "account", bank: b } });
  });
  // backup nudge (informational — never counts as unread)
  items.push({ key: "backup", icon: "download", bg: "var(--blueDim)", col: "var(--blue)", nm: tr("notif.backupTitle", null, "Your backup misses you"), mt: tr("notif.backupSub", null, "Keep a recent copy"), muted: true, nav: { type: "privacy" } });

  const read = new Set(notifReadKeys);
  items.forEach((n) => { n.unread = !n.muted && !read.has(n.key); });
  return items;
}

// Count of unread items — drives the Home bell badge.
export function unreadCount(store) {
  return buildNotifications(store).filter((n) => n.unread).length;
}
