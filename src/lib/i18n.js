// Saver — lightweight i18n: language state + translator (self-contained).
// There's no in-app language switcher — language is driven by the device/
// per-app iOS language (Settings > Saver > Language), plus a one-time
// Arabic/English prompt for a handful of markets where OS language isn't a
// reliable signal (see LangPrompt.jsx). Syncs <html dir/lang> live.
// NOTE: numbers stay Western/Inter everywhere — t() never localises digits.
import { createElement, createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./locales/en.js";
import ar from "./locales/ar.js";
import { setDateLang } from "./format.js";

const DICTS = { en, ar };
const LANG_KEY = "et_lang";
const OS_SNAPSHOT_KEY = "et_lang_os_snap"; // last-seen OS-derived language, to notice when it changes
const RTL = new Set(["ar"]);

const osLang = () => {
  try { return (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en"; } catch { return "en"; }
};

// Resolve the active language. The OS-provided language (device or, on iOS,
// the per-app Settings > Saver > Language override) is the source of truth —
// if it changed since we last checked, it wins outright. Otherwise fall back
// to a previously saved choice (set once by LangPrompt for the markets that
// get it), then to the OS language itself.
const detect = () => {
  const os = osLang();
  let snapshot = null;
  try { snapshot = localStorage.getItem(OS_SNAPSHOT_KEY); } catch { /* ignore */ }
  const osChanged = snapshot !== null && snapshot !== os;
  try { localStorage.setItem(OS_SNAPSHOT_KEY, os); } catch { /* ignore */ }
  if (osChanged) return os;

  try { const r = localStorage.getItem(LANG_KEY); if (r) { const v = JSON.parse(r); if (DICTS[v]) return v; } } catch { /* ignore */ }
  return os;
};

// Reflect language on the document root (direction + lang attribute).
const apply = (lang) => {
  const el = document.documentElement;
  el.setAttribute("lang", lang);
  el.setAttribute("dir", RTL.has(lang) ? "rtl" : "ltr");
  setDateLang(lang); // keep date helpers in sync (names only — digits stay Western)
};

// Set dir/lang BEFORE first paint so an Arabic user sees no LTR→RTL flash.
if (typeof document !== "undefined") apply(detect());

export const currentLang = detect;

const LangCtx = createContext({ lang: "en", setLang: () => {}, t: (k) => k, dir: "ltr" });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detect);

  useEffect(() => { apply(lang); }, [lang]);

  // Re-sync language when a backup is restored or data is reset (store writes et_lang
  // directly, outside this provider). detect() re-reads storage → falls back to auto-detect.
  useEffect(() => {
    const resync = () => setLangState(detect());
    window.addEventListener("saver:langsync", resync);
    return () => window.removeEventListener("saver:langsync", resync);
  }, []);

  const setLang = useCallback((next) => {
    if (!DICTS[next]) return;
    try { localStorage.setItem(LANG_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setLangState(next);
  }, []);

  // t("a.b.c", vars?) — dot-path lookup + {var} interpolation.
  // Missing key → English fallback → the raw key (never crashes).
  const t = useCallback((key, vars) => {
    const pick = (d) => key.split(".").reduce((o, p) => (o == null ? o : o[p]), d);
    let s = pick(DICTS[lang]);
    if (s == null) s = pick(DICTS.en);
    if (s == null) return key;
    if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
    return s;
  }, [lang]);

  return createElement(LangCtx.Provider, { value: { lang, setLang, t, dir: RTL.has(lang) ? "rtl" : "ltr" } }, children);
}

export const useLang = () => useContext(LangCtx);
export const useT = () => useContext(LangCtx).t;

// Plain (non-hook) translator for code that runs outside React components
// (e.g. scheduling native notifications). Re-reads the saved language each
// call — fine for the low-frequency call sites that need this.
export function translate(key, vars) {
  const lang = detect();
  const pick = (d) => key.split(".").reduce((o, p) => (o == null ? o : o[p]), d);
  let s = pick(DICTS[lang]);
  if (s == null) s = pick(DICTS.en);
  if (s == null) return key;
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k]);
  return s;
}
