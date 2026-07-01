// Saver — Add / Edit budget or project. A budget = name + amount + the expense
// categories it covers. Monthly budgets reset each month; projects accumulate from
// a start month. Icon + colour are pickable (like goals).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import DayGridSheet from "../ui/DayGridSheet.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import ColorField from "../ui/ColorField.jsx";
import IconField from "../ui/IconField.jsx";
import { resolveCat } from "../ui/cats.js";
import { loadColors } from "../ui/ColorSheet.jsx";
import { fmt, currentMonth, monthLabel } from "../lib/format.js";
import { BILL_TYPES } from "../lib/services.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) || null;
const shift = (m, d) => { const [y, mo] = m.split("-").map(Number); const nd = new Date(y, mo - 1 + d, 1); return `${nd.getFullYear()}-${String(nd.getMonth() + 1).padStart(2, "0")}`; };

export default function BudgetEditor({ store, budget, initialKind, onClose }) {
  const { expCats = [] } = store;
  const tr = useT();
  const editing = !!budget;
  const [kind, setKind] = useState(budget?.kind === "project" || initialKind === "project" ? "project" : "monthly");
  const [name, setName] = useState(budget?.name || "");
  const [amount, setAmount] = useState(budget?.amount || 0);
  const [color, setColor] = useState(budget?.color || "var(--purple)");
  const [glyph, setGlyph] = useState(budget?.glyph || "creditcard");
  const [cats, setCats] = useState(budget?.cats || []);
  // monthly: recurring (repeats from a start month) or a single past/specific month.
  const [recurring, setRecurring] = useState(budget?.month ? false : true);
  const [month, setMonth] = useState(budget?.startMonth || budget?.month || currentMonth());
  const [cycleStartDay, setCycleStartDay] = useState(budget?.cycleStartDay || 1);
  const [sheet, setSheet] = useState(null);
  const isProject = kind === "project";
  const canSave = name.trim().length > 0 && (isProject || amount > 0); // project amount is optional
  const toggle = (id) => setCats((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const stepMonth = (d) => { const ns = shift(month, d); if (ns <= currentMonth()) setMonth(ns); };
  const oneMonth = !isProject && !recurring;
  const monthLbl = isProject || recurring ? tr("editor.starts") : tr("editor.month");

  const save = () => {
    if (!canSave) return;
    const base = { name: name.trim(), amount, cats, color, glyph };
    const extra = isProject ? { kind: "project", startMonth: month, month: undefined, cycleStartDay: undefined }
      : recurring ? { kind: undefined, startMonth: month, month: undefined, cycleStartDay }
        : { kind: undefined, startMonth: undefined, month, cycleStartDay };
    if (editing) store.set("budgets", (list) => list.map((b) => (b.id === budget.id ? { ...b, ...base, ...extra } : b)));
    else store.set("budgets", (list) => [...list, { id: Date.now().toString(), ...base, ...extra }]);
    store.flash({ title: editing ? tr("edit.saved") : isProject ? tr("editor.projectCreated") : tr("editor.budgetCreated"), sub: name.trim(), color: "var(--purple)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? (isProject ? tr("editor.editProject") : tr("editor.editBudget")) : isProject ? tr("editor.newProject") : tr("editor.newBudget")}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{isProject ? tr("editor.totalBudgetOptional") : tr("editor.monthlyLimit")}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{amount > 0 ? fmt(amount) : <span style={{ opacity: .6 }}>{isProject ? tr("editor.optional") : fmt(0)}</span>}</div>
        <div className="sub">{name.trim() || (isProject ? tr("editor.nameYourProject") : tr("editor.nameYourBudget"))}</div>
      </div>

      {!editing && <SegToggle style={{ marginBottom: 16 }} value={kind} onChange={setKind} options={[{ id: "monthly", label: tr("editor.monthlyBudget") }, { id: "project", label: tr("editor.project") }]} />}

      <label className="field">
        <CatTile cat={glyph} color={color} name={name} size={42} />
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={isProject ? tr("editor.projectNamePlaceholder") : tr("editor.budgetNamePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      {!isProject && <SegToggle style={{ margin: "12px 0" }} value={recurring ? "rec" : "one"} onChange={(v) => setRecurring(v === "rec")} options={[{ id: "rec", label: tr("editor.everyMonth") }, { id: "one", label: tr("editor.oneMonth") }]} />}

      <div className="field" style={{ marginTop: 12 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--purpleDim)", color: "var(--purple)" }}><Ico name="cal" size={19} /></span>
        <div style={{ flex: 1 }}><div className="fl">{monthLbl}</div><div className="fv tnum">{monthLabel(month)}{!isProject && recurring ? tr("editor.repeats") : ""}</div></div>
        <div style={{ display: "flex", gap: 8 }}>
          <div className="hib" onClick={() => stepMonth(-1)}><Ico name="back" size={16} /></div>
          <div className="hib" onClick={() => stepMonth(1)} style={{ transform: "scaleX(-1)", opacity: month >= currentMonth() ? .3 : 1 }}><Ico name="back" size={16} /></div>
        </div>
      </div>

      {!isProject && <div className="field" style={{ marginTop: 12, cursor: "pointer" }} onClick={() => setSheet("cycleDay")}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--purpleDim)", color: "var(--purple)" }}><Ico name="cal" size={19} /></span>
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.cycleStartDay")}</div><div className="fv tnum">{tr("editor.dayOfMonth", { day: cycleStartDay })}</div></div>
        <span className="chev"><Ico name="chev" size={17} /></span>
      </div>}

      <ColorField value={color} onChange={setColor} style={{ margin: "13px 0" }} />
      <div style={{ marginBottom: 4 }}><IconField glyph={glyph} color={color} onPick={setGlyph} /></div>

      <div className="over" style={{ marginTop: 14 }}>{tr("editor.spendingCategories")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {expCats.map((c) => {
          const on = cats.includes(c.id);
          return (
            <button key={c.id} onClick={() => toggle(c.id)} className="chip" style={on ? { background: "var(--acDim)", color: "var(--acText)", borderColor: "transparent" } : {}}>
              <CatTile cat={catKeyOf(c)} name={c.name} size={20} style={{ borderRadius: 7 }} />{c.name}
            </button>
          );
        })}
      </div>

      <div className="over" style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 7 }}><Ico name="bills" size={14} />{tr("editor.billCategories")}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {BILL_TYPES.map((t) => {
          const id = `bill_${t.id}`;
          const on = cats.includes(id);
          const label = tr("billtype." + t.id);
          return (
            <button key={id} onClick={() => toggle(id)} className="chip" style={on ? { background: "var(--blueDim)", color: "var(--blue)", borderColor: "transparent" } : {}}>
              <CatTile cat={t.glyph} color="var(--blue)" name={label} size={20} style={{ borderRadius: 7 }} />{label}
            </button>
          );
        })}
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("editor.saveShort") : isProject ? tr("editor.createProject") : tr("editor.createBudget")}</div></div>

      {sheet === "amount" && <AmountSheet title={isProject ? tr("editor.totalBudget") : tr("editor.monthlyLimit")} confirmLabel={isProject ? tr("editor.setTotal") : tr("editor.setLimit")} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "cycleDay" && <DayGridSheet title={tr("editor.cycleStartDay")} sub={tr("editor.cycleStartDaySub")} value={cycleStartDay} onConfirm={(v) => { setCycleStartDay(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
