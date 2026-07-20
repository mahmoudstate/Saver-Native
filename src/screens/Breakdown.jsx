// Saver: Breakdown: income / expense analytics for a freely chosen date range
// (tap the hero chip to open the same DatePicker used on Activity: a whole
// month, or any custom "from/to" day range). Each category's bar is
// solid-filled with its own colour, its share of the range bolded inside the
// fill (min-width keeps it legible even for a small share); the badge next to
// the name is a separate stat, the change vs the equivalent-length period
// immediately before this one, shown as an arrow so it's never confused with
// the in-bar share percentage.
import { useMemo, useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import Money from "../ui/Money.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import { resolveCat, CATS } from "../ui/cats.js";
import { fmt, currentMonth } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const pad = (n) => String(n).padStart(2, "0");
const addDays = (iso, n) => { const d = new Date(iso + "T12:00:00"); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const catColor = (txn) => { const k = resolveCat(txn); return (k && CATS[k]) ? CATS[k][0] : (txn?.catColor || "var(--muted)"); };

const lum = (hex) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function CatBar({ c, last }) {
  const color = catColor(c.sample);
  const fg = lum(color) > 0.6 ? "#111" : "#fff";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 11, marginBottom: last ? 0 : 22 }}>
      <CatTile txn={c.sample} size={34} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 700, marginBottom: 7 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{c.name}{c.insight && <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 99, background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}>{c.insight}</span>}</span>
          <span className="tnum">{fmt(c.sum)}</span>
        </div>
        <div style={{ position: "relative", height: 24 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: 99, background: "var(--track)" }} />
          <div style={{ position: "absolute", inset: 0, width: `max(${c.pct}%, 44px)`, borderRadius: 99, background: color }} />
          <span className="tnum" style={{ position: "absolute", top: "50%", insetInlineStart: 9, transform: "translateY(-50%)", fontSize: 12, fontWeight: 800, color: fg, lineHeight: 1 }}>{c.pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function Breakdown({ store, back, dateFilter, onPickDate }) {
  const { txns = [] } = store;
  const tr = useT();

  // No filter picked yet defaults to the current calendar month; "all" means
  // no bound on either side.
  const cm = currentMonth();
  const [cy, cmo] = cm.split("-").map(Number);
  const defaultFrom = `${cm}-01`, defaultTo = `${cm}-${pad(new Date(cy, cmo, 0).getDate())}`;
  const isAll = dateFilter?.mode === "all";
  const from = dateFilter ? (isAll ? null : dateFilter.from) : defaultFrom;
  const to = dateFilter ? (isAll ? null : dateFilter.to) : defaultTo;
  const rangeLabel = dateFilter ? dateFilter.label : tr("brk.thisMonth");

  // Flags the "last week" badge only when the range is exactly the Monday-Sunday
  // week right before this one (e.g. opened from the weekly recap notification),
  // not for any other custom range that just happens to also span 7 days.
  const isLastWeek = useMemo(() => {
    if (!from || !to) return false;
    const now = new Date();
    const thisMonday = new Date(now); thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    const lastSunday = new Date(thisMonday); lastSunday.setDate(thisMonday.getDate() - 1);
    const lastMonday = new Date(lastSunday); lastMonday.setDate(lastSunday.getDate() - 6);
    return from === `${lastMonday.getFullYear()}-${pad(lastMonday.getMonth() + 1)}-${pad(lastMonday.getDate())}`
      && to === `${lastSunday.getFullYear()}-${pad(lastSunday.getMonth() + 1)}-${pad(lastSunday.getDate())}`;
  }, [from, to]);

  const [mode, setMode] = useState("expense"); // expense | income

  const { total, cats } = useMemo(() => {
    // the equivalent-length window immediately before this one, for the
    // per-category change badge, skipped entirely for an unbounded "all time" range.
    let prevFrom = null, prevTo = null;
    if (from && to) {
      const days = Math.round((new Date(to + "T12:00:00") - new Date(from + "T12:00:00")) / 86400000) + 1;
      prevTo = addDays(from, -1);
      prevFrom = addDays(prevTo, -(days - 1));
    }
    const inRange = (t, f, t2) => { if (f && t.date < f) return false; if (t2 && t.date > t2) return false; return true; };
    const all = txns.filter((t) => (mode === "expense" ? (t.type === "expense" || t.type === "goal_withdraw") : t.type === "income"));
    const cur = all.filter((t) => inRange(t, from, to));
    const prev = prevFrom ? all.filter((t) => inRange(t, prevFrom, prevTo)) : [];
    const total = cur.reduce((a, t) => a + t.amount, 0);
    const byCat = {};
    cur.forEach((t) => { const k = t.catName || t.catId || tr("brk.other"); (byCat[k] = byCat[k] || { name: k, sum: 0, sample: t }).sum += t.amount; });
    const prevByCat = {};
    prev.forEach((t) => { const k = t.catName || t.catId || tr("brk.other"); prevByCat[k] = (prevByCat[k] || 0) + t.amount; });
    let cats = Object.values(byCat).sort((a, b) => b.sum - a.sum);
    cats = cats.map((c, i) => {
      const pct = total > 0 ? Math.round((c.sum / total) * 100) : 0;
      let insight = null;
      if (i === 0) insight = tr("brk.top");
      else if (prevFrom) {
        const prevSum = prevByCat[c.name] || 0;
        if (prevSum > 0) { const change = Math.round(((c.sum - prevSum) / prevSum) * 100); if (change !== 0) insight = `${change > 0 ? "↑" : "↓"}${Math.abs(change)}%`; }
        else insight = tr("brk.newCat");
      }
      return { ...c, pct, insight };
    });
    return { total, cats };
  }, [txns, from, to, mode, tr]);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("brk.title")}</div><div className="grow" /><div className="hchip" onClick={onPickDate} style={{ background: "var(--heroChip)", color: "var(--heroText)", border: "none", cursor: "pointer" }}><Ico name="cal" size={14} /> {rangeLabel}</div></div>
        <div className="lbl">{mode === "expense" ? tr("brk.totalSpent") : tr("brk.totalIncome")}</div>
        <Money className="big tnum" v={total} />
        {isLastWeek && <div style={{ fontSize: 12.5, fontWeight: 800, color: "var(--heroText)", opacity: .75, marginTop: 2 }}>{tr("brk.lastWeekRecap")}</div>}
        <div className="sub">{cats[0] ? tr("brk.topCategoryLine", { name: cats[0].name }) : tr(cats.length === 1 ? "brk.acrossOne" : "brk.acrossMany", { n: cats.length })}</div>
      </div>

      <SegToggle style={{ marginBottom: 16 }} value={mode} onChange={setMode} options={[{ id: "expense", label: tr("brk.spending") }, { id: "income", label: tr("brk.income") }]} />

      {cats.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr(mode === "expense" ? "brk.noSpending" : "brk.noIncome")}</div>
      ) : (
        <>
          <div className="over">{tr("brk.topCategories")}</div>
          <div className="tile" style={{ padding: 16 }}>
            {cats.map((c, i) => <CatBar key={c.name} c={c} last={i === cats.length - 1} />)}
          </div>
        </>
      )}
    </div>
  );
}
