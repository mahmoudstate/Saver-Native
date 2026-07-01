import Ico from "./Ico.jsx";

// Marks transactions that were auto-split across banks. Every txn from one split
// shares a splitGroupId; we show a chain icon + the last 3 digits so the user can
// tell which cards belong together (and that deleting one removes the whole set).
export default function LinkBadge({ groupId, size = 12 }) {
  if (!groupId) return null;
  const code = String(groupId).slice(-3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--surface2)", color: "var(--muted)", fontWeight: 700, fontSize: 10.5, padding: "2px 7px", borderRadius: "var(--r-pill)", flexShrink: 0 }}>
      <Ico name="link" size={size} />#{code}
    </span>
  );
}
