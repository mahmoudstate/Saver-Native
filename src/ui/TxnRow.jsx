// Saver — shared transaction-row card. SINGLE SOURCE OF TRUTH for how any
// operation renders across the app (Activity, account ledger, filter results,
// budget / project detail). Change the rule here and every page follows.
import CatTile from "./CatTile.jsx";
import LinkBadge from "./LinkBadge.jsx";
import { fmt, fmtDate } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

// per-row date, light — e.g. "Tue, 23 Jun 2026"
const rowDate = (d) => d ? fmtDate(d) : "";

// Compute a row's fields from a transaction. `bankNameOf(id)` resolves a bank id
// → name. Returns: icon key (`cat`, null = derive from category), big `title`,
// small `sub` (bank + date), optional `goalLine`, and amount sign / colour.
export function txnView(t, bankNameOf = () => "", tr = (k, vars, fallback) => fallback) {
  const dl = rowDate(t.date);
  const bank = t.bankName || bankNameOf(t.bankId) || "";
  let cls = "", sign = "", cat = null, amtColor, title, sub, goalLine = null;
  if (t.type === "income") { cls = "in"; sign = "+"; title = t.catName || t.note || tr("activity.income", null, "Income"); sub = `${bank} · ${dl}`; }
  else if (t.type === "expense") { cls = "out"; sign = "−"; title = t.catName || t.note || tr("activity.expense", null, "Expense"); sub = `${bank} · ${dl}`; }
  else if (t.type === "saving") { cat = "deposit"; amtColor = "var(--ac)"; sub = `${bank} · ${dl}`; const sgn = t.goalName || t.catName; if (sgn) { title = tr("activity.savedTitle", null, "Saved"); goalLine = tr("activity.goalTag", { goal: sgn }, `Goal · ${sgn}`); } else title = tr("activity.saving", null, "Saving"); }
  else if (t.type === "goal_withdraw") { cls = "out"; sign = "−"; title = t.catName || tr("activity.goalSpend", null, "Goal spend"); sub = `${bank} · ${dl}`; const gn = t.goalName || tr("activity.goalFallback", null, "Goal"); goalLine = tr("activity.goalTag", { goal: gn }, `Goal · ${gn}`); }
  else if (t.type === "goal_return") { cls = "in"; sign = "+"; cat = "goalReturn"; sub = `${bank} · ${dl}`; if (t.goalName) { title = tr("activity.returnedTitle", null, "Returned"); goalLine = tr("activity.goalTag", { goal: t.goalName }, `Goal · ${t.goalName}`); } else title = tr("activity.goalReturn", null, "Goal return"); }
  else if (t.type === "transfer") { cat = "transfer"; amtColor = "var(--blue)"; title = tr("activity.transfer", null, "Transfer"); sub = `${t.bankName || bankNameOf(t.fromBankId || t.bankId) || ""} → ${t.toBankName || bankNameOf(t.toBankId) || ""} · ${dl}`; }
  else { title = t.catName || t.type; sub = `${bank} · ${dl}`; }
  return { cls, sign, cat, amtColor, title, sub, goalLine };
}

export default function TxnRow({ txn, bankNameOf, onClick, linked = false }) {
  const tr = useT();
  const { cls, sign, cat, amtColor, title, sub, goalLine } = txnView(txn, bankNameOf, tr);
  return (
    <div className="icard" onClick={onClick} style={onClick ? { cursor: "pointer" } : undefined}>
      <CatTile txn={txn} cat={cat} size={44} />
      <div style={{ minWidth: 0 }}>
        <div className="nm">{title}</div>
        <div className="mt">{sub}</div>
        {goalLine && (
          <div className="mt" style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 2 }}>
            <span style={{ color: "var(--acText)" }}>{goalLine}</span>
            {linked && <LinkBadge groupId={txn.splitGroupId} />}
          </div>
        )}
      </div>
      <div className={`amt ${cls} tnum`} style={!cls && amtColor ? { color: amtColor } : undefined}>{sign}{fmt(txn.amount)}</div>
    </div>
  );
}
