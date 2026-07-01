// Saver — global overlays: blocking AlertModal + ConfirmModal + transient Toast.
// Ported 1:1 from the showcase .dialog / .toast helpers. Friendly hybrid messaging.
import Ico from "./Ico.jsx";
import ConfettiBurst from "./ConfettiBurst.jsx";
import { useT } from "../lib/i18n.js";

const tile = (color) => ({ background: `color-mix(in srgb, ${color} 16%, transparent)`, color });

export function AlertModal({ data, onClose }) {
  const tr = useT();
  if (!data) return null;
  const color = data.color || "var(--ac)";
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-label={data.title}>
        <div className="dico" style={tile(color)}><Ico name={data.icon || "bell"} size={26} color={color} /></div>
        <div className="dttl">{data.title}</div>
        <div className="dmsg">{data.message}</div>
        <div className="drow">
          <button className="btn btn-primary btn-full" onClick={onClose}>{data.okText || tr("ui.gotIt")}</button>
        </div>
      </div>
    </>
  );
}

export function ConfirmModal({ data, onClose }) {
  const tr = useT();
  if (!data) return null;
  const color = data.color || "var(--red)";
  const run = () => { data.onConfirm?.(); onClose(); };
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="dialog" role="alertdialog" aria-label={data.title}>
        <div className="dico" style={tile(color)}><Ico name={data.icon || (data.danger ? "trash" : "bell")} size={26} color={color} /></div>
        <div className="dttl">{data.title}</div>
        <div className="dmsg">{data.message}</div>
        <div className="drow">
          <button className="btn btn-ghost btn-full" onClick={onClose}>{data.cancelText || tr("ui.cancel")}</button>
          <button className={`btn btn-full ${data.danger ? "btn-danger" : "btn-primary"}`} onClick={run}>{data.confirmText || tr("ui.confirm")}</button>
        </div>
      </div>
    </>
  );
}

// Semantic toast presets — one consistent color+icon per intent, drawn from the
// app's own tokens. flash() can pass { type } instead of hand-picking color/icon;
// an explicit color/icon still overrides the preset for one-off cases.
export const TOAST_TYPES = {
  success: { color: "var(--success)", icon: "check" },
  info:    { color: "var(--blue)",    icon: "info" },
  warning: { color: "var(--yellow)",  icon: "bell" },
  danger:  { color: "var(--red)",     icon: "close" },
  neutral: { color: "var(--muted)",   icon: "check" },
};

// Legacy calls pass a raw color and no type/icon. Map that color to a preset so
// they still get a sensible icon — and so odd tokens (acText) read as success.
const COLOR_TO_TYPE = {
  "var(--success)": "success", "var(--acText)": "success", "var(--ac)": "success",
  "var(--blue)": "info", "var(--yellow)": "warning", "var(--red)": "danger",
  "var(--muted)": "neutral", "var(--purple)": "info",
};

export function Toast({ data }) {
  if (!data) return null;
  const preset = TOAST_TYPES[data.type] || TOAST_TYPES[COLOR_TO_TYPE[data.color]] || TOAST_TYPES.success;
  const color = preset.color; // normalize to a palette color so the tint matches the app
  const icon = data.icon || preset.icon;
  return (
    <div className="toast" role="status">
      <span className="ic" style={tile(color)}><Ico name={icon} size={20} /></span>
      <div><div className="tx">{data.title}</div>{data.sub && <div className="ts">{data.sub}</div>}</div>
    </div>
  );
}

// Single mount point: renders whichever overlay the store currently holds.
export default function Overlays({ store }) {
  return (
    <>
      <Toast data={store.toast} />
      <ConfirmModal data={store.confirm} onClose={() => store.setConfirm(null)} />
      <AlertModal data={store.alert} onClose={() => store.setAlert(null)} />
      {store.confetti > 0 && <ConfettiBurst key={store.confetti} />}
    </>
  );
}
