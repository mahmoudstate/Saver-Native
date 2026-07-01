// Saver — Budgets + Projects. Monthly budgets are viewed per-month (pick any month);
// the top is a live infographic (animated donut + ranked bars). Projects accumulate
// from a start month and may be open-ended (no fixed amount).
import { useState, useEffect } from "react";
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import SegToggle from "../ui/SegToggle.jsx";
import BudgetRing from "../ui/BudgetRing.jsx";
import MonthSheet from "../ui/MonthSheet.jsx";
import { resolveCat } from "../ui/cats.js";
import Money from "../ui/Money.jsx";
import { fmt, currentMonth, currentCycleAnchor, cyclePeriod, dayRangeLabel, today, MONTHS } from "../lib/format.js";
import { budgetSpentMonth, projectSpent, budgetTxns, daysLeftInMonth, daysLeftInCycle, spentPerActiveDay } from "../lib/calc.js";
import { useT } from "../lib/i18n.js";

const budgetCat = (b) => b.glyph || resolveCat({ catId: b.cats?.[0], catName: b.name }) || "income";
const rangeLabel = (start, end) => `${MONTHS[+(start || end).split("-")[1] - 1]}–${MONTHS[+end.split("-")[1] - 1]}`;
const monthChip = (m, cm, tr) => { const [y, mo] = m.split("-"); return m === cm ? tr("budget.thisMonth") : `${MONTHS[+mo - 1]}${y !== cm.slice(0, 4) ? " " + y : ""}`; };
const barColor = (pct) => (pct >= 100 ? "var(--red)" : pct >= 80 ? "var(--yellow)" : "var(--ac)");

// Cards are dragged directly (no separate grip handle). MouseSensor needs a small
// move before it claims the pointer (so a click still opens the budget); TouchSensor
// needs a short hold before it claims the pointer (so a normal scroll swipe is never
// hijacked into a drag).
const useCardDndSensors = () => useSensors(
  useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
);

function SortableBudgetCard({ b, anim, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: b.id });
  const style = {
    cursor: "pointer", transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? .85 : 1, zIndex: isDragging ? 2 : "auto", position: "relative",
    ...(isDragging ? { boxShadow: "0 14px 30px rgba(0,0,0,.22)" } : {}),
  };
  return (
    <div className="bcard" ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onOpen?.(b)}>
      <div className="top"><CatTile cat={budgetCat(b)} color={b.color} name={b.name} size={38} /><div className="nm">{b.name}</div><div className="rt tnum" style={b.over ? { color: "var(--red)" } : {}}>{fmt(b.spent)} / {fmt(b.amount)}</div></div>
      <div className="pbar bar" style={{ marginTop: 12 }}><i style={{ width: `${anim ? Math.min(100, b.pct) : 0}%`, background: barColor(b.pct), transition: "width .85s cubic-bezier(.3,.8,.3,1)" }} /></div>
    </div>
  );
}

function SortableProjectCard({ p, anim, cm, tr, onOpen }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    cursor: "pointer", transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? .85 : 1, zIndex: isDragging ? 2 : "auto", position: "relative",
    ...(isDragging ? { boxShadow: "0 14px 30px rgba(0,0,0,.22)" } : {}),
  };
  const spent = p.spent ?? 0;
  const hasLimit = p.amount > 0;
  const pct = hasLimit ? Math.min(100, (spent / p.amount) * 100) : 0;
  return (
    <div className="bcard" ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onOpen?.(p)}>
      <div className="top"><CatTile cat={budgetCat(p)} color={p.color} name={p.name} size={40} /><div className="nm">{p.name}</div><div className="pct">{hasLimit ? `${Math.round(pct)}%` : tr("budget.open")}</div></div>
      <div className="nums"><div className="a tnum">{fmt(spent)}</div><div className="b tnum">{(spent > 0 ? rangeLabel(p.startMonth, cm) : tr("budget.noSpendingYet")) + (hasLimit ? ` · ${fmt(p.amount)}` : "")}</div></div>
      <div className="pbar bar" style={{ overflow: "hidden" }}>{hasLimit
        ? <i style={{ width: `${anim ? pct : 0}%`, background: "var(--ac)", transition: "width .85s cubic-bezier(.3,.8,.3,1)" }} />
        : <i className="bar-flow" />}</div>
    </div>
  );
}

