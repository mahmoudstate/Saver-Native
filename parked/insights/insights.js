// Saver — Insights: self-computed spending analytics, derived entirely from the
// user's own txns (no manual input, no network). All money figures are already
// in the app's single global currency (see format.js) — nothing here converts
// or mixes currencies. Aggregated across every account (not per-bank).
import { monthTxns, sumIncome, sumExpense } from "./calc.js";

const addMonths = (m, n) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

// Income/expense per month for the trailing `months` (oldest → newest, current month last).
export function monthlyHistory(txns, cm, months = 6) {
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const m = addMonths(cm, -i);
    const mt = monthTxns(txns, m);
    out.push({ month: m, inc: sumIncome(mt), exp: sumExpense(mt), count: mt.length });
  }
  return out;
}

// Category totals for one month's expenses (same grouping key as Breakdown.jsx).
export function categoryTotals(txns, month) {
  const mt = monthTxns(txns, month).filter((t) => t.type === "expense" || t.type === "goal_withdraw");
  const byCat = {};
  mt.forEach((t) => {
    const k = t.catName || t.catId || "Other";
    const row = (byCat[k] = byCat[k] || { key: k, name: k, sum: 0, sample: t });
    row.sum += t.amount;
  });
  return byCat;
}

// Top spending categories this month, sorted highest first, each with its share
// of the month's total spend — always available even with zero prior history.
export function topCategories(txns, cm, limit = 5) {
  const byCat = categoryTotals(txns, cm);
  const rows = Object.values(byCat).sort((a, b) => b.sum - a.sum);
  const total = rows.reduce((s, r) => s + r.sum, 0);
  return rows.slice(0, limit).map((r) => ({ ...r, share: total > 0 ? r.sum / total : 0 }));
}

// Categories spending notably more this month than their trailing average —
// the auto-generated "you're spending more on X" callouts. `minAvg` filters out
// noise from a single tiny one-off category; `threshold` is the minimum rise
// (0.25 = 25%) to be worth surfacing.
export function risingCategories(txns, cm, { lookbackMonths = 3, threshold = 0.25, minAvg = 1 } = {}) {
  const current = categoryTotals(txns, cm);
  const pastMonths = Array.from({ length: lookbackMonths }, (_, i) => addMonths(cm, -(i + 1)));
  const pastTotals = pastMonths.map((m) => categoryTotals(txns, m));

  return Object.values(current)
    .map((row) => {
      const pastSum = pastTotals.reduce((s, byCat) => s + (byCat[row.key]?.sum || 0), 0);
      const avg = pastSum / lookbackMonths;
      const pct = avg > 0 ? (row.sum - avg) / avg : row.sum > 0 ? 1 : 0;
      return { ...row, avg, pct };
    })
    .filter((r) => r.avg >= minAvg && r.pct >= threshold)
    .sort((a, b) => b.pct - a.pct);
}

// Quick "how am I doing this month" read: current month's spend vs the trailing
// average of *actual* past months with spending in them (empty history months
// are excluded rather than dragging the average toward zero). Requires at
// least 2 populated past months before it will claim a trend — otherwise it
// says so instead of showing a wild, unreliable percentage.
export function healthSnapshot(txns, cm, lookbackMonths = 3) {
  const currentExp = sumExpense(monthTxns(txns, cm));
  const pastMonths = Array.from({ length: lookbackMonths }, (_, i) => addMonths(cm, -(i + 1)));
  const pastExps = pastMonths.map((m) => sumExpense(monthTxns(txns, m))).filter((e) => e > 0);
  const haveHistory = pastExps.length >= 2;
  const avgExp = haveHistory ? pastExps.reduce((a, b) => a + b, 0) / pastExps.length : 0;
  const pct = avgExp > 0 ? (currentExp - avgExp) / avgExp : 0;
  // status thresholds: within ±12% of average = stable; over is a soft warning,
  // then a harder one past +30%. Under average is always framed positively.
  let status = "stable";
  if (haveHistory) {
    if (pct >= 0.3) status = "high";
    else if (pct >= 0.12) status = "elevated";
    else if (pct <= -0.12) status = "low";
  }
  return { currentExp, avgExp, pct, haveHistory, status };
}

// Share of income actually kept this month (income − expense) / income.
// null when there's no income logged this month (nothing to divide by).
export function savingsRate(txns, cm) {
  const mt = monthTxns(txns, cm);
  const inc = sumIncome(mt), exp = sumExpense(mt);
  if (inc <= 0) return null;
  return Math.max(-1, Math.min(1, (inc - exp) / inc));
}

// This month's single biggest expense txn, and a couple of quick per-txn stats.
export function monthStats(txns, cm) {
  const mt = monthTxns(txns, cm).filter((t) => t.type === "expense" || t.type === "goal_withdraw");
  const biggest = mt.slice().sort((a, b) => b.amount - a.amount)[0] || null;
  const total = mt.reduce((s, t) => s + t.amount, 0);
  return { biggest, count: mt.length, avgPerTxn: mt.length > 0 ? total / mt.length : 0 };
}
