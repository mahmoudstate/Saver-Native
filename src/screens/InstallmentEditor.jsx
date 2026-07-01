// Saver — Add / Edit installment plan. 3-step grouped wizard (showcase 49–51):
//   1) What & who  2) The numbers  3) Account & schedule + review.
// Months / Due day / Already paid open a keypad sheet (showcase 52) — type or pick.
// Total ⇄ monthly auto-derive: type the total and the monthly is worked out, and
// vice-versa. Down payment / already-paid back-fill is PORTED VERBATIM from the old
// app (optionally logs expenses via store.addTxns).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import StepSheet from "../ui/StepSheet.jsx";
import DayGridSheet from "../ui/DayGridSheet.jsx";
import OptionSheet from "../ui/OptionSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import ColorField from "../ui/ColorField.jsx";
import IconField from "../ui/IconField.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, today } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
// "YYYY-MM" n months from the current month (n negative = past).
const monthOffset = (n) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };
const clampDay = (d) => Math.min(28, Math.max(1, d || 1));

export default function InstallmentEditor({ store, plan, onClose }) {
  const { banks = [] } = store;
  const tr = useT();
  const editing = !!plan;
  const liveBanks = banks.filter((b) => !b.archived);

  const [step, setStep] = useState(0);
  const [item, setItem] = useState(plan?.itemType || "");
  const [company, setCompany] = useState(plan?.company || (plan && !plan.itemType ? plan.name : "") || "");
  const [color, setColor] = useState(plan?.color || "var(--ac)");
  const [glyph, setGlyph] = useState(plan?.glyph || "phone");
  const [count, setCount] = useState(plan?.totalInstallments || 12);
  const [monthly, setMonthly] = useState(plan?.installmentAmount || 0);
  const [total, setTotal] = useState(plan?.totalAmount || 0);
  const [downPayment, setDownPayment] = useState(plan?.downPayment || 0);
  const [deductDp, setDeductDp] = useState(true);
  const [paidInit, setPaidInit] = useState(0);
  const [deductPaid, setDeductPaid] = useState(true);
  const [dueDay, setDueDay] = useState(plan?.dueDay || 1);
  const [reminderDays, setReminderDays] = useState(plan?.reminderDays ?? 2);
  const [note, setNote] = useState(plan?.note || "");
  const [bankId, setBankId] = useState(plan?.bankId || liveBanks[0]?.id || null);
  const [startDate] = useState(plan?.startDate || today());
  const [sheet, setSheet] = useState(null);

  const bank = liveBanks.find((b) => b.id === bankId);
  const title = (item || company).trim();
  const effTotal = total > 0 ? total : r2(count * monthly);

  // ── total ⇄ monthly auto-derive ──
  const setMonthlyVal = (v) => { setMonthly(v); if (count > 0) setTotal(r2(count * v)); };
  const setTotalVal = (v) => { setTotal(v); if (count > 0) setMonthly(r2(v / count)); };
  const setCountVal = (c) => { setCount(c); if (c > 0) { if (total > 0) setMonthly(r2(total / c)); else if (monthly > 0) setTotal(r2(c * monthly)); } };

  const step1ok = !!title;
  const step2ok = count > 0 && monthly > 0 && paidInit <= count;
  const valid = step1ok && step2ok && !!bankId;

  const save = () => {
    if (!valid) return;
    const dp = Math.max(0, downPayment || 0);
    const tot = total > 0 ? total : r2(count * monthly);
    const base = { itemType: item.trim(), company: company.trim(), name: title, color, glyph, totalInstallments: count, installmentAmount: monthly, totalAmount: tot, downPayment: dp, dueDay: clampDay(dueDay), reminderDays: Math.min(7, Math.max(0, reminderDays | 0)), note: note.trim(), bankId, startDate };

    if (editing) {
      store.set("installments", (list) => list.map((i) => (i.id === plan.id ? { ...i, ...base } : i)));
      store.flash({ title: tr("inst.planSaved"), sub: `${title} · ${count}×${fmt(monthly)}`, color: "var(--acText)", icon: "check" });
      onClose();
      return;
    }

    const initN = Math.min(count, Math.max(0, paidInit));
    const wantDp = dp > 0 && deductDp, wantPaid = initN > 0 && deductPaid;
    const paidMonths = []; for (let k = 0; k < initN; k++) paidMonths.push(monthOffset(-(initN - k)));
    const mkTxn = (amt, date, n) => ({ type: "expense", amount: amt, date, bankId, bankName: bank?.name, catId: "installment", catName: "Installments", catIcon: "installment", catColor: color || "var(--ac)", note: n });
    const batch = [];
    if (wantDp) batch.push(mkTxn(dp, startDate || today(), `Deposit: ${title}`));
    if (wantPaid) paidMonths.forEach((m, k) => batch.push(mkTxn(monthly, `${m}-01`, `Installment ${k + 1}/${count}: ${title}`)));
    let ids = [];
    if (batch.length) { const res = store.addTxns(batch); if (res === false) return; ids = res; }
    let cur = 0; const dpTxnId = wantDp ? ids[cur++] : null;
    const payments = [];
    for (let k = 0; k < initN; k++) { const m = paidMonths[k]; const txnId = wantPaid ? ids[cur++] : null; payments.push({ month: m, date: wantPaid ? `${m}-01` : null, txnId, num: k + 1 }); }

    store.set("installments", (list) => [...list, { id: Date.now().toString(), ...base, payments, paidInstallments: payments.length, downPaymentTxnId: dpTxnId, status: payments.length >= count ? "completed" : "active" }]);
    store.flash({ title: tr("inst.installmentAdded"), sub: `${title} · ${count}×${fmt(monthly)}`, color: "var(--acText)", icon: "check" });
    onClose();
  };

  const back = () => { if (step > 0) setStep(step - 1); else onClose(); };
  const next = () => { if (step === 0 && step1ok) setStep(1); else if (step === 1 && step2ok) setStep(2); };

  const Toggle = ({ on, set, onText, offText }) => (
    <div className="tile" onClick={() => set(!on)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, marginTop: 10, cursor: "pointer" }}>
      <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{tr("inst.deductNow")}</div><div className="caption" style={{ marginTop: 2 }}>{on ? onText : offText}</div></div>
      <div style={{ width: 46, height: 27, borderRadius: 99, background: on ? "var(--ac)" : "var(--border)", position: "relative", flexShrink: 0, transition: "background .2s" }}><div style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 99, background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} /></div>
    </div>
  );

  const Row = ({ label, value, onClick, dim }) => (
    <div className="field" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default", marginTop: 12, opacity: dim ? .85 : 1 }}>
      <div style={{ flex: 1 }}><div className="fl">{label}</div><div className="fv tnum">{value}</div></div>
      {onClick && <span className="chev"><Ico name="chev" size={18} /></span>}
    </div>
  );

  const heroBig = step === 1
    ? <><div className="lbl">{tr("inst.theNumbers")}</div><div className="big tnum">{fmt(effTotal)}</div><div className="sub">{count > 0 && monthly > 0 ? `${tr("inst.totalLabel")} · ${count} × ${fmt(monthly)}` : tr("inst.totalLabel")}</div></>
    : <><div className="lbl">{step === 0 ? tr("inst.whatWho") : tr("inst.accountSchedule")}</div><div className="big" style={{ fontSize: 27 }}>{step === 0 ? tr("inst.theBasics") : tr("inst.almostDone")}</div><div className="sub">{title || tr("inst.nameTheItem")}</div></>;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{editing ? tr("inst.editPlan") : tr("inst.newInstallment")}</div><div className="grow" /><div className="hchip">{tr("inst.step", { n: step + 1 })}</div></div>
        {heroBig}
        <div style={{ display: "flex", gap: 6, marginTop: 14 }}>{[0, 1, 2].map((i) => <i key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i <= step ? "#fff" : "rgba(255,255,255,.35)" }} />)}</div>
      </div>

      {/* ───── STEP 1 · What & who ───── */}
      {step === 0 && <>
        <div className="over">{tr("inst.tellUs")}</div>
        <label className="field">
          <CatTile cat={glyph} name={title} color={color} size={42} />
          <div style={{ flex: 1 }}><div className="fl">{tr("inst.payingOff")}</div>
            <input value={item} onChange={(e) => setItem(e.target.value)} placeholder={tr("inst.itemPlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
          </div>
        </label>
        <label className="field" style={{ marginTop: 12 }}>
          <div style={{ flex: 1 }}><div className="fl">{tr("inst.storeProvider")}</div>
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder={tr("inst.providerPlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
          </div>
        </label>
        <ColorField value={color} onChange={setColor} style={{ marginTop: 12 }} />
        <div style={{ marginTop: 14 }}><IconField glyph={glyph} color={color} onPick={setGlyph} /></div>
      </>}

      {/* ───── STEP 2 · The numbers ───── */}
      {step === 1 && <>
        <div className="over">{tr("inst.thePlan")}</div>
        <Row label={tr("inst.months")} value={tr("inst.payments", { n: count })} onClick={() => setSheet("count")} />
        <Row label={tr("inst.perMonth")} value={monthly > 0 ? fmt(monthly) : tr("editor.setGeneric")} onClick={() => setSheet("monthly")} />
        <Row label={tr("inst.totalAuto")} value={effTotal > 0 ? fmt(effTotal) : tr("editor.setGeneric")} onClick={() => setSheet("total")} dim />
        <div className="over" style={{ marginTop: 18 }}>{tr("inst.optional")}</div>
        <Row label={tr("inst.downPayment")} value={downPayment > 0 ? fmt(downPayment) : tr("inst.none")} onClick={() => setSheet("dp")} />
        {!editing && downPayment > 0 && <Toggle on={deductDp} set={setDeductDp} onText={tr("inst.dpOn")} offText={tr("inst.infoOnly")} />}
        {!editing && <Row label={tr("inst.alreadyPaid")} value={paidInit > 0 ? tr("inst.nOfTotal", { n: paidInit, total: count }) : tr("inst.none")} onClick={() => setSheet("paid")} />}
        {!editing && paidInit > 0 && <Toggle on={deductPaid} set={setDeductPaid} onText={tr(paidInit === 1 ? "inst.paidOnOne" : "inst.paidOnMany", { n: paidInit })} offText={tr("inst.infoOnly")} />}
      </>}

      {/* ───── STEP 3 · Account & schedule ───── */}
      {step === 2 && <>
        <div className="over">{tr("inst.whereWhen")}</div>
        <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer" }}>
          <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
          <div style={{ flex: 1 }}><div className="fl">{tr("inst.payFrom")}</div><div className="fv">{bank?.name || tr("sub.pick")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
        <Row label={tr("inst.dueDay")} value={tr("sub.dayN", { n: clampDay(dueDay) })} onClick={() => setSheet("due")} />
        <Row label={tr("sub.remindMe")} value={reminderDays === 0 ? tr("sub.off") : tr(reminderDays === 1 ? "sub.dayBefore" : "sub.daysBefore", { n: reminderDays })} onClick={() => setSheet("remind")} />
        <label className="field" style={{ marginTop: 12 }}>
          <div style={{ flex: 1 }}><div className="fl">{tr("inst.note")}</div>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr("inst.notePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
          </div>
        </label>

        <div className="tile" style={{ marginTop: 14, padding: "14px 16px" }}>
          <div className="over" style={{ marginTop: 0, marginBottom: 8 }}>{tr("inst.review")}</div>
          {[[tr("inst.rItem"), title || "—"], [tr("inst.rPlan"), count > 0 && monthly > 0 ? `${count} × ${fmt(monthly)}` : "—"], [tr("inst.rTotal"), fmt(effTotal)], ...(downPayment > 0 ? [[tr("inst.rDeposit"), fmt(downPayment) + (deductDp ? "" : tr("inst.infoSuffix"))]] : []), ...(paidInit > 0 ? [[tr("inst.rAlreadyPaid"), `${paidInit}${deductPaid ? "" : tr("inst.infoSuffix")}`]] : []), [tr("inst.rFrom"), bank?.name || "—"], [tr("inst.rDueDay"), tr("sub.dayN", { n: clampDay(dueDay) })]].map(([k, v], i, arr) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--line)" }}>
              <span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600 }}>{k}</span>
              <span className="tnum" style={{ color: "var(--text)", fontSize: 14, fontWeight: 700, maxWidth: "60%", textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v}</span>
            </div>
          ))}
        </div>
      </>}

      <div className="cta" style={{ display: "flex", gap: 12 }}>
        {step > 0 && <div className="btn btn-ghost" onClick={back} style={{ flexShrink: 0 }}><Ico name="back" size={17} />{tr("inst.back")}</div>}
        {step < 2
          ? <div className="btn btn-primary" style={{ flex: 1, opacity: (step === 0 ? step1ok : step2ok) ? 1 : .5 }} onClick={next}>{tr("inst.next")}<Ico name="chev" size={18} /></div>
          : <div className="btn btn-primary" style={{ flex: 1, opacity: valid ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("inst.savePlan") : tr("inst.addInstallment")}</div>}
      </div>

      {sheet === "count" && <StepSheet title={tr("inst.howManyMonths")} suffix={tr("inst.mo")} value={count} picks={[6, 12, 24, 36, 48]} min={1} max={120} onConfirm={(v) => { setCountVal(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "monthly" && <AmountSheet title={tr("inst.amountEachMonth")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setMonthlyVal(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "total" && <AmountSheet title={tr("inst.totalAmount")} sub={tr("inst.splitsAcross")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setTotalVal(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "dp" && <AmountSheet title={tr("inst.downPayment")} sub={tr("inst.dpUpfront")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setDownPayment(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "paid" && <StepSheet title={tr("inst.monthsAlreadyPaid")} sub={tr("inst.outOf", { n: count })} value={paidInit} picks={[1, 2, 3, 6]} min={0} max={count} onConfirm={(v) => { setPaidInit(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "due" && <DayGridSheet title={tr("inst.dueDay")} sub={tr("inst.dueDaySub")} value={clampDay(dueDay)} onConfirm={(v) => { setDueDay(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "remind" && <OptionSheet title={tr("sub.remindMe")} sub={tr("sub.beforeDue")} value={reminderDays} onPick={(v) => { setReminderDays(v); setSheet(null); }} onClose={() => setSheet(null)} options={[{ value: 0, label: tr("sub.off") }, { value: 1, label: tr("sub.remind1") }, { value: 2, label: tr("sub.remind2") }, { value: 3, label: tr("sub.remind3") }, { value: 7, label: tr("sub.remind7") }]} />}
      {sheet === "account" && <PickerSheet title={tr("inst.payFrom")} selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={liveBanks.map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
