// Saver — real bank/wallet brand logos, bundled offline. Three forms:
// - `p`+`h`: single-path monochrome glyph (Simple Icons source) drawn on a
//   brand-colour tile.
// - `img`: full-colour brand SVG (bank's own mark), drawn on a light tile so
//   its real colours read correctly in both light and dark theme.
// - `img`+`full`: a self-contained square app-icon asset (already has its own
//   background baked in) — drawn edge-to-edge instead of inset on white.
// Same visual in Arabic and English: matched by name, not by display language.
import riyadbank from "../assets/banks/riyadbank.svg";
import alrajhibank from "../assets/banks/alrajhibank.svg";
import danskebank from "../assets/banks/danskebank.svg";
import ulsterbank from "../assets/banks/ulsterbank.svg";
import virginmoney from "../assets/banks/virginmoney.svg";
import revolutIcon from "../assets/banks/revolut-icon.svg";
import stcpay from "../assets/banks/stcpay.svg";
import kastbank from "../assets/banks/kastbank.svg";

export const BANK_ICONS = {
  hsbc: { h: "DB0011", p: "m24 12.007-5.996 5.997V5.996L24 12.007zm-5.996-6.01H6.01l5.996 6.01 5.997-6.01zM0 12.006l6.01 5.997V5.996L0 12.007zm6.01 5.997h11.994l-5.997-5.997-5.996 5.997z" },
  barclays: { h: "00AEEF", p: "M21.043 3.629a3.235 3.235 0 0 0-1.048-.54 3.076 3.076 0 0 0-.937-.144h-.046c-.413.006-1.184.105-1.701.71a1.138 1.138 0 0 0-.226 1.023.9.9 0 0 0 .555.63s.088.032.228.058c-.04.078-.136.214-.136.214-.179.265-.576.612-1.668.612h-.063c-.578-.038-1.056-.189-1.616-.915-.347-.45-.523-1.207-.549-2.452-.022-.624-.107-1.165-.256-1.6-.1-.29-.333-.596-.557-.742a2.55 2.55 0 0 0-.694-.336c-.373-.12-.848-.14-1.204-.146-.462-.01-.717.096-.878.292-.027.033-.032.05-.068.046-.084-.006-.272-.006-.328-.006-.264 0-.498.043-.721.09-.47.1-.761.295-1.019.503-.12.095-.347.365-.399.653a.76.76 0 0 0 .097.578c.14-.148.374-.264.816-.266.493-.002 1.169.224 1.406.608.336.547.27.99.199 1.517-.183 1.347-.68 2.048-1.783 2.203-.191.026-.38.04-.56.04-.776 0-1.34-.248-1.63-.716a.71.71 0 0 1-.088-.168s.087-.021.163-.056c.294-.14.514-.344.594-.661.09-.353.004-.728-.23-1.007-.415-.47-.991-.708-1.713-.708-.4 0-.755.076-.982.14-.908.256-1.633.947-2.214 2.112-.412.824-.7 1.912-.81 3.067-.11 1.13-.056 2.085.019 2.949.124 1.437.363 2.298.708 3.22a15.68 15.68 0 0 0 1.609 3.19c.09-.094.15-.161.308-.318.188-.19.724-.893.876-1.11.19-.27.51-.779.664-1.147l.15.119c.16.127.252.348.249.592-.003.215-.053.464-.184.922a8.703 8.703 0 0 1-.784 1.818c-.189.341-.27.508-.199.584.015.015.038.03.06.026.116 0 .34-.117.585-.304.222-.17.813-.672 1.527-1.675a15.449 15.449 0 0 0 1.452-2.521c.12.046.255.101.317.226a.92.92 0 0 1 .08.563c-.065.539-.379 1.353-.63 1.94-.425.998-1.208 2.115-1.788 2.877-.022.03-.163.197-.186.227.9.792 1.944 1.555 3.007 2.136.725.408 2.203 1.162 3.183 1.424.98-.262 2.458-1.016 3.184-1.424a17.063 17.063 0 0 0 3.003-2.134c-.05-.076-.13-.158-.183-.23-.582-.763-1.365-1.881-1.79-2.875-.25-.59-.563-1.405-.628-1.94-.028-.221-.002-.417.08-.565.033-.098.274-.218.317-.226.405.884.887 1.73 1.452 2.522.715 1.003 1.306 1.506 1.527 1.674.248.191.467.304.586.304a.07.07 0 0 0 .044-.012c.094-.069.017-.234-.183-.594a9.003 9.003 0 0 1-.786-1.822c-.13-.456-.18-.706-.182-.92-.004-.246.088-.466.248-.594l.15-.118c.155.373.5.919.665 1.147.15.216.685.919.876 1.11.156.158.22.222.308.32a15.672 15.672 0 0 0 1.609-3.19c.343-.923.583-1.784.707-3.222.075-.86.128-1.81.02-2.948-.101-1.116-.404-2.264-.81-3.068-.249-.49-.605-1.112-1.171-1.566z" },
  monzo: { h: "14233C", p: "M4.244 1.174a.443.443 0 00-.271.13l-3.97 3.97-.001.001c3.884 3.882 8.093 8.092 11.748 11.748v-8.57L4.602 1.305a.443.443 0 00-.358-.131zm15.483 0a.443.443 0 00-.329.13L12.25 8.456v8.568L24 5.275c-1.316-1.322-2.647-2.648-3.97-3.97a.443.443 0 00-.301-.131zM0 5.979l.002 10.955c0 .294.118.577.326.785l4.973 4.976c.28.282.76.083.758-.314V12.037zm23.998.003l-6.06 6.061v10.338c-.004.399.48.6.76.314l4.974-4.976c.208-.208.326-.49.326-.785z" },
  starling: { h: "6935D3", p: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.738 3.822h.666v2.724h-.666a4.794 4.794 0 0 0-4.789 4.788V12H7.226v-.666c0-4.142 3.37-7.512 7.512-7.512zM14.05 12h2.723v.666c0 4.142-3.37 7.512-7.512 7.512h-.666v-2.724h.666a4.794 4.794 0 0 0 4.789-4.788z" },
  revolut: { img: revolutIcon, full: true },
  wise: { h: "9FE870", p: "M6.488 7.469 0 15.05h11.585l1.301-3.576H7.922l3.033-3.507.01-.092L8.993 4.48h8.873l-6.878 18.925h4.706L24 .595H2.543l3.945 6.874Z" },
  fawry: { h: "FFD300", p: "M1.834 18.305c-1.06-1.594-1.63-3.36-1.79-5.261C-.238 9.474.84 6.34 3.318 3.74 5.311 1.65 7.788.435 10.652.11c2.882-.325 5.538.325 7.966 1.907.227 1.012.037 1.975-.331 2.925-.534 1.398-1.313 2.65-2.19 3.851-.177.251-.447.49-.27.84.197.362.54.233.853.209.65-.062 1.294-.099 1.944-.166.264-.025.368.043.331.337-.073.472-.11.957-.16 1.435-.024.24 0 .46.264.552.27.098.466-.018.626-.24 1.232-1.771 2.336-3.61 2.637-5.806 2.692 4.206 2.09 10.18-1.41 14.055A12.05 12.05 0 0 1 6.09 22.432c-.147-.08-.282-.178-.417-.27.89-.172 1.778-.374 2.618-.73 2.282-.944 4.268-2.342 6.114-3.937.282-.245.454-.294.7.013.208.263.471.484.692.73.172.19.368.318.638.226.264-.086.288-.325.313-.545.251-2.042.49-4.09.748-6.133.055-.447-.141-.68-.601-.637-2.091.171-4.188.35-6.28.54-.508.048-.65.422-.312.815.276.331.576.638.895.92.294.251.313.417 0 .674-1.288 1.073-2.618 2.085-4.09 2.888-1.613.877-3.25 1.668-5.176 1.38h.007c0-.061-.037-.086-.105-.073" },
  riyadbank: { img: riyadbank },
  alrajhibank: { img: alrajhibank },
  danskebank: { img: danskebank },
  ulsterbank: { img: ulsterbank },
  virginmoney: { img: virginmoney },
  stcpay: { img: stcpay },
  kastbank: { img: kastbank, full: true },
};

// Preset list for the bank picker — same anatomy as SUBSCRIPTION_SERVICES.
// `id` is the stable key stored on the account (account.domain) so a picked
// preset always resolves to its real logo, regardless of display language.
export const BANK_PRESETS = [
  { id: "hsbc", name: "HSBC", color: "#DB0011", region: "UK" },
  { id: "barclays", name: "Barclays", color: "#00AEEF", region: "UK" },
  { id: "monzo", name: "Monzo", color: "#14233C", region: "UK" },
  { id: "starling", name: "Starling Bank", color: "#6935D3", region: "UK" },
  { id: "revolut", name: "Revolut", color: "#191C1F", region: "UK" },
  { id: "wise", name: "Wise", color: "#9FE870", region: "UK" },
  { id: "danskebank", name: "Danske Bank", color: "#244B66", region: "UK" },
  { id: "ulsterbank", name: "Ulster Bank", color: "#24466B", region: "UK" },
  { id: "virginmoney", name: "Virgin Money", color: "#CC0000", region: "UK" },
  { id: "fawry", name: "Fawry", color: "#FFD300", region: "Egypt" },
  { id: "alrajhibank", name: "Al Rajhi Bank", color: "#231AFF", region: "Saudi Arabia" },
  { id: "riyadbank", name: "Riyad Bank", color: "#2B256C", region: "Saudi Arabia" },
  { id: "stcpay", name: "stc pay", color: "#512D83", region: "Saudi Arabia" },
  { id: "kastbank", name: "Kast Bank", color: "#080808", region: "Saudi Arabia" },
];
export const BANK_REGIONS = [...new Set(BANK_PRESETS.map((b) => b.region))];
export const POPULAR_BANK_IDS = ["hsbc", "barclays", "monzo", "revolut", "alrajhibank"];

// Alias -> BANK_ICONS key. Language-agnostic: covers common English and
// Arabic spellings so the same real logo shows regardless of which one the
// user typed as their account name. Used as a fallback for accounts that
// pre-date the bank picker (free-text name only, no stored preset id).
// NOTE: keys here must be pre-normalized (no spaces — normalize() strips them
// from the typed name before lookup, so a spaced key would never match).
const BANK_ALIASES = {
  hsbc: "hsbc", "اتشاسبيسي": "hsbc", "اتشإسبيسي": "hsbc",
  barclays: "barclays", "باركليز": "barclays", "بركليز": "barclays",
  monzo: "monzo", "مونزو": "monzo",
  starlingbank: "starling", starling: "starling", "ستارلينج": "starling", "ستارلينغ": "starling",
  revolut: "revolut", "ريفولوت": "revolut", "ريفولت": "revolut",
  wise: "wise", "وايز": "wise",
  fawry: "fawry", "فوري": "fawry",
  danskebank: "danskebank", danske: "danskebank", "دانسكي": "danskebank", "دانسكهبانك": "danskebank",
  ulsterbank: "ulsterbank", ulster: "ulsterbank", "الستربانك": "ulsterbank",
  virginmoney: "virginmoney", "فيرجنموني": "virginmoney",
  alrajhibank: "alrajhibank", alrajhi: "alrajhibank", "الراجحي": "alrajhibank", "مصرفالراجحي": "alrajhibank",
  riyadbank: "riyadbank", riyad: "riyadbank", "الرياض": "riyadbank", "بنكالرياض": "riyadbank",
  stcpay: "stcpay", "استيسيباي": "stcpay",
  kastbank: "kastbank", kast: "kastbank", "كاست": "kastbank", "بنككاست": "kastbank",
};

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]/gu, "");

// domain: stable preset id stored on the account (exact match, preferred).
// name: free-text account name, used as a fallback for pre-existing accounts.
export function resolveBankIcon(domain, name) {
  if (domain && BANK_ICONS[domain]) return BANK_ICONS[domain];
  const n = normalize(name);
  if (!n) return null;
  const key = BANK_ALIASES[n];
  return key ? BANK_ICONS[key] : null;
}
