// Saver — Add / Edit goal: ported from showcase 19 (target · icon · mode).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt } from "../lib/format.js";
import ColorField from "../ui/ColorField.jsx";
import IconField from "../ui/IconField.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";
import { useT } from "../lib/i18n.js";

const goalCat = (g) => resolveCat({ catGlyph: g?.glyph, catName: g?.name }) || "goal";

export default function GoalEditor({ store, goal, onClose }) {
  const editing = !!goal;
  const [name, setName] = useState(goal?.name || "");
  const [target, setTarget] = useState(goal?.goal || 0);
  const [color, setColor] = useState(goal?.color || loadColors()[0]);
  const [glyph, setGlyph] = useState(goal?.glyph || "goal");
  const [spending, setSpending] = useState(!!goal?.spendingMode);
  const [sheet, setSheet] = useState(null);
  const tr = useT();
  const canSave = name.trim().length > 0 && target > 0;

  const save = () => {
    if (!canSave) return;
    if (editing) store.set("savings", (list) => list.map((s) => (s.id === goal.id ? { ...s, name: name.trim(), goal: target, color, glyph, spendingMode: spending } : s)));
    else store.set("savings", (list) => [...list, { id: Date.now().toString(), name: name.trim(), goal: target, status: "active", spendingMode: spending, color, glyph }]);
    store.flash({ title: editing ? tr("editor.goalSaved") : tr("editor.goalCreated"), sub: name.trim(), color: "var(--acText)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? tr("editor.editGoal") : tr("editor.newGoal")}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{tr("editor.targetAmount")}</div>
        <div className="big tnum" onClick={() => setSheet("target")} style={{ cursor: "pointer" }}>{target > 0 ? fmt(target) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub">{name.trim() || tr("editor.nameYourGoal")}</div>
      </div>

      <label className="field">
        <CatTile cat={goalCat({ name, glyph })} color={color} name={name} size={42} />
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("editor.goalNamePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <ColorField value={color} onChange={setColor} style={{ margin: "13px 0" }} />
      <div style={{ marginBottom: 13 }}><IconField glyph={glyph} color={color} onPick={setGlyph} /></div>

      <div className="field">
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.spendingGoal")}</div><div className="fv" style={{ color: "var(--muted)", fontWeight: 600, fontSize: 12.5 }}>{tr("editor.spendFromPot")}</div></div>
        <span className={`switch ${spending ? "on" : ""}`} onClick={() => setSpending((v) => !v)}><i /></span>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("editor.saveGoal") : tr("editor.createGoal")}</div></div>

      {sheet === "target" && <AmountSheet title={tr("editor.targetAmount")} confirmLabel={tr("editor.setTarget")} onConfirm={(v) => { setTarget(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
