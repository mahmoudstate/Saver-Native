// Saver: soft pre-permission sheet, shown once (new installs right away,
// existing users right after their post-update What's New) to explain why
// notifications help before the native OS dialog appears. Asking cold from a
// buried Settings toggle gets ignored; asking with context here gets opted in.
import Ico from "./Ico.jsx";
import { requestNotifPermission, notifPermissionStatus } from "../lib/localNotifications.js";
import { HAPTICS } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

export default function NotifPrompt({ store, onClose }) {
  const tr = useT();

  const enable = async () => {
    HAPTICS.light();
    const status = await notifPermissionStatus();
    const granted = status === "granted" || (status !== "denied" && await requestNotifPermission());
    if (granted) store.set("notificationsEnabled", true);
    onClose();
  };

  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={tr("notifPrompt.title")}>
        <div className="grab" />
        <div style={{ textAlign: "center", padding: "4px 6px 8px" }}>
          <span className="circ" style={{ width: 54, height: 54, borderRadius: 17, background: "var(--yellowDim)", color: "var(--yellow)", margin: "0 auto 14px" }}><Ico name="bell" size={26} /></span>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -.4 }}>{tr("notifPrompt.title")}</div>
          <div className="mt" style={{ marginTop: 6, padding: "0 12px" }}>{tr("notifPrompt.subtitle")}</div>
        </div>
        <div className="btn btn-primary btn-full" style={{ marginTop: 14 }} onClick={enable}>{tr("notifPrompt.enable")}</div>
        <div className="btn btn-full" style={{ marginTop: 8 }} onClick={onClose}>{tr("notifPrompt.notNow")}</div>
      </div>
    </>
  );
}
