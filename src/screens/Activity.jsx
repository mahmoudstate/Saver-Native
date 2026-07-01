// Saver — Activity: flat transaction history (newest first). Compact header (no
// hero) so the list gets the full screen; date filter + live search up top.
import { useMemo, useState } from "react";
import Ico from "../ui/Ico.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import TxnRow from "../ui/TxnRow.jsx";
import { useT } from "../lib/i18n.js";

const Funnel = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18l-7 8.5V20l-4-2.5v-4z" /></svg>;

export default function Activity({ store, dateFilter, onPickDate, onFilter, onEdit, onAdd, onLearn }) {
  const { txns, banks } = store;
  const tr = useT();
  const [q, setQ] = useState("");
  const bankName = (t) => t.bankName || banks.find((b) => b.id === t.bankId)?.name || "";
  // A split shows the chain badge only when 2+ operations actually share the group id.
  const groupSizes = useMemo(() => { const m = {}; txns.forEach((t) => { if (t.splitGroupId) m[t.splitGroupId] = (m[t.splitGroupId] || 0) + 1; }); return m; }, [txns]);
  const isLinked = (t) => t.splitGroupId && groupSizes[t.splitGroupId] > 1;

  const hasDate = dateFilter && dateFilter.mode !== "all";
  const inDate = (d) => {
    if (!hasDate) return true;
    if (dateFilter.from && d < dateFilter.from) return false;
    if (dateFilter.to && d > dateFilter.to) return false;
    return true;
  };
  const query = q.trim().toLowerCase();
  const matchesQ = (t) => {
    if (!query) return true;
    return [t.note, t.catName, bankName(t), t.goalName, t.toBankName, t.type, String(t.amount)]
      .filter(Boolean).join(" ").toLowerCase().includes(query);
  };

  // flat list, newest first (date desc, then id desc)
  const list = useMemo(() =>
    [...txns].filter((t) => inDate(t.date) && matchesQ(t))
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)),
    [txns, dateFilter, q]);

  const n = list.length;
  const count = tr(n === 1 ? "activity.txnCountOne" : "activity.txnCountMany", { n });
  const summary = hasDate ? tr("activity.showing", { label: dateFilter.label, count }) : count;

  const bankNameOf = (id) => banks.find((b) => b.id === id)?.name || "";
  const row = (t) => <TxnRow key={t.id} txn={t} bankNameOf={bankNameOf} onClick={() => onEdit?.(t)} linked={isLinked(t)} />;

  const dateBtn = hasDate
    ? { background: "var(--acDim)", border: "1px solid var(--ac)", color: "var(--acText)" }
    : { background: "var(--surface)", border: "var(--cardBorder)", color: "var(--muted)" };

  return (
    <div className="content padnav">
      <div style={{ paddingTop: "calc(var(--safe-top) + 22px)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.6px", color: "var(--text)" }}>{tr("activity.title")}</div>
          <div style={{ flex: 1 }} />
          <div onClick={onPickDate} role="button" aria-label="dates" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12.5, padding: "8px 13px", borderRadius: "var(--r-pill)", cursor: "pointer", ...dateBtn }}><Ico name="cal" size={14} />{hasDate ? dateFilter.label : tr("activity.allTime")}</div>
        </div>
        <div style={{ marginTop: 7, fontSize: 12.5, fontWeight: 600, color: "var(--faint)" }}>{summary}</div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: "var(--surface)", border: "var(--cardBorder)", borderRadius: 13, padding: "11px 13px", color: "var(--faint)" }}>
          <Ico name="search" size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("activity.searchPlaceholder")} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", outline: "none", fontFamily: "inherit", fontSize: 13.5, fontWeight: 600, color: "var(--text)" }} />
          {q && <div onClick={() => setQ("")} role="button" aria-label="clear search" style={{ cursor: "pointer", color: "var(--faint)", display: "flex" }}><Ico name="close" size={15} /></div>}
        </div>
        <div onClick={onFilter} role="button" aria-label="filter" style={{ width: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--acDim)", border: "1px solid var(--ac)", borderRadius: 13, color: "var(--acText)" }}><Funnel /></div>
      </div>

      {n === 0 && (query || hasDate
        ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "34px 20px", fontWeight: 600 }}>{query ? tr("activity.noMatchQuery", { q: q.trim() }) : tr("activity.noMatchDates")}</div>
        : <EmptyState title={tr("activity.emptyTitle")} message={tr("activity.emptyMessage")} cta={tr("activity.emptyCta")} onCta={() => onAdd?.()} learn={tr("activity.learnHow")} onLearn={() => onLearn?.()} />)}
      {list.map(row)}
    </div>
  );
}
