// True device Region (Settings → General → Language & Region), read from the
// native side. navigator.language can't be trusted for this on-device (see
// ICloudBackupPlugin.swift's getRegion for why).
import { Capacitor } from "@capacitor/core";
import { ICloudBackupNative } from "./icloudBackup.js";

export async function getDeviceRegion() {
  if (Capacitor.getPlatform() !== "ios") return null;
  const { region } = await ICloudBackupNative.getRegion();
  return region || null;
}
