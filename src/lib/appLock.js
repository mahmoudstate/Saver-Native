// App Lock core: biometric (Face ID / Touch ID) with a PIN fallback.
// Web-safe: all calls no-op / return false when not on a native platform.
import { Capacitor } from "@capacitor/core";
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

const PIN_KEY = "saver_pin_hash";
const native = () => Capacitor.isNativePlatform();

// --- biometrics ---
export async function biometryInfo() {
  if (!native()) return { available: false, type: 0 };
  try {
    const r = await BiometricAuth.checkBiometry();
    return { available: !!r.isAvailable, type: r.biometryType };
  } catch { return { available: false, type: 0 }; }
}

export async function authBiometric(reason = "Unlock Saver") {
  try {
    await BiometricAuth.authenticate({
      reason,
      cancelTitle: "Use PIN",
      allowDeviceCredential: false,
    });
    return true;
  } catch { return false; }
}

// --- PIN (hashed in the Keychain) ---
async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setPin(pin) {
  if (!native()) return;
  await SecureStorage.set(PIN_KEY, await sha256(pin));
}

export async function hasPin() {
  if (!native()) return false;
  try { return (await SecureStorage.get(PIN_KEY)) != null; } catch { return false; }
}

export async function verifyPin(pin) {
  if (!native()) return false;
  try { return (await SecureStorage.get(PIN_KEY)) === (await sha256(pin)); }
  catch { return false; }
}

export async function clearPin() {
  if (!native()) return;
  try { await SecureStorage.remove(PIN_KEY); } catch { /* ignore */ }
}
