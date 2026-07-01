// Saver — Edit transaction: ported from showcase 16 (amend or delete).
// Save via locked store.updateTxn (re-checks balance); delete via store.delTxn (+confirm).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt, fmtDate } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function EditTxn({ store, txn, onClose }) {
  const { banks = [], expCats = [], incCats = [] } = store;
  const tr = useT();
  const editable = txn.type === "expense" || txn.type === "income";
  const cats = txn.type === "income" ? incCats : expCats;

  const [amount, setAmount] = useState(txn.amount);
  const [bankId, setBankId] = useState(txn.bankId);
  const [catId, setCatId] = useState(txn.catId || cats.find((c) => c.name === txn.catName)?.id || cats[0]?.id || null);
  const [note, setNote] = useState(txn.note || "");
  const [sheet, setSheet] = useState(null);

  const bank = banks.find((b) => b.id === bankId);
  const cat = cats.find((c) => c.id === catId);
  const sign = txn.type === "expense" ? "−" : txn.type === "income" ? "+" : "";

  const save = () => {
    const patch = { amount, note };
    if (editable) { patch.bankId = bankId; if (cat) { patch.catId = cat.id; patch.catName = cat.name; patch.catGlyph = cat.glyph; patch.catColor = cat.color; } }
    const ok = store.updateTxn(txn.id, patch);
    if (ok === false) return;
    store.flash({ title: tr("edit.saved"), sub: `${sign}${fmt(amount)}`, color: "var(--success)", icon: "check" });
    onClose();
  };

  // Split operations share a splitGroupId — deleting one removes the whole linked set,
  // so warn with the exact count first.
  const linkedCount = txn.splitGroupId ? (store.txns || []).filter((x) => x.splitGroupId === txn.splitGroupId).length : 1;
  const remove = () => store.setConfirm({
    title: linkedCount > 1 ? tr("edit.deleteLinked") : tr("edit.deleteTxn"),
    message: linkedCount > 1
      ? tr("edit.linkedMsg", { n: linkedCount })
      : tr("edit.removeMsg", { amt: `${sign}${fmt(txn.amount)}` }),
    confirmText: linkedCount > 1 ? tr("edit.deleteN", { n: linkedCount }) : tr("edit.delete"), danger: true, icon: "trash",
    onConfirm: () => { const r = store.delTxn(txn.id); if (r !== false) { store.flash({ title: tr("edit.deleted"), color: "var(--muted)", icon: "trash" }); onClose(); } },
  });

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{tr("edit.title")}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{tr("add.amountLabel", { cur: store.currency })}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{sign}{fmt(amount)}</div>
        <div className="sub" style={{ textTransform: "capitalize" }}>{txn.type.replace("_", " ")} · {txn.date ? fmtDate(txn.date).split(":")[0] : tr("add.today")}</div>
      </div>

      <div className="seg" style={{ marginBottom: 16, opacity: .85, pointerEvents: "none" }}>
        {["expense", "income", "saving"].map((t) => <b key={t} className={txn.type === t || (txn.type.startsWith("goal") && t === "saving") ? "on" : ""} style={{ textTransform: "capitalize" }}>{tr(`edit.type_${t}`)}</b>)}
      </div>

      {(() => {
        const isTransfer = txn.type === "transfer";
        const nameOf = (id) => banks.find((b) => b.id === id)?.name;
        const label = isTransfer
          ? `${nameOf(txn.fromBankId) || txn.fromBankName || "Deleted account"} → ${nameOf(txn.toBankId) || txn.toBankName || "Deleted account"}`
          : (bank?.name || txn.bankName || "Deleted account");
        return (
          <div className="field" onClick={() => editable && setSheet("account")} style={{ cursor: editable ? "pointer" : "default", opacity: editable ? 1 : .7 }}>
            <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--surface2)", color: bank ? "#fff" : "var(--muted)", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{bank ? (bank.name || "?").slice(0, 1).toUpperCase() : <Ico name={isTransfer ? "transfer" : "wallet"} size={18} />}</span>
            <div style={{ minWidth: 0 }}><div className="fl">{isTransfer ? tr("transfer.title") : tr("add.account")}</div><div className="fv" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div></div>{editable && <span className="chev"><Ico name="chev" size={18} /></span>}
          </div>
        );
      })()}

      {editable && (
        <div className="field" onClick={() => setSheet("category")} style={{ cursor: "pointer", marginTop: 12 }}>
          <CatTile cat={catKeyOf(cat)} name={cat?.name} size={42} />
          <div><div className="fl">{tr("add.category")}</div><div className="fv">{cat?.name || "—"}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
      )}

      <label className="field note" style={{ marginTop: 12 }}>
        <Ico name="note" size={19} color="var(--faint)" style={{ marginRight: 2 }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr("add.notePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", flex: 1, minWidth: 0 }} />
      </label>

      <div className="cta" style={{ display: "flex", gap: 10 }}>
        <div className="btn btn-primary" style={{ flex: 1 }} onClick={save}><Ico name="check" size={18} />Save</div>
        <div className="btn btn-secondary" style={{ width: 56, color: "var(--red)" }} onClick={remove}><Ico name="trash" size={18} /></div>
      </div>

      {sheet === "amount" && <AmountSheet title={tr("add.enterAmount")} sub={tr("edit.amountSub")} confirmLabel={tr("add.setAmount")} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title={tr("add.account")} selectedId={bankId} onPick={setBankId} onClose={() => setSheet(null)} options={banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color }))} />}
      {sheet === "category" && <PickerSheet title={tr("add.category")} selectedId={catId} onPick={setCatId} onClose={() => setSheet(null)} options={cats.map((c) => ({ id: c.id, label: c.name, sub: c.group, catKey: catKeyOf(c) }))} />}
    </div>
  );
}
