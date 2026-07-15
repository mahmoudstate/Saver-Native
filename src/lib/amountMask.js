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

// Restores what you had if you're back inside the grace window, otherwise the
// window has lapsed and the mask stays. Either way the window is spent.
function restore() {
  const inGrace = unmaskedAt && Date.now() - unmaskedAt < GRACE_MS;
  unmaskedAt = 0;
  if (inGrace) set(false);
}

// Owns the foreground/background transitions. Call once, from the app shell,
// above any early return — it has to keep running while the lock screen is up.
export function useAmountMaskLifecycle() {
  useEffect(() => {
    const subs_ = [
      CapApp.addListener("appStateChange", ({ isActive }) => {
        if (!isActive) {
          unmaskedAt = masked ? 0 : Date.now();
          set(true);
        } else restore();
      }),
      // `resume` lands on willEnterForeground — before the first paint — while
      // appStateChange:isActive lands on didBecomeActive, late enough that you
      // see a beat of masked amounts before they come back. Whichever fires
      // first spends the window; the other is then a no-op. Masking stays on
      // appStateChange: it must happen before the app-switcher snapshot.
      CapApp.addListener("resume", restore),
    ];
    return () => { subs_.forEach((p) => p.then((s) => s.remove())); };
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
