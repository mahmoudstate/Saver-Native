// Saver — formatting & time helpers (ported verbatim from legacy; LOGIC LOCKED)
export const APP_VERSION = "3.0";

export const CURRENCIES = [
  { code: "EGP", name: "Egyptian Pound", flag: "🇪🇬" }, { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "USD", name: "US Dollar", flag: "🇺🇸" }, { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" }, { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "KWD", name: "Kuwaiti Dinar", flag: "🇰🇼" },
];

let _currency = "EGP";
export const setCurrency = (c) => { _currency = c; };
export const getCurrency = () => _currency;

// Optional short overrides for currencies whose Intl code is a long string.
// Left empty on purpose: EGP shows its plain "EGP" code (rendered small next to
// big numbers via <Money/>) rather than a made-up symbol that could be mistaken
// for another currency.
const CUR_SYMBOL = {};

const intl = (r, cur) => new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: r % 1 === 0 ? 0 : 1, maximumFractionDigits: 2 });

// Wrapped in bidi isolate marks (invisible, no-op in LTR) so a formatted amount
// stays one atomic left-to-right unit when it lands inside an Arabic sentence —
// otherwise the bidi algorithm can reorder pieces of it (e.g. "£5,000" → "5,000£")
// next to other amounts/punctuation on the same line.
const isolate = (s) => `⁦${s}⁩`;

export const fmt = (n, ov) => {
  const cur = ov || _currency;
  try {
    const r = Math.round(n * 100) / 100;
    let s = intl(r, cur).format(r);
    const sym = CUR_SYMBOL[cur];
    if (sym) s = s.replace(cur + " ", sym).replace(cur, sym);
    return isolate(s);
  } catch { return isolate(`${cur} ${n}`); }
};

// Split a formatted amount into its currency part and its number part so big
// displays can render the currency smaller/lighter than the number.
export const fmtParts = (n, ov) => {
  const cur = ov || _currency;
  try {
    const r = Math.round(n * 100) / 100;
    let sym = "", num = "";
    for (const p of intl(r, cur).formatToParts(r)) {
      if (p.type === "currency") sym = CUR_SYMBOL[cur] || p.value;
      else if (p.type !== "literal") num += p.value;
    }
    return { cur: sym, num };
  } catch { return { cur, num: String(n) }; }
};

// Date language mirrors the UI language (set by i18n via setDateLang). Names
// localise; NUMERALS ALWAYS STAY WESTERN — so dates are built manually, never
// via toLocaleDateString("ar") which would switch to Arabic-Indic digits.
let _lang = "en";
export const setDateLang = (l) => { _lang = l === "ar" ? "ar" : "en"; };

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export const monthName = (i) => (_lang === "ar" ? MONTHS_AR : MONTHS)[i];
export const dayName = (i) => (_lang === "ar" ? DAYS_AR : DAYS)[i];
const pad2 = (n) => String(n).padStart(2, "0");

// "Wednesday: 24 Jun 2026" / "الأربعاء: 24 يونيو 2026" — digits Western.
export const fmtDate = (d) => { const dt = new Date(d + "T12:00:00"); return `${dayName(dt.getDay())}: ${pad2(dt.getDate())} ${monthName(dt.getMonth())} ${dt.getFullYear()}`; };

// "Jun 2026" / "يونيو 2026"
export const monthLabel = (ym) => { const [y, m] = ym.split("-"); return `${monthName(+m - 1)} ${y}`; };

// Day-range label for date pickers (manual; Western digits, localised months).
export const dayRangeLabel = (from, to) => {
  const f = new Date(from + "T12:00:00"), t = new Date((to || from) + "T12:00:00");
  const full = (x) => `${x.getDate()} ${monthName(x.getMonth())} ${x.getFullYear()}`;
  if (!to || from === to) return full(f);
  const sameMonth = from.slice(0, 7) === to.slice(0, 7);
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const fL = sameMonth ? `${f.getDate()}` : sameYear ? `${f.getDate()} ${monthName(f.getMonth())}` : full(f);
  return `${fL} – ${full(t)}`;
};

const getLocalTime = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  const localISO = new Date(d.getTime() - offset).toISOString();
  return { today: localISO.split("T")[0], month: localISO.slice(0, 7) };
};
export const today = () => getLocalTime().today;
export const currentMonth = () => getLocalTime().month;
export const prevMonthOf = (m) => { const [y, mo] = m.split("-"); const d = new Date(+y, +mo - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; };

// A budget's spend period for a given anchor `month` (YYYY-MM). Day 1 (default/unset)
// == the calendar month, unchanged. Otherwise the period runs from `cycleStartDay` of
// `month` to the day before `cycleStartDay` next month — clamped to each month's real
// length (e.g. day 30 in Feb), via Date's own day-rollover instead of manual math.
export const cyclePeriod = (month, cycleStartDay) => {
  const day = cycleStartDay > 1 ? cycleStartDay : 1;
  const [y, m] = month.split("-").map(Number);
  const fromD = new Date(y, m - 1, Math.min(day, new Date(y, m, 0).getDate()));
  const toD = new Date(y, m, day - 1);
  const iso = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  return { from: iso(fromD), to: iso(toD) };
};

// Which calendar month a cycle should be anchored to so that `todayISO` falls inside
// it — e.g. cycleStartDay=25: on the 10th that's still last month's cycle (25→24).
export const currentCycleAnchor = (todayISO, cycleStartDay) => {
  if (!(cycleStartDay > 1)) return todayISO.slice(0, 7);
  const [y, m, d] = todayISO.split("-").map(Number);
  const month = `${y}-${pad2(m)}`;
  return d >= cycleStartDay ? month : prevMonthOf(month);
};

// colour helpers for brand cards
export const _lum = (hex) => { try { const c = hex.replace("#", ""); const r = parseInt(c.slice(0, 2), 16) / 255, g = parseInt(c.slice(2, 4), 16) / 255, b = parseInt(c.slice(4, 6), 16) / 255; return 0.2126 * r + 0.7152 * g + 0.0722 * b; } catch { return 0.5; } };
export const darken = (hex, f = 0.5) => { try { let c = String(hex).replace("#", ""); if (c.length === 3) c = c.split("").map((ch) => ch + ch).join(""); if (c.length !== 6) return hex; const x = (i) => Math.round(parseInt(c.slice(i, i + 2), 16) * (1 - f)).toString(16).padStart(2, "0"); return `#${x(0)}${x(2)}${x(4)}`; } catch { return hex; } };
export const cardGradient = (hex) => `linear-gradient(140deg, ${hex}, ${darken(hex, 0.52)})`;

export const vibrate = (p) => { if (typeof window !== "undefined" && window.navigator?.vibrate) try { window.navigator.vibrate(p); } catch (e) {} };
export const HAPTICS = { light: () => vibrate(10), medium: () => vibrate(20), heavy: () => vibrate(50), success: () => vibrate([30, 50, 30]), warning: () => vibrate(100) };
