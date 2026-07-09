// Translated name of the device's real biometry (Face ID, Touch ID,
// fingerprint, face unlock, iris) for use in App Lock copy — falls back to a
// generic "biometrics" word until the native check resolves or on web.
import { useEffect, useState } from "react";
import { useT } from "../lib/i18n.js";
import { biometryInfo, biometryKindKey } from "../lib/appLock.js";

export function useBiometryLabel() {
  const tr = useT();
  const [kind, setKind] = useState("generic");
  useEffect(() => { biometryInfo().then(({ type }) => setKind(biometryKindKey(type))); }, []);
  return tr(`lock.biometryNames.${kind}`);
}
