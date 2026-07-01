// Saver — Smart Filter matching (pure, derived from txns). UI in SmartFilter/FilterResults.
import { currentMonth, prevMonthOf, today } from "./format.js";

export const PERIODS = [
  { id: "all", label: "All time" }, { id: "today", label: "Today" }, { id: "week", label: "This week" },
  { id: "month", label: "This month" }, { id: "lastMonth", label: "Last month" }, { id: "year", label: "This year" },
];
export const SHOWS = [
  { id: "expense", label: "Expenses" }, { id: "income", label: "Income" }, { id: "saving", label: "Savings" },
  { id: "transfer", label: "Transfers" }, { id: "bills", label: "Bills" }, { id: "installment", label: "Installments" },
];

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); const o = d.getTimezoneOffset() * 60000; return new Date(d.getTime() - o).toISOString().slice(0, 10); };

const inPeriod = (date, period) => {
  if (!date || period === "all") return true;
  if (period === "today") return date === today();
  if (period === "week") return date >= daysAgo(6);
  if (period === "month") return date.startsWith(currentMonth());
  if (period === "lastMonth") return date.startsWith(prevMonthOf(currentMonth()));
  if (period === "year") return date.startsWith(today().slice(0, 4));
  return true;
};

const isBill = (t) => t.catId === "bill" || t.catIcon === "zap" || /subscription/i.test(t.catName || "");
const isInstallment = (t) => t.catId === "installment" || t.catIcon === "installment" || t.catIcon === "wallet-cards";

// explicit from/to (YYYY-MM-DD) override the named period — used when the date
// is chosen up-front on Activity, so the filter sheet only narrows within it.
const inDates = (date, f) => {
  if (f.from || f.to) {
    if (!date) return false;
    if (f.from && date < f.from) return false;
    if (f.to && date > f.to) return false;
    return true;
  }
  return inPeriod(date, f.period);
};

const showMatch = (t, shows) => {
  if (!shows || shows.length === 0) return true;
  return shows.some((s) => {
    if (s === "installment") return isInstallment(t);
    if (s === "bills") return isBill(t);
    if (s === "expense") return t.type === "expense" && !isInstallment(t) && !isBill(t);
    return t.type === s; // income | saving | transfer
  });
};

export function applyFilter(txns, f) {
  return txns.filter((t) =>
    inDates(t.date, f) &&
    showMatch(t, f.shows) &&
    (!f.cats?.length || f.cats.includes(t.catId)) &&
    (!f.accounts?.length || f.accounts.includes(t.bankId) || f.accounts.includes(t.toBankId) || f.accounts.includes(t.fromBankId))
  );
}

export const summarize = (list) => {
  const total = list.reduce((a, t) => a + t.amount, 0);
  return { count: list.length, total, avg: list.length ? total / list.length : 0 };
};
