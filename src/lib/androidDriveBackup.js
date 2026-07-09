// Thin wrapper around the native GoogleDriveBackup Capacitor plugin (Android
// only). Writes/reads the encrypted auto-backup file to the user's Google
// Drive "app data" folder — the Android equivalent of icloudBackup.js.
import { Capacitor, registerPlugin } from "@capacitor/core";

export const GoogleDriveBackupNative = registerPlugin("GoogleDriveBackup");

export async function driveIsSignedIn() {
  if (Capacitor.getPlatform() !== "android") return false;
  try { return (await GoogleDriveBackupNative.isSignedIn()).signedIn; }
  catch { return false; }
}

export async function driveSignIn() {
  const { signedIn } = await GoogleDriveBackupNative.signIn();
  return signedIn;
}

export async function driveSignOut() {
  await GoogleDriveBackupNative.signOut();
}

export async function writeDriveBackup(text) {
  await GoogleDriveBackupNative.writeBackup({ data: text });
}

export async function readDriveBackup() {
  const { data } = await GoogleDriveBackupNative.readBackup();
  return data ?? null;
}
