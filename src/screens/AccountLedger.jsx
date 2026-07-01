// Saver — Account ledger: ported 1:1 from showcase 11. Bank-gradient hero + this-month ledger.
import { useMemo } from "react";
import Ico from "../ui/Ico.jsx";
import TxnRow from "../ui/TxnRow.jsx";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, cardGradient } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

export default function AccountLedger({ store, bank: bankProp, back, onMove, onEdit, onEditTxn }) {
  const { txns, banks } = store;
  const tr = useT();
  // Always read the latest bank from the store so edits (colour/name) reflect immediately.
  const bank = banks.find((b) => b.id === bankProp.id) || bankProp;
  const cm = currentMonth();
  const bankNameOf = (id) => banks.find((b) => b.id === id)?.name || "";
  const bal = calcBankBalance(bank.id, txns), frozen = Math.max(0, calcFrozenForBank(bank.id, [], txns)), avail = bal - frozen;
  const list = useMemo(() => txns
    .filter((t) => (t.bankId === bank.id || t.toBankId === bank.id || t.fromBankId === bank.id) && (t.date || "").startsWith(cm))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0)), [txns, bank.id, cm]);
  // chain badge shows only when 2+ operations actually share the split group id
  const groupSizes = useMemo(() => { const m = {}; txns.forEach((t) => { if (t.splitGroupId) m[t.splitGroupId] = (m[t.splitGroupId] || 0) + 1; }); return m; }, [txns]);
  const isLinked = (t) => t.splitGroupId && groupSizes[t.splitGroupId] > 1;

  return (
    <div className="content padnav">
      <div className="hero" style={{ position: "relative", overflow: "hidden", background: cardGradient(bank.color || "#0e9f6e"), color: "#fff" }}>
        <span className="bc-orb" style={{ width: 130, height: 130, top: -44, right: -34 }} /><span className="bc-orb" style={{ width: 60, height: 60, bottom: 18, right: 42, opacity: .5 }} /><span className="bc-shine" />
        <div className="toprow" style={{ position: "relative", zIndex: 2 }}>
          <div className="hib" onClick={back} style={{ background: "rgba(255,255,255,.2)", color: "#fff" }}><Ico name="back" size={20} /></div>
          <div className="ttl">{bank.name}</div><div className="grow" />
          <Ico name="contactless" size={20} color="#fff" stroke={2} style={{ opacity: .9, marginRight: 8 }} />
          <div className="hib" style={{ background: "rgba(255,255,255,.2)", color: "#fff" }} onClick={() => onEdit?.(bank)}><Ico name="pencil" size={18} /></div>
        </div>
        <div style={{ position: "relative", zIndex: 2 }}>
          <div className="lbl" style={{ color: "rgba(255,255,255,.82)" }}>{tr("home.available")}</div>
          <Money className="big tnum" style={{ color: "#fff" }} v={avail} />
          <div className="sub" style={{ color: "rgba(255,255,255,.85)", display: "flex", alignItems: "center", gap: 6 }}>
            {frozen > 0 ? <><Ico name="lock" size={12} color="#fff" />{tr("account.lockedTotal", { frozen: fmt(frozen), bal: fmt(bal) })}</> : <>{tr("account.totalBalance", { bal: fmt(bal) })}</>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <button className="btn btn-secondary" style={{ flex: 1, height: 46, fontSize: 14 }} onClick={() => onMove?.(bank)}><Ico name="transfer" size={17} />{tr("account.moveMoney")}</button>
      </div>
      <div className="over">{tr("account.thisMonth")}</div>
      {list.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("account.noTxnsMonth")}</div>
        : list.map((t) => <TxnRow key={t.id} txn={t} bankNameOf={bankNameOf} onClick={onEditTxn ? () => onEditTxn(t) : undefined} linked={isLinked(t)} />)}
    </div>
  );
}
