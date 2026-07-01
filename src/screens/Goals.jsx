// Saver — Goals list: ported 1:1 from showcase 04 (savings · frozen funds).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import { resolveCat } from "../ui/cats.js";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { calcGoalSaved, totalFrozen } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

const goalCat = (g) => resolveCat({ catGlyph: g.glyph, catName: g.name }) || "goal";

export default function Goals({ store, back, onAdd, onOpenGoal }) {
  const { savings = [], banks = [], txns = [] } = store;
  const tr = useT();
  const [view, setView] = useState("active"); // active | archived
  const withSaved = (s) => ({ ...s, saved: Math.max(0, calcGoalSaved(s.id, txns)) });
  const goals = savings.filter((s) => s.status !== "archived").map(withSaved);
  const archived = savings.filter((s) => s.status === "archived").map(withSaved);
  const totalSaved = goals.reduce((a, g) => a + g.saved, 0);
  const frozen = totalFrozen(banks, txns, savings);
  const list = view === "active" ? goals : archived;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("goal.title")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">{tr("goal.savedToward")}</div>
        <Money className="big tnum" v={totalSaved} />
        <div className="sub">{tr("goal.activeCount", { n: goals.length })} &nbsp;·&nbsp; {tr("goal.frozenSafe")}</div>
      </div>

      {archived.length > 0 && <SegToggle style={{ marginBottom: 16 }} value={view} onChange={setView} options={[{ id: "active", label: tr("goal.active") }, { id: "archived", label: tr("goal.archived") }]} />}

      {list.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{view === "active" ? tr("goal.noGoals") : tr("goal.noArchived")}</div>
      ) : list.map((g) => {
        const pct = g.goal > 0 ? Math.min(100, (g.saved / g.goal) * 100) : 0;
        const left = Math.max(0, g.goal - g.saved);
        const isArch = view === "archived";
        return (
          <div className="bcard" key={g.id} onClick={() => onOpenGoal?.(g)} style={{ cursor: "pointer", opacity: isArch ? .75 : 1 }}>
            <div className="top"><CatTile cat={goalCat(g)} color={g.color} name={g.name} size={42} /><div className="nm">{g.name}</div><div className="pct">{isArch ? tr("goal.done") : `${Math.round(pct)}%`}</div></div>
            <div className="nums"><div className="a tnum">{fmt(g.saved)}</div><div className="b tnum">{isArch ? tr("goal.archivedOf", { amt: fmt(g.goal) }) : left > 0 ? tr("goal.leftOf", { left: fmt(left), target: fmt(g.goal) }) : tr("goal.reached", { amt: fmt(g.goal) })}</div></div>
            <div className="pbar bar"><i style={{ width: `${pct}%`, background: isArch ? "var(--muted)" : "linear-gradient(90deg,var(--ac),var(--ac2))" }} /></div>
          </div>
        );
      })}

      {view === "active" && goals.length > 0 && (
        <div className="frozen" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, background: "var(--acDim)", color: "var(--acText)", borderRadius: 14, padding: "12px 14px" }}>
          <Ico name="lock" size={15} color="var(--ac)" />
          <span style={{ fontWeight: 700, fontSize: 13 }}>{tr("goal.frozenAndSafe")}</span>
          <b className="tnum" style={{ marginInlineStart: "auto", fontSize: 14 }}>{fmt(frozen)}</b>
        </div>
      )}
    </div>
  );
}
