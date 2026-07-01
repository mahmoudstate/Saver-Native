// Saver — core money math. PORTED VERBATIM from legacy App.jsx. **DO NOT change the maths.**
// See saver-site/APP-LOGIC.md (locked). Transaction types: income|expense|saving|goal_withdraw|goal_return|transfer.
import { cyclePeriod } from "./format.js";

export function calcBankBalance(bankId, txns) {
  return txns.reduce((acc, t) => {
    if (t.bankId === bankId && t.type === "income") return acc + t.amount;
    if (t.bankId === bankId && t.type === "expense") return acc - t.amount;
    if (t.bankId === bankId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.toBankId === bankId && t.type === "transfer") return acc + t.amount;
    if ((t.fromBankId || t.bankId) === bankId && t.type === "transfer") return acc - t.amount;
    return acc;
  }, 0);
}

export function calcGoalSaved(goalId, txns) {
  return txns.reduce((acc, t) => {
    if (t.goalId === goalId && t.type === "saving") return acc + t.amount;
    if (t.goalId === goalId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.goalId === goalId && t.type === "goal_return") return acc - t.amount;
    return acc;
  }, 0);
}

export function calcFrozenForBank(bankId, savings, txns) {
  return txns.reduce((acc, t) => {
    if (t.bankId === bankId && t.type === "saving") return acc + t.amount;
    if (t.bankId === bankId && t.type === "goal_withdraw") return acc - t.amount;
    if (t.bankId === bankId && t.type === "goal_return") return acc - t.amount;
    return acc;
  }, 0);
}

// Per-bank goal balance map (used to split a goal withdraw/return across the banks it was frozen in)
export function goalBalancesPerBank(goalId, txns) {
  const balances = {};
  txns.forEach((t) => {
    if (t.goalId !== goalId) return;
    if (t.type === "saving") balances[t.bankId] = (balances[t.bankId] || 0) + t.amount;
    if (t.type === "goal_withdraw" || t.type === "goal_return") balances[t.bankId] = (balances[t.bankId] || 0) - t.amount;
  });
  return balances;
}

// Derived helpers (clamped where legacy clamps with Math.max(0, …))
export const makeCalc = (txns, savings = []) => ({
  bankBalance: (id) => calcBankBalance(id, txns),
  goalSaved: (id) => Math.max(0, calcGoalSaved(id, txns)),
  frozenForBank: (id) => Math.max(0, calcFrozenForBank(id, savings, txns)),
  safeToSpend: (id) => calcBankBalance(id, txns) - Math.max(0, calcFrozenForBank(id, savings, txns)),
});

export const totalBalance = (banks, txns) => banks.reduce((s, b) => s + calcBankBalance(b.id, txns), 0);
export const totalSafe = (banks, txns, savings) => banks.reduce((s, b) => s + (calcBankBalance(b.id, txns) - Math.max(0, calcFrozenForBank(b.id, savings, txns))), 0);
export const totalFrozen = (banks, txns, savings) => banks.reduce((s, b) => s + Math.max(0, calcFrozenForBank(b.id, savings, txns)), 0);

// ── Budgets & Projects (spend = expense + goal_withdraw in the budget's categories) ──
// Monthly budgets reset each month; projects accumulate from startMonth across all months.
const inBudget = (t, cats) => (t.type === "expense" || t.type === "goal_withdraw") && cats?.includes(t.catId);
// Monthly budgets are scoped to their cycle period (calendar month by default, or a
// custom cycleStartDay e.g. salary-day-25-to-25) rather than a hard "YYYY-MM" prefix.
export const budgetTxns = (budget, txns, month) => {
  if (budget.kind === "project") return txns.filter((t) => inBudget(t, budget.cats) && (!budget.startMonth || (t.date || "").slice(0, 7) >= budget.startMonth));
  const { from, to } = cyclePeriod(month, budget.cycleStartDay);
  return txns.filter((t) => inBudget(t, budget.cats) && (t.date || "") >= from && (t.date || "") <= to);
};
export const budgetSpentMonth = (budget, txns, month) => budgetTxns(budget, txns, month).reduce((a, t) => a + t.amount, 0);
export const projectSpent = (project, txns) => txns.filter((t) => inBudget(t, project.cats) && (!project.startMonth || (t.date || "").slice(0, 7) >= project.startMonth)).reduce((a, t) => a + t.amount, 0);

// ── Daily pacing (new helpers — no locked maths touched) ──
export const daysInMonth = (month) => { const [y, m] = month.split("-").map(Number); return new Date(y, m, 0).getDate(); };
// Days still ahead in `month` (incl. today). For a past/future month vs todayISO, returns whole month.
export const daysLeftInMonth = (month, todayISO) => {
  const total = daysInMonth(month);
  if (!todayISO || todayISO.slice(0, 7) !== month) return total;
  return Math.max(1, total - Number(todayISO.slice(8, 10)) + 1);
};
// Days still ahead in a budget's cycle (incl. today), given the cycle's end date —
// unlike daysLeftInMonth this works even when the cycle spans two calendar months.
export const daysLeftInCycle = (cycleEnd, todayISO) => {
  const end = new Date(cycleEnd + "T12:00:00"), t = new Date(todayISO + "T12:00:00");
  return Math.max(1, Math.round((end - t) / 86400000) + 1);
};
// Average actually-spent per day, over only the days that had spending (rows = txns).
export const spentPerActiveDay = (rows) => {
  const days = new Set(rows.map((t) => t.date).filter(Boolean));
  const total = rows.reduce((a, t) => a + t.amount, 0);
  return days.size ? total / days.size : 0;
};

// Month-scoped income / expense (expense includes goal_withdraw, per legacy)
export const monthTxns = (txns, month) => txns.filter((t) => (t.date || "").startsWith(month));
export const sumIncome = (txns) => txns.filter((t) => t.type === "income").reduce((a, t) => a + t.amount, 0);
export const sumExpense = (txns) => txns.filter((t) => t.type === "expense" || t.type === "goal_withdraw").reduce((a, t) => a + t.amount, 0);
