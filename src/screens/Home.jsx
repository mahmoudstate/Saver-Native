// Saver — Home: PORTED 1:1 from showcase screen 01 (same classes/markup), data injected.
import { useState, useRef, useMemo, useLayoutEffect, useEffect, Fragment } from "react";
import Ico from "../ui/Ico.jsx";
import Money from "../ui/Money.jsx";
import ActivationCard from "../ui/ActivationCard.jsx";
import { fmt, currentMonth, monthName, cardGradient, today, dayName } from "../lib/format.js";
import { calcBankBalance, calcGoalSaved, calcFrozenForBank, totalBalance, totalSafe, totalFrozen, monthTxns, sumIncome, sumExpense, projectSpent, budgetSpentMonth } from "../lib/calc.js";
import { freqOf, billPeriod, isBillPaidForKey } from "../lib/billfreq.js";
import { DASH_SECTIONS, DASH_DEFAULT } from "../lib/store.js";
import { unreadCount } from "../lib/notifications.js";
import { useT } from "../lib/i18n.js";

const KNOWN_SECTIONS = DASH_SECTIONS.map((s) => s.id);

// Privacy mask state that persists across tab re-mounts (module scope), but
// resets to masked on a full app reload (i.e. close + reopen). It only re-masks
// after the app has been in the background longer than REHIDE_MS — not on
// navigation between screens.
let maskState = true;        // true = amounts masked
let bgSince = 0;             // timestamp the app last went to background
const REHIDE_MS = 60 * 1000; // re-mask after ~1 min away

const Contactless = ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" style={{ opacity: .9 }}><path d="M5 11a3 3 0 0 1 0 2M9 8.5a6.5 6.5 0 0 1 0 7M13 6a10 10 0 0 1 0 12" /></svg>;

export function BankCard({ bank, available, frozen, low, money, masked, onClick, wide, grid }) {
  const col = bank.color || "#0e9f6e";
  const t = useT();
  return (
    <div className="bankcard" onClick={onClick} style={{ background: cardGradient(col), cursor: "pointer", ...(wide ? { width: "100%", height: 168 } : {}), ...(grid ? { minWidth: 0, width: "100%", height: 152 } : {}), ...(low ? { boxShadow: "0 12px 24px -10px rgba(0,0,0,.45), inset 0 0 0 2px #F8B53D" } : {}) }}>
      <span className="bc-orb" style={{ width: 98, height: 98, top: -34, right: -26 }} />
      <span className="bc-orb" style={{ width: 44, height: 44, bottom: 30, right: 34, opacity: .5 }} />
      <span className="bc-shine" />
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: grid ? 13.5 : 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bank.name}</span>
        {available < 0 ? <span style={{ width: 9, height: 9, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
          : low ? <span style={{ display: "flex", alignItems: "center", gap: 3, background: "#F8B53D", color: "#3A2400", fontWeight: 800, fontSize: 10.5, letterSpacing: ".02em", padding: "4px 8px 4px 6px", borderRadius: 8, flexShrink: 0 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3A2400" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>{t("home.lowBadge")}</span>
            : <Contactless />}
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 10, opacity: .85, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".09em" }}>{low && frozen <= 0 ? t("home.availableLow") : t("home.available")}</div>
        <Money className="tnum" style={{ fontSize: grid ? 22 : 27, fontWeight: 800, letterSpacing: -.6, lineHeight: 1.08 }} v={available} masked={masked} curSize={0.5} />
        {frozen > 0
          ? <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}><Ico name="lock" size={11} color="#fff" /><span className="tnum" style={{ fontSize: 11.5, fontWeight: 700, opacity: .92 }}>{t("home.lockedGoals", { amt: money(frozen) })}</span></div>
          : low
            ? <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}><Ico name="bell" size={11} color="#fff" /><span style={{ fontSize: 11.5, fontWeight: 700, opacity: .95 }}>{t("home.belowAlert", { amt: fmt(bank.lowBalanceThreshold) })}</span></div>
            : <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6, opacity: .9 }}><Ico name="check" size={12} color="#fff" /><span style={{ fontSize: 11.5, fontWeight: 700 }}>{t("home.fullyAvailable")}</span></div>}
      </div>
    </div>
  );
}