export default function Budgets({ store, back, onAdd, onOpenBudget, onOpenProject, initialSeg, onSegChange }) {
  const { budgets = [], txns = [] } = store;
  const tr = useT();
  const [seg, setSeg] = useState(initialSeg || "monthly");
  const changeSeg = (v) => { setSeg(v); onSegChange?.(v); };
  const [projView, setProjView] = useState("active"); // active | completed
  const cm = currentMonth();
  const [vm, setVm] = useState(cm); // viewed month (monthly tab)
  const [monthSheet, setMonthSheet] = useState(false);
  const [anim, setAnim] = useState(false); // replays the bar growth on month/tab change
  useEffect(() => { setAnim(false); const t = setTimeout(() => setAnim(true), 60); return () => clearTimeout(t); }, [vm, seg]);
  const isMonthly = seg === "monthly";

  // A monthly budget shows in the viewed month if it's that one-off month, or it's a
  // recurring budget that has started by then (legacy budgets with neither = always on).
  const activeInMonth = (b) => (b.month ? b.month === vm : (!b.startMonth || vm >= b.startMonth));
  // For the budget's own spend, anchor a custom cycle to whichever calendar month it
  // actually started in (e.g. cycleStartDay=25 viewed on the 10th == last month's cycle).
  const monthly = budgets.filter((b) => b.kind !== "project" && activeInMonth(b))
    .map((b) => { const anchor = vm === cm ? currentCycleAnchor(today(), b.cycleStartDay) : vm; const spent = budgetSpentMonth(b, txns, anchor); return { ...b, _anchor: anchor, spent, pct: b.amount > 0 ? (spent / b.amount) * 100 : 0, over: spent > b.amount }; });
  const projects = budgets.filter((b) => b.kind === "project");
  const active = projects.filter((p) => p.status !== "archived").map((p) => { const spent = projectSpent(p, txns); return { ...p, spent, pct: p.amount > 0 ? Math.min(100, (spent / p.amount) * 100) : 0 }; });
  const completed = projects.filter((p) => p.status === "archived");
  const dndSensors = useCardDndSensors();
  const onCardDragEnd = ({ active: a, over }) => {
    if (!over || a.id === over.id) return;
    store.set("budgets", (list) => {
      const oldIndex = list.findIndex((x) => x.id === a.id);
      const newIndex = list.findIndex((x) => x.id === over.id);
      return oldIndex < 0 || newIndex < 0 ? list : arrayMove(list, oldIndex, newIndex);
    });
  };

  const mSpent = monthly.reduce((a, b) => a + b.spent, 0);
  const mLimit = monthly.reduce((a, b) => a + b.amount, 0);
  const overCount = monthly.filter((b) => b.over).length;
  const pSpent = active.reduce((a, p) => a + p.spent, 0);

  // The page's spending cycle. Most users set every budget to the same custom
  // "salary day" (e.g. 25th) — so derive one page-level cycle day (the most common
  // among the shown budgets) and pace the daily card + period range against it
  // instead of the calendar month. Day-1 budgets keep the plain calendar behaviour.
  const cycleDayCount = {};
  monthly.forEach((b) => { const d = b.cycleStartDay > 1 ? b.cycleStartDay : 1; cycleDayCount[d] = (cycleDayCount[d] || 0) + 1; });
  const topDay = Object.keys(cycleDayCount).sort((a, b) => cycleDayCount[b] - cycleDayCount[a])[0];
  const pageCycleDay = topDay ? +topDay : 1;
  const cycleAnchor = vm === cm ? currentCycleAnchor(today(), pageCycleDay) : vm;
  const cyclePer = cyclePeriod(cycleAnchor, pageCycleDay);
  const cycleRange = pageCycleDay > 1 ? dayRangeLabel(cyclePer.from, cyclePer.to) : null;

  // Daily pacing for the viewed period: how much is safe to spend per remaining day,
  // and how much was actually spent per day (averaged over days that had spending).
  const mTxns = (() => { const seen = new Set(), rows = []; monthly.forEach((b) => budgetTxns(b, txns, b._anchor).forEach((t) => { if (!seen.has(t.id)) { seen.add(t.id); rows.push(t); } })); return rows; })();
  const daysLeft = pageCycleDay > 1 && vm === cm ? daysLeftInCycle(cyclePer.to, today()) : daysLeftInMonth(vm, today());
  const safePerDay = vm === cm && mLimit > 0 ? Math.max(0, (mLimit - mSpent)) / daysLeft : null;
  const spentPerDay = spentPerActiveDay(mTxns);

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{isMonthly ? tr("budget.titleMonthly") : tr("budget.projects")}</div><div className="grow" />{isMonthly && <div className="hchip" onClick={() => setMonthSheet(true)} style={{ cursor: "pointer", marginRight: 8 }}><Ico name="cal" size={14} />{monthChip(vm, cm, tr)}</div>}<div className="hib" onClick={() => onAdd?.(seg)}><Ico name="plus" size={20} /></div></div>
        {isMonthly ? <>
          <div className="lbl">{tr("budget.spent")}</div><Money className="big tnum" v={mSpent} /><div className="sub">{tr("budget.ofBudget", { amt: fmt(mLimit) })} &nbsp;·&nbsp; {tr("budget.pctUsed", { pct: mLimit > 0 ? Math.round((mSpent / mLimit) * 100) : 0 })}</div>{cycleRange && <div className="sub" style={{ marginTop: 2, opacity: .85, display: "flex", alignItems: "center", gap: 6 }}><Ico name="cal" size={13} />{tr("budget.cycleRange", { range: cycleRange })}</div>}
        </> : <>
          <div className="lbl">{tr("budget.projSpentSoFar")}</div><Money className="big tnum" v={pSpent} /><div className="sub">{tr("budget.activeCount", { n: active.length })}{completed.length ? ` · ${tr("budget.completedCount", { n: completed.length })}` : ""}</div>
        </>}
      </div>

      <SegToggle style={{ marginBottom: 18 }} value={seg} onChange={changeSeg} options={[{ id: "monthly", label: tr("budget.monthly") }, { id: "projects", label: tr("budget.projects") }]} />

      {isMonthly ? (
        monthly.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("budget.noBudgets", { month: monthChip(vm, cm, tr) })}</div> : <>
          {/* infographic: animated donut + at-a-glance totals */}
          <div className="tile" style={{ display: "flex", alignItems: "center", gap: 18, padding: 16, marginBottom: 16 }}>
            <BudgetRing spent={mSpent} total={mLimit} size={120} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 11 }}>
              <div><div className="over" style={{ margin: 0 }}>{tr("budget.spent")}</div><div className="title tnum" style={{ fontSize: 21 }}>{fmt(mSpent)}</div></div>
              <div><div className="over" style={{ margin: 0 }}>{tr("budget.ofBudgetLabel")}</div><div className="title tnum" style={{ fontSize: 16, color: "var(--muted)" }}>{fmt(mLimit)}</div></div>
              <span className={`pill${overCount ? " pill-red" : ""}`} style={{ alignSelf: "flex-start", fontSize: 11.5 }}>
                <Ico name={overCount ? "bell" : "check"} size={13} />{overCount ? tr("budget.overCount", { n: overCount }) : tr("budget.onTrack")}
              </span>
            </div>
          </div>

          {/* daily pacing: safe-to-spend per remaining day + actual average per spending day */}
          <div className="tile" style={{ display: "flex", padding: 14, marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="over" style={{ margin: 0 }}>{tr("budget.safePerDay")}</div>
              <div className="title tnum" style={{ fontSize: 18, marginTop: 4 }}>{safePerDay != null ? fmt(safePerDay) : "—"}</div>
              <div className="caption" style={{ marginTop: 2 }}>{safePerDay != null ? tr(daysLeft === 1 ? "budget.daysLeftOne" : "budget.daysLeftMany", { n: daysLeft }) : tr("budget.pastMonth")}</div>
            </div>
            <div style={{ width: 1, background: "var(--border)", margin: "2px 14px" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="over" style={{ margin: 0 }}>{tr("budget.spentPerDay")}</div>
              <div className="title tnum" style={{ fontSize: 18, marginTop: 4 }}>{fmt(spentPerDay)}</div>
              <div className="caption" style={{ marginTop: 2 }}>{tr("budget.avgDays")}</div>
            </div>
          </div>

          <div className="over">{tr("budget.categoriesMostUsed")}</div>
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onCardDragEnd}>
            <SortableContext items={monthly.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {monthly.map((b) => <SortableBudgetCard key={b.id} b={b} anim={anim} onOpen={onOpenBudget} />)}
            </SortableContext>
          </DndContext>
        </>
      ) : (
        active.length === 0 && completed.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("budget.noProjects")}</div> : <>
          {completed.length > 0 && <SegToggle style={{ marginBottom: 16 }} value={projView} onChange={setProjView} options={[{ id: "active", label: tr("budget.active") }, { id: "completed", label: tr("budget.completed") }]} />}
          {projView === "active" ? (
            active.length === 0
              ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "30px", fontWeight: 600 }}>{tr("budget.noActiveProjects")}</div>
              : <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onCardDragEnd}>
                  <SortableContext items={active.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    {active.map((p) => <SortableProjectCard key={p.id} p={p} anim={anim} cm={cm} tr={tr} onOpen={onOpenProject} />)}
                  </SortableContext>
                </DndContext>
          ) : (
            completed.length === 0
              ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "30px", fontWeight: 600 }}>{tr("budget.nothingCompleted")}</div>
              : completed.map((p) => {
                const spent = p.spent ?? projectSpent(p, txns);
                const hasLimit = p.amount > 0;
                const pct = hasLimit ? Math.min(100, (spent / p.amount) * 100) : 0;
                return (
                  <div className="bcard" key={p.id} onClick={() => onOpenProject?.(p)} style={{ cursor: "pointer", opacity: .75 }}>
                    <div className="top"><CatTile cat={budgetCat(p)} color={p.color} name={p.name} size={40} /><div className="nm">{p.name}</div><div className="pct">{tr("budget.done")}</div></div>
                    <div className="nums"><div className="a tnum">{fmt(spent)}</div><div className="b tnum">{tr("budget.completed")}{hasLimit ? ` · ${fmt(p.amount)}` : ""}</div></div>
                    <div className="pbar bar" style={{ overflow: "hidden" }}>{hasLimit
                      ? <i style={{ width: `${anim ? pct : 0}%`, background: "var(--muted)", transition: "width .85s cubic-bezier(.3,.8,.3,1)" }} />
                      : <i className="bar-flow" />}</div>
                  </div>
                );
              })
          )}
        </>
      )}

      {monthSheet && <MonthSheet value={vm} max={cm} onPick={(m) => { setVm(m); setMonthSheet(false); }} onClose={() => setMonthSheet(false)} />}
    </div>
  );
}
