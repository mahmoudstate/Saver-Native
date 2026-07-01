// Saver — Add / Edit subscription (bill). Pick a real brand logo (colour locked to
// the brand) or make a Custom icon+colour. The hero takes the chosen colour. Plan
// fields, then the bill Category (built-in types + your own custom categories).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import DayGridSheet from "../ui/DayGridSheet.jsx";
import OptionSheet from "../ui/OptionSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import ServicePicker from "../ui/ServicePicker.jsx";
import ServiceLogo from "../ui/ServiceLogo.jsx";
import CustomIconSheet from "../ui/CustomIconSheet.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";
import { fmt, currentMonth, cardGradient, dayName } from "../lib/format.js";
import { SERVICE_CAT_TO_TYPE, BILL_TYPES } from "../lib/services.js";
import { FREQS } from "../lib/billfreq.js";
import { useT } from "../lib/i18n.js";

const clampDay = (d) => Math.min(28, Math.max(1, d || 1));
const clampDow = (d) => Math.min(6, Math.max(0, d | 0));

// Brand tile: bundled logo for a preset service, else a custom icon, else monogram.
function Brand({ domain, glyph, name, color, size = 42 }) {
  if (domain) return <ServiceLogo domain={domain} name={name} color={color} size={size} />;
  if (glyph) return <CatTile cat={glyph} name={name} color={color} size={size} />;
  return <span className="circ" style={{ width: size, height: size, borderRadius: size * 0.3, background: color, color: "#fff", fontWeight: 800, fontSize: size * 0.34 }}>{(name || "?").slice(0, 1).toUpperCase()}</span>;
}

