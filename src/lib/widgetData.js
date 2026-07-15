// Builds the snapshot the iOS home screen widgets render. Amounts are
// pre-formatted strings (currency already applied) so the native widgets never
// do money math. Bank logos and category icons are rasterised to small PNG
// data-URLs here (the native widget can't read the app's SVG assets), with an
// in-memory cache so we only rasterise each one once.
import { totalSafe, totalBalance, makeCalc, calcGoalSaved, monthTxns, sumExpense } from "./calc.js";
import { fmt, today, currentMonth } from "./format.js";
import { billPeriod, isBillPaidForKey } from "./billfreq.js";
import { resolveBankIcon } from "./banks.js";
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

  const activeGoal = savings.find((g) => g.status !== "archived") || savings[0];
  let goal = null;
  if (activeGoal && activeGoal.goal > 0) {
    const saved = Math.max(0, calcGoalSaved(activeGoal.id, txns));
    goal = {
      name: activeGoal.name,
      saved: fmt(saved),
      target: fmt(activeGoal.goal),
      percent: Math.min(100, Math.round((saved / activeGoal.goal) * 100)),
      color: activeGoal.color || DEFAULT_COLOR,
    };
  }

  const quick = await Promise.all(
    quickActions.filter((q) => q.catId).slice(0, 4).map(async (q) => {
      const cat = expCats.find((c) => c.id === q.catId);
      const color = cat?.color || DEFAULT_COLOR;
      return { id: q.id, label: cat?.name || "Quick", amount: fmt(+q.amount || 0), color, icon: await rasterize(catSvg(cat?.glyph, color), 72) };
    })
  );

  const banksOut = await Promise.all(
    banks.slice(0, 6).map(async (b) => {
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

  return {
    safeToSpend: fmt(totalSafe(banks, txns, savings)),
    totalBalance: fmt(totalBalance(banks, txns)),
    monthSpent: fmt(sumExpense(monthTxns(txns, month))),
    bankCount: banks.length,
    banks: banksOut,
    quick,
    goal,
    bills: {
      count: unpaid.length,
      total: fmt(unpaid.reduce((s, x) => s + (+x.b.amount || 0), 0)),
      nextName: unpaid[0]?.b.name || "",
      nextAmount: unpaid[0] ? fmt(+unpaid[0].b.amount || 0) : "",
      nextDueIn: unpaid[0]?.dueIn ?? null,
    },
    updatedAt: Date.now(),
  };
}
