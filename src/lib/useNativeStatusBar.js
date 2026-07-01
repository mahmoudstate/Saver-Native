// Native shell glue for iOS/Android (Capacitor).
// Single responsibility: keep the native Status Bar in sync with the app theme,
// and hide the launch Splash once the web app has mounted.
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

export function useNativeStatusBar() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const root = document.documentElement;
    const sync = () => {
      const theme = root.getAttribute("data-theme") || "light";
      StatusBar.setStyle({ style: styleForTheme(theme) }).catch(() => {});
    };

    sync(); // initial
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    // App is mounted and painted — dismiss the splash to avoid a white flash.
    SplashScreen.hide().catch(() => {});

    return () => obs.disconnect();
  }, []);
}