export default function SubscriptionEditor({ store, bill, onClose }) {
  const { banks = [] } = store;
  const tr = useT();
  const editing = !!bill;
  const [name, setName] = useState(bill?.name || "");
  const [amount, setAmount] = useState(bill?.amount || 0);
  const [frequency, setFrequency] = useState(bill?.frequency || "monthly");
  const [dueDay, setDueDay] = useState(bill?.dueDay || 1);
  const [reminderDays, setReminderDays] = useState(bill?.reminderDays ?? 2);
  const [bankId, setBankId] = useState(bill?.bankId || banks[0]?.id || null);
  const [color, setColor] = useState(bill?.color || loadColors()[0]);
  const [domain, setDomain] = useState(bill?.domain || "");
  const [glyph, setGlyph] = useState(bill?.glyph || "");
  const [typeId, setTypeId] = useState(bill?.typeId || "other");
  const [custom, setCustom] = useState(!!bill?.glyph && !bill?.domain);
  const [sheet, setSheet] = useState(null);

  const bank = banks.find((b) => b.id === bankId);
  const canSave = name.trim() && amount > 0;
  const amtLabel = tr("sub.amt" + frequency.charAt(0).toUpperCase() + frequency.slice(1));
  const allTypes = BILL_TYPES;
  const selType = allTypes.find((t) => t.id === typeId) || allTypes.find((t) => t.id === "other");
  // Picking a brand: set name to the brand + brand colour (locked) + auto category.
  const pickService = (svc) => { setName(svc.name); setColor(svc.color); setDomain(svc.domain); setGlyph(""); setTypeId(SERVICE_CAT_TO_TYPE[svc.category] || "other"); setCustom(false); };

  const save = () => {
    if (!canSave) return;
    const dueClamped = frequency === "weekly" ? clampDow(dueDay) : clampDay(dueDay);
    const base = { name: name.trim(), amount, frequency, dueDay: dueClamped, reminderDays: Math.min(7, Math.max(0, reminderDays | 0)), bankId, color, domain: custom ? "" : domain, glyph: custom ? glyph : "", typeId };
    if (editing) store.set("bills", (list) => list.map((b) => (b.id === bill.id ? { ...b, ...base } : b)));
    else store.set("bills", (list) => [...list, { id: Date.now().toString(), ...base, payments: [], startMonth: currentMonth() }]);
    store.flash({ title: editing ? tr("sub.subscriptionSaved") : tr("sub.subscriptionAdded"), sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero" style={{ background: cardGradient(color), color: "#fff" }}>
        <div className="toprow"><div className="ttl">{editing ? tr("sub.editSubscription") : tr("sub.newSubscription")}</div><div className="grow" /><div className="hib" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }} onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 4 }}>
          <span style={{ display: "inline-flex", borderRadius: 15, boxShadow: "0 0 0 1px rgba(255,255,255,.55), 0 8px 18px rgba(0,0,0,.22)" }}>
            <Brand domain={custom ? "" : domain} glyph={custom ? glyph : ""} name={name} color={color} size={48} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: -.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name.trim() || tr("sub.nameTheService")}</div>
            <div className="lbl" style={{ color: "rgba(255,255,255,.82)", marginTop: 2 }}>{tr("freq." + frequency)} · {store.currency}</div>
          </div>
        </div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer", color: "#fff", marginTop: 12 }}><span style={{ opacity: amount > 0 ? 1 : .6 }}>{fmt(amount)}</span></div>
      </div>

      {/* ── Custom icon (above companies) ── */}
      <div className="over">{tr("sub.makeYourOwn")}</div>
      <div className="field" onClick={() => { if (domain) setName(""); setSheet("custom"); }} style={{ cursor: "pointer", border: custom ? "1.5px solid var(--ac)" : undefined }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: custom ? color : "var(--acDim)", color: custom ? "#fff" : "var(--acText)" }}>{custom ? <CatTile cat={glyph} color={color} size={42} /> : <Ico name="pencil" size={19} />}</span>
        <div style={{ flex: 1 }}><div className="fl">{tr("sub.customIcon")}</div><div className="fv">{custom ? tr("sub.yourIconColour") : tr("sub.buildYourOwn")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      {/* ── Companies ── */}
      <div className="over" style={{ marginTop: 18 }}>{tr("sub.orPickService")}</div>
      <ServicePicker activeDomain={custom ? "" : domain} onPick={pickService} onCustom={() => setSheet("custom")} />

      <label className="field" style={{ marginTop: 12 }}>
        <Brand domain={custom ? "" : domain} glyph={custom ? glyph : ""} name={name} color={color} size={42} />
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("sub.serviceNamePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div>
      </label>

      {/* ── Plan ── */}
      <div className="over" style={{ marginTop: 20 }}>{tr("sub.plan")}</div>
      <div className="field" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>
        <div style={{ flex: 1 }}><div className="fl">{amtLabel}</div><div className="fv tnum">{amount > 0 ? fmt(amount) : tr("editor.setGeneric")}</div></div><span className="chev"><Ico name="pencil" size={17} /></span>
      </div>
      <div className="field" onClick={() => setSheet("freq")} style={{ cursor: "pointer", marginTop: 10 }}>
        <div style={{ flex: 1 }}><div className="fl">{tr("sub.repeats")}</div><div className="fv">{tr("freq." + frequency)}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet(frequency === "weekly" ? "weekday" : "day")} style={{ cursor: "pointer", marginTop: 10 }}>
        <div style={{ flex: 1 }}><div className="fl">{frequency === "weekly" ? tr("sub.billingWeekday") : tr("sub.billingDay")}</div><div className="fv tnum">{frequency === "weekly" ? dayName(clampDow(dueDay)) : tr("sub.dayN", { n: clampDay(dueDay) })}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet("remind")} style={{ cursor: "pointer", marginTop: 10 }}>
        <div style={{ flex: 1 }}><div className="fl">{tr("sub.remindMe")}</div><div className="fv tnum">{reminderDays === 0 ? tr("sub.off") : tr(reminderDays === 1 ? "sub.dayBefore" : "sub.daysBefore", { n: reminderDays })}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 10 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
        <div><div className="fl">{tr("sub.paysFrom")}</div><div className="fv">{bank?.name || tr("sub.pick")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      {/* ── Category (last) — a row that opens the picker ── */}
      <div className="over" style={{ marginTop: 20 }}>{tr("add.category")}</div>
      <div className="field" onClick={() => setSheet("cat")} style={{ cursor: "pointer" }}>
        <CatTile cat={selType.glyph} color="var(--ac)" size={42} />
        <div style={{ flex: 1 }}><div className="fl">{tr("add.category")}</div><div className="fv">{tr("billtype." + selType.id)}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("sub.saveSubscription") : tr("sub.addSubscription")}</div></div>

      {sheet === "cat" && (
        <>
          <div className="dim" onClick={() => setSheet(null)} />
          <div className="sheet" role="dialog" aria-label={tr("add.category")}>
            <div className="grab" />
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3, marginBottom: 12 }}>{tr("add.category")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "52vh", overflowY: "auto", paddingBottom: 4 }}>
              {allTypes.map((t) => (
                <div key={t.id} className="icard" onClick={() => { setTypeId(t.id); setSheet(null); }} style={{ cursor: "pointer", border: typeId === t.id ? "1.5px solid var(--ac)" : undefined }}>
                  <CatTile cat={t.glyph} color="var(--ac)" size={40} />
                  <div className="nm" style={{ flex: 1 }}>{tr("billtype." + t.id)}</div>
                  {typeId === t.id && <span style={{ color: "var(--ac)" }}><Ico name="check" size={18} /></span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {sheet === "custom" && <CustomIconSheet title={tr("sub.customIcon")} glyph={glyph || "subscription"} color={color} onDone={({ glyph, color }) => { setGlyph(glyph); setColor(color); setDomain(""); setCustom(true); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "amount" && <AmountSheet title={amtLabel} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "freq" && <OptionSheet title={tr("sub.repeats")} sub={tr("sub.repeatsSub")} value={frequency} onPick={(v) => { if (v !== frequency) setDueDay(v === "weekly" ? 0 : 1); setFrequency(v); setSheet(null); }} onClose={() => setSheet(null)} options={FREQS.map((f) => ({ value: f, label: tr("freq." + f) }))} />}
      {sheet === "day" && <DayGridSheet title={tr("sub.billingDay")} sub={tr("sub.billingDaySub")} value={clampDay(dueDay)} onConfirm={(v) => { setDueDay(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "weekday" && <OptionSheet title={tr("sub.billingWeekday")} sub={tr("sub.billingWeekdaySub")} value={clampDow(dueDay)} onPick={(v) => { setDueDay(v); setSheet(null); }} onClose={() => setSheet(null)} options={[0, 1, 2, 3, 4, 5, 6].map((d) => ({ value: d, label: dayName(d) }))} />}
      {sheet === "remind" && <OptionSheet title={tr("sub.remindMe")} sub={tr("sub.beforeDue")} value={reminderDays} onPick={(v) => { setReminderDays(v); setSheet(null); }} onClose={() => setSheet(null)} options={[{ value: 0, label: tr("sub.off") }, { value: 1, label: tr("sub.remind1") }, { value: 2, label: tr("sub.remind2") }, { value: 3, label: tr("sub.remind3") }, { value: 7, label: tr("sub.remind7") }]} />}
      {sheet === "account" && <PickerSheet title={tr("sub.paysFrom")} selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
