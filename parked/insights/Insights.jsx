// Saver — Insights: a standalone, filter-free dashboard of self-computed spending
// analytics (no manual input). Health snapshot vs. your usual average, an
// interactive 6-month trend, a "this month at a glance" stat grid, and top
// spending categories. Aggregated across every account. Animated with GSAP
// (respects reduced-motion).
import { useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { fmt, currentMonth, monthName } from "../lib/format.js";
import { monthlyHistory, risingCategories, healthSnapshot, savingsRate, monthStats, topCategories } from "../lib/insights.js";
import { useT } from "../lib/i18n.js";

const REDUCED = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const RING_C = 2 * Math.PI * 40; // r = 40

const STATUS_COLOR = { high: "var(--red)", elevated: "var(--orange)", low: "var(--success)", stable: "var(--heroText)" };
const STATUS_KEY = { high: "insights.statusHigh", elevated: "insights.statusElevated", low: "insights.statusLow", stable: "insights.statusStable" };

export default function Insights({ store, back }) {
  const { txns = [] } = store;
  const tr = useT();
  const cm = currentMonth();
  const scope = useRef(null);

  const history = useMemo(() => monthlyHistory(txns, cm, 6), [txns, cm]);
  const health = useMemo(() => healthSnapshot(txns, cm), [txns, cm]);
  const rising = useMemo(() => risingCategories(txns, cm), [txns, cm]);
  const rate = useMemo(() => savingsRate(txns, cm), [txns, cm]);
  const stats = useMemo(() => monthStats(txns, cm), [txns, cm]);
  const cats = useMemo(() => topCategories(txns, cm), [txns, cm]);

  const [selIdx, setSelIdx] = useState(history.length - 1);
  const sel = history[selIdx];

  const maxVal = Math.max(1, ...history.flatMap((h) => [h.inc, h.exp]));
  const pctAbs = Math.round(Math.abs(health.pct) * 100);
  const ringPct = health.haveHistory ? Math.min(1, Math.abs(health.pct) / 0.5) : 0;
  const ringColor = health.haveHistory ? STATUS_COLOR[health.status] : "var(--heroText)";

  useGSAP(() => {
    if (REDUCED) return;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".ins-ring", { opacity: 0, scale: 0.85, duration: 0.6 })
      .from(".ins-status", { opacity: 0, y: 12, duration: 0.5 }, "-=0.35")
      .from(".ins-stat", { opacity: 0, y: 14, duration: 0.4, stagger: 0.06 }, "-=0.25")
      .from(".ins-bar", { scaleY: 0, transformOrigin: "bottom", duration: 0.55, stagger: 0.05 }, "-=0.2")
      .from(".ins-card", { opacity: 0, y: 16, duration: 0.45, stagger: 0.07 }, "-=0.3");
  }, { scope, dependencies: [history.length] });

  return (
    <div className="content padnav" ref={scope}>
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("insights.title")}</div></div>

        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 4 }}>
          <div className="ins-ring" style={{ width: 96, height: 96, position: "relative", flexShrink: 0 }}>
            <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="48" cy="48" r="40" fill="none" stroke="var(--heroChip)" strokeWidth="9" />
              <circle cx="48" cy="48" r="40" fill="none" stroke={ringColor} strokeWidth="9" strokeLinecap="round"
                strokeDasharray={RING_C.toFixed(1)} strokeDashoffset={(RING_C * (1 - ringPct)).toFixed(1)} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {health.haveHistory
                ? <b className="tnum" style={{ fontSize: 20, color: "var(--heroText)" }}>{health.pct >= 0 ? "+" : "−"}{pctAbs}%</b>
                : <Ico name="sparkles" size={22} color="var(--heroText)" />}
            </div>
          </div>
          <div className="ins-status" style={{ flex: 1, color: "var(--heroText)" }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.4 }}>{tr(health.haveHistory ? STATUS_KEY[health.status] : "insights.noHistory")}</div>
          </div>
        </div>
      </div>

      {/* ── This month at a glance ── */}
      <div className="over" style={{ marginTop: 4 }}>{tr("insights.glance")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div className="tile ins-stat" style={{ padding: 14 }}>
          <div className="caption">{tr("insights.biggestExpense")}</div>
          {stats.biggest
            ? <><div className="tnum" style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>{fmt(stats.biggest.amount)}</div><div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{stats.biggest.catName || stats.biggest.note || "—"}</div></>
            : <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, color: "var(--faint)" }}>{tr("insights.none")}</div>}
        </div>
        <div className="tile ins-stat" style={{ padding: 14 }}>
          <div className="caption">{tr("insights.savingsRate")}</div>
          {rate != null
            ? <div className="tnum" style={{ fontSize: 19, fontWeight: 800, marginTop: 4, color: rate >= 0 ? "var(--success)" : "var(--red)" }}>{rate >= 0 ? "+" : "−"}{Math.round(Math.abs(rate) * 100)}%</div>
            : <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6, color: "var(--faint)" }}>{tr("insights.savingsRateNone")}</div>}
        </div>
        <div className="tile ins-stat" style={{ padding: 14 }}>
          <div className="caption">{tr("insights.txnCount")}</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>{stats.count}</div>
        </div>
        <div className="tile ins-stat" style={{ padding: 14 }}>
          <div className="caption">{tr("insights.avgPerTxn")}</div>
          <div className="tnum" style={{ fontSize: 19, fontWeight: 800, marginTop: 4 }}>{fmt(stats.avgPerTxn)}</div>
        </div>
      </div>

      {/* ── Trend (tap a month) ── */}
      <div className="over">{tr("insights.trend")}</div>
      <div className="tile" style={{ marginBottom: 16 }}>
        <div className="caption" style={{ marginBottom: 14 }}>{tr("insights.trendMonths", { n: history.length })}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
          {history.map((h, i) => (
            <div key={h.month} onClick={() => setSelIdx(i)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: "100%" }}>
                <div className="ins-bar" style={{ width: 8, borderRadius: 4, background: "var(--success)", height: `${Math.max(3, (h.inc / maxVal) * 100)}%`, opacity: i === selIdx ? 1 : .45, transition: "opacity .15s" }} />
                <div className="ins-bar" style={{ width: 8, borderRadius: 4, background: "var(--red)", height: `${Math.max(3, (h.exp / maxVal) * 100)}%`, opacity: i === selIdx ? 1 : .45, transition: "opacity .15s" }} />
              </div>
              <div style={{ fontSize: 10, fontWeight: 800, color: i === selIdx ? "var(--text)" : "var(--muted)" }}>{monthName(+h.month.split("-")[1] - 1)}</div>
            </div>
          ))}
        </div>
        {sel && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--success)" }} /><span className="caption">{tr("home.income")}</span><b className="tnum" style={{ fontSize: 13 }}>{fmt(sel.inc)}</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: "var(--red)" }} /><span className="caption">{tr("home.spent")}</span><b className="tnum" style={{ fontSize: 13 }}>{fmt(sel.exp)}</b></div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span className="caption">{tr("insights.net")}</span><b className="tnum" style={{ fontSize: 13, color: sel.inc - sel.exp >= 0 ? "var(--success)" : "var(--red)" }}>{fmt(sel.inc - sel.exp)}</b></div>
          </div>
        )}
      </div>

      {/* ── Top categories this month ── */}
      <div className="over">{tr("insights.topCategoriesThisMonth")}</div>
      {cats.length === 0
        ? <div className="tile" style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, padding: "22px 16px", marginBottom: 16 }}>{tr("insights.noSpendingMonth")}</div>
        : (
          <div className="tile ins-card" style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            {cats.map((c) => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <CatTile txn={c.sample} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, flexShrink: 0 }}>{fmt(c.sum)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: "var(--surface2)", overflow: "hidden" }}>
                    <i style={{ display: "block", width: `${Math.round(c.share * 100)}%`, height: "100%", borderRadius: 4, background: "var(--purple)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ── Spending on the rise (only when there's a real signal) ── */}
      {rising.length > 0 && (
        <>
          <div className="over">{tr("insights.rising")}</div>
          <div className="caption" style={{ margin: "-4px 2px 10px" }}>{tr("insights.risingSub")}</div>
          {rising.map((r) => (
            <div className="icard ins-card" key={r.key}>
              <CatTile txn={r.sample} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="nm">{r.name}</div>
                <div className="mt">{tr("insights.vsAvg", { amt: fmt(r.avg) })}</div>
              </div>
              <span className="tnum" style={{ fontSize: 12.5, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: "var(--redDim)", color: "var(--red)" }}>+{Math.round(r.pct * 100)}%</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
