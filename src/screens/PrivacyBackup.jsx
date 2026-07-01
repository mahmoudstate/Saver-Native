// Saver — Privacy & Backup: ported from showcase 25 + 39 (on-device · export/restore).
import { useRef } from "react";
import Ico from "../ui/Ico.jsx";
import { today } from "../lib/format.js";
import { KEYS, loadKey } from "../lib/store.js";
import { useT } from "../lib/i18n.js";

// TODO: swap for the live marketing-site privacy page once it is ready.
const PRIVACY_URL = "https://savertrack.app/privacy";

export default function PrivacyBackup({ store, back }) {
  const fileRef = useRef(null);
  const tr = useT();

  const download = () => {
    const payload = { _app: "Saver", _version: 3, _exported: today() };
    for (const k in KEYS) payload[k] = loadKey(KEYS[k], null);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Saver_Backup_${today()}.json`; a.click();
    URL.revokeObjectURL(url);
    store.flash({ title: tr("privacy.backupDownloaded"), sub: "Saver_Backup.json", color: "var(--success)", icon: "download" });
  };

  const onFile = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        store.setConfirm({
          title: tr("privacy.restoreTitle"), message: tr("privacy.restoreMsg"),
          color: "var(--acText)", confirmText: tr("privacy.restore"), icon: "download",
          onConfirm: () => { if (store.restore(data)) store.flash({ title: tr("privacy.backupRestored"), color: "var(--acText)", icon: "check" }); },
        });
      } catch { store.setAlert({ title: tr("privacy.cantRead"), message: tr("privacy.cantReadMsg"), color: "var(--red)" }); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Factory reset — always exports a backup first, then wipes everything.
  const reset = () => {
    store.setConfirm({
      title: tr("privacy.resetTitle"),
      message: tr("privacy.resetMsg"),
      confirmText: tr("privacy.backupReset"), danger: true, icon: "trash",
      onConfirm: () => { download(); store.resetAll(); },
    });
  };

  const Row = ({ icon, bg, color, nm, mt, right, onClick }) => (
    <div className="icard" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: bg, color }}><Ico name={icon} size={20} /></span>
      <div><div className="nm">{nm}</div><div className="mt">{mt}</div></div>
      <span style={{ marginLeft: "auto" }}>{right}</span>
    </div>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("privacy.title")}</div><div className="grow" /></div>
        <div className="lbl">{tr("privacy.yourData")}</div><div className="big" style={{ fontSize: 34 }}>{tr("privacy.private")}</div><div className="sub">{tr("privacy.onDevice")}</div>
      </div>

      <div className="over">{tr("privacy.security")}</div>
      <Row icon="lock" bg="var(--blueDim)" color="var(--blue)" nm={tr("privacy.appLock")} mt={tr("privacy.appLockSub")} />
      <div className="frozen" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: "var(--acDim)", color: "var(--acText)", borderRadius: 14, padding: "12px 14px", fontWeight: 700, fontSize: 13 }}>
        <Ico name="shield" size={15} color="var(--ac)" />{tr("privacy.onDeviceBadge")}
      </div>

      <div className="over" style={{ marginTop: 16 }}>{tr("privacy.backup")}</div>
      <Row icon="download" bg="var(--purpleDim)" color="var(--purple)" nm={tr("privacy.downloadBackup")} mt="Saver_Backup.json" right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={download} />
      <Row icon="download" bg="var(--blueDim)" color="var(--blue)" nm={tr("privacy.restoreFromFile")} mt={tr("privacy.overwrites")} right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={() => fileRef.current?.click()} />
      <Row icon="trash" bg="var(--redDim)" color="var(--red)" nm={tr("privacy.resetAllData")} mt={tr("privacy.resetSub")} right={<Ico name="chev" size={18} color="var(--faint)" />} onClick={reset} />

      <div className="over" style={{ marginTop: 16 }}>{tr("privacy.legal")}</div>
      <Row icon="shield" bg="var(--blueDim)" color="var(--blue)" nm={tr("privacy.policy")} mt={tr("privacy.policySub")} right={<Ico name="link" size={18} color="var(--faint)" />} onClick={() => window.open(PRIVACY_URL, "_blank", "noopener,noreferrer")} />
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: "none" }} />
    </div>
  );
}
