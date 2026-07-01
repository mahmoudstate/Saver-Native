// Saver — Accounts list: ported 1:1 from showcase 40 (manage banks & cash).
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Ico from "../ui/Ico.jsx";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, totalBalance, totalFrozen } from "../lib/calc.js";
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
      <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: b.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 15 }}>{(b.name || "?").slice(0, 1).toUpperCase()}</span>
      <div><div className="nm">{b.name}</div><div className="mt">{sub}</div></div>
      <div className="amt tnum">{fmt(balance)}</div>
    </div>
  );
}

export default function Accounts({ store, back, onOpen, onAdd }) {
  const { banks = [], txns = [], savings = [] } = store;
  const tr = useT();
  const total = totalBalance(banks, txns);
  const frozen = totalFrozen(banks, txns, savings);
  const active = banks.filter((b) => !b.archived);
  const dndSensors = useRowDndSensors();
  const onDragEnd = ({ active: a, over }) => {
    if (!over || a.id === over.id) return;
    store.set("banks", (list) => {
      const oldIndex = list.findIndex((x) => x.id === a.id);
      const newIndex = list.findIndex((x) => x.id === over.id);
      return oldIndex < 0 || newIndex < 0 ? list : arrayMove(list, oldIndex, newIndex);
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("account.title")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">{tr("home.totalBalance")}</div>
        <Money className="big tnum" v={total} />
        <div className="sub">{tr("account.accountsCount", { n: active.length })}{frozen > 0 ? ` · ${tr("home.frozenInGoals", { amt: fmt(frozen) })}` : ""}</div>
      </div>

      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={active.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          {active.map((b) => {
            const fr = Math.max(0, calcFrozenForBank(b.id, savings, txns));
            const sub = b.lowBalanceThreshold ? tr("account.lowAlert", { amt: fmt(b.lowBalanceThreshold) }) : fr > 0 ? tr("account.frozenGoals", { amt: fmt(fr) }) : tr("add.account");
            return <SortableBankRow key={b.id} b={b} sub={sub} balance={calcBankBalance(b.id, txns)} onOpen={onOpen} />;
          })}
        </SortableContext>
      </DndContext>

      <div className="icard" onClick={onAdd} style={{ cursor: "pointer", borderStyle: "dashed" }}>
        <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
        <div className="nm" style={{ color: "var(--acText)" }}>{tr("account.addAccount")}</div>
      </div>
    </div>
  );
}
