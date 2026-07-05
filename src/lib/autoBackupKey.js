// Gets (or creates once) a random passphrase kept in the iOS Keychain, used
// only to encrypt the automatic iCloud backup, separate from the user's own
// manual export/import password, so auto-backups never need a prompt.
//
// Synced via iCloud Keychain (sync: true) so a new/replacement device signed
// into the same Apple ID (with iCloud Keychain enabled) already has the key
// once it syncs in, letting useICloudRestoreCheck decrypt the existing
// iCloud backup without ever asking the user for a password.
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

const KEY = "icloud_auto_backup_key";

const randomPassphrase = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes));
};

// Read-only, never creates a key. Used to check whether a restorable key is
// already available (e.g. synced in from another device) before deciding to
// offer a restore. Creating one here instead would risk generating a second,
// different key moments before the real one finishes syncing in.
export async function peekAutoBackupKey() {
  try { return await SecureStorage.get(KEY, false, true); }
  catch { return null; }
}

export async function getAutoBackupKey() {
  let key = await peekAutoBackupKey();
  if (!key) {
    key = randomPassphrase();
    await SecureStorage.set(KEY, key, false, true);
  }
  return key;
}
