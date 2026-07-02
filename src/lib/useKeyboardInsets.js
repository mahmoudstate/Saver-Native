// When the native keyboard opens, the focused input can end up hidden behind
// a fixed bottom CTA bar (the CTA sits absolute over .content, unaware of the
// keyboard). Nudge the focused field back into view once the keyboard settles.
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";

export function useKeyboardInsets() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const onShow = () => {
      setTimeout(() => {
        const el = document.activeElement;
        if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
          el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
      }, 120);
    };
    const h = Keyboard.addListener("keyboardDidShow", onShow);
    return () => { h.then((l) => l.remove()); };
  }, []);
}
