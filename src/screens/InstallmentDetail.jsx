// Saver — Installment detail: ring · schedule · pay (showcase 37). Pay / pay-ahead
// / undo are the LOCKED legacy lifecycle (each creates/removes an expense txn and a
// {month,date,txnId,num} payment). Stop keeps history; delete keeps past txns.
import { useState, useRef, useEffect } from "react";
import Ico from "../ui/Ico.jsx";
import StepSheet from "../ui/StepSheet.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import Money from "../ui/Money.jsx";
import { fmt, today, currentMonth, monthName, monthLabel } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const RING_C = 2 * Math.PI * 40; // r = 40

const addMonths = (m, n) => { const [y, mo] = m.split("-").map(Number); const d = new Date(y, mo - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

export default function InstallmentDetail({ store, instId, back, onEdit }) {
  const { installments = [], banks = [] } = store;
  const tr = useT();
  const inst = installments.find((i) => i.id === instId);
  const [sheet, setSheet] = useState(false);
  const [menu, setMenu] = useState(false);
  // Guard against a fast double-tap paying the same installment twice (the state
  // update is async, so two taps in one tick would read the same stale `paid`).
  const busy = useRef(false);
  const paidCount = inst ? (inst.payments ? inst.payments.length : inst.paidInstallments || 0) : 0;
  useEffect(() => { busy.current = false; }, [paidCount]);
  if (!inst) return null;

  const label = inst.itemType || inst.company || inst.name || tr("instd.installmentFallback");
  const color = inst.color || "var(--ac)";
  const bankName = banks.find((b) => b.id === inst.bankId)?.name || "—";
  const cm = currentMonth();

  const ensurePayments = () => {
    if (inst.payments) return inst.payments;
    const n = inst.paidInstallments || 0, arr = [];
    for (let k = 0; k < n; k++) arr.push({ month: addMonths(inst.startDate?.slice(0, 7) || cm, k), date: null, txnId: null, num: k + 1 });
    return arr;
  };
  const payments = ensurePayments();
  const paid = payments.length;
  const total = inst.totalInstallments;
  const paidAmt = paid * inst.installmentAmount;
  const remaining = Math.max(0, inst.totalAmount - paidAmt);
  const pct = total ? paid / total : 0;
  const done = paid >= total;
  const left = total - paid;
  // The main "Pay" button settles only the current month's due installment; it
  // disappears once this month is covered (paying ahead is the other button's job).
  const paidThisMonth = payments.some((p) => p.month === cm);

  const startMonth = inst.startDate?.slice(0, 7) || payments[0]?.month || cm;
  const nextDueMonth = !done && !inst.stopped ? monthName(+addMonths(startMonth, paid).split("-")[1] - 1) : null;
  const rows = Array.from({ length: total }, (_, i) => {
    const num = i + 1;
    const p = payments[i];
    const month = p?.month || addMonths(startMonth, i);
    const isPaid = i < paid;
    const isNext = !isPaid && i === paid && !done;
    return { num, month, isPaid, isNext, txnId: p?.txnId || null };
  });

  const persist = (newPayments) => {
    const newStatus = newPayments.length >= total ? "completed" : "active";
    store.set("installments", (list) => list.map((x) => (x.id === inst.id ? { ...x, payments: newPayments, paidInstallments: newPayments.length, status: newStatus } : x)));
    return newStatus;
  };

  const mkTxn = (num) => ({ type: "expense", amount: inst.installmentAmount, date: today(), bankId: inst.bankId, bankName, catId: "installment", catName: "Installments", catIcon: inst.glyph || "installment", catColor: color, note: `Installment ${num}/${total}: ${label}` });

  // Pay the next N installments at once (default 1). Tags each with its scheduled month.
  const payN = (n) => {
    if (busy.current) return; // a pay is already in flight this tick
    if (done) { store.setAlert({ title: tr("instd.allPaid"), message: tr("instd.allPaidMsg"), color: "var(--acText)", icon: "check" }); return; }
    n = Math.min(left, Math.max(1, n));
    const batch = [], newPays = [];
    for (let k = 0; k < n; k++) batch.push(mkTxn(paid + k + 1));
    busy.current = true; // locks until the new `paid` re-renders (cleared by effect)
    const ids = store.addTxns(batch);
    if (ids === false) { busy.current = false; return; } // blocked (insufficient balance) — alert shown
    for (let k = 0; k < n; k++) newPays.push({ month: addMonths(startMonth, paid + k), date: today(), txnId: ids[k], num: paid + k + 1 });
    const status = persist([...payments, ...newPays]);
    if (status === "completed") store.setAlert({ title: tr("instd.paidOff"), message: tr("instd.paidOffMsg", { name: label }), color: "var(--acText)", icon: "check" });
    else store.flash({ title: n === 1 ? tr("instd.payLoggedOne", { n: paid + 1, total }) : tr("instd.payLoggedMany", { n }), sub: `${fmt(inst.installmentAmount * n)} · ${label}`, color: "var(--success)" });
  };

  const undo = (row) => {
    store.setConfirm({
      title: tr("instd.undoTitle", { n: row.num }), message: tr("instd.undoMsg", { month: monthLabel(row.month) }), confirmText: tr("instd.undoPayment"), danger: true, icon: "back",
      onConfirm: () => { if (row.txnId) store.delTxn(row.txnId); persist(payments.filter((p) => p.month !== row.month)); store.flash({ title: tr("instd.paymentRemoved"), sub: `${label} · ${monthLabel(row.month)}`, color: "var(--muted)" }); },
    });
  };

  const toggleStop = () => {
    if (inst.stopped) { store.set("installments", (list) => list.map((x) => { if (x.id !== inst.id) return x; const { stopped, ...rest } = x; return rest; })); store.flash({ title: tr("instd.resumed"), sub: label, color: "var(--success)", icon: "check" }); return; }
    store.setConfirm({ title: tr("instd.stopTitle", { name: label }), message: tr("instd.stopMsg"), confirmText: tr("instd.stopPlan"), icon: "back",
      onConfirm: () => { store.set("installments", (list) => list.map((x) => (x.id === inst.id ? { ...x, stopped: true } : x))); store.flash({ title: tr("instd.planStopped"), sub: label, color: "var(--muted)" }); } });
  };

  const remove = () => {
    const has = payments.length > 0;
    store.setConfirm({
      title: tr("instd.deleteTitle", { name: label }), message: has ? tr("instd.deleteHasMsg") : tr("instd.deleteNoMsg"), confirmText: tr("edit.delete"), danger: true, icon: "trash",
      onConfirm: () => { store.set("installments", (list) => list.filter((x) => x.id !== inst.id)); store.flash({ title: tr("instd.planDeleted"), sub: label, color: "var(--muted)" }); back(); },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{label}</div><div className="grow" /><div className="hib" onClick={() => onEdit?.(inst)} style={{ marginRight: 8 }}><Ico name="pencil" size={18} /></div><div className="hib" onClick={() => setMenu(true)}><Ico name="more" size={20} /></div></div>
        <div className="lbl">{inst.company ? inst.company + " · " : ""}{tr("instd.perMo", { amt: fmt(inst.installmentAmount) })}</div>
        <Money className="big tnum" v={remaining} />
        <div className="sub">{inst.stopped ? tr("instd.stopped") : done ? tr("instd.fullyPaid") : tr("instd.nextDue", { month: nextDueMonth, amt: fmt(inst.installmentAmount) })}</div>
      </div>

      <div className="card ringcard r" style={{ "--d": ".16s", display: "flex", alignItems: "center", gap: 20, marginBottom: 16 }}>
        <div className="ring" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--track)" strokeWidth="10" />
            <circle cx="48" cy="48" r="40" fill="none" stroke="var(--ac)" strokeWidth="10" strokeLinecap="round" strokeDasharray={RING_C.toFixed(1)} strokeDashoffset={(RING_C * (1 - pct)).toFixed(1)} />
          </svg>
          <div className="v"><b className="tnum" style={{ fontSize: 20 }}>{paid}/{total}</b><small>{tr("instd.paidSuffix")}</small></div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div><div className="over" style={{ margin: 0 }}>{tr("instd.paid")}</div><div className="title tnum">{fmt(paidAmt)}</div></div>
          <div><div className="over" style={{ margin: 0 }}>{tr("instd.remaining")}</div><div className="title tnum" style={{ color: "var(--muted)" }}>{fmt(remaining)}</div></div>
          {inst.downPayment > 0 && <div><div className="over" style={{ margin: 0 }}>{tr("instd.deposit")}</div><div className="title tnum" style={{ color: "var(--acText)" }}>{fmt(inst.downPayment)}{inst.downPaymentTxnId ? "" : tr("instd.infoSuffix")}</div></div>}
        </div>
      </div>

      <div className="over r" style={{ "--d": ".2s" }}>{tr("instd.schedule")}</div>
      {rows.map((r) => (
        <div className="icard r" key={r.num} style={{ "--d": ".24s", opacity: r.isPaid || r.isNext ? 1 : .6 }} onClick={r.isPaid ? () => undo(r) : undefined}>
          <span className="circ" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--catTile)", border: "1px solid var(--catTileBorder)", color: r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ico name={r.isPaid ? "check" : "card"} size={18} color={r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)"} />
          </span>
          <div><div className="nm">{tr("instd.paymentN", { n: r.num })}</div><div className="mt">{monthLabel(r.month)}{r.isPaid ? tr("instd.tapToUndo") : ""}</div></div>
          <div className="amtb"><b className="tnum">{fmt(inst.installmentAmount)}</b><small style={{ color: r.isPaid ? "var(--success)" : r.isNext ? "var(--ac)" : "var(--faint)" }}>{r.isPaid ? tr("instd.paid") : r.isNext ? tr("instd.next") : tr("instd.upcoming")}</small></div>
        </div>
      ))}

      {!done && (
        <div className="cta" style={{ display: "flex", gap: 10 }}>
          {inst.stopped
            ? <div className="btn btn-primary btn-full" onClick={toggleStop}><Ico name="check" size={18} />{tr("instd.resumePlan")}</div>
            : !paidThisMonth
              ? <div className="btn btn-primary btn-full" onClick={() => payN(1)}><Ico name="check" size={18} />{tr("instd.payNext", { n: paid + 1, amt: fmt(inst.installmentAmount) })}</div>
              : <div className="btn btn-secondary btn-full" style={{ pointerEvents: "none", opacity: .8 }}><Ico name="check" size={18} />{tr("instd.thisMonthPaid")}</div>}
        </div>
      )}

      {menu && <MenuSheet title={label} onClose={() => setMenu(false)} items={[
        ...(!done && !inst.stopped && left > 1 ? [{ label: tr("instd.payAhead"), icon: "card", sub: tr("instd.payAheadSub"), onClick: () => setSheet(true) }] : []),
        ...(!done ? [{ label: inst.stopped ? tr("instd.resume") : tr("instd.stopPlan"), icon: inst.stopped ? "check" : "back", sub: inst.stopped ? tr("instd.markActive") : tr("instd.keepsPaid"), onClick: toggleStop }] : []),
        { label: tr("edit.delete"), icon: "trash", danger: true, sub: tr("instd.paidStayHistory"), onClick: remove },
      ]} />}

      {sheet && <StepSheet title={tr("instd.payHowMany")} sub={tr("instd.upToLeft", { n: left })} value={1} picks={[2, 3, 6, left]} min={1} max={left} onConfirm={(n) => {
        setSheet(false);
        store.setConfirm({ title: tr(n === 1 ? "instd.payAheadTitleOne" : "instd.payAheadTitleMany", { n }), message: tr(n === 1 ? "instd.payAheadMsgOne" : "instd.payAheadMsgMany", { n, amt: fmt(inst.installmentAmount * n), bank: bankName }), confirmText: tr("instd.payNow"), icon: "card", onConfirm: () => payN(n) });
      }} onClose={() => setSheet(false)} />}
    </div>
  );
}
