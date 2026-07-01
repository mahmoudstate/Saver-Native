// Saver — Add / Edit account: ported from showcase 17 (bank or cash · colour · alert).
// New account optionally seeds an opening-balance income txn (existing income path).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import { fmt, today, cardGradient } from "../lib/format.js";
import { calcBankBalance } from "../lib/calc.js";
import ColorField from "../ui/ColorField.jsx";
import { loadColors } from "../ui/ColorSheet.jsx";
import { useT } from "../lib/i18n.js";

export default function AccountEditor({ store, account, onClose, onDeleted }) {
  const editing = !!account;
  const [kind, setKind] = useState(account?.glyph === "banknote" ? "cash" : "bank");
  const [name, setName] = useState(account?.name || "");
  const [color, setColor] = useState(account?.color || loadColors()[0]);
  const [opening, setOpening] = useState(0);
  const [alertOn, setAlertOn] = useState(account?.lowBalanceThreshold != null);
  const [threshold, setThreshold] = useState(account?.lowBalanceThreshold || 0);
  const [sheet, setSheet] = useState(null); // opening | threshold | palette
  const tr = useT();

  const canSave = name.trim().length > 0;

  const toggleAlert = () => setAlertOn((v) => { const nv = !v; if (nv && !threshold) setSheet("threshold"); return nv; });

  const save = () => {
    if (!canSave) return;
    const lowBalanceThreshold = alertOn && threshold > 0 ? threshold : undefined;
    const glyph = kind === "cash" ? "banknote" : "landmark";
    if (editing) {
      store.set("banks", (list) => list.map((b) => (b.id === account.id ? { ...b, name: name.trim(), color, glyph, lowBalanceThreshold } : b)));
    } else {
      const id = Date.now().toString();
      store.set("banks", (list) => [...list, { id, name: name.trim(), color, glyph, lowBalanceThreshold }]);
      if (opening > 0) store.addTxn({ type: "income", amount: opening, date: today(), bankId: id, bankName: name.trim(), catName: "Opening balance", catIcon: "wallet" });
    }
    store.flash({ title: editing ? tr("editor.accountSaved") : tr("editor.accountAdded"), sub: name.trim(), color: "var(--success)", icon: "check" });
    onClose();
  };

  // Delete = soft delete: blocked while the account holds money; once empty it's hidden
  // from the UI but the record stays so historical transactions keep resolving.
  const del = () => {
    const bal = calcBankBalance(account.id, store.txns);
    if (Math.abs(bal) > 0.005) {
      store.setAlert({ title: tr("editor.emptyFirstTitle"), message: tr("editor.emptyFirstMsg", { bal: fmt(bal), zero: fmt(0) }), color: "var(--red)", icon: "lock" });
      return;
    }
    store.setConfirm({
      title: tr("editor.deleteAccountTitle", { name: account.name }),
      message: tr("editor.deleteAccountMsg"),
      confirmText: tr("edit.delete"), danger: true, icon: "trash",
      onConfirm: () => {
        store.set("banks", (list) => list.map((b) => (b.id === account.id ? { ...b, archived: true } : b)));
        store.flash({ title: tr("editor.accountRemoved"), sub: account.name, color: "var(--red)", icon: "trash" });
        (onDeleted || onClose)();
      },
    });
  };

  return (
    <div className="content padnav">
      {/* Live preview: the hero takes the selected colour so you see the card before saving */}
      <div className="hero" style={{ background: cardGradient(color), color: "#fff" }}>
        <div className="toprow"><div className="ttl" style={{ color: "#fff" }}>{editing ? tr("editor.editAccount") : tr("editor.newAccount")}</div><div className="grow" /><div className="hib" style={{ background: "rgba(255,255,255,.18)" }} onClick={onClose}><Ico name="close" size={20} color="#fff" /></div></div>
        <div className="lbl" style={{ color: "rgba(255,255,255,.82)" }}>{editing ? tr("add.account") : tr("editor.openingBalance")}</div>
        <div className="big tnum" onClick={() => !editing && setSheet("opening")} style={{ color: "#fff", cursor: editing ? "default" : "pointer" }}>{editing ? (name || "—") : (opening > 0 ? fmt(opening) : <span style={{ opacity: .65 }}>{fmt(0)}</span>)}</div>
        <div className="sub" style={{ color: "rgba(255,255,255,.85)" }}>{kind === "cash" ? tr("editor.cashWallet") : tr("editor.bankAccount")}</div>
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        <b className={kind === "bank" ? "on" : ""} onClick={() => setKind("bank")}>{tr("editor.bank")}</b>
        <b className={kind === "cash" ? "on" : ""} onClick={() => setKind("cash")}>{tr("editor.cashWallet")}</b>
      </div>

      <label className="field">
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "cash" ? tr("editor.cashWallet") : tr("editor.namePlaceholderBank")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <ColorField value={color} onChange={setColor} style={{ margin: "13px 0" }} />

      <div className="field">
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.lowBalanceAlert")}</div><div className="fv">{alertOn ? tr("editor.on") : tr("editor.off")}</div></div>
        <span className={`switch ${alertOn ? "on" : ""}`} onClick={toggleAlert}><i /></span>
      </div>
      {alertOn && (
        <label className="field" style={{ marginTop: 11 }} onClick={() => setSheet("threshold")}>
          <div style={{ flex: 1 }}><div className="fl">{tr("editor.alertMeBelow")}</div><div className="fv" style={threshold > 0 ? null : { color: "var(--faint)" }}>{threshold > 0 ? fmt(threshold) : tr("editor.tapToSet")}</div></div>
          <span className="chev"><Ico name="pencil" size={17} /></span>
        </label>
      )}

      <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: canSave ? 1 : .5 }} onClick={save}><Ico name="check" size={18} />{editing ? tr("editor.saveAccount") : tr("account.addAccount")}</div></div>

      {editing && <div className="btn btn-full" style={{ marginTop: 12, background: "transparent", color: "var(--red)", border: "1px solid color-mix(in srgb, var(--red) 40%, transparent)" }} onClick={del}><Ico name="trash" size={17} />{tr("editor.deleteAccount")}</div>}

      {sheet === "opening" && <AmountSheet title={tr("editor.openingBalance")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setOpening(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "threshold" && <AmountSheet title={tr("editor.lowBalanceAlert")} sub={tr("editor.warnBelow")} confirmLabel={tr("editor.setGeneric")} onConfirm={(v) => { setThreshold(v); setSheet(null); }} onClose={() => setSheet(null)} />}
    </div>
  );
}
