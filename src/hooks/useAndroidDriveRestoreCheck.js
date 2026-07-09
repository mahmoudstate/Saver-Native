// Offers to restore a previous Google Drive auto-backup on a genuinely empty
// install (fresh reinstall on the same device, or a brand-new device signed
// into the same Google account) — the Android equivalent of
// useICloudRestoreCheck.js. Kept as a fully separate hook so iOS's restore
// flow is never touched by Android-only changes.
//
// Gated on the device being "empty" (no accounts/transactions yet) rather
// than a one-time flag, so it keeps re-checking on every cold launch until
// either the user restores, dismisses (per this empty state, a later
// Factory Reset clears the dismissal along with everything else), or starts
// entering real data. Returns `checking` so callers can hold off rendering
// Onboarding until the offer (if any) is ready, instead of flashing it first.
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { decryptBackup } from "../lib/backupCrypto.js";
import { peekAutoBackupKey } from "../lib/autoBackupKey.js";
import { driveIsSignedIn, readDriveBackup } from "../lib/androidDriveBackup.js";
import { useT } from "../lib/i18n.js";

export function useAndroidDriveRestoreCheck(store) {
  const [checking, setChecking] = useState(true);
  const tr = useT();
  const isEmpty = (store.txns?.length ?? 0) === 0 && (store.banks?.length ?? 0) === 0;
  const dismissed = store.androidDriveRestoreDismissed;

  useEffect(() => {
    if (Capacitor.getPlatform() !== "android" || !isEmpty || dismissed) {
      setChecking(false);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        if (await driveIsSignedIn()) {
          const enc = await readDriveBackup();
          // No key yet is most likely a fresh sign-in still settling, so skip
          // silently this run rather than generating a fresh (wrong) key.
          const key = enc ? await peekAutoBackupKey() : null;
          if (enc && key) {
            const payload = await decryptBackup(enc, key);
            if (!cancelled) {
              store.setConfirm({
                title: tr("privacy.foundDriveBackupTitle"),
                message: tr("privacy.foundDriveBackupMsg"),
                confirmText: tr("privacy.restore"),
                cancelText: tr("privacy.startFresh"),
                icon: "download", color: "var(--acText)",
                onConfirm: () => {
                  if (store.restore(payload)) store.flash({ title: tr("privacy.backupRestored"), color: "var(--acText)", icon: "check" });
                },
                onCancel: () => store.set("androidDriveRestoreDismissed", true),
              });
            }
          }
        }
      } catch (e) {
        console.warn("[drive-restore] check failed:", e);
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmpty, dismissed]);

  return checking;
}
