// Saver — Goal detail: ported 1:1 from showcase 13 (savings ledger).
// Actions use the LOCKED engine: Add money = saving txn; Return to bank = goal_return
// (auto-splits across the banks it was frozen in); spending-mode/archive per legacy.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import LinkBadge from "../ui/LinkBadge.jsx";
import Money from "../ui/Money.jsx";
import { fmt, today, fmtDate } from "../lib/format.js";
import { calcGoalSaved, goalBalancesPerBank } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";


export default function GoalDetail({ store, goalId, back, onReached, onEdit, onEditTxn }) {
  const { savings = [], banks = [], txns = [] } = store;
  const tr = useT();
  const goal = savings.find((s) => s.id === goalId);
  const [sheet, setSheet] = useState(null); // "add" | "return"
  const [menu, setMenu] = useState(false);
  if (!goal) return null;

  const saved = Math.max(0, calcGoalSaved(goalId, txns));
  const target = goal.goal || 0;
  const left = Math.max(0, target - saved);
  const pct = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const spending = !!goal.spendingMode;
  const bankOf = (id) => banks.find((b) => b.id === id);

  const perBank = Object.entries(goalBalancesPerBank(goalId, txns)).filter(([, v]) => v > 0.0001);
  const contributions = txns.filter((t) => t.goalId === goalId).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  // Chain badge only when 2+ operations actually share the same split group id.
  const groupSizes = {}; txns.forEach((t) => { if (t.splitGroupId) groupSizes[t.splitGroupId] = (groupSizes[t.splitGroupId] || 0) + 1; });
  const isLinked = (t) => t.splitGroupId && groupSizes[t.splitGroupId] > 1;

  const addMoney = (amount, bankId) => {
    const bank = bankOf(bankId);
    const id = store.addTxn({ type: "saving", amount, date: today(), bankId, bankName: bank?.name, goalId, goalName: goal.name, catName: goal.name, catIcon: "saving", note: "" });
    if (id === false) return;
    setSheet(null);
    if (saved + amount >= target && target > 0 && onReached) onReached(goal, saved + amount);
    else { store.fireConfetti(); store.flash({ title: tr("goal.addedAmt", { amt: fmt(amount) }), sub: tr("goal.addedFrom", { name: goal.name, bank: bank?.name || tr("goal.bankFallback") }), color: "var(--success)" }); }
  };

  const returnToBank = (amount) => {
    const id = store.addTxn({ type: "goal_return", amount, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Returned to bank", catIcon: "saving" });
    if (id === false) return;
    setSheet(null);
    store.flash({ title: tr("goal.returnedAmt", { amt: fmt(amount) }), sub: tr("goal.backToAccounts"), color: "var(--muted)", icon: "back" });
  };

  const toggleSpending = () => {
    store.setConfirm({
      title: spending ? tr("goal.spendOffTitle") : tr("goal.spendOnTitle"),
      message: spending ? tr("goal.spendOffMsg") : tr("goal.spendOnMsg"),
      color: spending ? "var(--yellow)" : "var(--ac)", confirmText: spending ? tr("goal.turnOff") : tr("goal.turnOn"), icon: "wallet",
      onConfirm: () => store.set("savings", (list) => list.map((s) => (s.id === goalId ? { ...s, spendingMode: !spending } : s))),
    });
  };

  const archive = () => {
    store.setConfirm({
      title: tr("goal.archiveTitle"),
      message: saved > 0 ? tr("goal.archiveMsgSaved", { name: goal.name, amt: fmt(saved) }) : tr("goal.archiveMsgEmpty", { name: goal.name }),
      color: "var(--acText)", confirmText: tr("goal.completeGoal"), icon: "check",
      onConfirm: () => {
        if (saved > 0) store.addTxn({ type: "goal_return", amount: saved, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Goal archived", catIcon: "saving" });
        store.set("savings", (list) => list.map((s) => (s.id === goalId ? { ...s, status: "archived", spendingMode: false } : s)));
        store.flash({ title: tr("goal.goalCompleted"), sub: goal.name, color: "var(--success)" });
        back();
      },
    });
  };

  // Delete: releases any frozen money back to the banks (so balances stay correct),
  // removes the goal from the list, but the saving/return transactions stay in the data.
  const remove = () => {
    store.setConfirm({
      title: tr("goal.deleteTitle", { name: goal.name }),
      message: saved > 0
        ? tr("goal.deleteMsgSaved", { amt: fmt(saved) })
        : tr("goal.deleteMsgEmpty"),
      danger: true, confirmText: tr("goal.deleteGoal"), icon: "trash",
      onConfirm: () => {
        if (saved > 0) store.addTxn({ type: "goal_return", amount: saved, date: today(), bankId: banks[0]?.id, goalId, goalName: goal.name, catName: "Goal deleted", catIcon: "saving" });
        store.set("savings", (list) => list.filter((s) => s.id !== goalId));
        store.flash({ title: tr("goal.goalDeleted"), sub: goal.name, color: "var(--muted)" });
        back();
      },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{goal.name}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(goal)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">{tr("goal.saved")}</div>
        <Money className="big tnum" v={saved} />
        <div className="sub">{left > 0 ? tr("goal.leftPctOf", { left: fmt(left), pct: Math.round(pct), target: fmt(target) }) : tr("goal.reached", { amt: fmt(target) })}</div>
      </div>

      <div className="tile" style={{ marginBottom: 14, padding: 14 }}><div className="pbar bar"><i style={{ width: `${pct}%`, background: "linear-gradient(90deg,var(--ac),var(--ac2))" }} /></div></div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <button className="btn btn-primary" style={{ flex: 1, height: 46, fontSize: 14 }} onClick={() => setSheet("add")}><Ico name="plus" size={17} />{tr("goal.addMoney")}</button>
        <button className="btn btn-secondary" style={{ flex: 1, height: 46, fontSize: 14, opacity: saved > 0 ? 1 : .5 }} disabled={saved <= 0} onClick={() => setSheet("return")}><Ico name="back" size={16} />{tr("goal.returnToBank")}</button>
      </div>

      <div className="tile" style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12, padding: 14, cursor: "pointer" }} onClick={toggleSpending}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="wallet" size={20} /></span>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{tr("goal.spendingMode")}</div><div className="caption" style={{ marginTop: 2 }}>{tr("goal.spendingCaption")}</div></div>
        <span className={`switch ${spending ? "on" : ""}`}><i /></span>
      </div>

      {perBank.length > 0 && <>
        <div className="over">{tr("goal.frozenAcross")}</div>
        {perBank.map(([bid, amt]) => { const b = bankOf(bid); return (
          <div className="icard" key={bid}>
            <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: b?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(b?.name || "?").slice(0, 1).toUpperCase()}</span>
            <div><div className="nm">{b?.name || tr("add.account")}</div><div className="mt">{tr("goal.frozenForGoal")}</div></div>
            <div className="amtb"><b className="tnum">{fmt(amt)}</b></div>
          </div>
        ); })}
      </>}

      <div className="over" style={{ marginTop: 14 }}>{tr("goal.contributions")}</div>
      {contributions.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "8px 2px" }}>{tr("goal.noContributions")}</div>
        : contributions.map((t) => {
          const positive = t.type === "saving" || t.type === "goal_return";
          const labels = { saving: tr("goal.lblAddedToGoal"), goal_withdraw: tr("goal.lblSpentFromGoal"), goal_return: tr("goal.lblReturnedToBank") };
          const title = t.type === "goal_withdraw" ? (t.catName || labels.goal_withdraw) : labels[t.type];
          return (
            <div className="icard" key={t.id} onClick={onEditTxn ? () => onEditTxn(t) : undefined} style={onEditTxn ? { cursor: "pointer" } : undefined}>
              <CatTile txn={t} cat={t.type === "saving" ? "deposit" : t.type === "goal_return" ? "goalReturn" : null} size={44} />
              <div style={{ minWidth: 0 }}>
                <div className="nm">{title}</div>
                <div className="mt">{(bankOf(t.bankId)?.name || "—")} · {t.date ? fmtDate(t.date) : ""}</div>
                {isLinked(t) && (
                  <div className="mt" style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 2 }}>
                    <LinkBadge groupId={t.splitGroupId} />
                  </div>
                )}
              </div>
              <div className="amtb"><b className="tnum" style={{ color: positive ? "var(--success)" : "var(--red)" }}>{positive ? "+" : "−"}{fmt(t.amount)}</b></div>
            </div>
          );
        })}

      <button className="btn btn-secondary btn-full" style={{ marginTop: 18, marginBottom: 8, height: 48, fontSize: 14.5 }} onClick={archive}><Ico name="check" size={17} />{tr("goal.completeArchive")}</button>

      {menu && <MenuSheet title={goal.name} onClose={() => setMenu(false)} items={[
        { label: tr("edit.delete"), icon: "trash", danger: true, sub: tr("goal.deleteMenuSub"), onClick: remove },
      ]} />}

      {sheet === "add" && <AmountSheet title={tr("goal.addMoney")} sub={tr("add.toName", { name: goal.name })} confirmLabel={tr("goal.addToGoal")} banks={banks} onConfirm={addMoney} onClose={() => setSheet(null)} />}
      {sheet === "return" && <AmountSheet title={tr("goal.returnToBank")} sub={tr("goal.fromName", { name: goal.name })} confirmLabel={tr("goal.returnMoney")} max={saved} onConfirm={returnToBank} onClose={() => setSheet(null)} />}
    </div>
  );
}
