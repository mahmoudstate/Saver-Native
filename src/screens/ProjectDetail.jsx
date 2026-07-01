// Saver — Project detail (cross-month): ported 1:1 from showcase 42 (long-term tracking).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import TxnRow from "../ui/TxnRow.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, monthName } from "../lib/format.js";
import { projectSpent, budgetTxns } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

const monthsBetween = (start, end) => { if (!start) return 1; const [sy, sm] = start.split("-").map(Number); const [ey, em] = end.split("-").map(Number); return Math.max(1, (ey - sy) * 12 + (em - sm) + 1); };

export default function ProjectDetail({ store, projectId, back, onEdit, onEditTxn }) {
  const { budgets = [], txns = [], banks = [] } = store;
  const [menu, setMenu] = useState(false);
  const tr = useT();
  const project = budgets.find((b) => b.id === projectId);
  if (!project) return null;
  const cm = currentMonth();
  const spent = projectSpent(project, txns);
  const total = project.amount || 0;
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
  const left = Math.max(0, total - spent);
  const months = monthsBetween(project.startMonth, cm);
  const perMonth = Math.round(spent / months);
  const range = project.startMonth ? `${monthName(+project.startMonth.split("-")[1] - 1)}–${monthName(+cm.split("-")[1] - 1)}` : "";
  const rows = budgetTxns(project, txns).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "—";

  const archived = project.status === "archived";
  const complete = () => store.setConfirm({
    title: tr("budget.completeTitle"), message: tr("budget.completeMsg", { name: project.name }),
    color: "var(--acText)", confirmText: tr("budget.markCompleteBtn"), icon: "check",
    onConfirm: () => { store.set("budgets", (list) => list.map((b) => (b.id === projectId ? { ...b, status: "archived" } : b))); store.flash({ title: tr("budget.projectCompleted"), sub: project.name, color: "var(--success)" }); back(); },
  });
  const reopen = () => { store.set("budgets", (list) => list.map((b) => (b.id === projectId ? { ...b, status: undefined } : b))); store.flash({ title: tr("budget.projectReopened"), sub: project.name, color: "var(--success)", icon: "check" }); };
  const remove = () => store.setConfirm({
    title: tr("budget.deleteProjectTitle", { name: project.name }), message: tr("budget.deleteProjectMsg"),
    danger: true, confirmText: tr("budget.deleteProject"), icon: "trash",
    onConfirm: () => { store.set("budgets", (list) => list.filter((b) => b.id !== projectId)); store.flash({ title: tr("budget.projectDeleted"), sub: project.name, color: "var(--muted)" }); back(); },
  });

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{project.name}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(project)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">{tr("budget.spentSoFar")}</div>
        <Money className="big tnum" v={spent} />
        <div className="sub">{tr("budget.ofPct", { amt: fmt(total), pct: Math.round(pct) })}{range ? ` · ${range}` : ""}</div>
      </div>

      <div className="tile" style={{ marginBottom: 16, padding: 14 }}>
        <div className="pbar bar"><i style={{ width: `${pct}%`, background: "var(--ac)" }} /></div>
        <div className="caption" style={{ marginTop: 9 }}>{tr("budget.toGo", { left: fmt(left), perMonth: fmt(perMonth) })}</div>
      </div>

      <div className="over">{tr("budget.spending")}</div>
      {rows.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>{tr("budget.noSpending")}</div>
        : rows.map((t) => <TxnRow key={t.id} txn={t} bankNameOf={bankName} onClick={onEditTxn ? () => onEditTxn(t) : undefined} />)}

      <div className="cta">
        {archived
          ? <div className="btn btn-secondary btn-full" onClick={reopen}><Ico name="check" size={17} />{tr("budget.reopenProject")}</div>
          : <div className="btn btn-primary btn-full" onClick={complete}><Ico name="check" size={18} />{tr("budget.markComplete")}</div>}
      </div>

      {menu && <MenuSheet title={project.name} onClose={() => setMenu(false)} items={[
        ...(archived ? [{ label: tr("budget.reopenLabel"), icon: "check", sub: tr("budget.moveBackActive"), onClick: reopen }] : []),
        { label: tr("edit.delete"), icon: "trash", danger: true, sub: tr("budget.expensesStay"), onClick: remove },
      ]} />}
    </div>
  );
}
