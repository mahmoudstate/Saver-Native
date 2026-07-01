// Saver — Bills: Subscriptions + Installments. Subscriptions show Active (grouped
// by category, each with a header) / History (by month). Installments split
// Active / Completed. Segmented controls slide between options.
import { useState, useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, monthLabel, today, dayName } from "../lib/format.js";
import { getBillType, BILL_TYPES } from "../lib/services.js";
import { freqOf, billPeriod, isBillPaidForKey, monthlyEquiv, yearlyMult } from "../lib/billfreq.js";
import { useT } from "../lib/i18n.js";
const guessCat = (t = "") => /phone|iphone|mobile|tablet|ipad/i.test(t) ? "phone" : /car|loan|auto|vehicle/i.test(t) ? "transport" : /laptop|pc|mac/i.test(t) ? "phone" : null;

// Small status dot (drawn, not an emoji) — same size as the Active dot.
const Dot = ({ color, size = 8 }) => <span style={{ width: size, height: size, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />;

function BillLogo({ bill, size = 44 }) {
  if (bill.domain) return <ServiceLogo domain={bill.domain} name={bill.name} color={bill.color} size={size} />;
  if (bill.glyph) return <CatTile cat={bill.glyph} name={bill.name} color={bill.color} size={size} />;
  return <span className="circ" style={{ width: size, height: size, borderRadius: size * 0.3, background: bill.color || "var(--surface2)", color: "#fff", fontWeight: 800, fontSize: size * 0.34, flexShrink: 0 }}>{(bill.name || "?").slice(0, 1).toUpperCase()}</span>;
}

// "monthly · day 5" / "weekly · Mon" / "quarterly" — frequency + when it's due.
function dueSummary(bill, tr) {
  const f = freqOf(bill);
  const freqLabel = tr("freq." + f);
  if (!bill.dueDay && f === "monthly") return freqLabel;
  const when = f === "weekly" ? dayName(Math.min(6, Math.max(0, bill.dueDay | 0))) : tr("bills.dayN", { n: bill.dueDay });
  return `${freqLabel} · ${when}`;
}

function SubCard({ bill, onOpen }) {
  const tr = useT();
  return (
    <div className="icard" onClick={() => onOpen?.(bill)} style={{ cursor: "pointer" }}>
      <BillLogo bill={bill} />
      <div style={{ minWidth: 0 }}>
        <div className="nm">{bill.name}</div>
        <div className="mt" style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span>{bill.note ? bill.note + " · " : ""}{dueSummary(bill, tr)} ·</span>
          <Dot color={bill.statusColor} size={7} /><span>{bill.status}</span>
        </div>
      </div>
      <b className="amt tnum" style={{ flexShrink: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-.3px" }}>{fmt(bill.amount)}</b>
    </div>
  );
}

export default function Bills({ store, onAdd, onOpenSub, onOpenInst, initialSeg }) {
  const { bills = [], installments = [] } = store;
  const tr = useT();
  const resolveType = (id) => BILL_TYPES.find((t) => t.id === id) || getBillType(id);
  const [seg, setSeg] = useState(initialSeg || "subs");
  const [subView, setSubView] = useState("active"); // active | history
  const [instView, setInstView] = useState("active"); // active | done
  const cm = currentMonth();
  const day = new Date().getDate();

  const todayISO = today();
  const statusOf = (b) => {
    const { key, dueIn } = billPeriod(b, todayISO);
    const isPaid = isBillPaidForKey(b, key);
    let status = tr("bills.paid"), color = "var(--success)";
    if (!isPaid) {
      if (dueIn == null) { status = tr("bills.due"); color = "var(--yellow)"; }
      else if (dueIn < 0) { status = tr("bills.overdueD", { n: Math.abs(dueIn) }); color = "var(--red)"; }
      else if (dueIn === 0) { status = tr("bills.dueToday"); color = "var(--orange)"; }
      else if (dueIn === 1) { status = tr("bills.tomorrow"); color = "var(--yellow)"; }
      else { status = tr("bills.dueInD", { n: dueIn }); color = dueIn <= 3 ? "var(--yellow)" : "var(--muted)"; }
    }
    return { ...b, isPaid, status, statusColor: color, dueIn };
  };

  const subs = useMemo(() => {
    const active = (b) => (!b.startMonth || cm >= b.startMonth) && (!b.stoppedMonth || cm < b.stoppedMonth);
    const paid = (b) => isBillPaidForKey(b, billPeriod(b, todayISO).key);
    const rows = bills.filter((b) => active(b) || paid(b)).map(statusOf);
    const unpaid = rows.filter((r) => !r.isPaid);
    const paidRows = rows.filter((r) => r.isPaid);
    const total = rows.reduce((s, r) => s + monthlyEquiv(r.amount, freqOf(r)), 0);
    return {
      rows, active: rows.length,
      due: unpaid.reduce((s, r) => s + r.amount, 0),
      soon: unpaid.filter((r) => r.dueIn != null && r.dueIn >= 0 && r.dueIn <= 3).length,
      overdue: unpaid.filter((r) => r.dueIn != null && r.dueIn < 0).length,
      total, yearly: rows.reduce((s, r) => s + r.amount * yearlyMult(freqOf(r)), 0),
      paidCount: paidRows.length, paidAmt: paidRows.reduce((s, r) => s + r.amount, 0),
      unpaidCount: unpaid.length,
    };
  }, [bills, cm, day]);

  // Active = grouped by category. Within a group: unpaid first (soonest due), paid sink.
  const catGroups = useMemo(() => {
    const by = {};
    subs.rows.forEach((b) => { const t = resolveType(b.typeId); (by[t.id] = by[t.id] || { type: t, items: [] }).items.push(b); });
    Object.values(by).forEach((g) => g.items.sort((a, b) => { const pa = a.isPaid ? 1 : 0, pb = b.isPaid ? 1 : 0; if (pa !== pb) return pa - pb; return (a.dueIn ?? 99) - (b.dueIn ?? 99); }));
    // Order groups by urgency: soonest-due / overdue first; fully-paid groups sink
    // to the bottom; ties broken by the larger monthly total.
    const total = (g) => g.items.reduce((s, x) => s + x.amount, 0);
    const urgency = (g) => { const unpaid = g.items.filter((x) => !x.isPaid); return unpaid.length ? Math.min(...unpaid.map((x) => x.dueIn ?? 9999)) : Infinity; };
    return Object.values(by).sort((a, b) => { const d = urgency(a) - urgency(b); return d !== 0 ? d : total(b) - total(a); });
  }, [subs.rows]);

  const histGroups = useMemo(() => {
    const byMonth = {};
    bills.forEach((b) => (b.payments || []).forEach((p) => { (byMonth[p.month] = byMonth[p.month] || []).push({ bill: b, p }); }));
    return Object.keys(byMonth).sort().reverse().map((m) => ({ month: m, items: byMonth[m], total: byMonth[m].reduce((s, x) => s + x.bill.amount, 0) }));
  }, [bills]);

  const inst = useMemo(() => {
    const paidOf = (i) => (i.payments ? i.payments.length : (i.paidInstallments || 0));
    const done = (i) => paidOf(i) >= i.totalInstallments;
    const paidThisMonth = (i) => i.payments?.some((p) => p.month === cm);
    const rows = installments.map((i) => ({ ...i, paid: paidOf(i), remaining: Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), pct: i.totalInstallments ? (paidOf(i) / i.totalInstallments) * 100 : 0, done: done(i), stopped: !!i.stopped, dueThis: !paidThisMonth(i) && !done(i) && !i.stopped }));
    const live = rows.filter((r) => !r.done && !r.stopped);
    const paidAmtOf = (r) => r.paid * r.installmentAmount;
    return {
      rows, plans: live.length,
      remaining: live.reduce((s, r) => s + r.remaining, 0),
      dueAmt: rows.filter((r) => r.dueThis).reduce((s, r) => s + r.installmentAmount, 0),
      total: live.reduce((s, r) => s + r.totalAmount, 0),
      paidAmt: live.reduce((s, r) => s + paidAmtOf(r), 0),
    };
  }, [installments, cm]);

  const isSubs = seg === "subs";
  const instActive = inst.rows.filter((r) => !r.done && !r.stopped);
  const instDone = inst.rows.filter((r) => r.done || r.stopped);
  const instRows = instView === "active" ? instActive : instDone;

  const InstCard = (i) => (
    <div className="bcard" key={i.id} onClick={() => onOpenInst?.(i)} style={{ cursor: "pointer", opacity: i.stopped ? .7 : 1 }}>
      <div className="top"><CatTile cat={i.glyph || guessCat(i.itemType || i.company)} name={i.itemType || i.company} color={i.color} size={40} /><div className="nm">{i.itemType || i.company}</div><div className="rt tnum">{fmt(i.installmentAmount)}{tr("bills.perMo")}</div></div>
      <div className="nums"><div className="a tnum" style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>{i.stopped ? tr("bills.stoppedPrefix") : ""}{tr("bills.paidOf", { paid: i.paid, total: i.totalInstallments })}</div><div className="b tnum">{i.done ? tr("bills.done") : tr("bills.leftAmt", { amt: fmt(i.remaining) })}</div></div>
      <div className="pbar bar"><i style={{ width: `${Math.min(100, i.pct)}%`, background: i.done ? "var(--success)" : "var(--ac)" }} /></div>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{isSubs ? tr("bills.titleSubs") : tr("bills.titleInst")}</div><div className="grow" /><div className="hib" onClick={() => onAdd?.(seg)}><Ico name="plus" size={20} /></div></div>
        {isSubs
          ? <><div className="lbl">{tr("bills.totalThisMonth")}</div><Money className="big tnum" v={subs.total} />
            <div className="sub" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Dot color={subs.overdue > 0 ? "var(--red)" : subs.due > 0 ? "var(--yellow)" : "var(--success)"} />
              <span>{subs.due > 0 && <>{fmt(subs.due)} {subs.overdue > 0 ? tr("bills.overdue") : tr("bills.dueWord")} &nbsp;·&nbsp; </>}{tr("bills.paidOf", { paid: subs.paidCount, total: subs.active })} &nbsp;·&nbsp; {tr("bills.perYear", { amt: fmt(subs.yearly) })}</span>
            </div></>
          : <><div className="lbl">{tr("bills.remaining")}</div><Money className="big tnum" v={inst.remaining} />
            <div className="sub" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Dot color={inst.dueAmt > 0 ? "var(--yellow)" : "var(--success)"} />
              <span>{inst.dueAmt > 0 && <>{fmt(inst.dueAmt)} {tr("bills.dueWord")} &nbsp;·&nbsp; </>}{tr("bills.pctPaid", { pct: inst.total > 0 ? Math.round((inst.paidAmt / inst.total) * 100) : 0 })} &nbsp;·&nbsp; {tr("bills.plans", { n: inst.plans })}</span>
            </div></>}
      </div>

      <SegToggle style={{ marginBottom: 14 }} value={seg} onChange={setSeg} options={[{ id: "subs", label: tr("bills.subscriptions") }, { id: "inst", label: tr("bills.installments") }]} />

      {isSubs ? (
        <>
          <SegToggle style={{ marginBottom: 16 }} value={subView} onChange={setSubView} options={[{ id: "active", label: tr("bills.active") }, { id: "history", label: tr("bills.history") }]} />

          {subView === "active" && (catGroups.length === 0 ? <Empty msg={tr("bills.noSubs")} /> : catGroups.map((g) => (
            <div key={g.type.id} style={{ marginBottom: 10 }}>
              <div className="over">{tr("billtype." + g.type.id)} &nbsp;·&nbsp; {fmt(g.items.reduce((s, b) => s + monthlyEquiv(b.amount, freqOf(b)), 0))}{tr("bills.perMo")}</div>
              {g.items.map((b) => <SubCard key={b.id} bill={b} onOpen={onOpenSub} />)}
            </div>
          )))}

          {subView === "history" && (histGroups.length === 0 ? <Empty msg={tr("bills.noPayments")} /> : histGroups.map((g) => (
            <div key={g.month} style={{ marginBottom: 10 }}>
              <div className="over">{monthLabel(g.month)} &nbsp;·&nbsp; {fmt(g.total)}</div>
              {g.items.map(({ bill, p }) => (
                <div className="icard" key={bill.id + p.month} onClick={() => onOpenSub?.(bill)} style={{ cursor: "pointer" }}>
                  <BillLogo bill={bill} size={42} />
                  <div style={{ minWidth: 0 }}>
                    <div className="nm">{bill.name}</div>
                    <div className="mt" style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <Dot color="var(--success)" size={7} /><span>{tr("bills.paid")}{p.date ? " · " + p.date : ""}</span>
                    </div>
                  </div>
                  <b className="amt tnum" style={{ flexShrink: 0, fontSize: 18, fontWeight: 800, letterSpacing: "-.3px" }}>{fmt(bill.amount)}</b>
                </div>
              ))}
            </div>
          )))}
        </>
      ) : (
        <>
          <SegToggle style={{ marginBottom: 16 }} value={instView} onChange={setInstView} options={[{ id: "active", label: tr("bills.active") }, { id: "done", label: tr("bills.completed") }]} />
          {instRows.length === 0 ? <Empty msg={instView === "active" ? tr("bills.noActivePlans") : tr("bills.nothingCompleted")} /> : instRows.map(InstCard)}
        </>
      )}
    </div>
  );
}

function Empty({ msg }) {
  return <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{msg}</div>;
}
