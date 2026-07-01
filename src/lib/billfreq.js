// Saver — bill recurrence helpers. A bill repeats weekly / monthly / quarterly /
// yearly. Monthly is the legacy default: bills with no `frequency` field behave
// EXACTLY as before (period = calendar month, dueDay = day-of-month, payments
// keyed by {month}). Other frequencies compute their own period + due date and
// store payments with an extra {period} key, never touching the monthly path.

export const FREQS = ["weekly", "monthly", "quarterly", "yearly"];
export const freqOf = (b) => b?.frequency || "monthly";

// How many charges land per year — drives the "per year" chip / yearly total.
export const yearlyMult = (f) => (f === "weekly" ? 52 : f === "quarterly" ? 4 : f === "yearly" ? 1 : 12);
// A single charge expressed as a monthly-equivalent — drives "total this month".
export const monthlyEquiv = (amt, f) => (f === "weekly" ? (amt * 52) / 12 : f === "quarterly" ? amt / 3 : f === "yearly" ? amt / 12 : amt);

const pad2 = (n) => String(n).padStart(2, "0");
const parse = (isoStr) => new Date(isoStr + "T12:00:00");
const isoOf = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const daysFromToday = (todayISO, target) => Math.round((parse(target) - parse(todayISO)) / 86400000);
const clampDom = (d) => Math.min(28, Math.max(1, d || 1)); // day of month 1–28
const clampDow = (d) => Math.min(6, Math.max(0, d | 0)); // day of week 0 (Sun) – 6 (Sat)
const addDays = (isoStr, n) => { const d = parse(isoStr); d.setDate(d.getDate() + n); return isoOf(d); };

// Week starts Saturday (matches the region). ISO date of this week's Saturday.
const weekStart = (todayISO) => { const d = parse(todayISO); const off = (d.getDay() + 1) % 7; d.setDate(d.getDate() - off); return isoOf(d); };

// The current billing period for a bill, relative to `todayISO`:
//   key      — unique id for this period (used to check / record a payment)
//   dueIn    — days until this period's due date (negative = overdue); null if no day set (monthly only)
//   dueDate  — ISO date the charge lands this period (null only for legacy monthly with no dueDay)
//   nextDate — ISO date of the following period's charge (for "renews on …" once paid)
export const billPeriod = (bill, todayISO) => {
  const f = freqOf(bill);
  const tD = parse(todayISO);

  if (f === "monthly") {
    const key = todayISO.slice(0, 7);
    const dd = bill.dueDay;
    return { key, dueIn: dd ? dd - tD.getDate() : null, dueDate: dd ? `${key}-${pad2(clampDom(dd))}` : null, nextDate: null };
  }

  if (f === "weekly") {
    const ws = weekStart(todayISO);
    const off = (clampDow(bill.dueDay) + 1) % 7; // offset from Saturday
    const dueDate = addDays(ws, off);
    return { key: ws, dueIn: daysFromToday(todayISO, dueDate), dueDate, nextDate: addDays(dueDate, 7) };
  }

  // quarterly / yearly — charge on dueDay of every Nth month, anchored to startMonth.
  const interval = f === "quarterly" ? 3 : 12;
  const anchor = bill.startMonth || todayISO.slice(0, 7);
  const [ay, am] = anchor.split("-").map(Number);
  const monthsSince = (tD.getFullYear() - ay) * 12 + (tD.getMonth() + 1 - am);
  const cycleIndex = Math.max(0, Math.floor(monthsSince / interval));
  const dd = clampDom(bill.dueDay);
  const cycleDate = (idx) => { const total = am - 1 + idx * interval; return `${ay + Math.floor(total / 12)}-${pad2((total % 12) + 1)}-${pad2(dd)}`; };
  const dueDate = cycleDate(cycleIndex);
  return { key: dueDate, dueIn: daysFromToday(todayISO, dueDate), dueDate, nextDate: cycleDate(cycleIndex + 1) };
};

// Has this bill been paid for the given period key? Accepts legacy {month}-keyed
// payments (period falls back to month) so existing monthly history still matches.
export const isBillPaidForKey = (bill, key) => (bill.payments || []).some((p) => (p.period ?? p.month) === key);
