// Saver — Activity date picker: choose a whole month or a custom day range.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import { MONTHS, currentMonth, today, monthLabel, monthName, dayRangeLabel } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

const pad = (n) => String(n).padStart(2, "0");
const lastDay = (y, m) => new Date(y, m, 0).getDate(); // m = 1..12

export default function DatePicker({ initial, onApply, back }) {
  const cm = currentMonth();
  const [mode, setMode] = useState(initial?.mode === "range" ? "days" : "month");
  const [year, setYear] = useState(+(initial?.month || cm).slice(0, 4));
  const [cal, setCal] = useState((initial?.from || today()).slice(0, 7));
  const [from, setFrom] = useState(initial?.mode === "range" ? initial.from : null);
  const [to, setTo] = useState(initial?.mode === "range" ? initial.to : null);

  const tr = useT();
  const done = (d) => { onApply(d); back(); };
  const pickMonth = (mi) => { const ym = `${year}-${pad(mi + 1)}`; done({ mode: "month", month: ym, from: `${ym}-01`, to: `${ym}-${pad(lastDay(year, mi + 1))}`, label: monthLabel(ym) }); };
  const clear = () => done({ mode: "all", from: null, to: null, label: tr("date.allTime") });

  const [cy, cmo] = cal.split("-").map(Number);
  const startDow = new Date(cy, cmo - 1, 1).getDay();
  const ndays = lastDay(cy, cmo);
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: ndays }, (_, i) => i + 1)];
  const shiftCal = (delta) => { const d = new Date(cy, cmo - 1 + delta, 1); setCal(`${d.getFullYear()}-${pad(d.getMonth() + 1)}`); };
  const tapDay = (ds) => { if (!from || (from && to)) { setFrom(ds); setTo(null); } else if (ds < from) { setTo(from); setFrom(ds); } else setTo(ds); };
  const cellSel = (ds) => ds === from || ds === to;
  const cellMid = (ds) => from && to && ds > from && ds < to;

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("date.title")}</div><div className="grow" /><div className="hchip" onClick={clear} style={{ cursor: "pointer" }}>{tr("date.allTime")}</div></div>
        <div className="lbl">{tr("date.showFor")}</div>
        <div className="big" style={{ fontSize: 28 }}>{tr("date.pickDates")}</div>
        <div className="sub">{tr("date.monthOrDays")}</div>
      </div>

      <div className="seg" style={{ marginBottom: 18 }}>
        <b className={mode === "month" ? "on" : ""} onClick={() => setMode("month")}>{tr("date.month")}</b>
        <b className={mode === "days" ? "on" : ""} onClick={() => setMode("days")}>{tr("date.specificDays")}</b>
      </div>

      {mode === "month" ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="hib" onClick={() => setYear((y) => y - 1)}><Ico name="back" size={18} /></div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{year}</div>
            <div className="hib" onClick={() => setYear((y) => y + 1)} style={{ transform: "scaleX(-1)" }}><Ico name="back" size={18} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9 }}>
            {MONTHS.map((m, i) => {
              const ym = `${year}-${pad(i + 1)}`;
              const on = initial?.mode === "month" && initial.month === ym;
              const isCur = ym === cm;
              return <div key={m} onClick={() => pickMonth(i)} style={{ textAlign: "center", padding: "14px 0", borderRadius: 13, cursor: "pointer", fontWeight: on ? 800 : 700, fontSize: 14, ...(on ? { background: "var(--acDim)", border: "1px solid var(--ac)", color: "var(--acText)" } : { background: "var(--surface)", border: "var(--cardBorder)", color: isCur ? "var(--acText)" : "var(--text)" }) }}>{monthName(i)}</div>;
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="hib" onClick={() => shiftCal(-1)}><Ico name="back" size={18} /></div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{monthLabel(cal)}</div>
            <div className="hib" onClick={() => shiftCal(1)} style={{ transform: "scaleX(-1)" }}><Ico name="back" size={18} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
            {tr("date.dow").split(",").map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "var(--faint)", padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={i} />;
              const ds = `${cal}-${pad(d)}`;
              const sel = cellSel(ds), mid = cellMid(ds), isToday = ds === today();
              return <div key={i} onClick={() => tapDay(ds)} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13.5, fontWeight: sel ? 800 : 600, borderRadius: 11, cursor: "pointer", ...(sel ? { background: "var(--ac)", color: "var(--onacc)" } : mid ? { background: "var(--acDim)", color: "var(--acText)" } : { color: isToday ? "var(--acText)" : "var(--text)", background: isToday ? "var(--surface)" : "transparent" }) }}>{d}</div>;
            })}
          </div>
          <div style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 12.5, margin: "16px 0 4px" }}>{from ? dayRangeLabel(from, to) : tr("date.tapStartEnd")}</div>
          <div className="cta"><div className="btn btn-primary btn-full" style={{ opacity: from ? 1 : .5 }} onClick={() => from && done({ mode: "range", from, to: to || from, label: dayRangeLabel(from, to) })}>{tr("date.apply")}</div></div>
        </>
      )}
    </div>
  );
}
