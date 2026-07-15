// Drives the locked/unlocked state for the app shell.
// Locks on launch (when enabled) and again when the app returns from background.
import { useState, useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { authBiometric } from "./appLock.js";

export function useAppLock(enabled) {
  const native = Capacitor.isNativePlatform();
  const [locked, setLocked] = useState(enabled && native);
  // "idle" before the first attempt, "busy" while the system sheet is up,
  // "failed" once an attempt was cancelled or rejected.
  const [biometryState, setBiometryState] = useState("idle");
  const lockedRef = useRef(locked);
  const busyRef = useRef(false);
  useEffect(() => { lockedRef.current = locked; }, [locked]);

  const tryBiometric = useCallback(async () => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBiometryState("busy");
    const ok = await authBiometric();
    busyRef.current = false;
    setBiometryState(ok ? "idle" : "failed");
    if (ok) setLocked(false);
    return ok;
  }, []);

  // Prompt once on launch, while the app is already in the foreground.
  useEffect(() => {
    if (!enabled || !native) return;
    tryBiometric();
  }, [enabled, native, tryBiometric]);

  // Re-lock when the app is sent to the background, but never prompt there:
  // iOS silently rejects a prompt raised mid-transition, and the user sees a
  // biometric scan on the way out of the app. Prompt only once we're active again.
  useEffect(() => {
    if (!enabled || !native) return;
    const h = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) { setLocked(true); setBiometryState("idle"); }
      else if (lockedRef.current) tryBiometric();
    });
    return () => { h.then((l) => l.remove()); };
  }, [enabled, native, tryBiometric]);

  // If the lock gets disabled, drop straight through.
  useEffect(() => { if (!enabled) setLocked(false); }, [enabled]);

  const unlock = useCallback(() => setLocked(false), []);

  return { locked: enabled && native && locked, unlock, tryBiometric, biometryState };
}
