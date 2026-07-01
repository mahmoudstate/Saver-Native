// Saver — Guide live demos: real app components rendered with safe sample data
// inside a small framed stage. Some are interactive (tap the eye, toggle type).
// Everything is theme-aware via CSS vars; nothing is a static picture.
// All visible copy is translated via i18n (demo.* keys) so demos follow the language.
import { useState } from "react";
import { BankCard } from "../screens/Home.jsx";
import CatTile from "./CatTile.jsx";
import SegToggle from "./SegToggle.jsx";
import BudgetRing from "./BudgetRing.jsx";
import ServiceLogo from "./ServiceLogo.jsx";
import Money from "./Money.jsx";
import Ico from "./Ico.jsx";
import InstallSteps from "./InstallSteps.jsx";
import { fmt, CURRENCIES } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const Stage = ({ children, label }) => {
  const tr = useT();
  return (
    <div className="gsap-demo" style={{ background: "var(--stage)", borderRadius: 22, padding: 16, border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Ico name="sparkles" size={13} color="var(--ac)" />{label || tr("demo.live")}</div>
      {children}
    </div>
  );
};

function HomeDemo() {
  const tr = useT();
  const [hide, setHide] = useState(false);
  const money = (v) => (hide ? "••••" : fmt(v));
  return (
    <Stage label={tr("demo.tapEye")}>
      <div style={{ background: "var(--heroGrad)", color: "var(--heroText)", borderRadius: 18, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", opacity: .72 }}>{tr("demo.safeToSpend")}</div>
          <span onClick={() => setHide((h) => !h)} style={{ cursor: "pointer", display: "flex" }}><Ico name={hide ? "eyeOff" : "eye"} size={17} /></span>
        </div>
        <Money className="tnum" style={{ fontSize: 27, fontWeight: 800, letterSpacing: -.5 }} v={1446} masked={hide} />
      </div>
      <BankCard bank={{ id: "demo", name: tr("demo.mainAccount"), color: "#0e9f6e" }} available={426} frozen={200} money={money} masked={hide} grid />
    </Stage>
  );
}

function AddDemo() {
  const tr = useT();
  const [mode, setMode] = useState("expense");
  const out = mode === "expense";
  return (
    <Stage label={tr("demo.pickType")}>
      <SegToggle value={mode} onChange={setMode} options={[{ id: "expense", label: tr("demo.expense") }, { id: "income", label: tr("demo.income") }]} />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Money style={{ fontSize: 36, fontWeight: 800, letterSpacing: -.5, color: out ? "var(--red)" : "var(--success)" }} v={250} sign={out ? "−" : "+"} curSize={0.5} />
      </div>
    </Stage>
  );
}

function GoalsDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.goalFilling")}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BudgetRing spent={1200} total={1800} size={104} stroke={12} />
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>{tr("demo.savedSoFar")}</div>
          <Money style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }} v={1200} curSize={0.5} />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}><Ico name="lock" size={12} color="var(--ac)" />{tr("demo.target", { v: fmt(1800) })}</div>
        </div>
      </div>
    </Stage>
  );
}

function BillsDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.billRadar")}>
      <div className="icard" style={{ margin: 0 }}>
        <ServiceLogo domain="netflix" name="Netflix" color="#E50914" size={44} />
        <div><div className="nm">Netflix</div><div className="mt" style={{ color: "var(--yellow)" }}>{tr("demo.dueIn3")}</div></div>
        <Money className="tnum" style={{ marginInlineStart: "auto", fontWeight: 800, fontSize: 15 }} v={10} curSize={0.6} />
      </div>
    </Stage>
  );
}

function CategoriesDemo() {
  const tr = useT();
  const cats = ["groceries", "fuel", "gift", "music", "fitness"];
  return (
    <Stage label={tr("demo.realCatIcons")}>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        {cats.map((c) => <CatTile key={c} cat={c} size={48} />)}
      </div>
    </Stage>
  );
}

function AccountsDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.accountCard")}>
      <BankCard bank={{ id: "demo", name: tr("demo.cashWallet"), color: "#f59e0b", lowBalanceThreshold: 200 }} available={120} frozen={0} low money={fmt} grid />
      <div className="btn btn-secondary btn-full" style={{ marginTop: 12, pointerEvents: "none" }}><Ico name="transfer" size={17} />{tr("demo.moveMoney")}</div>
    </Stage>
  );
}

function ActivityDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.yourActivity")}>
      <div className="icard" style={{ margin: 0 }}>
        <CatTile cat="groceries" size={44} />
        <div><div className="nm">{tr("demo.groceries")}</div><div className="mt">HSBC · {tr("demo.dateFri")}</div></div>
        <Money className="tnum" style={{ marginInlineStart: "auto", fontWeight: 800, fontSize: 15, color: "var(--red)" }} v={160} sign="−" curSize={0.6} />
      </div>
      <div className="icard" style={{ margin: "10px 0 0" }}>
        <CatTile cat="goal" color="var(--ac)" size={44} />
        <div><div className="nm">{tr("demo.savedLaptop")}</div><div className="mt">HSBC · {tr("demo.dateTue")}</div></div>
        <Money className="tnum" style={{ marginInlineStart: "auto", fontWeight: 800, fontSize: 15, color: "var(--success)" }} v={600} sign="+" curSize={0.6} />
      </div>
    </Stage>
  );
}

function BudgetsDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.thisMonthBudget")}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BudgetRing spent={420} total={500} size={104} stroke={12} />
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--muted)" }}>{tr("demo.spent")}</div>
          <Money style={{ fontSize: 22, fontWeight: 800, letterSpacing: -.3 }} v={420} curSize={0.5} />
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>{tr("demo.ofBudget", { v: fmt(500) })}</div>
        </div>
      </div>
    </Stage>
  );
}

function BreakdownDemo() {
  const tr = useT();
  const bars = [{ cat: "groceries", name: tr("demo.groceries"), pct: 62, color: "var(--purple)" }, { cat: "fuel", name: tr("demo.fuel"), pct: 38, color: "var(--orange)" }];
  return (
    <Stage label={tr("demo.whereItWent")}>
      {bars.map((b, i) => (
        <div key={b.cat} style={{ display: "flex", alignItems: "center", gap: 11, marginTop: i ? 13 : 0 }}>
          <CatTile cat={b.cat} size={34} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 5 }}><span>{b.name}</span><span className="tnum">{b.pct}%</span></div>
            <div className="pbar bar"><i style={{ width: `${b.pct}%`, background: b.color }} /></div>
          </div>
        </div>
      ))}
    </Stage>
  );
}

function NotificationsDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.headsUp")}>
      <div className="icard" style={{ margin: 0 }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--yellowDim)", color: "var(--yellow)" }}><Ico name="bell" size={19} /></span>
        <div><div className="nm">{tr("demo.netflixDue")}</div><div className="mt">{tr("demo.bills")}</div></div>
        <span style={{ marginInlineStart: "auto", display: "flex", alignItems: "center", gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} /><Ico name="chev" size={18} color="var(--faint)" /></span>
      </div>
    </Stage>
  );
}

