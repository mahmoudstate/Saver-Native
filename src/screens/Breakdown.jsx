// Saver — Breakdown: income / expense analytics (showcase 35) for the current month.
// Spending ⇄ Income toggle; biggest item + top categories; filter entry → Smart Filter.
import { useMemo, useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import Money from "../ui/Money.jsx";
import MonthSheet from "../ui/MonthSheet.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import { resolveCat, CATS } from "../ui/cats.js";
import { fmt, currentMonth, monthName, dayName } from "../lib/format.js";
import { monthTxns } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

// same day+date label used across Activity / Account / Budget / Project rows (Western digits)
const rowDate = (d) => { if (!d) return ""; const dt = new Date(d + "T12:00:00"); return `${dayName(dt.getDay())} ${dt.getDate()} ${monthName(dt.getMonth())} ${dt.getFullYear()}`; };
// "This month" for the current month, else "Mon" or "Mon YYYY" if a different year
const monthChip = (m, cm, tr) => { const [y, mo] = m.split("-"); return m === cm ? tr("brk.thisMonth") : `${monthName(+mo - 1)}${y !== cm.slice(0, 4) ? " " + y : ""}`; };
// the category's own colour (same as its CatTile icon), so each bar matches its glyph
const catColor = (txn) => { const k = resolveCat(txn); return (k && CATS[k]) ? CATS[k][0] : (txn?.catColor || "var(--muted)"); };

export default function Breakdown({ store, back }) {
  const { txns = [], banks = [] } = store;
  const tr = useT();
  const cm = currentMonth();
  const [vm, setVm] = useState(cm); // viewed month
  const [monthSheet, setMonthSheet] = useState(false);
  const [mode, setMode] = useState("expense"); // expense | income
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "";

  const { total, biggest, cats } = useMemo(() => {
    const mt = monthTxns(txns, vm).filter((t) => (mode === "expense" ? (t.type === "expense" || t.type === "goal_withdraw") : t.type === "income"));
    const total = mt.reduce((a, t) => a + t.amount, 0);
    const biggest = mt.slice().sort((a, b) => b.amount - a.amount)[0] || null;
    const byCat = {};
    mt.forEach((t) => { const k = t.catName || t.catId || "Other"; (byCat[k] = byCat[k] || { name: k, sum: 0, sample: t }).sum += t.amount; });
    const cats = Object.values(byCat).sort((a, b) => b.sum - a.sum);
    return { total, biggest, cats };
  }, [txns, vm, mode]);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("brk.title")}</div><div className="grow" /><div className="hchip" onClick={() => setMonthSheet(true)} style={{ background: "var(--heroChip)", color: "var(--heroText)", border: "none", cursor: "pointer" }}><Ico name="cal" size={14} /> {monthChip(vm, cm, tr)}</div></div>
        <div className="lbl">{mode === "expense" ? tr("brk.totalSpent") : tr("brk.totalIncome")}</div>
        <Money className="big tnum" v={total} />
        <div className="sub">{tr(cats.length === 1 ? "brk.acrossOne" : "brk.acrossMany", { n: cats.length })}</div>
      </div>

      <SegToggle style={{ marginBottom: 16 }} value={mode} onChange={setMode} options={[{ id: "expense", label: tr("brk.spending") }, { id: "income", label: tr("brk.income") }]} />

      {cats.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr(mode === "expense" ? "brk.noSpendingMonth" : "brk.noIncomeMonth")}</div>
      ) : (
        <>
          {biggest && <>
            <div className="over">{tr(mode === "expense" ? "brk.biggestExpense" : "brk.biggestDeposit")}</div>
            <div className="icard">
              <CatTile txn={biggest} size={44} />
              <div><div className="nm">{biggest.catName || biggest.note || "—"}</div><div className="mt">{bankName(biggest.bankId)}{biggest.date ? " · " + rowDate(biggest.date) : ""}</div></div>
              <div className={`amt ${mode === "expense" ? "out" : "in"} tnum`}>{mode === "expense" ? "−" : "+"}{fmt(biggest.amount)}</div>
            </div>
          </>}

          <div className="over" style={{ marginTop: 14 }}>{tr("brk.topCategories")}</div>
          <div className="tile" style={{ padding: 16 }}>
            {cats.map((c, i) => {
              const pct = total > 0 ? Math.round((c.sum / total) * 100) : 0;
              return (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: i === cats.length - 1 ? 0 : 13 }}>
                  <CatTile txn={c.sample} size={34} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 5 }}><span>{c.name}</span><span className="tnum">{fmt(c.sum)} · {pct}%</span></div>
                    <div className="pbar bar"><i style={{ width: `${pct}%`, background: catColor(c.sample) }} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {monthSheet && <MonthSheet value={vm} max={cm} onPick={(m) => { setVm(m); setMonthSheet(false); }} onClose={() => setMonthSheet(false)} />}
    </div>
  );
}
