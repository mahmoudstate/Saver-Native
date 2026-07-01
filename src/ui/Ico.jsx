// Saver — icon set (paths match the design-system showcase / ds.js).
const D = "currentColor";
export const MARKS = {
  search: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  cal: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>`,
  back: `<path d="m15 18-6-6 6-6"/>`,
  transfer: `<path d="M7 8h11l-3-3M17 16H6l3 3"/>`,
  chev: `<path d="m9 18 6-6-6-6"/>`,
  close: `<path d="M6 6 18 18M18 6 6 18"/>`,
  check: `<path d="m20 6-11 11-5-5"/>`,
  note: `<path d="M4 7h16M4 12h16M4 17h10"/>`,
  more: `<circle cx="5" cy="12" r="1.6" fill="${D}" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="${D}" stroke="none"/><circle cx="19" cy="12" r="1.6" fill="${D}" stroke="none"/>`,
  lock: `<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  bell: `<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>`,
  eye: `<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>`,
  eyeOff: `<path d="M9.9 4.2A9 9 0 0 1 12 4c5 0 9 5 9 8a13 13 0 0 1-1.7 2.7M6.6 6.6C3.6 8.2 2 11 2 12c0 1.5 4 7 10 7a9 9 0 0 0 3.5-.7"/><path d="m2 2 20 20"/>`,
  wallet: `<path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v3M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M3 7h16"/><circle cx="17" cy="13" r="1.4" fill="${D}" stroke="none"/>`,
  zap: `<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>`,
  card: `<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/>`,
  target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3" fill="${D}" stroke="none"/>`,
  layers: `<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>`,
  home: `<path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"/>`,
  activity: `<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.5" cy="7" r="1.4" fill="${D}" stroke="none"/><circle cx="4.5" cy="12" r="1.4" fill="${D}" stroke="none"/><circle cx="4.5" cy="17" r="1.4" fill="${D}" stroke="none"/>`,
  you: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>`,
  bills: `<path d="M6 3h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3L6 20Z"/><path d="M9 8h6M9 12h5"/>`,
  shield: `<path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z"/>`,
  sparkles: `<path d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3Z"/><path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z"/>`,
  palette: `<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-.5-.3-.9-.5-1.3-.2-.3-.4-.7-.4-1.1 0-.9.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5c0-3.9-4-7.4-9-7.4Z"/><circle cx="7.5" cy="11" r="1.2" fill="${D}" stroke="none"/><circle cx="12" cy="7.5" r="1.2" fill="${D}" stroke="none"/><circle cx="16.5" cy="11" r="1.2" fill="${D}" stroke="none"/>`,
  download: `<path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14"/>`,
  trash: `<path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13h10l1-13"/>`,
  grip: `<circle cx="9" cy="6" r="1.4" fill="${D}" stroke="none"/><circle cx="15" cy="6" r="1.4" fill="${D}" stroke="none"/><circle cx="9" cy="12" r="1.4" fill="${D}" stroke="none"/><circle cx="15" cy="12" r="1.4" fill="${D}" stroke="none"/><circle cx="9" cy="18" r="1.4" fill="${D}" stroke="none"/><circle cx="15" cy="18" r="1.4" fill="${D}" stroke="none"/>`,
  pencil: `<path d="M4 20h4L18.5 9.5a2 2 0 0 0-3-3L4 16v4Z"/>`,
  link: `<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 0 1 0 10h-2"/><path d="M8 12h8"/>`,
  moon: `<path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8Z"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>`,
  crown: `<path d="M4 8l3.7 3L12 5l4.3 6L20 8l-1.6 9.5H5.6L4 8Z"/><path d="M5.6 20.5h12.8"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>`,
  share: `<path d="M12 3v13"/><path d="m8 7 4-4 4 4"/><path d="M6 12H5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1h-1"/>`,
  book: `<path d="M4 5a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5Z"/><path d="M4 17a2 2 0 0 1 2-2h12"/><path d="M9 7h5"/>`,
  arrowUp: `<path d="M12 19V5M5 12l7-7 7 7"/>`,
  arrowDown: `<path d="M12 5v14M5 12l7 7 7-7"/>`,
  down: `<path d="M12 5v14M19 12l-7 7-7-7"/>`,
  funnel: `<path d="M3 5h18l-7 8.5V20l-4-2.5v-4z"/>`,
  contactless: `<path d="M5 11a3 3 0 0 1 0 2M9 8.5a6.5 6.5 0 0 1 0 7M13 6a10 10 0 0 1 0 12"/>`,
  gear: `<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>`,
  camera: `<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3.2"/>`,
  device: `<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>`,
  coins: `<ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3"/><path d="M15 11.5c2.8.3 6 1.5 6 3.5 0 1.7-2.7 3-6 3-1.2 0-2.3-.2-3.2-.5"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>`,
};

// Horizontal/directional glyphs that must mirror under RTL (back arrow + row chevron).
const DIR_ICONS = new Set(["back", "chev"]);

export default function Ico({ name, size = 18, color = "currentColor", stroke = 2, style = {} }) {
  const d = MARKS[name];
  if (!d) return null;
  return <svg className={DIR_ICONS.has(name) ? "dirico" : undefined} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, display: "block", ...style }} dangerouslySetInnerHTML={{ __html: d }} />;
}
