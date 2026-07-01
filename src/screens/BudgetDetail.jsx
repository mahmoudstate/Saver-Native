// Saver — Budget detail (monthly): ported 1:1 from showcase 12 (category ledger).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import TxnRow from "../ui/TxnRow.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentCycleAnchor, cyclePeriod, today, monthName } from "../lib/format.js";
import { budgetSpentMonth, budgetTxns, daysLeftInCycle, spentPerActiveDay } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

export default function BudgetDetail({ store, budgetId, back, onEdit, onEditTxn }) {
  const { budgets = [], txns = [], banks = [] } = store;
  const [menu, setMenu] = useState(false);
  const tr = useT();
  const budget = budgets.find((b) => b.id === budgetId);
  if (!budget) return null;

  // Delete just removes the tracker — the expenses themselves stay in your history.
  const remove = () => store.setConfirm({
    title: tr("budget.deleteBudgetTitle", { name: budget.name }), message: tr("budget.deleteBudgetMsg"),
    danger: true, confirmText: tr("budget.deleteBudget"), icon: "trash",
    onConfirm: () => { store.set("budgets", (list) => list.filter((b) => b.id !== budgetId)); store.flash({ title: tr("budget.budgetDeleted"), sub: budget.name, color: "var(--muted)" }); back(); },
  });
  const cm = currentCycleAnchor(today(), budget.cycleStartDay);
  const spent = budgetSpentMonth(budget, txns, cm);
  const limit = budget.amount || 0;
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const over = spent > limit;
  const left = limit - spent;
  const rows = budgetTxns(budget, txns, cm).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "—";
  const daysLeft = daysLeftInCycle(cyclePeriod(cm, budget.cycleStartDay).to, today());
  const safePerDay = limit > 0 ? Math.max(0, left) / daysLeft : null;
  const spentPerDay = spentPerActiveDay(rows);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{budget.name}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(budget)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">{tr("budget.spent")}</div>
        <Money className="big tnum" v={spent} />
        <div className="sub">{tr("budget.ofBudget", { amt: fmt(limit) })} &nbsp;·&nbsp; {tr("budget.pctUsed", { pct: limit > 0 ? Math.round((spent / limit) * 100) : 0 })}</div>
      </div>

      <div className="tile" style={{ marginBottom: 18, padding: 14 }}>
        <div className="pbar bar"><i style={{ width: `${pct}%`, background: over ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)" }} /></div>
        <div className="caption" style={{ marginTop: 9, color: over ? "var(--red)" : "var(--muted)" }}>{over ? tr("budget.overFor", { amt: fmt(-left), month: monthName(+cm.split("-")[1] - 1) }) : tr("budget.leftFor", { amt: fmt(left), month: monthName(+cm.split("-")[1] - 1) })}</div>
        <div style={{ display: "flex", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="over" style={{ margin: 0 }}>{tr("budget.safePerDay")}</div>
            <div className="title tnum" style={{ fontSize: 17, marginTop: 4 }}>{safePerDay != null ? fmt(safePerDay) : "—"}</div>
            <div className="caption" style={{ marginTop: 2 }}>{tr(daysLeft === 1 ? "budget.daysLeftOne" : "budget.daysLeftMany", { n: daysLeft })}</div>
          </div>
          <div style={{ width: 1, background: "var(--border)", margin: "2px 14px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="over" style={{ margin: 0 }}>{tr("budget.spentPerDay")}</div>
            <div className="title tnum" style={{ fontSize: 17, marginTop: 4 }}>{fmt(spentPerDay)}</div>
            <div className="caption" style={{ marginTop: 2 }}>{tr("budget.avgDays")}</div>
          </div>
        </div>
      </div>

      <div className="over">{tr("budget.transactions")}</div>
      {rows.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>{tr("budget.noSpendingCats")}</div>
        : rows.map((t) => <TxnRow key={t.id} txn={t} bankNameOf={bankName} onClick={onEditTxn ? () => onEditTxn(t) : undefined} />)}

      {menu && <MenuSheet title={budget.name} onClose={() => setMenu(false)} items={[
        { label: tr("edit.delete"), icon: "trash", danger: true, sub: tr("budget.deleteBudgetMenuSub"), onClick: remove },
      ]} />}
    </div>
  );
}
