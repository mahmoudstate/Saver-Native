// Saver — Filter Results: ported from showcase 55 (summary insight + list).
import Ico from "../ui/Ico.jsx";
import TxnRow from "../ui/TxnRow.jsx";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { PERIODS, SHOWS, applyFilter, summarize } from "../lib/filter.js";
import { useT } from "../lib/i18n.js";

export default function FilterResults({ store, filter, back, onEditFilter, onEdit }) {
  const { txns = [], banks = [], expCats = [], incCats = [] } = store;
  const bankName = (id) => banks.find((b) => b.id === id)?.name || "";
  const catName = (id) => [...expCats, ...incCats].find((c) => c.id === id)?.name;
  const tr = useT();

  const list = applyFilter(txns, filter).sort((a, b) => (b.date || "").localeCompare(a.date || "") || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
  const groupSizes = {}; txns.forEach((t) => { if (t.splitGroupId) groupSizes[t.splitGroupId] = (groupSizes[t.splitGroupId] || 0) + 1; });
  const isLinked = (t) => t.splitGroupId && groupSizes[t.splitGroupId] > 1;
  const { count, total, avg } = summarize(list);

  const chips = [];
  if (filter.dateLabel) chips.push(filter.dateLabel);
  else if (filter.period && filter.period !== "all") chips.push(tr("filter.period_" + filter.period));
  (filter.shows || []).forEach((s) => chips.push(tr("filter.show_" + s)));
  (filter.cats || []).forEach((c) => chips.push(catName(c)));
  (filter.accounts || []).forEach((a) => chips.push(bankName(a)));

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("filter.results")}</div><div className="grow" /><div className="hib" onClick={onEditFilter}><Ico name="funnel" size={18} /></div></div>
        <div className="lbl">{tr("filter.yourView")}</div>
        <Money className="big tnum" v={total} />
        <div className="sub">{tr(count === 1 ? "activity.txnCountOne" : "activity.txnCountMany", { n: count })}{count ? tr("filter.avgSuffix", { amt: fmt(avg) }) : ""}</div>
      </div>

      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {chips.filter(Boolean).map((c, i) => <span key={i} className="chip" style={{ background: "var(--acDim)", color: "var(--acText)", borderColor: "transparent" }}>{c}</span>)}
          <span className="chip" onClick={onEditFilter} style={{ cursor: "pointer" }}>{tr("filter.edit")}</span>
        </div>
      )}

      <div className="over">{tr("budget.transactions")}</div>
      {list.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "30px", fontWeight: 600 }}>{tr("filter.nothingMatches")}</div>
        : list.map((t) => <TxnRow key={t.id} txn={t} bankNameOf={bankName} onClick={() => onEdit?.(t)} linked={isLinked(t)} />)}
    </div>
  );
}
