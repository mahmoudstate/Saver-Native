// Drives the locked/unlocked state for the app shell.
// Locks on launch (when enabled) and again when the app returns from background.
import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { authBiometric } from "./appLock.js";

export function useAppLock(enabled) {
  const native = Capacitor.isNativePlatform();
  const [locked, setLocked] = useState(enabled && native);
  const lockedRef = useRef(locked);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  const tryBiometric = useCallback(async () => {
    const ok = await authBiometric();
    if (ok) setLocked(false);
    return ok;
  }, []);

  // Re-lock when the app is sent to the background. Wait for the app to
  // actually be back in the foreground (isActive: true) before re-prompting
  // biometrics — prompting at the moment of backgrounding gets silently
  // rejected by iOS, since the lock screen was already mounted mid-transition.
  useEffect(() => {
    if (!enabled || !native) return;
    const h = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) setLocked(true);
      else if (lockedRef.current) tryBiometric();
    });
    return () => { h.then((l) => l.remove()); };
  }, [enabled, native, tryBiometric]);

  // If the lock gets disabled, drop straight through.
  useEffect(() => { if (!enabled) setLocked(false); }, [enabled]);

  const unlock = useCallback(() => setLocked(false), []);

  return { locked: enabled && native && locked, unlock, tryBiometric };
}
