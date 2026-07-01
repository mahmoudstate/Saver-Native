// Saver — Add / Edit category: ported from showcase 18 (icon · colour · type).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { CATS } from "../ui/cats.js";
import ColorField from "../ui/ColorField.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";
import { useT } from "../lib/i18n.js";

// Icons are split by type: expense icons show for an expense category, income icons for income.
const EXPENSE_ICONS = ["food", "coffee", "drinks", "groceries", "shopping", "clothing", "jewelry", "beauty", "transport", "car", "fuel", "parking", "ticket", "travel", "hotel", "bill", "utilities", "electricity", "water", "wifi", "phone", "electronics", "home", "furniture", "repairs", "garden", "laundry", "health", "pharmacy", "fitness", "sports", "education", "books", "entertainment", "movie", "music", "gaming", "kids", "pet", "subscription", "insurance", "creditcard", "bank", "taxes", "charity", "gift"];
const INCOME_ICONS = ["salary", "business", "freelance", "income", "investment", "crypto", "interest", "savings", "refund", "sales", "rental", "pension", "bonus", "tips", "gift"];
// Curated set shown inline (first 11); the rest live behind "Show all".
const QUICK_EXP = ["food", "groceries", "shopping", "transport", "car", "bill", "home", "health", "entertainment", "subscription", "gift"];
const QUICK_INC = ["salary", "business", "freelance", "investment", "savings", "rental", "refund", "sales", "bonus", "tips", "income"];
const iconsFor = (k) => (k === "income" ? INCOME_ICONS : EXPENSE_ICONS);
const quickFor = (k) => (k === "income" ? QUICK_INC : QUICK_EXP);

// One icon cell — renders the glyph in the chosen colour when selected.
function Glyph({ g, selected, color, onPick }) {
  if (!CATS[g]) return null; // defensive: never crash on an unknown/legacy glyph key
  return (
    <span onClick={() => onPick(g)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--catTile)", border: selected ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)", cursor: "pointer" }}>
      <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={selected ? color : CATS[g][0]} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: CATS[g][1] }} />
    </span>
  );
}

// Bottom sheet with every icon for this type (app-styled, same as ColorSheet).
function IconSheet({ icons, kind, glyph, color, onPick, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{kind === "income" ? tr("editor.incomeIcons") : tr("editor.expenseIcons")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 16px" }}>{tr("editor.tapIcon")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, maxHeight: "46vh", overflowY: "auto", paddingBottom: 4 }}>
          {icons.map((g) => <Glyph key={g} g={g} selected={glyph === g} color={color} onPick={(x) => { onPick(x); onClose(); }} />)}
        </div>
        <div style={{ marginTop: 16 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("editor.done")}</div></div>
      </div>
    </>
  );
}

export default function CategoryEditor({ store, category, kind: initialKind, onClose }) {
  const editing = !!category;
  const tr = useT();
  const initKind = category?._kind || initialKind || "expense";
  const [kind, setKind] = useState(initKind);
  const [name, setName] = useState(category?.name || "");
  // Old backups may store a legacy glyph (lucide name / emoji) that isn't in our icon
  // set — fall back to a valid default so the editor renders instead of blank-crashing.
  const [glyph, setGlyph] = useState(category?.glyph && CATS[category.glyph] ? category.glyph : quickFor(initKind)[0]);
  const [color, setColor] = useState(category?.color || loadColors()[0]);
  const [iconsOpen, setIconsOpen] = useState(false);
  const canSave = name.trim().length > 0;
  const listKey = kind === "income" ? "incCats" : "expCats";

  // Switching type swaps the icon set; if the current glyph isn't in the new set, pick that set's first.
  const changeKind = (k) => { setKind(k); if (!iconsFor(k).includes(glyph)) setGlyph(quickFor(k)[0]); };

  const quick = quickFor(kind);
  // Show the curated set, plus the current glyph if it's not in it (so an edited category keeps its icon visible).
  const inline = quick.includes(glyph) ? quick : [glyph, ...quick.slice(0, quick.length - 1)];

  const save = () => {
    if (!canSave) return;
    const entry = { name: name.trim(), glyph, color, group: category?.group || "daily" };
    if (editing) store.set(listKey, (list) => list.map((c) => (c.id === category.id ? { ...c, ...entry } : c)));
    else store.set(listKey, (list) => [...list, { id: Date.now().toString(), ...entry }]);
    store.flash({ title: editing ? tr("editor.categorySaved") : tr("editor.categoryAdded"), sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  // Delete just removes the category from the list — past transactions keep their own
  // snapshot of the icon/name/colour, so they stay recorded and look exactly the same.
  const del = () => {
    store.setConfirm({
      title: tr("editor.deleteCategoryTitle", { name: category.name }),
      message: tr("editor.deleteCategoryMsg"),
      confirmText: tr("editor.deleteCategory"), danger: true, icon: "trash",
      onConfirm: () => {
        store.set(listKey, (list) => list.filter((c) => c.id !== category.id));
        store.flash({ title: tr("editor.categoryDeleted"), sub: category.name, color: "var(--muted)" });
        onClose();
      },
    });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{editing ? tr("editor.editCategory") : tr("editor.newCategory")}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{tr("add.category")}</div>
        <div className="big" style={{ fontSize: 34 }}>{name.trim() || tr("editor.nameIt")}</div>
        <div className="sub" style={{ textTransform: "capitalize" }}>{kind === "income" ? tr("editor.incomeCategory") : tr("editor.expenseCategory")}</div>
      </div>

      {!editing && (
        <div className="seg" style={{ marginBottom: 16 }}>
          <b className={kind === "expense" ? "on" : ""} onClick={() => changeKind("expense")}>{tr("edit.type_expense")}</b>
          <b className={kind === "income" ? "on" : ""} onClick={() => changeKind("income")}>{tr("edit.type_income")}</b>
        </div>
      )}

      <label className="field" style={{ marginBottom: 16 }}>
        <CatTile cat={CATS[glyph] ? glyph : null} name={name} color={color} size={42} />
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("editor.catNamePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="over">{kind === "income" ? tr("editor.incomeIcon") : tr("editor.expenseIcon")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 10, marginBottom: 18 }}>
        {inline.map((g) => <Glyph key={g} g={g} selected={glyph === g} color={color} onPick={setGlyph} />)}
        <span onClick={() => setIconsOpen(true)} className="circ" style={{ aspectRatio: "1", borderRadius: 14, background: "var(--surface2)", border: "1px dashed var(--border)", cursor: "pointer", flexDirection: "column", gap: 1, color: "var(--muted)" }}>
          <Ico name="layers" size={17} /><span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: ".02em" }}>{tr("editor.all")}</span>
        </span>
      </div>

      <ColorField value={color} onChange={setColor} />

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("editor.saveCategory") : tr("editor.addCategory")}</div></div>

      {editing && <div className="btn btn-full" style={{ marginTop: 12, background: "transparent", color: "var(--red)", border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)" }} onClick={del}><Ico name="trash" size={17} />{tr("editor.deleteCategory")}</div>}

      {iconsOpen && <IconSheet icons={iconsFor(kind)} kind={kind} glyph={glyph} color={color} onPick={setGlyph} onClose={() => setIconsOpen(false)} />}
    </div>
  );
}
