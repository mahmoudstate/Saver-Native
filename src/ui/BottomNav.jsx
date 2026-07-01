// Saver — new bottom nav: Home · Bills · [+] · Activity · Profile (squircle FAB)
import Ico from "./Ico.jsx";

const TABS = [
  { id: "home", icon: "home" },
  { id: "bills", icon: "bills" },
  { id: "activity", icon: "activity" },
  { id: "profile", icon: "you" },
];

export default function BottomNav({ active, onTab, onAdd, onQuickAdd }) {
  let timer = null;
  const start = () => { if (onQuickAdd) timer = setTimeout(() => { timer = null; onQuickAdd(); }, 450); };
  const end = (fire) => { if (timer) { clearTimeout(timer); timer = null; if (fire) onAdd(); } };
  const out = [];
  TABS.forEach((t, i) => {
    if (i === 2) out.push(<div key="fab" className="fab" role="button" aria-label="Add"
      onClick={() => { if (!onQuickAdd) onAdd(); }}
      onPointerDown={start} onPointerUp={() => end(true)} onPointerLeave={() => end(false)} onContextMenu={(e) => { e.preventDefault(); onQuickAdd?.(); }}><Ico name="plus" size={24} stroke={2.4} /></div>);
    out.push(<div key={t.id} className={`it ${active === t.id ? "on" : ""}`} onClick={() => onTab(t.id)} role="button" aria-label={t.id}><Ico name={t.icon} size={22} /></div>);
  });
  return <div className="nav">{out}</div>;
}
