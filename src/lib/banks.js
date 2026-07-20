// Saver — real bank/wallet brand logos, bundled offline. Three forms:
// - `p`+`h`: single-path monochrome glyph (Simple Icons source) drawn on a
//   brand-colour tile.
// - `img`: full-colour brand SVG (bank's own mark), drawn on a light tile so
//   its real colours read correctly in both light and dark theme.
// - `img`+`full`: a self-contained square app-icon asset (already has its own
//   background baked in) — drawn edge-to-edge instead of inset on white.
// Same visual in Arabic and English: matched by name, not by display language.
import riyadbank from "../assets/banks/riyadbank-icon.svg";
import alrajhibank from "../assets/banks/alrajhibank-icon.svg";
import danskebank from "../assets/banks/danskebank-icon.svg";
import ulsterbank from "../assets/banks/ulsterbank-icon.svg";
import virginmoney from "../assets/banks/virginmoney-icon.svg";
import revolutIcon from "../assets/banks/revolut-icon.svg";
import stcpay from "../assets/banks/stcpay-icon.svg";
import kastbank from "../assets/banks/kastbank.svg";
import snb from "../assets/banks/snb-icon.svg";
import sab from "../assets/banks/sab-icon.svg";
import bsf from "../assets/banks/bsf-icon.svg";
import anb from "../assets/banks/anb-icon.svg";
import albilad from "../assets/banks/albilad-icon.svg";
import aljazira from "../assets/banks/aljazira-icon.svg";
import alinma from "../assets/banks/alinma-icon.svg";
import awwalbank from "../assets/banks/awwalbank-icon.svg";
import fawry from "../assets/banks/fawry-icon.svg";
import nbe from "../assets/banks/nbe-icon.svg";
import banquemisr from "../assets/banks/banquemisr-icon.svg";
import cib from "../assets/banks/cib-icon.svg";
import instapay from "../assets/banks/instapay.svg";
import vodafonecash from "../assets/banks/vodafonecash-icon.svg";
import hsbc from "../assets/banks/hsbc-icon.svg";
import monzo from "../assets/banks/monzo-icon.svg";
import paypal from "../assets/banks/paypal-icon.svg";
import adcb from "../assets/banks/adcb-icon.svg";
import banqueducaire from "../assets/banks/banqueducaire-icon.svg";
import egyptpost from "../assets/banks/egyptpost-icon.svg";
import boubyanbank from "../assets/banks/boubyanbank-icon.svg";
import kfh from "../assets/banks/kfh-icon.svg";
import warbabank from "../assets/banks/warbabank-icon.svg";
import burganbank from "../assets/banks/burganbank-icon.svg";
import gulfbank from "../assets/banks/gulfbank-icon.svg";
import commercialbankqatar from "../assets/banks/commercialbankqatar-icon.svg";
import dukhanbank from "../assets/banks/dukhanbank-icon.svg";
import masrafalrayan from "../assets/banks/masrafalrayan-icon.svg";
import qnb from "../assets/banks/qnb-icon.svg";
import qiib from "../assets/banks/qiib-icon.svg";
import nationwide from "../assets/banks/nationwide-icon.svg";

