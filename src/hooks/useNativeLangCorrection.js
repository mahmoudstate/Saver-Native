// iOS only: keep the UI language in sync with the per-app Settings > Saver >
// Language override, which WKWebView's navigator.language doesn't reflect
// reliably. Reads the real preferred language natively on each launch and
// caches it (et_native_lang) for i18n.js's osLang(). When that value actually
// CHANGES since last seen, re-runs detection (via the saver:langsync event the
// LangProvider already listens for) so the change is applied live. On an
// unchanged value it does nothing, so an explicit in-app / LangPrompt choice
// (stored in et_lang) is always preserved.
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getDeviceLanguage } from "../lib/deviceRegion.js";

const NATIVE_LANG_KEY = "et_native_lang";

export function useNativeLangCorrection() {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios") return;
    (async () => {
      const lang = await getDeviceLanguage().catch(() => null);
      if (lang !== "ar" && lang !== "en") return;
      let prev = null;
      try { prev = localStorage.getItem(NATIVE_LANG_KEY); } catch { /* ignore */ }
      if (prev === lang) return; // nothing changed
      try { localStorage.setItem(NATIVE_LANG_KEY, lang); } catch { /* ignore */ }
      // detect() (via osLang) now reads the fresh cache; its own OS-snapshot
      // guard decides whether the OS value beats a saved choice.
      window.dispatchEvent(new Event("saver:langsync"));
    })();
  }, []);
}