function PrivacyDemo() {
  const tr = useT();
  const items = [{ icon: "lock", label: tr("demo.onPhone") }, { icon: "close", label: tr("demo.noAds") }, { icon: "eyeOff", label: tr("demo.noTracking") }];
  return (
    <Stage label={tr("demo.privateDefault")}>
      <div style={{ display: "flex", gap: 10 }}>
        {items.map((it) => (
          <div key={it.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, padding: "14px 6px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14 }}>
            <span style={{ width: 36, height: 36, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name={it.icon} size={18} /></span>
            <div style={{ fontSize: 11.5, fontWeight: 800, textAlign: "center" }}>{it.label}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
}

function AppearanceDemo() {
  const tr = useT();
  const swatches = ["#5FE3C0", "#7DD3FC", "#C4B5FD", "#FCA5A5", "#FDBA74"];
  return (
    <Stage label={tr("demo.makeYours")}>
      <SegToggle value="system" onChange={() => {}} options={[{ id: "light", label: tr("demo.light") }, { id: "dark", label: tr("demo.dark") }, { id: "system", label: tr("demo.system") }]} />
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        {swatches.map((c, i) => <span key={c} style={{ width: 34, height: 34, borderRadius: "50%", background: c, boxShadow: i === 0 ? "0 0 0 3px var(--stage), 0 0 0 5px var(--ac)" : "none" }} />)}
      </div>
    </Stage>
  );
}

function CurrencyDemo() {
  const tr = useT();
  const list = CURRENCIES.slice(0, 2);
  return (
    <Stage label={tr("demo.pickCurrency")}>
      {list.map((c, i) => (
        <div className="icard" key={c.code} style={{ margin: i ? "10px 0 0" : 0 }}>
          <span className="circ" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, lineHeight: 1 }}>{c.flag}</span>
          <div className="nm">{c.code}</div>
        </div>
      ))}
    </Stage>
  );
}

function InstallDemo() {
  const tr = useT();
  return <Stage label={tr("demo.onHome")}><InstallSteps /></Stage>;
}

function QuickDemo() {
  const tr = useT();
  const items = [{ icon: "drinks", name: tr("demo.coffee"), amt: 3.5 }, { icon: "groceries", name: tr("demo.lunch"), amt: 12 }];
  return (
    <Stage label={tr("demo.oneTap")}>
      <div style={{ display: "flex", gap: 10 }}>
        {items.map((q) => (
          <div key={q.name} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16 }}>
            <CatTile cat={q.icon} size={38} />
            <div style={{ fontSize: 12.5, fontWeight: 800 }}>{q.name}</div>
            <Money style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)" }} v={q.amt} curSize={0.7} />
          </div>
        ))}
      </div>
    </Stage>
  );
}

function CustomizeDemo() {
  const tr = useT();
  const rows = [tr("demo.rowAccounts"), tr("demo.rowBills"), tr("demo.rowGoals")];
  return (
    <Stage label={tr("demo.dragReorder")}>
      {rows.map((r, i) => (
        <div className="icard" key={r} style={{ margin: i ? "10px 0 0" : 0 }}>
          <span style={{ color: "var(--faint)", display: "flex" }}><Ico name="grip" size={20} /></span>
          <div className="nm">{r}</div>
          <span className={`switch ${i === 2 ? "" : "on"}`} style={{ marginInlineStart: "auto", pointerEvents: "none" }}><i /></span>
        </div>
      ))}
    </Stage>
  );
}

function TransferDemo() {
  const tr = useT();
  const Chip = ({ name, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999, fontWeight: 800, fontSize: 13 }}>
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: color }} />{name}
    </div>
  );
  return (
    <Stage label={tr("demo.betweenAccounts")}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Chip name="HSBC" color="#ec1623" /><Ico name="transfer" size={20} color="var(--ac)" /><Chip name={tr("demo.cash")} color="#f59e0b" />
      </div>
      <div style={{ textAlign: "center", marginTop: 14 }}><Money style={{ fontSize: 24, fontWeight: 800 }} v={200} curSize={0.5} /></div>
    </Stage>
  );
}

function SpendGoalDemo() {
  const tr = useT();
  return (
    <Stage label={tr("demo.spendFromGoal")}>
      <div className="icard" style={{ margin: 0 }}>
        <CatTile cat="goal" color="var(--ac)" size={44} />
        <div><div className="nm">{tr("demo.newLaptop")}</div><div className="mt">{tr("demo.spendingOn")}</div></div>
        <span className="switch on" style={{ marginInlineStart: "auto", pointerEvents: "none" }}><i /></span>
      </div>
    </Stage>
  );
}

const DEMOS = { home: HomeDemo, add: AddDemo, goals: GoalsDemo, bills: BillsDemo, categories: CategoriesDemo, accounts: AccountsDemo, activity: ActivityDemo, budgets: BudgetsDemo, breakdown: BreakdownDemo, notifications: NotificationsDemo, privacy: PrivacyDemo, appearance: AppearanceDemo, currency: CurrencyDemo, install: InstallDemo, quick: QuickDemo, customize: CustomizeDemo, transfer: TransferDemo, spendgoal: SpendGoalDemo };

export default function GuideDemo({ demo }) {
  const C = DEMOS[demo];
  return C ? <C /> : null;
}
