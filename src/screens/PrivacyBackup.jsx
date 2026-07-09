// Saver — Privacy & Backup: ported from showcase 25 + 39 (on-device · export/restore).
import { useEffect, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import Ico from "../ui/Ico.jsx";
import AppLockRow from "../ui/AppLockRow.jsx";
import NotificationsRow from "../ui/NotificationsRow.jsx";
import PasswordPrompt from "../ui/PasswordPrompt.jsx";
import { today, HAPTICS } from "../lib/format.js";
import { KEYS, loadKey, saveKey } from "../lib/store.js";
import { encryptBackup, decryptBackup, isEncryptedBackup } from "../lib/backupCrypto.js";
import { buildBackupPayload } from "../lib/backupPayload.js";
import { exportTextFile } from "../lib/nativeFile.js";
import { runICloudBackup } from "../hooks/useICloudAutoBackup.js";
import { runAndroidDriveBackup } from "../hooks/useAndroidDriveAutoBackup.js";
import { driveIsSignedIn, driveSignIn } from "../lib/androidDriveBackup.js";
import { useT, useLang } from "../lib/i18n.js";

// The site can't guess the app's language/theme from the browser — a direct
// deep link like this skips its own auto-detect (that only runs on "/").
// Pass both explicitly instead, straight from the app's own settings.
const privacyUrl = (lang, theme) => {
  const url = `https://www.savertrack.app/${lang}/privacy-policy`;
  return theme === "light" || theme === "dark" ? `${url}?theme=${theme}` : url;
};

export default function PrivacyBackup({ store, back }) {
  const fileRef = useRef(null);
  const tr = useT();
  const { lang } = useLang();
  const [prompt, setPrompt] = useState(null); // { mode:'enc'|'dec', text? }

  // Export flow: ask for a password, then write an encrypted backup.
  // Kept as .json (not a custom .saver extension) — iOS's file picker maps
  // "accept" to known file types (UTIs), and a made-up extension has none,
  // so it grays out the file in Files.app. The payload is valid JSON either
  // way (the encryption lives in the content, not the extension).
  const download = () => setPrompt({ mode: "enc" });

  const doEncrypt = async (password) => {
    const andReset = prompt?.andReset;
    setPrompt(null);
    const enc = await encryptBackup(buildBackupPayload(), password);
    const done = await exportTextFile(`Saver_Backup_${today()}.json`, enc, "Save Saver backup");
    if (!done) return; // user backed out of the share sheet — don't wipe anything
    const ts = Date.now();
    saveKey(KEYS.lastBackup, ts);
    setLastBackupAt(ts);
    store.flash({ title: tr("privacy.backupDownloaded"), sub: "Saver_Backup.json", color: "var(--success)", icon: "download" });
    if (andReset) store.resetAll();
  };

  const applyRestore = (data) => {
    store.setConfirm({
      title: tr("privacy.restoreTitle"), message: tr("privacy.restoreMsg"),
      color: "var(--acText)", confirmText: tr("privacy.restore"), icon: "download",
      onConfirm: () => { if (store.restore(data)) store.flash({ title: tr("privacy.backupRestored"), color: "var(--acText)", icon: "check" }); },
    });
  };

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (isEncryptedBackup(text)) { setPrompt({ mode: "dec", text }); return; }
      try { applyRestore(JSON.parse(text)); }
      catch (err) { console.error("[backup] restore failed:", err); store.setAlert({ title: tr("privacy.cantRead"), message: tr("privacy.cantReadMsg"), color: "var(--red)" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doDecrypt = async (password) => {
    const text = prompt?.text;
    setPrompt(null);
    try { applyRestore(await decryptBackup(text, password)); }
    catch { store.setAlert({ title: tr("privacy.cantRead"), message: tr("pwd.wrongPassword"), color: "var(--red)" }); }
  };

  // Factory reset — walks the full encrypted-backup flow (password, then the
  // share sheet) and only wipes once that export actually succeeds.
  const reset = () => {
    store.setConfirm({
      title: tr("privacy.resetTitle"),
      message: tr("privacy.resetMsg"),
      confirmText: tr("privacy.backupReset"), danger: true, icon: "trash",
      onConfirm: () => setPrompt({ mode: "enc", andReset: true }),
    });
  };

  const [lastBackupAt, setLastBackupAt] = useState(() => loadKey(KEYS.lastBackup, null));
  const [backingUp, setBackingUp] = useState(false);
  const lastBackupText = lastBackupAt
    ? tr("privacy.lastBackupAt", { time: new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", { hour: "numeric", minute: "2-digit" }).format(lastBackupAt) })
    : tr("privacy.neverBackedUp");
  // 3+ silent consecutive background-write failures (iCloud full, signed out,
  // etc.) is worth surfacing — a single blip isn't (transient network hiccups
  // are common and self-resolve on the next debounced write).
  const iCloudBackupFailing = loadKey(KEYS.iCloudBackupFailCount, 0) >= 3;
  const isAndroid = Capacitor.getPlatform() === "android";

  const [driveSignedIn, setDriveSignedIn] = useState(false);
  useEffect(() => { if (isAndroid) driveIsSignedIn().then(setDriveSignedIn); }, []);

  const connectGoogle = async () => {
    HAPTICS.light();
    const ok = await driveSignIn();
    setDriveSignedIn(ok);
    if (ok) store.set("iCloudBackupEnabled", true);
  };

  const toggleICloudBackup = () => { HAPTICS.light(); store.set("iCloudBackupEnabled", !store.iCloudBackupEnabled); };

  const backupNow = async () => {
    if (backingUp) return;
    HAPTICS.light();
    setBackingUp(true);
    const title = tr(isAndroid ? "privacy.googleDriveBackup" : "privacy.iCloudBackup");
    const unavailable = tr(isAndroid ? "privacy.googleDriveUnavailable" : "privacy.iCloudUnavailable");
    try {
      const ok = isAndroid ? await runAndroidDriveBackup() : await runICloudBackup();
      if (ok) {
        const ts = Date.now();
        saveKey(KEYS.lastBackup, ts);
        saveKey(KEYS.iCloudBackupFailCount, 0);
        setLastBackupAt(ts);
        store.flash({ title: tr(isAndroid ? "privacy.backedUpNowDrive" : "privacy.backedUpNow"), color: "var(--success)", icon: "check" });
      } else {
        // A Drive write can fail because access was revoked outside the app
        // (Android Settings > Google > Manage access) rather than a transient
        // error — re-check so the UI drops back to "connect" instead of
        // silently retrying against a dead session.
        if (isAndroid) driveIsSignedIn().then(setDriveSignedIn);
        store.setAlert({ title, message: unavailable, color: "var(--red)" });
      }
    } catch {
      if (isAndroid) driveIsSignedIn().then(setDriveSignedIn);
      store.setAlert({ title, message: unavailable, color: "var(--red)" });
    } finally {
      setBackingUp(false);
    }
  };

  const Row = ({ icon, bg, color, nm, mt, right, onClick }) => (
    <div className="icard" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: bg, color }}><Ico name={icon} size={20} /></span>
      <div><div className="nm">{nm}</div><div className="mt">{mt}</div></div>
      <span style={{ marginInlineStart: "auto" }}>{right}</span>
    </div>
  );

  // Shared toggle row for both the iCloud (iOS) and Google Drive (Android)
  // auto-backup switches — same `iCloudBackupEnabled` flag drives both, only
  // one of which is ever active on a given device. Android also reuses this
  // (via `on`/`onToggle`/`sub`) before an account is connected, so the row
  // looks like a single persistent switch instead of "Connect" turning into
  // a toggle after tapping it — matching the iOS iCloud row from first paint.
  const CloudToggleRow = ({ label, on = store.iCloudBackupEnabled, onToggle = toggleICloudBackup, sub }) => (
    <div className="icard" onClick={onToggle} style={{ cursor: "pointer" }}>
      <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)" }}><Ico name="check" size={20} /></span>
      <div><div className="nm">{label}</div><div className="mt">{sub ?? (on ? tr("privacy.iCloudBackupSub") : tr("privacy.iCloudBackupOffSub"))}</div></div>
      <span style={{ marginInlineStart: "auto" }}>
        <span style={{ width: 46, height: 28, borderRadius: 99, background: on ? "var(--ac)" : "var(--track)", border: on ? "none" : "var(--cardBorder)", display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start", padding: 3, boxSizing: "border-box", transition: "background .2s, justify-content .2s" }}>
          <span style={{ width: 22, height: 22, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
        </span>
      </span>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("privacy.title")}</div><div className="grow" /></div>
        <div className="lbl">{tr("privacy.yourData")}</div><div className="big" style={{ fontSize: 34 }}>{tr("privacy.private")}</div><div className="sub">{tr("privacy.onDevice")}</div>
      </div>

      <div className="over">{tr("notif.osOffTitle")}</div>
      <NotificationsRow store={store} tr={tr} />

      <div className="over" style={{ marginTop: 16 }}>{tr("privacy.security")}</div>
      <AppLockRow store={store} tr={tr} />
      <div className="frozen" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--acDim)", color: "var(--acText)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
        <Ico name="shield" size={15} color="var(--ac)" />{tr("privacy.onDeviceBadge")}
      </div>

      <div className="over" style={{ marginTop: 16 }}>{tr("privacy.backup")}</div>
      {Capacitor.getPlatform() === "ios" && (
        <>
          <CloudToggleRow label={tr("privacy.iCloudBackup")} />
          {store.iCloudBackupEnabled && (
            <Row icon="download" bg="var(--acDim)" color="var(--ac)" nm={tr("privacy.backUpNow")} mt={backingUp ? tr("privacy.backingUp") : lastBackupText} onClick={backupNow} />
          )}
          {store.iCloudBackupEnabled && iCloudBackupFailing && (
            <div className="frozen" style={{ marginTop: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--redDim)", color: "var(--red)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
              <Ico name="bell" size={15} color="var(--red)" />{tr("privacy.iCloudBackupFailing")}
            </div>
          )}
        </>
      )}
      {isAndroid && (
        !driveSignedIn ? (
          <CloudToggleRow label={tr("privacy.googleDriveBackup")} on={false} onToggle={connectGoogle} sub={tr("privacy.connectGoogleAccount")} />
        ) : (
          <>
            <CloudToggleRow label={tr("privacy.googleDriveBackup")} />
            {store.iCloudBackupEnabled && (
              <Row icon="download" bg="var(--acDim)" color="var(--ac)" nm={tr("privacy.backUpNow")} mt={backingUp ? tr("privacy.backingUp") : lastBackupText} onClick={backupNow} />
            )}
            {store.iCloudBackupEnabled && iCloudBackupFailing && (
              <div className="frozen" style={{ marginTop: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--redDim)", color: "var(--red)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
                <Ico name="bell" size={15} color="var(--red)" />{tr("privacy.googleDriveBackupFailing")}
              </div>
            )}
          </>
        )
      )}
      <Row icon="download" bg="var(--purpleDim)" color="var(--purple)" nm={tr("privacy.downloadBackup")} mt={`Saver_Backup.json · ${tr("privacy.encrypted")}`} right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={download} />
      <Row icon="download" bg="var(--blueDim)" color="var(--blue)" nm={tr("privacy.restoreFromFile")} mt={tr("privacy.overwrites")} right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={() => fileRef.current?.click()} />
      <Row icon="trash" bg="var(--redDim)" color="var(--red)" nm={tr("privacy.resetAllData")} mt={tr("privacy.resetSub")} right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={reset} />

      <div className="over" style={{ marginTop: 16 }}>{tr("privacy.legal")}</div>
      <Row icon="shield" bg="var(--blueDim)" color="var(--blue)" nm={tr("privacy.policy")} mt={tr("privacy.policySub")} right={<Ico name="link" size={18} color="var(--faint)" />} onClick={() => window.open(privacyUrl(lang, store.theme), "_blank", "noopener,noreferrer")} />
      <input ref={fileRef} type="file" accept=".json,application/json" onChange={onFile} style={{ display: "none" }} />

      {prompt?.mode === "enc" && (
        <PasswordPrompt title={tr("pwd.encryptTitle")} sub={tr("pwd.encryptSub")} confirm submitText={tr("pwd.export")}
          onSubmit={doEncrypt} onCancel={() => setPrompt(null)} />
      )}
      {prompt?.mode === "dec" && (
        <PasswordPrompt title={tr("pwd.restoreTitle")} sub={tr("pwd.restoreSub")} submitText={tr("pwd.restore")}
          onSubmit={doDecrypt} onCancel={() => setPrompt(null)} />
      )}
    </div>
  );
}
