// Saver — lightweight i18n: language state + translator (self-contained).
// Choice persists in localStorage `et_lang` (same et_* convention).
// First launch: auto-detect from navigator.language (ar → Arabic, else English).
// A manual choice always wins and persists. Syncs <html dir/lang> live.
// NOTE: numbers stay Western/Inter everywhere — t() never localises digits.
import { createElement, createContext, useContext, useState, useEffect, useCallback } from "react";
import en from "./locales/en.js";
import ar from "./locales/ar.js";
import { setDateLang } from "./format.js";

const DICTS = { en, ar };
const LANG_KEY = "et_lang";
const RTL = new Set(["ar"]);

// Resolve the active language: saved choice → browser language → English.
const detect = () => {
  try { const r = localStorage.getItem(LANG_KEY); if (r) { const v = JSON.parse(r); if (DICTS[v]) return v; } } catch { /* ignore */ }
  try { if ((navigator.language || "en").toLowerCase().startsWith("ar")) return "ar"; } catch { /* ignore */ }
  return "en";
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
