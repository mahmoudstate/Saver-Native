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

// True preferred app language (Settings > Saver > Language), read natively —
// navigator.language can't be trusted for this in WKWebView (see i18n.js).
// Returns "ar" / "en" / null.
export async function getDeviceLanguage() {
  if (Capacitor.getPlatform() !== "ios") return null;
  try {
    const { language } = await ICloudBackupNative.getLanguage();
    if (!language) return null;
    return language.toLowerCase().startsWith("ar") ? "ar" : "en";
  } catch { return null; }
}