const circ = (size = 42, r = 13, bg, color) => ({ width: size, height: size, borderRadius: r, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" });
const ordinal = (n) => { if (!n) return ""; const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

export default function Home({ store, onTab, onAdd, onAddAccount, onAddBill, onAddGoal, onOpenBank, onOpenGoals, onOpenGoal, onOpenBudgets, onOpenBudget, onOpenProjects, onOpenProject, onOpenInstallments, onOpenInst, onOpenBill, onOpenNotifications, onOpenAllAccounts, onOpenBreakdown, onCustomize, initialScroll = 0, onScrollChange }) {
  const { banks, txns, savings, bills = [], budgets = [], installments = [], username } = store;
  const t = useT();
  const notifUnread = unreadCount(store);
  const scrollRef = useRef(null);
  // restore the scroll position from when Home was last left (tab-switch memory)
  useLayoutEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = initialScroll; }, []);
  const [hide, setHide] = useState(maskState); // privacy-first: amounts masked on open
  const [page, setPage] = useState(0);
  const toggleHide = () => setHide((v) => (maskState = !v));
  // Re-mask only after the app has been in the background past REHIDE_MS, so the
  // app-switcher snapshot stays private but plain navigation never re-masks.
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden") { bgSince = Date.now(); return; }
      if (bgSince && Date.now() - bgSince > REHIDE_MS) { maskState = true; setHide(true); }
      bgSince = 0;
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  const [budgetsOpen, setBudgetsOpen] = useState(false); // Home budgets card: expand to per-budget rows
  const [goalsOpen, setGoalsOpen] = useState(false); // Home goals card: expand to per-goal rows
  const [instOpen, setInstOpen] = useState(false); // installments card expand
  const [billsOpen, setBillsOpen] = useState(false); // bills card expand
  const [projOpen, setProjOpen] = useState(false); // projects card expand
  const pagerRef = useRef(null);
  const cm = currentMonth();
  const mName = monthName(+cm.split("-")[1] - 1);

  const d = useMemo(() => {
    const tb = totalBalance(banks, txns), ts = totalSafe(banks, txns, savings), tf = totalFrozen(banks, txns, savings);
    const mt = monthTxns(txns, cm), inc = sumIncome(mt), exp = sumExpense(mt);
    const goals = savings.filter((s) => s.status !== "archived").map((s) => ({ ...s, saved: Math.max(0, calcGoalSaved(s.id, txns)) }));
    const goalsSaved = goals.reduce((a, g) => a + g.saved, 0);
    const billActive = (b) => (!b.startMonth || cm >= b.startMonth) && (!b.stoppedMonth || cm < b.stoppedMonth);
    const billPaid = (b) => isBillPaidForKey(b, billPeriod(b, today()).key);
    const mBills = bills.filter((b) => billActive(b) || billPaid(b));
    const unpaid = mBills.filter((b) => !billPaid(b));
    const mb = budgets.filter((b) => b.kind !== "project");
    const limit = mb.reduce((s, b) => s + (b.amount || 0), 0);
    const budCatIds = new Set(mb.flatMap((b) => b.cats || []));
    const spent = mt.filter((t) => t.type === "expense" && budCatIds.has(t.catId)).reduce((s, t) => s + t.amount, 0);
    // Installments: active plans (not fully paid / not archived), remaining + due-this-month
    const paidOf = (i) => i.payments?.length ?? i.paidInstallments ?? 0;
    const activeInst = installments.filter((i) => i.status !== "archived" && paidOf(i) < i.totalInstallments);
    const instRemaining = activeInst.reduce((s, i) => s + Math.max(0, i.totalAmount - paidOf(i) * i.installmentAmount), 0);
    const instDue = activeInst.filter((i) => !(i.payments || []).some((p) => p.month === cm)).reduce((s, i) => s + i.installmentAmount, 0);
    // Projects: long-term budgets (kind === "project"), accumulate spend across months
    const activeProj = budgets.filter((b) => b.kind === "project" && b.status !== "archived");
    const projSpent = activeProj.reduce((s, p) => s + projectSpent(p, txns), 0);
    const projLimit = activeProj.reduce((s, p) => s + (p.amount || 0), 0);
    const budgetsList = mb.map((b) => ({ id: b.id, name: b.name, amount: b.amount || 0, spent: budgetSpentMonth(b, txns, cm) }));
    const goalsTarget = goals.reduce((a, g) => a + (g.goal || 0), 0);
    const instList = activeInst.map((i) => { const paidCount = paidOf(i), paid = paidCount * i.installmentAmount; return { id: i.id, name: i.name || i.company || i.itemType || t("home.planFallback"), paidCount, total: i.totalInstallments, paid, remaining: Math.max(0, i.totalAmount - paid), totalAmount: i.totalAmount }; });
    const billsList = mBills.map((b) => ({ id: b.id, name: b.name, amount: b.amount, paid: billPaid(b), dueDay: b.dueDay, frequency: freqOf(b), color: b.color, note: b.note })).sort((a, b) => (a.paid === b.paid ? 0 : a.paid ? 1 : -1));
    const projList = activeProj.map((p) => ({ id: p.id, name: p.name, amount: p.amount || 0, spent: projectSpent(p, txns) }));
    return { tb, ts, tf, inc, exp, net: inc - exp, goals, goalsSaved, goalsTarget, billsDue: unpaid.reduce((s, b) => s + b.amount, 0), unpaid: unpaid.length, paid: mBills.length - unpaid.length, limit, spent, budgetsList, instCount: activeInst.length, instRemaining, instDue, instList, billsList, projCount: activeProj.length, projSpent, projLimit, projList };
  }, [banks, txns, savings, bills, budgets, installments, cm]);

  const hh = new Date().getHours();
  const greet = hh < 12 ? t("home.greetMorning") : hh < 18 ? t("home.greetAfternoon") : t("home.greetEvening");
  const money = (v) => (hide ? "••••" : fmt(v));
  const onScroll = () => { const el = pagerRef.current; if (el) setPage(Math.round(el.scrollLeft / el.clientWidth)); };
  // shared "Show all N / Show less" disclosure footer used by every expandable section card
  const Disclosure = ({ open, n, set, label }) => (
    <div onClick={() => set((o) => !o)} role="button" aria-label={label} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 13, paddingTop: 12, borderTop: "1px solid var(--line)", cursor: "pointer", color: "var(--acText)", fontSize: 12.5, fontWeight: 800 }}>
      {open ? t("home.showLess") : t("home.showAll", { n })}
      <Ico name="chev" size={14} color="var(--acText)" style={{ transform: open ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
    </div>
  );

  return (
    <div className="content padnav" ref={scrollRef} onScroll={(e) => onScrollChange?.(e.currentTarget.scrollTop)}>
      <div className="hero">
        <div className="toprow">
          <div><div style={{ fontSize: 11, letterSpacing: ".05em", textTransform: "uppercase", opacity: .72, fontWeight: 700 }}>{greet}</div><div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{username || t("home.nameFallback")}</div></div>
          <div className="grow" />
          <div className="hib" onClick={toggleHide}><Ico name={hide ? "eyeOff" : "eye"} size={20} /></div>
          <div className="hib" onClick={() => onOpenNotifications?.()} style={{ position: "relative" }}><Ico name="bell" size={20} />{notifUnread > 0 && <span className="notifDot" />}</div>
        </div>
        <div className="hscroll" ref={pagerRef} onScroll={onScroll} style={{ overflow: "hidden", marginTop: 2, display: "flex", overflowX: "auto", scrollSnapType: "x mandatory" }}>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 124 }}>
            <div className="lbl">{t("home.safeToSpend")}</div><Money className="big tnum" v={d.ts} masked={hide} />
            <div className="sub">{d.tf > 0 ? t("home.frozenInGoals", { amt: money(d.tf) }) : t("home.nothingFrozen")}</div>
          </div>
          <div style={{ minWidth: "100%", scrollSnapAlign: "start", display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 124 }}>
            <div className="lbl">{t("home.totalBalance")}</div><Money className="big tnum" v={d.tb} masked={hide} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, display: "flex", justifyContent: "center", gap: 6, zIndex: 1 }}>
          <span style={{ width: page === 0 ? 18 : 6, height: 6, borderRadius: 3, background: page === 0 ? "#fff" : "rgba(255,255,255,.45)" }} />
          <span style={{ width: page === 1 ? 18 : 6, height: 6, borderRadius: 3, background: page === 1 ? "#fff" : "rgba(255,255,255,.45)" }} />
        </div>
      </div>

      <ActivationCard store={store} onAdd={onAdd} onAddAccount={onAddAccount} onAddBill={onAddBill} onAddGoal={onAddGoal} />

      {(() => {
      const saved = store.dashboard?.order ? store.dashboard : DASH_DEFAULT;
      // merge: keep saved order, then append any newer sections (e.g. installments/projects) not yet in it
      const order = [...saved.order.filter((id) => KNOWN_SECTIONS.includes(id)), ...KNOWN_SECTIONS.filter((id) => !saved.order.includes(id))];
      const dash = { order, hidden: saved.hidden || [] };
      const SEC = {};
      SEC.accounts = (<Fragment key="accounts">
      <div className="sectit"><div className="t">{t("account.title")}</div></div>
      <div className="hscroll" style={{ display: "flex", gap: 13, overflowX: "auto", marginBottom: 4, paddingBottom: 30, paddingTop: 4, marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
        {banks.filter((b) => !b.archived).map((b) => {
          const bal = calcBankBalance(b.id, txns), frozen = Math.max(0, calcFrozenForBank(b.id, savings, txns)), avail = bal - frozen;
          const low = b.lowBalanceThreshold && avail <= b.lowBalanceThreshold && avail >= 0;
          return <BankCard key={b.id} bank={b} available={avail} frozen={frozen} low={low} money={money} masked={hide} onClick={() => onOpenBank?.(b)} />;
        })}
        <div style={{ minWidth: 84, background: "var(--surface2)", border: "var(--cardBorder)", borderRadius: 22, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--acText)" }} onClick={() => onOpenAllAccounts?.()}><Ico name="layers" size={20} /><div style={{ fontSize: 11, fontWeight: 800, textAlign: "center" }}>{t("editor.all")}</div></div>
      </div>

      </Fragment>);
      SEC.income = (<Fragment key="income">
      <div className="tile" style={{ marginBottom: 13, cursor: "pointer", minHeight: 146, display: "flex", flexDirection: "column", justifyContent: "center" }} onClick={() => onOpenBreakdown?.()}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{t("home.thisMonth", { month: mName })}</div>
          <div style={{ flex: 1 }} />
          <span className="tnum" style={{ fontSize: 11.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: d.net < 0 ? "var(--redDim)" : "color-mix(in srgb,var(--success) 14%,transparent)", color: d.net < 0 ? "var(--red)" : "var(--success)" }}>{t("home.net")} {hide ? "••••" : (d.net < 0 ? "−" : "+") + fmt(Math.abs(d.net))}</span>
          <Ico name="chev" size={16} color="var(--faint)" />
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}><span style={circ(34, 11, "rgba(16,185,129,.15)", "var(--success)")}><Ico name="arrowUp" size={16} stroke={2.5} /></span><div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{t("home.income")}</div><Money className="tnum" style={{ fontSize: 17.5, fontWeight: 800, color: "var(--success)" }} v={d.inc} sign="+" masked={hide} curSize={0.62} /></div></div>
          <div style={{ width: 1, background: "var(--line)", alignSelf: "stretch", margin: "2px 14px" }} />
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}><span style={circ(34, 11, "rgba(229,84,78,.15)", "var(--red)")}><Ico name="arrowDown" size={16} stroke={2.5} /></span><div><div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{t("home.spent")}</div><Money className="tnum" style={{ fontSize: 17.5, fontWeight: 800, color: "var(--red)" }} v={d.exp} sign="−" masked={hide} curSize={0.62} /></div></div>
        </div>
      </div>

      </Fragment>);
      SEC.bills = (<Fragment key="bills">{bills.length > 0 && (
        <div className="tile" style={{ marginBottom: 13 }}>
          <div onClick={() => onTab?.("bills")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><span style={circ(42, 13, "var(--blueDim)", "var(--blue)")}><Ico name="bills" size={21} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{t("home.billsDue", { month: mName })}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.billsDue)} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{t("home.due")}</span></div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          {billsOpen ? (
            <div style={{ marginTop: 6 }}>
              {d.billsList.map((b, i) => (
                <div key={b.id} onClick={() => onOpenBill?.(b)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < d.billsList.length - 1 ? "1px solid var(--line)" : "none" }}>
                  <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: b.color || "var(--blue)", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{(b.name || "?").trim().slice(0, 1).toUpperCase()}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{b.note ? b.note + " · " : ""}{t("freq." + b.frequency)}{b.dueDay ? " · " + (b.frequency === "weekly" ? dayName(Math.min(6, Math.max(0, b.dueDay | 0))) : t("bills.dayN", { n: b.dueDay })) : ""}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div className="tnum" style={{ fontSize: 14.5, fontWeight: 800 }}>{money(b.amount)}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: b.paid ? "var(--success)" : "var(--yellow)" }}>{b.paid ? t("bills.paid") : t("bills.dueWord")}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", marginTop: 13 }}><i style={{ display: "block", width: `${(d.paid + d.unpaid) > 0 ? Math.round((d.paid / (d.paid + d.unpaid)) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--blue)" }} /></div>
          )}
          <Disclosure open={billsOpen} n={d.billsList.length} set={setBillsOpen} label="toggle bills" />
        </div>
      )}
      </Fragment>);
      SEC.installments = (<Fragment key="installments">{d.instCount > 0 && (() => {
        const paid = d.instList.reduce((s, i) => s + i.paid, 0), total = d.instList.reduce((s, i) => s + i.totalAmount, 0);
        return (
        <div className="tile" style={{ marginBottom: 13 }}>
          <div onClick={() => onOpenInstallments?.()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><span style={circ(42, 13, "var(--orangeDim)", "var(--orange)")}><Ico name="card" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{t("home.installmentsActive", { n: d.instCount })}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.instRemaining)} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{t("home.leftLabel")}</span></div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          {instOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 14 }}>
              {d.instList.map((i) => {
                const pct = i.totalAmount > 0 ? Math.round((i.paid / i.totalAmount) * 100) : 0;
                return (
                  <div key={i.id} onClick={() => onOpenInst?.(i)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</span>
                      <span className="tnum" style={{ fontSize: 12, fontWeight: 800, color: "var(--orange)", flexShrink: 0 }}>{i.paidCount}/{i.total}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 4, background: "var(--orange)" }} /></div>
                    <div className="tnum" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{t("home.instProgress", { paid: money(i.paid), remaining: money(i.remaining), total: fmt(i.totalAmount) })}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", marginTop: 13 }}><i style={{ display: "block", width: `${total > 0 ? Math.min(100, (paid / total) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--orange)" }} /></div>
          )}
          <Disclosure open={instOpen} n={d.instList.length} set={setInstOpen} label="toggle installments" />
        </div>
        );
      })()}
      </Fragment>);
      SEC.goals = (<Fragment key="goals">{d.goals.length > 0 && (
        <div className="tile" style={{ marginBottom: 13 }}>
          <div onClick={() => onOpenGoals?.()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><span style={circ(42, 13, "var(--acDim)", "var(--acText)")}><Ico name="target" size={21} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{t("home.goalsActive", { n: d.goals.length })}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.goalsSaved)} {d.goalsTarget > 0 && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{t("home.ofTotal", { amt: fmt(d.goalsTarget) })}</span>}</div></div></div>
            <Ico name="chev" size={18} color="var(--faint)" />
          </div>
          {goalsOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 14 }}>
              {d.goals.map((g) => {
                const pct = g.goal > 0 ? Math.round((g.saved / g.goal) * 100) : 0;
                const reached = g.saved >= g.goal;
                return (
                  <div key={g.id} onClick={() => onOpenGoal?.(g)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: "var(--acText)", flexShrink: 0 }}>{Math.min(100, pct)}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 4, background: "var(--ac)" }} /></div>
                    <div className="tnum" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{t("home.savedLabel", { amt: money(g.saved) })} · {reached ? <span style={{ color: "var(--acText)", fontWeight: 700 }}>{t("goal.reachedWord")}</span> : t("home.left", { amt: money(g.goal - g.saved) })} · {t("home.ofTotal", { amt: fmt(g.goal) })}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", marginTop: 13 }}><i style={{ display: "block", width: `${d.goalsTarget > 0 ? Math.min(100, (d.goalsSaved / d.goalsTarget) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--ac)" }} /></div>
          )}
          <div onClick={() => setGoalsOpen((o) => !o)} role="button" aria-label="toggle goals" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--line)", cursor: "pointer", color: "var(--acText)", fontSize: 12.5, fontWeight: 800 }}>
            {goalsOpen ? t("home.showLess") : t("home.showAll", { n: d.goals.length })}
            <Ico name="chev" size={14} color="var(--acText)" style={{ transform: goalsOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
          </div>
        </div>
      )}
      </Fragment>);
      SEC.budgets = (<Fragment key="budgets">{d.limit > 0 && (
        <div className="tile" style={{ marginBottom: 13 }}>
          <div onClick={() => onOpenBudgets?.()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><span style={circ(42, 13, "var(--purpleDim)", "var(--purple)")}><Ico name="layers" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>{t("home.budgetsMonth", { month: mName })}</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.spent)} <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>{t("home.ofTotal", { amt: fmt(d.limit) })}</span></div></div></div>
            <Ico name="chev" size={18} color="var(--faint)" />
          </div>
          {budgetsOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 14 }}>
              {d.budgetsList.map((b) => {
                const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
                const left = b.amount - b.spent, over = left < 0;
                return (
                  <div key={b.id} onClick={() => onOpenBudget?.(b)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: over ? "var(--red)" : "var(--purple)", flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)" }}><i style={{ display: "block", width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 4, background: over ? "var(--red)" : "var(--purple)" }} /></div>
                    <div className="tnum" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{t("home.spentLabel", { amt: money(b.spent) })} · <span style={{ color: over ? "var(--red)" : "inherit", fontWeight: over ? 700 : 600 }}>{over ? t("home.over", { amt: money(-left) }) : t("home.left", { amt: money(left) })}</span> · {t("home.ofTotal", { amt: fmt(b.amount) })}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", marginTop: 13 }}><i style={{ display: "block", width: `${d.limit > 0 ? Math.min(100, (d.spent / d.limit) * 100) : 0}%`, height: "100%", borderRadius: 4, background: "var(--purple)" }} /></div>
          )}
          <div onClick={() => setBudgetsOpen((o) => !o)} role="button" aria-label="toggle budgets" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--line)", cursor: "pointer", color: "var(--acText)", fontSize: 12.5, fontWeight: 800 }}>
            {budgetsOpen ? t("home.showLess") : t("home.showAll", { n: d.budgetsList.length })}
            <Ico name="chev" size={14} color="var(--acText)" style={{ transform: budgetsOpen ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform .2s" }} />
          </div>
        </div>
      )}</Fragment>);
      SEC.projects = (<Fragment key="projects">{d.projCount > 0 && (
        <div className="tile" style={{ marginBottom: 13 }}>
          <div onClick={() => onOpenProjects?.()} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><span style={circ(42, 13, "var(--purpleDim)", "var(--purple)")}><Ico name="sparkles" size={20} /></span><div><div style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em" }}>Projects · {d.projCount} active</div><div className="tnum" style={{ fontSize: 21, fontWeight: 800 }}>{money(d.projSpent)} {d.projLimit > 0 && <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 700 }}>of {fmt(d.projLimit)}</span>}</div></div></div><Ico name="chev" size={18} color="var(--faint)" /></div>
          {projOpen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 14 }}>
              {d.projList.map((p) => {
                const pct = p.amount > 0 ? Math.round((p.spent / p.amount) * 100) : 0;
                const left = p.amount - p.spent, over = left < 0;
                return (
                  <div key={p.id} onClick={() => onOpenProject?.(p)} style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                      <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, color: p.amount > 0 ? (over ? "var(--red)" : "var(--purple)") : "var(--muted)", flexShrink: 0 }}>{p.amount > 0 ? `${pct}%` : t("home.open")}</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>{p.amount > 0
                      ? <i style={{ display: "block", width: `${Math.min(100, pct)}%`, height: "100%", borderRadius: 4, background: over ? "var(--red)" : "var(--purple)" }} />
                      : <i className="bar-flow" style={{ display: "block", height: "100%", borderRadius: 4, "--c": "var(--purple)" }} />}</div>
                    <div className="tnum" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--muted)" }}>{t("home.spentLabel", { amt: money(p.spent) })}{p.amount > 0 ? ` · ${over ? t("home.over", { amt: money(-left) }) : t("home.left", { amt: money(left) })} · ${t("home.ofTotal", { amt: fmt(p.amount) })}` : ""}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            d.projLimit > 0
              ? <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", marginTop: 13 }}><i style={{ display: "block", width: `${Math.min(100, (d.projSpent / d.projLimit) * 100)}%`, height: "100%", borderRadius: 4, background: "var(--purple)" }} /></div>
              : <div style={{ height: 6, marginTop: 13 }} />
          )}
          <Disclosure open={projOpen} n={d.projList.length} set={setProjOpen} label="toggle projects" />
        </div>
      )}</Fragment>);
      return dash.order.filter((id) => !(dash.hidden || []).includes(id)).map((id) => SEC[id]);
      })()}

      <div className="customize-cta" onClick={() => onCustomize?.()}>
        <span className="g"><Ico name="grip" size={16} /></span>
        {t("home.customize")}
      </div>
    </div>
  );
}
