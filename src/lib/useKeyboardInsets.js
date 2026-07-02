// When the native keyboard opens, the focused input can end up hidden behind
// a fixed bottom CTA bar (the CTA sits absolute over .content, unaware of the
// keyboard). Nudge the focused field back into view once the keyboard settles.
//
// Two triggers are needed, not one: iOS only fires "keyboardDidShow" when the
// keyboard transitions from closed to open. Tapping a second field while the
// keyboard is already open (e.g. moving from "item" to "company") does NOT
// refire it, so a fix that only listens to that event works for the first
// field touched and silently does nothing for every field after it. `focusin`
// fires on every field focus regardless of keyboard state, so it covers that
// case; the keyboard listener covers the initial open before any DOM focus
// order guarantees settle.
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

const nudgeFocused = () => {
  const el = document.activeElement;
  if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
  }
};

export function useKeyboardInsets() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const onShow = () => setTimeout(nudgeFocused, 120);
    const onFocusIn = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") setTimeout(nudgeFocused, 120);
    };

    const h = Keyboard.addListener("keyboardDidShow", onShow);
    document.addEventListener("focusin", onFocusIn);
    return () => { h.then((l) => l.remove()); document.removeEventListener("focusin", onFocusIn); };
  }, []);
}
