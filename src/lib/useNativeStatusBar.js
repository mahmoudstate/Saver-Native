// Native shell glue for iOS/Android (Capacitor).
// Single responsibility: keep the native Status Bar in sync with what's
// actually behind it, and hide the launch Splash once the web app has mounted.
// No-op on the web (Capacitor.isNativePlatform() === false).
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// data-theme="dark"  -> light text/icons  (Style.Dark = light content)
// data-theme="light" -> dark text/icons   (Style.Light = dark content)
function styleForTheme(theme) {
  return theme === "dark" ? Style.Dark : Style.Light;
}

// Almost every screen renders a `.hero` band under the status bar, and the
// hero is always a bright, accent-tinted gradient with dark text regardless
// of app theme (by design — see --heroGrad in saver-ui.css). So the status
// bar defaults to dark content (Style.Light) to stay readable on that hero.
// The couple of screens with no hero (Activity, Celebration) sit directly on
// the theme background instead, so they opt in to theme-based coloring via
// useThemedStatusBar() below.
let themedRequests = 0;
let syncFn = () => {};

export function useNativeStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const root = document.documentElement;
    const sync = () => {
      const style = themedRequests > 0 ? styleForTheme(root.getAttribute("data-theme") || "light") : Style.Light;
      StatusBar.setStyle({ style }).catch(() => {});
    };
    syncFn = sync;

    // Android-only: scoped class so CSS can opt specific fixes in without
    // touching iOS (e.g. the overscroll-bounce ghost-row repaint glitch).
    if (Capacitor.getPlatform() === "android") root.classList.add("is-android");

    sync(); // initial
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    // App is mounted and painted. Keep the branded splash up a little longer
    // (min display time) before dismissing it with a soft fade.
    const t = setTimeout(() => SplashScreen.hide().catch(() => {}), 2000);

    return () => { obs.disconnect(); clearTimeout(t); syncFn = () => {}; };
  }, []);
}

// Call from a hero-less screen (background = var(--bg), theme-dependent) to
// make the status bar follow the app theme while that screen is visible.
export function useThemedStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    themedRequests += 1;
    syncFn();
    return () => { themedRequests -= 1; syncFn(); };
  }, []);
}
