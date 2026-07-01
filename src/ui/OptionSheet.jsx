// Saver — simple single-choice sheet: a clean list of options, tap to pick & close.
// Matches the category picker. Used for Reminder and other small button choices.
import Ico from "./Ico.jsx";

export default function OptionSheet({ title, sub, options, value, onPick, onClose }) {
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{title}</div>
        {sub && <div className="caption" style={{ margin: "3px 0 0" }}>{sub}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {options.map((o) => {
            const on = value === o.value;
            return (
              <div key={o.value} className="icard" onClick={() => onPick(o.value)} style={{ cursor: "pointer", border: on ? "1.5px solid var(--ac)" : undefined }}>
                <div className="nm" style={{ flex: 1 }}>{o.label}</div>
                {on && <span style={{ color: "var(--ac)" }}><Ico name="check" size={18} /></span>}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
