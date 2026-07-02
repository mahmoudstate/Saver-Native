// Settings row that turns native (OS-level) notifications on/off.
// Enabling requests the iOS permission once, then bill/installment reminders
// get scheduled automatically. Native (iOS) only — no-op on the web.
import { Capacitor } from "@capacitor/core";
import Ico from "./Ico.jsx";
import { requestNotifPermission, notifPermissionStatus } from "../lib/localNotifications.js";

export default function NotificationsRow({ store, tr }) {
  const on = !!store.notificationsEnabled;
  const native = Capacitor.isNativePlatform();

  const toggle = async () => {
    if (!native) {
      store.setAlert({ title: tr("notif.osPermTitle"), message: tr("notif.nativeOnly"), color: "var(--blue)" });
      return;
    }
    if (on) { store.set("notificationsEnabled", false); return; }

    const status = await notifPermissionStatus();
    if (status === "denied") {
      store.setAlert({ title: tr("notif.osPermTitle"), message: tr("notif.osPermDenied"), color: "var(--blue)" });
      return;
    }
    const granted = status === "granted" || await requestNotifPermission();
    if (!granted) { store.setAlert({ title: tr("notif.osPermTitle"), message: tr("notif.osPermDenied"), color: "var(--blue)" }); return; }
    store.set("notificationsEnabled", true);
  };

  return (
    <div className="icard" onClick={toggle} style={{ cursor: "pointer" }}>
      <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--yellowDim)", color: "var(--yellow)" }}><Ico name="bell" size={20} /></span>
      <div><div className="nm">{tr("notif.osOffTitle")}</div><div className="mt">{tr("notif.osOffSub")}</div></div>
      <span style={{ marginInlineStart: "auto" }}>
        <span style={{ width: 46, height: 28, borderRadius: 99, background: on ? "var(--ac)" : "var(--line)", display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start", padding: 3, transition: "background .2s, justify-content .2s" }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
        </span>
      </span>
    </div>
  );
}
