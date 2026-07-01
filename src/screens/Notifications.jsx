// Saver — Notifications inbox screen. Logic lives in lib/notifications.js so the
// Home bell badge stays in sync. This file just renders the list + read controls.
import Ico from "../ui/Ico.jsx";
import { buildNotifications } from "../lib/notifications.js";
import { useT } from "../lib/i18n.js";

export default function Notifications({ store, back, onOpen }) {
  const tr = useT();
  const items = buildNotifications(store, tr);
  const newCount = items.filter((n) => n.unread).length;
  const markAllRead = () => store.set("notifReadKeys", [...new Set([...(store.notifReadKeys || []), ...items.filter((n) => n.unread).map((n) => n.key)])]);
  // tapping an item: mark it read, then jump to the screen it's about
  const open = (n) => {
    if (n.unread) store.set("notifReadKeys", [...new Set([...(store.notifReadKeys || []), n.key])]);
    if (n.nav) onOpen?.(n.nav);
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("notif.title")}</div><div className="grow" />{newCount > 0 && <div className="hchip" onClick={markAllRead} style={{ cursor: "pointer" }}><Ico name="check" size={14} />{tr("notif.markAllRead")}</div>}</div>
        <div className="lbl">{tr("notif.inbox")}</div><div className="big" style={{ fontSize: 34 }}>{tr("notif.newCount", { n: newCount })}</div><div className="sub">{tr("notif.alertsSub")}</div>
      </div>
      {items.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("notif.allCaughtUp")}</div>
        : items.map((n) => (
          <div className="icard" key={n.key} onClick={() => open(n)} style={{ opacity: n.unread ? 1 : .7, cursor: n.nav ? "pointer" : "default" }}>
            <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, color: n.col }}><Ico name={n.icon} size={19} /></span>
            <div><div className="nm">{n.nm}</div><div className="mt">{n.mt}</div></div>
            <span className="amtb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {n.unread && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} />}
              {n.nav && <Ico name="chev" size={18} color="var(--faint)" />}
            </span>
          </div>
        ))}
    </div>
  );
}
