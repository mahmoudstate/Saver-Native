// Builds the snapshot the iOS home screen widgets render. Amounts are
// pre-formatted strings (currency already applied) so the native widgets never
// do money math. Bank logos and category icons are rasterised to small PNG
// data-URLs here (the native widget can't read the app's SVG assets), with an
// in-memory cache so we only rasterise each one once.
import { totalSafe, totalBalance, makeCalc, calcGoalSaved, monthTxns, sumExpense } from "./calc.js";
import { fmt, today, currentMonth, prevMonthOf } from "./format.js";
import { billPeriod, isBillPaidForKey } from "./billfreq.js";
import { resolveBankIcon } from "./banks.js";
import { BRAND_ICONS } from "./services.js";
import { CATS } from "../ui/cats.js";

const DEFAULT_COLOR = "#5FE3C0";
const _imgCache = new Map();

// Grouped number without a currency symbol — keeps the per-bank figures big
// and legible in the compact banks widget (the header already says it's money).
const plain = (v) => Math.round(v || 0).toLocaleString("en-US");

const abbrev = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
};

// Draw an image or SVG source onto a square canvas and return a PNG data-URL.
// Resolves to null on any failure so the widget just falls back to a plain tile.
function rasterize(src, size = 120) {
  if (!src) return Promise.resolve(null);
  if (_imgCache.has(src)) return Promise.resolve(_imgCache.get(src));
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const c = document.createElement("canvas");
          c.width = c.height = size;
          c.getContext("2d").drawImage(img, 0, 0, size, size);
          const out = c.toDataURL("image/png");
          _imgCache.set(src, out);
          resolve(out);
        } catch { resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    } catch { resolve(null); }
  });
}

// Build an SVG data-URL for a category glyph, stroked in the category colour.
function catSvg(glyph, color) {
  const entry = CATS[glyph];
  if (!entry) return null;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${entry[1]}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

// A bill's logo the way the Bills screen resolves it: brand mark when the
// service is known (image asset or a Simple-Icons path), category glyph
// otherwise. Returns {src, full} for rasterising, or null for a monogram tile.
function billIcon(bill) {
  const ic = bill.domain && BRAND_ICONS[bill.domain];
  if (ic?.img) return { src: ic.img, full: !!ic.full };
  if (ic?.p) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#${ic.h || "888"}">${`<path d="${ic.p}"/>`}</svg>`;
    return { src: "data:image/svg+xml;utf8," + encodeURIComponent(svg), full: false };
  }
  if (bill.glyph) return { src: catSvg(bill.glyph, bill.color || DEFAULT_COLOR), full: false };
  return null;
}

export async function buildWidgetData(store) {
  const banks = store.banks || [];
  const txns = store.txns || [];
  const savings = store.savings || [];
  const quickActions = store.quickActions || [];
  const expCats = store.expCats || [];
  const bills = store.bills || [];
  const calc = makeCalc(txns, savings);
  const todayISO = today();
  const month = currentMonth();

  // Up to four goals — the medium widget shows them as a row of rings, four
  // across like the Batteries widget.
  const goals = savings
    .filter((g) => g.status !== "archived" && g.goal > 0)
    .slice(0, 4)
    .map((g) => {
      const saved = Math.max(0, calcGoalSaved(g.id, txns));
      return {
        id: g.id,
        name: g.name,
        saved: fmt(saved),
        target: fmt(g.goal),
        percent: Math.min(100, Math.round((saved / g.goal) * 100)),
        color: g.color || DEFAULT_COLOR,
      };
    });
  const goal = goals[0] || null; // kept for any single-goal consumer

  const quick = await Promise.all(
    quickActions.filter((q) => q.catId).slice(0, 4).map(async (q) => {
      const cat = expCats.find((c) => c.id === q.catId);
      const color = cat?.color || DEFAULT_COLOR;
      return { id: q.id, label: cat?.name || "Quick", amount: fmt(+q.amount || 0), color, icon: await rasterize(catSvg(cat?.glyph, color), 72) };
    })
  );

  // Archiving an account hides it everywhere in the app, so it has to leave the
  // widget too — otherwise it only disappears once you delete it for good.
  const banksOut = await Promise.all(
    banks.filter((b) => !b.archived).slice(0, 6).map(async (b) => {
      const icon = resolveBankIcon(b.domain, b.name);
      return {
        id: b.id,
        name: b.name,
        abbrev: abbrev(b.name),
        available: plain(calc.safeToSpend(b.id)),
        color: b.color || DEFAULT_COLOR,
        logo: icon?.img ? await rasterize(icon.img, 120) : null,
        logoFull: !!icon?.full,
      };
    })
  );

  const unpaid = bills
    .map((b) => { const p = billPeriod(b, todayISO); return { b, dueIn: p.dueIn, paid: isBillPaidForKey(b, p.key) }; })
    .filter((x) => !x.paid)
    .sort((a, z) => (a.dueIn ?? 9999) - (z.dueIn ?? 9999));

  // The soonest three unpaid bills, each with its logo and a short due label —
  // the medium bills widget lists these the way accounts and goals are listed.
  const dueLabel = (n) => n == null ? "" : n < 0 ? `${Math.abs(n)}d overdue` : n === 0 ? "Due today" : n === 1 ? "Tomorrow" : `In ${n}d`;
  const billsList = await Promise.all(
    unpaid.slice(0, 3).map(async ({ b, dueIn }) => {
      const ic = billIcon(b);
      return {
        id: b.id,
        name: b.name,
        amount: plain(+b.amount || 0),
        due: dueLabel(dueIn),
        overdue: dueIn != null && dueIn < 0,
        color: b.color || DEFAULT_COLOR,
        abbrev: abbrev(b.name),
        logo: ic?.src ? await rasterize(ic.src, 120) : null,
        logoFull: !!ic?.full,
      };
    })
  );

  // Spend against the same point last month, so the widget can say whether this
  // month is running hot instead of leaving the reader to guess what the number
  // means. Null when there's nothing to compare against.
  const spent = sumExpense(monthTxns(txns, month));
  const prevSpent = sumExpense(monthTxns(txns, prevMonthOf(month)));
  // Truncated, not rounded: spending 7 against last month's 6,810 is a 99.9%
  // drop, and rounding turned that into "100% less than last month" — which
  // says you spent nothing. Only a real zero may reach 100.
  const spentDelta = prevSpent > 0 ? Math.trunc(((spent - prevSpent) / prevSpent) * 100) : null;

  return {
    safeToSpend: fmt(totalSafe(banks, txns, savings)),
    totalBalance: fmt(totalBalance(banks, txns)),
    monthSpent: fmt(spent),
    spentDelta,
    bankCount: banks.filter((b) => !b.archived).length,
    banks: banksOut,
    quick,
    goal,
    goals,
    bills: {
      count: unpaid.length,
      total: fmt(unpaid.reduce((s, x) => s + (+x.b.amount || 0), 0)),
      list: billsList,
      nextName: unpaid[0]?.b.name || "",
      nextAmount: unpaid[0] ? fmt(+unpaid[0].b.amount || 0) : "",
      nextDueIn: unpaid[0]?.dueIn ?? null,
    },
    updatedAt: Date.now(),
  };
}
