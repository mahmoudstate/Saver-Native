// Saver — sensible defaults for a brand-new install, applied once before the
// store's first read (see useStore()'s init in store.js). Never touches an
// existing install: every check below bails out the moment any of this data
// already exists, so a returning user's choices are never overwritten.
//
// Three things are seeded: the UI language (already handled live by
// i18n.js's own navigator.language detection — nothing to do here), the
// currency (guessed from the device's region), and a small starter set of
// expense/income categories so the app isn't a blank list on first open.
import { loadKey, saveKey, KEYS } from "./store.js";
import { CURRENCIES } from "./format.js";

const newId = () => { try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch { /* fall through */ } return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`; };

// Region → currency, limited to what Saver actually supports (CURRENCIES in
// format.js). Everything else falls back to USD rather than guessing wrong.
const REGION_CURRENCY = { EG: "EGP", GB: "GBP", US: "USD", SA: "SAR", AE: "AED", KW: "KWD" };
const EUROZONE = new Set(["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "IE", "FI", "GR", "LU", "SK", "SI", "EE", "LV", "LT", "CY", "MT", "HR"]);

function detectRegion() {
  try { return new Intl.Locale(navigator.language).maximize().region || null; } catch { return null; }
}

function detectCurrency() {
  const region = detectRegion();
  const code = region && (REGION_CURRENCY[region] || (EUROZONE.has(region) ? "EUR" : null));
  return code && CURRENCIES.some((c) => c.code === code) ? code : "USD";
}

function isArabic() {
  try { return (navigator.language || "en").toLowerCase().startsWith("ar"); } catch { return false; }
}

const SEED_EXPENSE = {
  en: [["food", "Food & Dining"], ["groceries", "Groceries"], ["transport", "Transport"], ["shopping", "Shopping"], ["bill", "Bills & Utilities"], ["health", "Health"]],
  ar: [["food", "طعام ومطاعم"], ["groceries", "بقالة"], ["transport", "مواصلات"], ["shopping", "تسوق"], ["bill", "فواتير ومرافق"], ["health", "صحة"]],
};
const SEED_INCOME = {
  en: [["salary", "Salary"], ["freelance", "Freelance"], ["business", "Business"], ["income", "Other Income"]],
  ar: [["salary", "راتب"], ["freelance", "عمل حر"], ["business", "تجارة"], ["income", "دخل آخر"]],
};
const PALETTE = ["#0E9F6E", "#2563EB", "#7C3AED", "#D97706", "#E5544E", "#EC4899"];

function seedCategories(group, lang) {
  return group.map(([glyph, name], i) => ({ id: newId(), name, glyph, color: PALETTE[i % PALETTE.length], group: "daily" }));
}

export function applyFirstRunDefaults() {
  // Only on a genuinely untouched device — as soon as any of these three
  // keys exist, treat it as a returning user and change nothing.
  const fresh = loadKey(KEYS.seenWelcome, null) == null
    && loadKey(KEYS.expCats, null) == null
    && loadKey(KEYS.currency, null) == null;
  if (!fresh) return;

  const lang = isArabic() ? "ar" : "en";
  saveKey(KEYS.currency, detectCurrency());
  saveKey(KEYS.expCats, seedCategories(SEED_EXPENSE[lang], lang));
  saveKey(KEYS.incCats, seedCategories(SEED_INCOME[lang], lang));
}
