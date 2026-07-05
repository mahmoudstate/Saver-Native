// Thin wrapper around the native ICloudBackup Capacitor plugin (iOS only).
// Writes/reads the encrypted auto-backup file to the app's iCloud Drive container.
import { Capacitor, registerPlugin } from "@capacitor/core";

export const ICloudBackupNative = registerPlugin("ICloudBackup");

export async function icloudAvailable() {
  if (Capacitor.getPlatform() !== "ios") return false;
  try { return (await ICloudBackupNative.isAvailable()).available; }
  catch { return false; }
}

export async function writeICloudBackup(text) {
  await ICloudBackupNative.writeBackup({ data: text });
}

export async function readICloudBackup() {
  const { data } = await ICloudBackupNative.readBackup();
  return data ?? null;
}
