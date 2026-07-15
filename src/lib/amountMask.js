// Privacy mask for on-screen amounts.
//
// State lives here, at module scope, rather than inside a screen: the lock
// screen unmounts Home, so screen-local state would forget the grace window
// every time App Lock kicked in. Resets to masked on a full app reload.
//
// Leaving the foreground always masks immediately — that has to happen before
// iOS/Android snapshot the screen for the app switcher. Coming back within the
// grace window restores what you had; a manual hide drops the window entirely.
import { useEffect, useState } from "react";
import { App as CapApp } from "@capacitor/app";

const GRACE_MS = 60_000;

let masked = true;
let unmaskedAt = 0; // when amounts were last visible on the way to the background
const subs = new Set();

function set(next) {
  if (masked === next) return;
  masked = next;
  subs.forEach((fn) => fn(masked));
}

export function isMasked() { return masked; }

export function toggleMask() {
  const next = !masked;
  if (next) unmaskedAt = 0; // masking by hand drops the grace window
  set(next);
}

// Owns the foreground/background transitions. Call once, from the app shell,
// above any early return — it has to keep running while the lock screen is up.
export function useAmountMaskLifecycle() {
  useEffect(() => {
    const sub = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) {
        unmaskedAt = masked ? 0 : Date.now();
        set(true);
      } else if (unmaskedAt && Date.now() - unmaskedAt < GRACE_MS) {
        unmaskedAt = 0;
        set(false);
      } else {
        unmaskedAt = 0;
      }
    });
    return () => { sub.then((s) => s.remove()); };
  }, []);
}

export function useAmountMask() {
  const [hide, setHide] = useState(masked);
  useEffect(() => {
    subs.add(setHide);
    setHide(masked); // re-sync on mount: the mask may have changed while unmounted
    return () => { subs.delete(setHide); };
  }, []);
  return { hide, toggleHide: toggleMask };
}
