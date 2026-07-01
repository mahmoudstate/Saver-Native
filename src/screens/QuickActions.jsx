// Saver — Quick Actions setup: ported 1:1 from showcase 21 (up to 4 one-tap shortcuts).
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function QuickActions({ store, back, onEdit }) {
  const { quickActions = [], expCats = [], banks = [] } = store;
  const active = quickActions.filter((q) => q.catId);
  const catOf = (id) => expCats.find((c) => c.id === id);
  const bankOf = (id) => banks.find((b) => b.id === id);
  const tr = useT();

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("quick.quickActions")}</div><div className="grow" /></div>
        <div className="lbl">{tr("quick.shortcuts")}</div><div className="big">{active.length} / 4</div><div className="sub">{tr("quick.longPress")}</div>
      </div>

      <div className="over">{tr("quick.yourShortcuts")}</div>
      {active.map((q) => { const c = catOf(q.catId); return (
        <div className="icard" key={q.id} onClick={() => onEdit?.(q)} style={{ cursor: "pointer" }}>
          <CatTile cat={catKeyOf(c)} name={c?.name} size={44} />
          <div><div className="nm">{c?.name || tr("quick.shortcut")}</div><div className="mt">{fmt(+q.amount || 0)} · {bankOf(q.bankId)?.name || "—"}</div></div>
          <span className="chev" style={{ marginLeft: "auto", color: "var(--faint)" }}><Ico name="pencil" size={17} /></span>
        </div>
      ); })}

      {active.length < 4 && (
        <div className="icard" onClick={() => onEdit?.(null)} style={{ cursor: "pointer", borderStyle: "dashed" }}>
          <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
          <div><div className="nm" style={{ color: "var(--acText)" }}>{tr("quick.addShortcut")}</div><div className="mt">{tr(4 - active.length === 1 ? "quick.slotOne" : "quick.slotMany", { n: 4 - active.length })}</div></div>
        </div>
      )}
    </div>
  );
}
