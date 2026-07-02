// Saver — Notifications inbox screen. Logic lives in lib/notifications.js so the
// Home bell badge stays in sync. This file just renders the list + read controls.
import { useState } from "react";
import Ico from "../ui/Ico.jsx";
import SwipeToDismiss from "../ui/SwipeToDismiss.jsx";
import { buildNotifications } from "../lib/notifications.js";
import { useT } from "../lib/i18n.js";

export default function Notifications({ store, back, onOpen }) {
  const tr = useT();
  const items = buildNotifications(store, tr);
  const newCount = items.filter((n) => n.unread).length;
  const [openKey, setOpenKey] = useState(null); // which row (if any) has its delete button revealed
  const markAllRead = () => store.set("notifReadKeys", [...new Set([...(store.notifReadKeys || []), ...items.filter((n) => n.unread).map((n) => n.key)])]);
  // tapping an item: mark it read, then jump to the screen it's about
  const open = (n) => {
    if (n.unread) store.set("notifReadKeys", [...new Set([...(store.notifReadKeys || []), n.key])]);
    if (n.nav) onOpen?.(n.nav);
  };
  const dismiss = (n) => {
    store.set("notifDismissedKeys", [...new Set([...(store.notifDismissedKeys || []), n.key])]);
    store.flash?.({ title: tr("notif.dismissed"), color: "var(--muted)", icon: "check" });
  };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("notif.title")}</div><div className="grow" />{newCount > 0 && <div className="hchip" onClick={markAllRead} style={{ cursor: "pointer" }}><Ico name="check" size={14} />{tr("notif.markAllRead")}</div>}</div>
        <div className="lbl">{tr("notif.inbox")}</div><div className="big" style={{ fontSize: 34 }}>{tr("notif.newCount", { n: newCount })}</div><div className="sub">{tr("notif.alertsSub")}</div>
      </div>
      {items.length === 0 ? <div style={{ textAlign: "center", color: "var(--muted)", padding: "40px", fontWeight: 600 }}>{tr("notif.allCaughtUp")}</div>
        : items.map((n) => (
          // .icard's own margin-bottom would get trapped by SwipeToDismiss's
          // overflow:hidden wrapper, so move the gap to the outer element instead.
          <div key={n.key} style={{ marginBottom: 11 }}>
            <SwipeToDismiss isOpen={openKey === n.key} onOpenChange={(v) => setOpenKey(v ? n.key : null)} onDismiss={() => dismiss(n)}>
              {/* opacity lives on the inner content, not the card itself — the
                  card's own background must stay fully opaque, or it lets the
                  swipe-reveal delete panel show through behind it. */}
              <div className="icard" onClick={() => open(n)} style={{ cursor: n.nav ? "pointer" : "default", marginBottom: 0 }}>
                <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, color: n.col, opacity: n.unread ? 1 : .7 }}><Ico name={n.icon} size={19} /></span>
                <div style={{ opacity: n.unread ? 1 : .7 }}><div className="nm">{n.nm}</div><div className="mt">{n.mt}</div></div>
                <span className="amtb" style={{ display: "flex", alignItems: "center", gap: 8, opacity: n.unread ? 1 : .7 }}>
                  {n.unread && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--ac)" }} />}
                  {n.nav && <Ico name="chev" size={18} color="var(--faint)" />}
                </span>
              </div>
            </SwipeToDismiss>
          </div>
        ))}
    </div>
  );
}
