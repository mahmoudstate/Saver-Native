// Saver — Smart Filter: ported from showcase 54 (compose any view of your money).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import { fmt } from "../lib/format.js";
import { PERIODS, SHOWS, applyFilter, summarize } from "../lib/filter.js";
import { useT } from "../lib/i18n.js";

function Chip({ on, children, onClick }) {
  return <span onClick={onClick} style={{ padding: "8px 14px", borderRadius: 11, cursor: "pointer", fontWeight: on ? 800 : 700, fontSize: 13, ...(on ? { background: "var(--acDim)", border: "1px solid var(--ac)", color: "var(--acText)" } : { background: "var(--surface)", border: "var(--cardBorder)", color: "var(--muted)" }) }}>{children}</span>;
}
const row = { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 };

export default function SmartFilter({ store, initial, dateFilter, hidePeriod, onApply, back }) {
  const { txns = [], banks = [], expCats = [], incCats = [] } = store;
  const cats = [...expCats, ...incCats];
  const tr = useT();
  // When a date range is already chosen on Activity (or carried by an existing
  // filter), lock it in and hide the period chips — the date is set up-front.
  const lockedRange = dateFilter && dateFilter.mode !== "all" ? { from: dateFilter.from, to: dateFilter.to, label: dateFilter.label }
    : (initial && (initial.from || initial.to)) ? { from: initial.from, to: initial.to, label: initial.dateLabel } : null;
  const noPeriod = hidePeriod || !!lockedRange;
  const [period, setPeriod] = useState(initial?.period || "month");
  const [shows, setShows] = useState(initial?.shows || []);
  const [catSel, setCatSel] = useState(initial?.cats || []);
  const [accSel, setAccSel] = useState(initial?.accounts || []);

  const toggle = (arr, set, id) => set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  const filter = { period: noPeriod ? "all" : period, shows, cats: catSel, accounts: accSel, ...(lockedRange ? { from: lockedRange.from, to: lockedRange.to, dateLabel: lockedRange.label } : {}) };
  const { count, total } = summarize(applyFilter(txns, filter));

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("filter.title")}</div><div className="grow" /><div className="hchip" onClick={() => { setPeriod("all"); setShows([]); setCatSel([]); setAccSel([]); }}>{tr("filter.reset")}</div></div>
        <div className="lbl">{tr("filter.buildView")}</div><div className="big" style={{ fontSize: 28 }}>{tr("filter.smartFilter")}</div><div className="sub">{tr("filter.smartSub")}</div>
      </div>

      {noPeriod ? (lockedRange?.label && <>
        <div className="over">{tr("filter.dates")}</div>
        <div style={row}><span style={{ padding: "8px 14px", borderRadius: 11, fontWeight: 800, fontSize: 13, background: "var(--acDim)", border: "1px solid var(--ac)", color: "var(--acText)", display: "inline-flex", alignItems: "center", gap: 6 }}><Ico name="cal" size={13} />{lockedRange.label}</span><span className="caption" style={{ alignSelf: "center" }}>{tr("filter.setOnActivity")}</span></div>
      </>) : <>
        <div className="over">{tr("filter.when")}</div>
        <div style={row}>{PERIODS.map((p) => <Chip key={p.id} on={period === p.id} onClick={() => setPeriod(p.id)}>{tr("filter.period_" + p.id)}</Chip>)}</div>
      </>}

      <div className="over">{tr("filter.show")}</div>
      <div style={{ ...row, marginBottom: 7 }}><Chip on={shows.length === 0} onClick={() => setShows([])}>{tr("filter.all")}</Chip>{SHOWS.map((s) => <Chip key={s.id} on={shows.includes(s.id)} onClick={() => toggle(shows, setShows, s.id)}>{tr("filter.show_" + s.id)}</Chip>)}</div>
      <div className="caption" style={{ marginBottom: 18 }}>{tr("filter.pickOneOrAll")}</div>

      {cats.length > 0 && <>
        <div className="over">{tr("filter.categories")}</div>
        <div style={row}><Chip on={catSel.length === 0} onClick={() => setCatSel([])}>{tr("filter.all")}</Chip>{cats.map((c) => <Chip key={c.id} on={catSel.includes(c.id)} onClick={() => toggle(catSel, setCatSel, c.id)}>{c.name}</Chip>)}</div>
      </>}

      <div className="over">{tr("filter.accounts")}</div>
      <div style={{ ...row, marginBottom: 8 }}><Chip on={accSel.length === 0} onClick={() => setAccSel([])}>{tr("filter.all")}</Chip>{banks.filter((b) => !b.archived).map((b) => <Chip key={b.id} on={accSel.includes(b.id)} onClick={() => toggle(accSel, setAccSel, b.id)}>{b.name}</Chip>)}</div>

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: count ? 1 : .5 }} onClick={() => count && onApply(filter)}><Ico name="search" size={17} />{tr(count === 1 ? "filter.showResult" : "filter.showResults", { count, total: fmt(total) })}</div></div>
    </div>
  );
}
