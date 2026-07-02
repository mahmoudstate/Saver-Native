// Legacy bank records stored "banknote"/"landmark" glyphs that were never
// real Ico.jsx keys (the real ones are wallet/card) — map old + new values
// to a valid icon name wherever a bank's glyph is rendered.
export const bankIcon = (glyph) => ({ banknote: "wallet", landmark: "card" }[glyph] || glyph || "card");
