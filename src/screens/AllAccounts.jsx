// Saver — All Accounts: same two-page swipeable hero as Home (safe to spend
// first, then total balance) + every bank as its gradient card.
import { useRef, useState } from "react";
import Ico from "../ui/Ico.jsx";
import { BankCard } from "./Home.jsx";
import Money from "../ui/Money.jsx";
import { fmt } from "../lib/format.js";
import { calcBankBalance, calcFrozenForBank, totalBalance, totalSafe, totalFrozen } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

export default function AllAccounts({ store, back, onOpenBank, onAdd }) {
  const { banks = [], txns = [], savings = [] } = store;
  const tr = useT();
  const total = totalBalance(banks, txns);
  const safe = totalSafe(banks, txns, savings);
  const frozen = totalFrozen(banks, txns, savings);
  const [page, setPage] = useState(0);
  const pagerRef = useRef(null);
  const onScroll = () => { const el = pagerRef.current; if (el) setPage(Math.round(el.scrollLeft / el.clientWidth)); };
  const countSub = `${tr("account.accountsCount", { n: banks.filter((b) => !b.archived).length })}${frozen > 0 ? ` · ${tr("home.frozenInGoals", { amt: fmt(frozen) })}` : ""}`;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("account.title")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="hscroll" ref={pagerRef} onScroll={onScroll} style={{ overflow: "hidden", marginTop: 2, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 124 }}>
            <div className="lbl">{tr("home.safeToSpend")}</div>
            <Money className="big tnum" v={safe} />
            <div className="sub">{countSub}</div>
          </div>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 124 }}>
            <div className="lbl">{tr("home.totalBalance")}</div>
            <Money className="big tnum" v={total} />
            <div className="sub">{countSub}</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", gap: 6, zIndex: 1 }}>
          <span style={{ width: page === 0 ? 18 : 6, height: 6, borderRadius: 3, background: page === 0 ? "#fff" : "rgba(255,255,255,.45)" }} />
          <span style={{ width: page === 1 ? 18 : 6, height: 6, borderRadius: 3, background: page === 1 ? "#fff" : "rgba(255,255,255,.45)" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {banks.filter((b) => !b.archived).map((b) => {
          const bal = calcBankBalance(b.id, txns), fr = Math.max(0, calcFrozenForBank(b.id, savings, txns)), avail = bal - fr;
          const low = b.lowBalanceThreshold && avail <= b.lowBalanceThreshold && avail >= 0;
          return <BankCard key={b.id} grid bank={b} available={avail} frozen={fr} low={low} money={fmt} onClick={() => onOpenBank?.(b)} />;
        })}
        <div className="icard" onClick={onAdd} style={{ cursor: "pointer", borderStyle: "dashed", gridColumn: "1 / -1" }}>
          <span className="circ" style={{ width: 44, height: 44, borderRadius: 14, background: "var(--surface2)", color: "var(--acText)" }}><Ico name="plus" size={22} /></span>
          <div className="nm" style={{ color: "var(--acText)" }}>{tr("account.addAccount")}</div>
        </div>
      </div>
    </div>
  );
}