export const BANK_ICONS = {
  hsbc: { img: hsbc, full: true },
  barclays: { h: "00AEEF", p: "M21.043 3.629a3.235 3.235 0 0 0-1.048-.54 3.076 3.076 0 0 0-.937-.144h-.046c-.413.006-1.184.105-1.701.71a1.138 1.138 0 0 0-.226 1.023.9.9 0 0 0 .555.63s.088.032.228.058c-.04.078-.136.214-.136.214-.179.265-.576.612-1.668.612h-.063c-.578-.038-1.056-.189-1.616-.915-.347-.45-.523-1.207-.549-2.452-.022-.624-.107-1.165-.256-1.6-.1-.29-.333-.596-.557-.742a2.55 2.55 0 0 0-.694-.336c-.373-.12-.848-.14-1.204-.146-.462-.01-.717.096-.878.292-.027.033-.032.05-.068.046-.084-.006-.272-.006-.328-.006-.264 0-.498.043-.721.09-.47.1-.761.295-1.019.503-.12.095-.347.365-.399.653a.76.76 0 0 0 .097.578c.14-.148.374-.264.816-.266.493-.002 1.169.224 1.406.608.336.547.27.99.199 1.517-.183 1.347-.68 2.048-1.783 2.203-.191.026-.38.04-.56.04-.776 0-1.34-.248-1.63-.716a.71.71 0 0 1-.088-.168s.087-.021.163-.056c.294-.14.514-.344.594-.661.09-.353.004-.728-.23-1.007-.415-.47-.991-.708-1.713-.708-.4 0-.755.076-.982.14-.908.256-1.633.947-2.214 2.112-.412.824-.7 1.912-.81 3.067-.11 1.13-.056 2.085.019 2.949.124 1.437.363 2.298.708 3.22a15.68 15.68 0 0 0 1.609 3.19c.09-.094.15-.161.308-.318.188-.19.724-.893.876-1.11.19-.27.51-.779.664-1.147l.15.119c.16.127.252.348.249.592-.003.215-.053.464-.184.922a8.703 8.703 0 0 1-.784 1.818c-.189.341-.27.508-.199.584.015.015.038.03.06.026.116 0 .34-.117.585-.304.222-.17.813-.672 1.527-1.675a15.449 15.449 0 0 0 1.452-2.521c.12.046.255.101.317.226a.92.92 0 0 1 .08.563c-.065.539-.379 1.353-.63 1.94-.425.998-1.208 2.115-1.788 2.877-.022.03-.163.197-.186.227.9.792 1.944 1.555 3.007 2.136.725.408 2.203 1.162 3.183 1.424.98-.262 2.458-1.016 3.184-1.424a17.063 17.063 0 0 0 3.003-2.134c-.05-.076-.13-.158-.183-.23-.582-.763-1.365-1.881-1.79-2.875-.25-.59-.563-1.405-.628-1.94-.028-.221-.002-.417.08-.565.033-.098.274-.218.317-.226.405.884.887 1.73 1.452 2.522.715 1.003 1.306 1.506 1.527 1.674.248.191.467.304.586.304a.07.07 0 0 0 .044-.012c.094-.069.017-.234-.183-.594a9.003 9.003 0 0 1-.786-1.822c-.13-.456-.18-.706-.182-.92-.004-.246.088-.466.248-.594l.15-.118c.155.373.5.919.665 1.147.15.216.685.919.876 1.11.156.158.22.222.308.32a15.672 15.672 0 0 0 1.609-3.19c.343-.923.583-1.784.707-3.222.075-.86.128-1.81.02-2.948-.101-1.116-.404-2.264-.81-3.068-.249-.49-.605-1.112-1.171-1.566z" },
  monzo: { img: monzo, full: true },
  starling: { h: "6935D3", p: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm2.738 3.822h.666v2.724h-.666a4.794 4.794 0 0 0-4.789 4.788V12H7.226v-.666c0-4.142 3.37-7.512 7.512-7.512zM14.05 12h2.723v.666c0 4.142-3.37 7.512-7.512 7.512h-.666v-2.724h.666a4.794 4.794 0 0 0 4.789-4.788z" },
  revolut: { img: revolutIcon, full: true },
  wise: { h: "9FE870", p: "M6.488 7.469 0 15.05h11.585l1.301-3.576H7.922l3.033-3.507.01-.092L8.993 4.48h8.873l-6.878 18.925h4.706L24 .595H2.543l3.945 6.874Z" },
  fawry: { img: fawry, full: true },
  riyadbank: { img: riyadbank, full: true },
  alrajhibank: { img: alrajhibank, full: true },
  danskebank: { img: danskebank, full: true },
  ulsterbank: { img: ulsterbank, full: true },
  virginmoney: { img: virginmoney, full: true },
  stcpay: { img: stcpay, full: true },
  kastbank: { img: kastbank, full: true },
  snb: { img: snb, full: true },
  sab: { img: sab, full: true },
  bsf: { img: bsf, full: true },
  anb: { img: anb, full: true },
  albilad: { img: albilad, full: true },
  aljazira: { img: aljazira, full: true },
  alinma: { img: alinma, full: true },
  awwalbank: { img: awwalbank, full: true },
  nbe: { img: nbe, full: true },
  banquemisr: { img: banquemisr, full: true },
  cib: { img: cib, full: true },
  instapay: { img: instapay, full: true },
  vodafonecash: { img: vodafonecash, full: true },
  paypal: { img: paypal, full: true },
  adcb: { img: adcb, full: true },
  banqueducaire: { img: banqueducaire, full: true },
  egyptpost: { img: egyptpost, full: true },
  boubyanbank: { img: boubyanbank, full: true },
  kfh: { img: kfh, full: true },
  warbabank: { img: warbabank, full: true },
  burganbank: { img: burganbank, full: true },
  gulfbank: { img: gulfbank, full: true },
  commercialbankqatar: { img: commercialbankqatar, full: true },
  dukhanbank: { img: dukhanbank, full: true },
  masrafalrayan: { img: masrafalrayan, full: true },
  qnb: { img: qnb, full: true },
  qiib: { img: qiib, full: true },
  nationwide: { img: nationwide, full: true },
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
  { id: "paypal", name: "PayPal", color: "#2A3466", region: "UK" },
  { id: "nationwide", name: "Nationwide", color: "#0D1A3C", region: "UK" },
  { id: "fawry", name: "Fawry", nameAr: "فوري", color: "#2E6C97", region: "Egypt" },
  { id: "nbe", name: "National Bank of Egypt", nameAr: "البنك الأهلي المصري", color: "#EF6024", region: "Egypt" },
  { id: "banquemisr", name: "Banque Misr", nameAr: "بنك مصر", color: "#E5AC02", region: "Egypt" },
  { id: "cib", name: "CIB", nameAr: "البنك التجاري الدولي", color: "#185CA3", region: "Egypt" },
  { id: "instapay", name: "InstaPay", nameAr: "إنستاباي", color: "#FB6518", region: "Egypt" },
  { id: "vodafonecash", name: "Vodafone Cash", nameAr: "فودافون كاش", color: "#E60000", region: "Egypt" },
  { id: "banqueducaire", name: "Banque du Caire", nameAr: "بنك القاهرة", color: "#E84432", region: "Egypt" },
  { id: "egyptpost", name: "Egypt Post", nameAr: "البريد المصري", color: "#4485C0", region: "Egypt" },
  { id: "adcb", name: "ADCB", nameAr: "بنك أبوظبي التجاري", color: "#EC1C24", region: "Egypt" },
  { id: "alrajhibank", name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", color: "#231AFF", region: "Saudi Arabia" },
  { id: "riyadbank", name: "Riyad Bank", nameAr: "بنك الرياض", color: "#2B256C", region: "Saudi Arabia" },
  { id: "stcpay", name: "stc pay", nameAr: "stc pay", color: "#512D83", region: "Saudi Arabia" },
  { id: "kastbank", name: "Kast Bank", nameAr: "بنك كاست", color: "#080808", region: "Saudi Arabia" },
  { id: "snb", name: "Saudi National Bank", nameAr: "البنك الأهلي السعودي", color: "#82C341", region: "Saudi Arabia" },
  { id: "sab", name: "Saudi Awwal Bank (SAB)", nameAr: "ساب", color: "#D42027", region: "Saudi Arabia" },
  { id: "bsf", name: "Banque Saudi Fransi", nameAr: "البنك السعودي الفرنسي", color: "#002A30", region: "Saudi Arabia" },
  { id: "anb", name: "Arab National Bank", nameAr: "البنك العربي الوطني", color: "#0071CE", region: "Saudi Arabia" },
  { id: "albilad", name: "Bank Albilad", nameAr: "بنك البلاد", color: "#CE0E2D", region: "Saudi Arabia" },
  { id: "aljazira", name: "Bank Aljazira", nameAr: "بنك الجزيرة", color: "#000000", region: "Saudi Arabia" },
  { id: "alinma", name: "Alinma Bank", nameAr: "مصرف الإنماء", color: "#002134", region: "Saudi Arabia" },
  { id: "awwalbank", name: "Bank Al Awwal", nameAr: "البنك الأول", color: "#FBC132", region: "Saudi Arabia" },
  { id: "kfh", name: "Kuwait Finance House (KFH)", nameAr: "بيت التمويل الكويتي", color: "#00693C", region: "Kuwait" },
  { id: "boubyanbank", name: "Boubyan Bank", nameAr: "بنك بوبيان", color: "#D22630", region: "Kuwait" },
  { id: "gulfbank", name: "Gulf Bank", nameAr: "بنك الخليج", color: "#E03A3E", region: "Kuwait" },
  { id: "burganbank", name: "Burgan Bank", nameAr: "بنك برقان", color: "#F79239", region: "Kuwait" },
  { id: "warbabank", name: "Warba Bank", nameAr: "بنك وربة", color: "#2B2560", region: "Kuwait" },
  { id: "qnb", name: "QNB (Qatar National Bank)", nameAr: "بنك قطر الوطني", color: "#870051", region: "Qatar" },
  { id: "dukhanbank", name: "Dukhan Bank", nameAr: "بنك دخان", color: "#1B75BC", region: "Qatar" },
  { id: "masrafalrayan", name: "Masraf Al Rayan", nameAr: "مصرف الريان", color: "#C19545", region: "Qatar" },
  { id: "commercialbankqatar", name: "Commercial Bank of Qatar", nameAr: "البنك التجاري القطري", color: "#9F1C49", region: "Qatar" },
  { id: "qiib", name: "QIIB", nameAr: "بنك قطر الدولي الإسلامي", color: "#CF343E", region: "Qatar" },
];
export const BANK_REGIONS = [...new Set(BANK_PRESETS.map((b) => b.region))];
export const POPULAR_BANK_IDS = ["hsbc", "barclays", "monzo", "revolut", "alrajhibank"];

// Region section order + labels, language-aware. Arabic users see Saudi
// Arabia, Egypt, then Kuwait first, then the rest — matching the app's
// primary Arabic-speaking markets. English keeps the original declaration order.
const REGION_NAME_AR = { "Saudi Arabia": "السعودية", "Egypt": "مصر", "Kuwait": "الكويت", "Qatar": "قطر", "UK": "بريطانيا" };
export function getBankRegions(lang) {
  if (lang !== "ar") return BANK_REGIONS;
  const priority = ["Saudi Arabia", "Egypt", "Kuwait", "Qatar"];
  return [...priority.filter((r) => BANK_REGIONS.includes(r)), ...BANK_REGIONS.filter((r) => !priority.includes(r))];
}
export function bankRegionLabel(region, lang) {
  return lang === "ar" ? (REGION_NAME_AR[region] || region) : region;
}
// Localized display name for a preset: Arabic name when the app is Arabic
// and one exists, English otherwise (also what gets saved on the account).
export function bankDisplayName(preset, lang) {
  return (lang === "ar" && preset.nameAr) ? preset.nameAr : preset.name;
}

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
  snb: "snb", "البنكالاهلي": "snb", "البنكالاهليالسعودي": "snb", "الاهلي": "snb", "الاهليالتجاري": "snb",
  sab: "sab", saudiawwalbank: "sab", "ساب": "sab", "البنكالسعوديالبريطاني": "sab",
  bsf: "bsf", banquesaudifransi: "bsf", "البنكالسعوديالفرنسي": "bsf", "الفرنسي": "bsf",
  anb: "anb", arabnationalbank: "anb", "العربيالوطني": "anb", "البنكالعربيالوطني": "anb",
  albilad: "albilad", bankalbilad: "albilad", "البلاد": "albilad", "بنكالبلاد": "albilad",
  aljazira: "aljazira", bankaljazira: "aljazira", "الجزيره": "aljazira", "بنكالجزيره": "aljazira",
  alinma: "alinma", alinmabank: "alinma", "الانماء": "alinma", "مصرفالانماء": "alinma",
  awwalbank: "awwalbank", alawwalbank: "awwalbank", "الاول": "awwalbank", "البنكالاول": "awwalbank",
  nbe: "nbe", nationalbankofegypt: "nbe", "البنكالاهليالمصري": "nbe", "الاهليالمصري": "nbe",
  banquemisr: "banquemisr", bankmisr: "banquemisr", "بنكمصر": "banquemisr",
  cib: "cib", commercialinternationalbank: "cib", "البنكالتجاريالدولي": "cib", "سيايبي": "cib",
  instapay: "instapay", "انستاباي": "instapay", "إنستاباي": "instapay",
  vodafonecash: "vodafonecash", vodafone: "vodafonecash", "فودافونكاش": "vodafonecash", "فودافون": "vodafonecash",
  paypal: "paypal", "بايبال": "paypal",
  nationwide: "nationwide", "نيشنوايد": "nationwide", "نيشن وايد": "nationwide",
  banqueducaire: "banqueducaire", bankofcairo: "banqueducaire", "بنكالقاهره": "banqueducaire",
  egyptpost: "egyptpost", "البريدالمصري": "egyptpost", "بريدمصر": "egyptpost",
  adcb: "adcb", "بنكابوظبيالتجاري": "adcb", "ابوظبيالتجاري": "adcb",
  kfh: "kfh", kuwaitfinancehouse: "kfh", "بيتالتمويلالكويتي": "kfh", "بيتالتمويل": "kfh",
  boubyanbank: "boubyanbank", boubyan: "boubyanbank", "بنكبوبيان": "boubyanbank", "بوبيان": "boubyanbank",
  gulfbank: "gulfbank", "بنكالخليج": "gulfbank", "الخليج": "gulfbank",
  burganbank: "burganbank", burgan: "burganbank", "بنكبرقان": "burganbank", "برقان": "burganbank",
  warbabank: "warbabank", warba: "warbabank", "بنكوربه": "warbabank", "وربه": "warbabank",
  qnb: "qnb", qatarnationalbank: "qnb", "بنكقطرالوطني": "qnb", "قطرالوطني": "qnb",
  dukhanbank: "dukhanbank", dukhan: "dukhanbank", "بنكدخان": "dukhanbank", "دخان": "dukhanbank",
  masrafalrayan: "masrafalrayan", alrayan: "masrafalrayan", "مصرفالريان": "masrafalrayan", "الريان": "masrafalrayan",
  commercialbankqatar: "commercialbankqatar", "البنكالتجاريالقطري": "commercialbankqatar", "التجاريالقطري": "commercialbankqatar",
  qiib: "qiib", "بنكقطرالدوليالاسلامي": "qiib", "قطرالدوليالاسلامي": "qiib",
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
