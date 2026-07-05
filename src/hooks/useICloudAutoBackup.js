// Debounced automatic backup to the app's iCloud Drive container, encrypted
// with a device-only Keychain key. Runs silently in the background, no
// prompts, no manual export needed. iOS native only.
import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { encryptBackup } from "../lib/backupCrypto.js";
import { buildBackupPayload } from "../lib/backupPayload.js";
import { getAutoBackupKey } from "../lib/autoBackupKey.js";
import { icloudAvailable, writeICloudBackup } from "../lib/icloudBackup.js";

const DEBOUNCE_MS = 4000;

// Shared by the debounced auto-backup below and the manual "Back up now"
// button (PrivacyBackup.jsx). Reads the payload fresh from localStorage each
// time, so it never needs a stale `data` snapshot passed in. Returns true on
// success, false if iCloud isn't available (not signed in, no container yet).
export async function runICloudBackup() {
  if (Capacitor.getPlatform() !== "ios" || !(await icloudAvailable())) return false;
  const key = await getAutoBackupKey();
  const enc = await encryptBackup(buildBackupPayload(), key);
  await writeICloudBackup(enc);
  return true;
}

// `data` is the store's live state object, only used to detect changes
// (dependency array); the actual payload is re-read fresh from localStorage
// by runICloudBackup(). `onBackedUp`/`onFailed`, if given, write straight to
// localStorage (not through React state), so neither can retrigger this
// effect. `onFailed` only fires on a genuine error (write/encrypt threw), not
// when iCloud is simply unavailable (not signed in, no container yet), since
// that isn't something a "backup keeps failing" warning should surface.
export function useICloudAutoBackup(data, enabled, onBackedUp, onFailed) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios" || !enabled) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (await runICloudBackup()) onBackedUp?.(Date.now());
      } catch (e) {
        console.warn("[icloud-backup] failed:", e);
        onFailed?.();
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [data, enabled]);
}
