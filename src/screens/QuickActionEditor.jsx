// Saver — configure a Quick Action shortcut (category · default amount · account).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function QuickActionEditor({ store, action, onClose }) {
  const { expCats = [], banks = [] } = store;
  const editing = !!action;
  const [catId, setCatId] = useState(action?.catId || expCats[0]?.id || null);
  const [amount, setAmount] = useState(+action?.amount || 0);
  const [bankId, setBankId] = useState(action?.bankId || banks[0]?.id || null);
  const [sheet, setSheet] = useState(null);

  const cat = expCats.find((c) => c.id === catId);
  const bank = banks.find((b) => b.id === bankId);
  const canSave = catId && amount > 0 && bankId;
  const tr = useT();

  const save = () => {
    if (!canSave) return;
    store.set("quickActions", (list = []) => {
      const arr = list.filter((q) => q.catId);
      if (editing) return arr.map((q) => (q.id === action.id ? { ...q, catId, amount, bankId } : q));
      if (arr.length >= 4) return arr;
      return [...arr, { id: Date.now().toString(), catId, amount, bankId }];
    });
    store.flash({ title: editing ? tr("quick.shortcutSaved") : tr("quick.shortcutAdded"), sub: cat?.name, color: "var(--acText)", icon: "check" });
    onClose();
  };

  const remove = () => { store.set("quickActions", (list = []) => list.filter((q) => q.id !== action.id)); store.flash({ title: tr("quick.shortcutRemoved"), color: "var(--muted)", icon: "trash" }); onClose(); };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? tr("quick.editShortcut") : tr("quick.newShortcut")}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{tr("quick.defaultAmount")}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{amount > 0 ? fmt(amount) : <span style={{ opacity: .6 }}>{fmt(0)}</span>}</div>
        <div className="sub">{cat?.name || tr("quick.pickCategory")}</div>
      </div>

      <div className="field" onClick={() => setSheet("category")} style={{ cursor: "pointer" }}>
        <CatTile cat={catKeyOf(cat)} name={cat?.name} size={42} /><div><div className="fl">{tr("add.category")}</div><div className="fv">{cat?.name || tr("sub.pick")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>
      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 12 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>
        <div><div className="fl">{tr("add.account")}</div><div className="fv">{bank?.name || tr("sub.pick")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <div className="cta" style={{ display: "flex", gap: 10 }}>
        <div className="btn btn-primary" style={{ flex: 1, opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{tr("editor.saveShort")}</div>
        {editing && <div className="btn btn-secondary" style={{ width: 56, color: "var(--red)" }} onClick={remove}><Ico name="trash" size={18} /></div>}
      </div>

      {sheet === "amount" && <AmountSheet title={tr("quick.defaultAmount")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "category" && <PickerSheet title={tr("add.category")} selectedId={catId} onPick={setCatId} onClose={() => setSheet(null)} options={expCats.map((c) => ({ id: c.id, label: c.name, catKey: catKeyOf(c) }))} />}
      {sheet === "account" && <PickerSheet title={tr("add.account")} selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
    </div>
  );
}
