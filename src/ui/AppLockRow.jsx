// Settings row that turns App Lock on/off.
// Enabling sets a PIN fallback; disabling clears it. Native (iOS) only.
import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import Ico from "./Ico.jsx";
import PinSetup from "./PinSetup.jsx";
import { setPin, clearPin, biometryInfo } from "../lib/appLock.js";
import { HAPTICS } from "../lib/format.js";

export default function AppLockRow({ store, tr }) {
  const [setup, setSetup] = useState(false);
  const on = !!store.appLock;
  const native = Capacitor.isNativePlatform();

  const toggle = async () => {
    HAPTICS.light();
    if (!native) {
      store.setAlert({ title: tr("privacy.appLock"), message: tr("lock.nativeOnly"), color: "var(--blue)" });
      return;
    }
    if (on) {
      store.setConfirm({
        title: tr("privacy.appLock"), message: tr("lock.turnOffTitle"), confirmText: tr("lock.turnOff"), icon: "lock",
        onConfirm: async () => { await clearPin(); store.set("appLock", false); },
      });
    } else {
      const { available } = await biometryInfo();
      if (!available) {
        store.setAlert({ title: tr("privacy.appLock"), message: tr("lock.setUpBiometrics"), color: "var(--blue)" });
      }
      setSetup(true); // set a PIN either way (fallback)
    }
  };

  const finishSetup = async (pin) => {
    await setPin(pin);
    store.set("appLock", true);
    setSetup(false);
    store.flash?.({ title: tr("lock.enabled"), color: "var(--success)", icon: "lock" });
  };

  return (
    <>
      <div className="icard" onClick={toggle} style={{ cursor: "pointer" }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--blueDim)", color: "var(--blue)" }}><Ico name="lock" size={20} /></span>
        <div><div className="nm">{tr("privacy.appLock")}</div><div className="mt">{tr("privacy.appLockSub")}</div></div>
        <span style={{ marginInlineStart: "auto" }}>
          {/* flex-start/flex-end are logical (follow text direction), unlike
              translateX/left — this keeps the knob correct in both LTR and RTL. */}
          <span style={{ width: 46, height: 28, borderRadius: 99, background: on ? "var(--ac)" : "var(--track)", border: on ? "none" : "var(--cardBorder)", display: "flex", alignItems: "center", justifyContent: on ? "flex-end" : "flex-start", padding: 3, boxSizing: "border-box", transition: "background .2s, justify-content .2s" }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: "#fff", flexShrink: 0 }} />
          </span>
        </span>
      </div>
      {setup && <PinSetup onDone={finishSetup} onCancel={() => setSetup(false)} />}
    </>
  );
}
