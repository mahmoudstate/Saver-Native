// Drives the locked/unlocked state for the app shell.
// Locks on launch (when enabled) and again when the app returns from background.
import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { authBiometric } from "./appLock.js";

export function useAppLock(enabled) {
  const native = Capacitor.isNativePlatform();
  const [locked, setLocked] = useState(enabled && native);

  // Re-lock when the app is sent to the background.
  useEffect(() => {
    if (!enabled || !native) return;
    const h = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) setLocked(true);
    });
    return () => { h.then((l) => l.remove()); };
  }, [enabled, native]);

  // If the lock gets disabled, drop straight through.
  useEffect(() => { if (!enabled) setLocked(false); }, [enabled]);

  const unlock = useCallback(() => setLocked(false), []);
  const tryBiometric = useCallback(async () => {
    const ok = await authBiometric();
    if (ok) setLocked(false);
    return ok;
  }, []);

  return { locked: enabled && native && locked, unlock, tryBiometric };
}
