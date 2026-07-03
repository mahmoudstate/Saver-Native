// Saver — Accounts list: ported 1:1 from showcase 40 (manage banks & cash).
import { useState, useMemo } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Ico from "../ui/Ico.jsx";
import Money from "../ui/Money.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import SwipeToDismiss from "../ui/SwipeToDismiss.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, totalBalance, totalFrozen } from "../lib/calc.js";
import BankLogo from "../ui/BankLogo.jsx";
import { useT } from "../lib/i18n.js";

// Rows are dragged directly (no separate grip handle). MouseSensor needs a small
// move before it claims the pointer (so a tap still opens the account); TouchSensor
// needs a short hold before it claims the pointer (so a normal scroll swipe is never
// hijacked into a drag).
const useRowDndSensors = () => useSensors(
  useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
);

function SortableBankRow({ b, sub, balance, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const style = {
    cursor: "pointer", transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? .85 : 1, zIndex: isDragging ? 2 : "auto", position: "relative",
    ...(isDragging ? { boxShadow: "0 14px 30px rgba(0,0,0,.22)" } : {}),
  };
  return (
    <div className="icard" ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onOpen?.(b)}>
      <BankLogo name={b.name} domain={b.domain} glyph={b.glyph} color={b.color} size={44} radius={14} iconSize={20} />
      <div><div className="nm">{b.name}</div><div className="mt">{sub}</div></div>
      <div className="amt tnum">{fmt(balance)}</div>
    </div>
  );
}

// hasHistory: true if any transaction ever touched this account (as the main
// bank, or either side of a transfer) — used to decide whether permanent
// delete is safe. Deleting a bank with history would silently drop its old
// transactions out of every total/balance sum (they'd stay visible in
// Activity with their own saved bank name, but stop counting anywhere),
// so we only ever offer that for an account that was never actually used.
const hasHistory = (bankId, txns) => txns.some((t) => t.bankId === bankId || t.fromBankId === bankId || t.toBankId === bankId);

// Restore is the one visible action (a small pill, like the notifications
// row style). Delete — only ever available on an unused account — lives
// behind a left-swipe instead of a second crammed-in button, matching the
// swipe-to-dismiss pattern already used for notifications.
function ArchivedBankRow({ b, balance, restoreLabel, onRestore, deletable }) {
  // opacity lives on the inner content, never the card itself — an opaque
  // card is required so the swipe-reveal delete panel can't bleed through.
  return (
    <div className="icard" style={{ marginBottom: 0 }}>
      <BankLogo name={b.name} domain={b.domain} glyph={b.glyph} color={b.color} size={44} radius={14} iconSize={20} style={{ opacity: .75 }} />
      <div style={{ opacity: .75 }}><div className="nm">{b.name}</div><div className="mt tnum">{fmt(balance)}</div></div>
      <div className="btn btn-ghost" style={{ marginInlineStart: "auto", padding: "8px 14px", fontSize: 13, opacity: .75 }} onClick={() => onRestore(b)}><Ico name="back" size={15} />{restoreLabel}</div>
      {deletable && <Ico name="trash" size={14} style={{ color: "var(--red)", opacity: .3, marginInlineStart: 4 }} />}
    </div>
  );
}

export default function Accounts({ store, back, onOpen, onAdd }) {
  const { banks = [], txns = [], savings = [] } = store;
  const tr = useT();
  const total = useMemo(() => totalBalance(banks, txns), [banks, txns]);
  const frozen = useMemo(() => totalFrozen(banks, txns, savings), [banks, txns, savings]);
  const active = banks.filter((b) => !b.archived);
  const archived = banks.filter((b) => b.archived);
  const [view, setView] = useState("active"); // active | archived
  const [openKey, setOpenKey] = useState(null); // which archived row (if any) has swipe-delete revealed
  const dndSensors = useRowDndSensors();
  const onDragEnd = ({ active: a, over }) => {
    if (!over || a.id === over.id) return;
    store.set("banks", (list) => {
      const oldIndex = list.findIndex((x) => x.id === a.id);
      const newIndex = list.findIndex((x) => x.id === over.id);
      return oldIndex < 0 || newIndex < 0 ? list : arrayMove(list, oldIndex, newIndex);
    });
  };
  const restore = (b) => {
    store.set("banks", (list) => list.map((x) => (x.id === b.id ? { ...x, archived: false } : x)));
    store.flash({ title: tr("account.restored"), sub: b.name, color: "var(--success)", icon: "check" });
  };
  const deleteForever = (b) => {
    store.setConfirm({
      title: tr("account.deleteForeverTitle", { name: b.name }),
      message: tr("account.deleteForeverMsg"),
      confirmText: tr("account.deleteForever"), danger: true, icon: "trash",
      onConfirm: () => {
        store.set("banks", (list) => list.filter((x) => x.id !== b.id));
        store.flash({ title: tr("account.deletedForever"), sub: b.name, color: "var(--muted)", icon: "trash" });
      },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("account.title")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">{tr("home.totalBalance")}</div>
        <Money className="big tnum" v={total} />
        <div className="sub">{tr(active.length === 1 ? "account.accountsCountOne" : "account.accountsCount", { n: active.length })}{frozen > 0 ? ` · ${tr("home.frozenInGoals", { amt: fmt(frozen) })}` : ""}</div>
      </div>

      {archived.length > 0 && <SegToggle style={{ marginBottom: 16 }} value={view} onChange={setView} options={[{ id: "active", label: tr("account.active") }, { id: "archived", label: tr("account.archived") }]} />}

      {view === "active" ? (
        <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={active.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {active.map((b) => {
              const fr = Math.max(0, calcFrozenForBank(b.id, savings, txns));
              const sub = b.lowBalanceThreshold ? tr("account.lowAlert", { amt: fmt(b.lowBalanceThreshold) }) : fr > 0 ? tr("account.frozenGoals", { amt: fmt(fr) }) : tr("add.account");
              return <SortableBankRow key={b.id} b={b} sub={sub} balance={calcBankBalance(b.id, txns)} onOpen={onOpen} />;
            })}
          </SortableContext>
        </DndContext>
      ) : (
        <div onClick={() => openKey && setOpenKey(null)}>
          {archived.length === 0
            ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("account.noArchived")}</div>
            : archived.map((b) => {
              const empty = !hasHistory(b.id, txns);
              const row = <ArchivedBankRow b={b} balance={calcBankBalance(b.id, txns)} restoreLabel={tr("account.restore")} onRestore={restore} deletable={empty} />;
              return (
                // .icard's own margin-bottom would get trapped by SwipeToDismiss's
                // overflow:hidden wrapper, so move the gap to the outer element.
                <div key={b.id} style={{ marginBottom: 11 }}>
                  {empty
                    ? <SwipeToDismiss isOpen={openKey === b.id} onOpenChange={(v) => setOpenKey(v ? b.id : null)} onDismiss={() => deleteForever(b)}>{row}</SwipeToDismiss>
                    : row}
                </div>
              );
            })}
        </div>
      )}

      {view === "active" && (
        <div className="icard" onClick={onAdd} style={{ cursor: "pointer", borderStyle: "dashed" }}>
          <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
          <div className="nm" style={{ color: "var(--acText)" }}>{tr("account.addAccount")}</div>
        </div>
      )}
    </div>
  );
}
