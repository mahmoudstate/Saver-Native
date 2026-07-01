// Saver — Add transaction: ported from showcase 07/08/09 (Expense · Income · Saving).
// Amount via keypad sheet; account/category/goal via picker sheets; commits through the
// LOCKED store.addTxn (balance checks + goal freezing handled there).
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import AmountSheet from "../ui/AmountSheet.jsx";
import PickerSheet from "../ui/PickerSheet.jsx";
import DateSheet from "../ui/DateSheet.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import { resolveCat } from "../ui/cats.js";
import { fmt, today, monthName } from "../lib/format.js";
import { calcGoalSaved, calcBankBalance, calcFrozenForBank } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => (c ? resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) : null);

export default function Add({ store, initial, onSaved, onClose }) {
  const { banks = [], expCats = [], incCats = [], savings = [], txns = [] } = store;
  const tr = useT();
  const goals = savings.filter((s) => s.status !== "archived");
  // amount you can still spend from a bank (balance − money frozen for goals)
  const safeOf = (id) => calcBankBalance(id, txns) - Math.max(0, calcFrozenForBank(id, savings, txns));

  // `initial` pre-fills the form (e.g. opened from a Quick Add shortcut).
  const [type, setType] = useState(initial?.type || "expense");
  const [amount, setAmount] = useState(+initial?.amount || 0);
  const [bankId, setBankId] = useState(initial?.bankId || banks[0]?.id || null);
  const [srcGoal, setSrcGoal] = useState(null); // expense paid from a goal vault (spending mode)
  const vaults = goals.filter((g) => g.spendingMode);
  const [expCatId, setExpCatId] = useState(initial?.expCatId || expCats[0]?.id || null);
  const [incCatId, setIncCatId] = useState(incCats[0]?.id || null);
  const [goalId, setGoalId] = useState(goals[0]?.id || null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [sheet, setSheet] = useState(null); // amount | account | category | goal | date

  const meta = {
    expense: { title: tr("add.newExpense"), sign: "−", sub: tr("add.subExpense"), accLabel: tr("add.account"), cta: tr("add.ctaExpense"), ctaIcon: "check" },
    income: { title: tr("add.newIncome"), sign: "+", sub: tr("add.subIncome"), accLabel: tr("add.toAccount"), cta: tr("add.ctaIncome"), ctaIcon: "check" },
    saving: { title: tr("add.moveToGoal"), sign: "+", sub: tr("add.subSaving"), accLabel: tr("add.fromAccount"), cta: tr("add.ctaSaving"), ctaIcon: "lock" },
  }[type];

  const dateLabel = date === today() ? tr("add.today") : (() => { const d = new Date(date + "T12:00:00"); return `${d.getDate()} ${monthName(d.getMonth())} ${d.getFullYear()}`; })();
  const vaultGoal = srcGoal ? goals.find((g) => g.id === srcGoal) : null;
  const bank = banks.find((b) => b.id === bankId);
  const avail = bankId ? safeOf(bankId) : 0;
  const showAvail = type !== "income" && !vaultGoal && !!bank; // only when spending/saving from a real bank
  const cat = type === "income" ? incCats.find((c) => c.id === incCatId) : expCats.find((c) => c.id === expCatId);
  const goal = goals.find((g) => g.id === goalId);
  const sourceOk = type === "expense" && srcGoal ? true : !!bankId;
  const canSave = amount > 0 && sourceOk && (type === "saving" ? goalId : cat);

  const submit = () => {
    if (!canSave) {
      const why = amount <= 0 ? tr("add.whyAmount") : !sourceOk ? tr("add.whyAccount") : type === "saving" ? tr("add.whyGoal") : tr("add.whyCategory");
      store.flash({ title: why, color: "var(--yellow)", icon: "bell" });
      return;
    }
    let txn;
    if (type === "saving") txn = { type: "saving", amount, date, bankId, bankName: bank?.name, goalId, goalName: goal?.name, catName: goal?.name, catIcon: "saving", note };
    else if (type === "expense" && srcGoal) txn = { type: "goal_withdraw", amount, date, goalId: srcGoal, goalName: vaultGoal?.name, catId: cat.id, catName: cat.name, catGlyph: cat.glyph, catColor: cat.color, note };
    else txn = { type, amount, date, bankId, bankName: bank?.name, catId: cat.id, catName: cat.name, catGlyph: cat.glyph, catColor: cat.color, note };
    const id = store.addTxn(txn);
    if (id === false) return; // blocked (alert shown by store)
    if (type === "saving") store.fireConfetti(); // celebrate money moved into a goal
    if (!srcGoal) onSaved?.({ amount, bankId }); // remember last amount/bank (Quick Add shortcut)
    const label = type === "saving" ? tr("add.toName", { name: goal?.name }) : type === "income" ? tr("add.toName", { name: bank?.name }) : srcGoal ? tr("add.fromVaultName", { name: vaultGoal?.name }) : `${cat?.name}`;
    store.flash({ title: `${meta.sign}${fmt(amount)} ${type === "income" ? tr("add.flashIn") : type === "saving" ? tr("add.flashSaved") : tr("add.flashSpent")}`, sub: label, color: type === "income" ? "var(--success)" : type === "saving" ? "var(--ac)" : "var(--muted)", icon: "check" });
    onClose();
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="ttl">{meta.title}</div><div className="grow" /><div className="hib" onClick={onClose}><Ico name="close" size={20} /></div></div>
        <div className="lbl">{tr("add.amountLabel", { cur: store.currency })}</div>
        <div className="big tnum" onClick={() => setSheet("amount")} style={{ cursor: "pointer" }}>{amount > 0 ? `${meta.sign}${fmt(amount)}` : <span style={{ opacity: .6 }}>{meta.sign}{fmt(0)}</span>}</div>
        <div className="sub">{type === "saving" ? meta.sub : `${tr(type === "income" ? "add.incomeWord" : "add.expenseWord")} · ${dateLabel}`}</div>
      </div>

      <SegToggle style={{ marginBottom: 16 }} value={type} onChange={setType} options={[{ id: "expense", label: tr("add.segExpense") }, { id: "income", label: tr("add.segIncome") }, { id: "saving", label: tr("add.segSaving") }]} />

      {type === "saving" ? (
        <div className="field" onClick={() => setSheet("goal")} style={{ cursor: "pointer" }}>
          <CatTile cat={goal ? catKeyOf({ name: goal.name, glyph: goal.glyph }) || "goal" : "goal"} name={goal?.name} size={42} />
          <div><div className="fl">{tr("add.toGoal")}</div><div className="fv">{goal?.name || tr("add.whyGoal")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
      ) : (
        <div className="field" onClick={() => setSheet("category")} style={{ cursor: "pointer" }}>
          <CatTile cat={catKeyOf(cat)} name={cat?.name} size={42} />
          <div><div className="fl">{tr("add.category")}</div><div className="fv">{cat?.name || tr("add.whyCategory")}</div></div><span className="chev"><Ico name="chev" size={18} /></span>
        </div>
      )}

      <div className="field" onClick={() => setSheet("account")} style={{ cursor: "pointer", marginTop: 12 }}>
        {vaultGoal
          ? <CatTile cat="goal" name={vaultGoal.name} size={42} />
          : <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: bank?.color || "var(--muted)", color: "#fff", fontWeight: 800, fontSize: 14 }}>{(bank?.name || "?").slice(0, 1).toUpperCase()}</span>}
        <div style={{ minWidth: 0 }}>
          <div className="fl">{vaultGoal ? tr("add.fromVault") : meta.accLabel}</div>
          <div className="fv" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {vaultGoal ? vaultGoal.name : (bank?.name || tr("add.pickAccount"))}
            {showAvail && <span className={`pill${avail <= 0 ? " pill-red" : ""}`} style={{ fontSize: 11, fontWeight: 700, padding: "3px 9px" }}>{fmt(Math.max(0, avail))} {tr("add.available")}</span>}
          </div>
        </div>
        <span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <div className="field" onClick={() => setSheet("date")} style={{ cursor: "pointer", marginTop: 12 }}>
        <span className="circ" style={{ width: 42, height: 42, borderRadius: 13, background: "var(--acDim)", color: "var(--acText)" }}><Ico name="cal" size={19} /></span>
        <div style={{ flex: 1 }}><div className="fl">{tr("add.date")}</div><div className="fv">{dateLabel}</div></div>
        <span className="chev"><Ico name="chev" size={18} /></span>
      </div>

      <label className="field note" style={{ marginTop: 12 }}>
        <Ico name="note" size={19} color="var(--faint)" style={{ marginRight: 2 }} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr("add.notePlaceholder")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", flex: 1, minWidth: 0 }} />
      </label>

      <div className="cta"><div className={`btn btn-primary btn-full`} onClick={submit}><Ico name={meta.ctaIcon} size={19} />{meta.cta}</div></div>

      {sheet === "date" && <DateSheet value={date} onPick={(d) => { setDate(d); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "amount" && <AmountSheet title={tr("add.enterAmount")} sub={meta.title} confirmLabel={tr("add.setAmount")} onConfirm={(v) => { setAmount(v); setSheet(null); }} onClose={() => setSheet(null)} />}
      {sheet === "account" && <PickerSheet title={meta.accLabel} selectedId={srcGoal ? "vault:" + srcGoal : bankId} onPick={(id) => { if (id.startsWith?.("vault:")) setSrcGoal(id.slice(6)); else { setBankId(id); setSrcGoal(null); } }} onClose={() => setSheet(null)} options={[
        ...banks.filter((b) => !b.archived).map((b) => ({ id: b.id, label: b.name, bankColor: b.color, sub: type !== "income" ? `${fmt(Math.max(0, safeOf(b.id)))} ${tr("add.available")}` : undefined })),
        ...(type === "expense" ? vaults.map((g, i) => ({ id: "vault:" + g.id, label: g.name, sub: `${fmt(Math.max(0, calcGoalSaved(g.id, store.txns)))} ${tr("add.available")}`, catKey: "goal", sectionHeader: i === 0 ? tr("add.goalsHeader") : undefined })) : []),
      ]} />}
      {sheet === "category" && <PickerSheet title={tr("add.category")} selectedId={type === "income" ? incCatId : expCatId} onPick={type === "income" ? setIncCatId : setExpCatId} onClose={() => setSheet(null)} options={(type === "income" ? incCats : expCats).map((c) => ({ id: c.id, label: c.name, sub: c.group, catKey: catKeyOf(c) }))} />}
      {sheet === "goal" && <PickerSheet title={tr("add.toGoal")} selectedId={goalId} onPick={setGoalId} onClose={() => setSheet(null)} options={goals.map((g) => ({ id: g.id, label: g.name, sub: `${fmt(Math.max(0, calcGoalSaved(g.id, store.txns)))} ${tr("add.savedWord")}`, catKey: catKeyOf({ name: g.name, glyph: g.glyph }) || "goal" }))} />}
    </div>
  );
}
