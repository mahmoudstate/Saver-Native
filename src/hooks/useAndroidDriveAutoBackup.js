// Debounced automatic backup to the user's Google Drive app-data folder,
// encrypted with a device-only key (same key store as iCloud's, via
// capacitor-secure-storage). Android native only. Unlike iCloud, this
// requires the user to sign in to Google once (see PrivacyBackup.jsx); after
// that it runs silently in the background just like the iOS auto-backup.
import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { encryptBackup } from "../lib/backupCrypto.js";
import { buildBackupPayload } from "../lib/backupPayload.js";
import { getAutoBackupKey } from "../lib/autoBackupKey.js";
import { driveIsSignedIn, writeDriveBackup } from "../lib/androidDriveBackup.js";

const DEBOUNCE_MS = 4000;

// Shared by the debounced auto-backup below and the manual "Back up now"
// button (PrivacyBackup.jsx). Returns true on success, false if the user
// hasn't connected a Google account yet.
export async function runAndroidDriveBackup() {
  if (Capacitor.getPlatform() !== "android" || !(await driveIsSignedIn())) return false;
  const key = await getAutoBackupKey();
  const enc = await encryptBackup(buildBackupPayload(), key);
  await writeDriveBackup(enc);
  return true;
}

// `data` is only used to detect changes (dependency array); the actual
// payload is re-read fresh from localStorage by runAndroidDriveBackup().
export function useAndroidDriveAutoBackup(data, enabled, onBackedUp, onFailed) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android" || !enabled) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (await runAndroidDriveBackup()) onBackedUp?.(Date.now());
      } catch (e) {
        console.warn("[drive-backup] failed:", e);
        onFailed?.();
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [data, enabled]);
}
