// Saver — Subscription detail: brand hero + logo (our layout). Record payment,
// stop/resume, and delete are the LOCKED legacy lifecycle (record = expense txn +
// {month,date,txnId}; stop = soft end keeping history; delete keeps past txns).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CatTile from "../ui/CatTile.jsx";
import MenuSheet from "../ui/MenuSheet.jsx";
import Money from "../ui/Money.jsx";
import { fmt, today, currentMonth, cardGradient, MONTHS, monthName, monthLabel, dayName } from "../lib/format.js";
import { freqOf, billPeriod, isBillPaidForKey, yearlyMult } from "../lib/billfreq.js";
import { useT } from "../lib/i18n.js";

const clampDow = (d) => Math.min(6, Math.max(0, d | 0));

export default function SubscriptionDetail({ store, bill: billProp, back, onEdit }) {
  const [menu, setMenu] = useState(false);
  const { banks = [], bills = [] } = store;
  const tr = useT();
  const bill = bills.find((b) => b.id === billProp.id) || billProp;
  const col = bill.color || "#0e9f6e";
  const cm = currentMonth();
  const day = new Date().getDate();
  const bank = banks.find((b) => b.id === bill.bankId);
  const bankName = bank?.name || "—";
  const freq = freqOf(bill);
  const per = billPeriod(bill, today());
  const paidThis = isBillPaidForKey(bill, per.key);
  const stopped = !!bill.stoppedMonth && cm >= bill.stoppedMonth;
  const dueIn = per.dueIn;
  const renews = stopped ? tr("subd.stopped") : paidThis ? tr("subd.paidThisPeriod") : dueIn == null ? tr("freq." + freq) : dueIn < 0 ? tr("subd.overdue", { n: Math.abs(dueIn) }) : dueIn === 0 ? tr("subd.renewsToday") : dueIn === 1 ? tr("subd.renewsTomorrow") : tr("subd.renewsInDays", { n: dueIn });
  const dueSuffix = stopped || !bill.dueDay ? "" : freq === "weekly" ? ` · ${dayName(clampDow(bill.dueDay))}` : tr("subd.daySuffix", { n: bill.dueDay });
  const keyOf = (p) => p.period ?? p.month;
  const history = [...(bill.payments || [])].sort((a, b) => (b.date || b.month || "").localeCompare(a.date || a.month || ""));
  const nextMonthLabel = monthName((+cm.split("-")[1]) % 12);

  const Logo = ({ size }) => bill.domain ? <ServiceLogo domain={bill.domain} name={bill.name} color={col} size={size} /> : bill.glyph ? <CatTile cat={bill.glyph} name={bill.name} color={col} size={size} /> : <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size, borderRadius: size * 0.3, background: "#fff", color: col, fontWeight: 800, fontSize: size * 0.42 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>;

  const record = () => {
    if (paidThis) { store.setAlert({ title: tr("subd.alreadyPaid"), message: tr("subd.alreadyPaidMsg", { name: bill.name, month: monthName(+cm.split("-")[1] - 1) }), color: "var(--yellow)" }); return; }
    const id = store.addTxn({ type: "expense", amount: bill.amount, date: today(), bankId: bill.bankId, bankName, catId: `bill_${bill.typeId || "other"}`, catName: bill.name, catIcon: bill.glyph || "subscription", catColor: col, note: `Bill: ${bill.name} ${MONTHS[+cm.split("-")[1] - 1]} ${cm.split("-")[0]}` });
    if (id === false) return;
    store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, payments: [...(b.payments || []), { month: cm, period: per.key, date: today(), txnId: id }] } : b)));
    store.flash({ title: tr("subd.paymentLogged"), sub: `${bill.name} · ${fmt(bill.amount)}`, color: "var(--success)", icon: "check" });
  };

  const undo = (p) => {
    store.setConfirm({
      title: tr("subd.undoTitle"), message: tr("subd.undoMsg", { month: monthLabel(p.month) }), confirmText: tr("subd.undoPayment"), danger: true, icon: "back",
      onConfirm: () => { if (p.txnId) store.delTxn(p.txnId); store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, payments: (b.payments || []).filter((x) => keyOf(x) !== keyOf(p)) } : b))); store.flash({ title: tr("subd.paymentRemoved"), sub: bill.name, color: "var(--muted)" }); },
    });
  };

  const toggleStop = () => {
    if (stopped) { store.set("bills", (list) => list.map((b) => { if (b.id !== bill.id) return b; const { stoppedMonth, ...rest } = b; return rest; })); store.flash({ title: tr("subd.resumed"), sub: bill.name, color: "var(--success)", icon: "check" }); return; }
    store.setConfirm({ title: tr("subd.stopTitle", { name: bill.name }), message: tr("subd.stopMsg"), confirmText: tr("subd.stopSubscription"), icon: "back",
      onConfirm: () => { store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, stoppedMonth: cm } : b))); store.flash({ title: tr("subd.subscriptionStopped"), sub: bill.name, color: "var(--muted)" }); } });
  };

  const remove = () => {
    const hasPayments = (bill.payments || []).length > 0;
    store.setConfirm({
      title: tr("subd.deleteTitle", { name: bill.name }),
      message: hasPayments ? tr("subd.deleteHasMsg") : tr("subd.deleteNoMsg"),
      confirmText: tr("edit.delete"), danger: true, icon: "trash",
      onConfirm: () => { store.set("bills", (list) => list.filter((b) => b.id !== bill.id)); store.flash({ title: tr("subd.subscriptionDeleted"), sub: bill.name, color: "var(--muted)" }); back(); },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero" style={{ position: "relative", overflow: "hidden", background: cardGradient(col), color: "#fff" }}>
        <span className="bc-orb" style={{ width: 130, height: 130, top: -44, right: -34 }} /><span className="bc-orb" style={{ width: 60, height: 60, bottom: 16, right: 44, opacity: .45 }} /><span className="bc-shine" />
        <div className="toprow" style={{ position: "relative", zIndex: 2 }}>
          <div className="hib" onClick={back} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="back" size={20} /></div>
          <div className="grow" />
          <div className="hib" onClick={() => onEdit?.(bill)} style={{ background: "rgba(255,255,255,.2)", color: "#fff", marginRight: 8 }}><Ico name="pencil" size={18} /></div>
          <div className="hib" onClick={() => setMenu(true)} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="more" size={20} /></div>
        </div>
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 13, marginTop: 4 }}>
          <span style={{ background: "#fff", borderRadius: 15, padding: 4, display: "inline-flex", boxShadow: "0 8px 18px rgba(0,0,0,.2)" }}><Logo size={44} /></span>
          <div><div style={{ fontSize: 17, fontWeight: 800, letterSpacing: -.3 }}>{bill.name}</div><div style={{ fontSize: 12, opacity: .85, fontWeight: 600 }}>{tr("freq." + freq)}</div></div>
        </div>
        <div className="lbl" style={{ color: "rgba(255,255,255,.8)", marginTop: 12 }}>{tr("freq." + freq)}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 2 }}>
          <Money className="big tnum" style={{ color: "#fff" }} v={bill.amount} />
          <span onClick={toggleStop} style={{ flexShrink: 0, marginBottom: 5, display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,.18)", color: "#fff", fontWeight: 700, fontSize: 12, padding: "6px 12px", borderRadius: "var(--r-pill)", cursor: "pointer" }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: stopped ? "rgba(255,255,255,.55)" : "var(--success)" }} />{stopped ? tr("subd.inactive") : tr("subd.active")}</span>
        </div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{renews}{dueSuffix}{tr("subd.fromSuffix", { bank: bankName })}</div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        <span className="chip">{tr("subd.perYear", { amt: fmt(bill.amount * yearlyMult(freq)) })}</span>
        {bill.reminderDays != null && <span className="chip">{tr("subd.reminderChip", { v: bill.reminderDays === 0 ? tr("subd.reminderOff") : tr("subd.reminderDays", { n: bill.reminderDays }) })}</span>}
        <span className="chip">{(bill.payments || []).length > 0 ? tr((bill.payments || []).length === 1 ? "subd.paymentsOverOne" : "subd.paymentsOver", { amt: fmt(bill.amount * (bill.payments || []).length), n: (bill.payments || []).length }) : tr("subd.noPaymentsYet")}</span>
      </div>

      <div className="over">{tr("subd.paymentHistory")}</div>
      {history.length === 0 ? <div style={{ color: "var(--muted)", fontWeight: 600, padding: "12px 2px" }}>{tr("subd.noPaymentsDot")}</div>
        : history.map((p) => (
          <div className="icard" key={keyOf(p) + (p.date || "")} onClick={() => undo(p)} style={{ cursor: "pointer" }}>
            <span style={{ display: "inline-flex" }}><Logo size={42} /></span>
            <div><div className="nm">{freq === "weekly" ? (p.date || monthLabel(p.month)) : monthLabel(p.month)}</div><div className="mt">{tr("subd.paid")}{p.date ? " " + p.date : ""} · {bankName} · {tr("subd.tapUndo")}</div></div>
            <div className="amtb"><b className="tnum">{fmt(bill.amount)}</b><small style={{ color: "var(--success)" }}>{tr("subd.paid")}</small></div>
          </div>
        ))}

      <div className="cta">
        {stopped
          ? <div className="btn btn-primary btn-full" onClick={toggleStop}><Ico name="check" size={18} />{tr("subd.resumeSubscription")}</div>
          : <div className="btn btn-primary btn-full" onClick={record} style={{ opacity: paidThis ? .5 : 1 }}><Ico name="check" size={18} />{freq === "monthly" ? (paidThis ? tr("subd.paidForMonth", { month: monthName(+cm.split("-")[1] - 1) }) : tr("subd.recordPaymentFor", { month: nextMonthLabel })) : (paidThis ? tr("subd.paidThisPeriod") : tr("subd.recordPayment"))}</div>}
      </div>

      {menu && <MenuSheet title={bill.name} onClose={() => setMenu(false)} items={[
        { label: stopped ? tr("subd.resume") : tr("subd.stopSubscription"), icon: stopped ? "check" : "back", sub: stopped ? tr("subd.showAgain") : tr("subd.keepsHistory"), onClick: toggleStop },
        { label: tr("edit.delete"), icon: "trash", danger: true, sub: tr("subd.pastPaymentsStay"), onClick: remove },
      ]} />}
    </div>
  );
}
