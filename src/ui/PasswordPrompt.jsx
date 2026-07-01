// Password overlay for encrypted backups.
// confirm=true requires the password twice (used when creating a backup).
import { useState } from "react";
import Ico from "./Ico.jsx";

export default function PasswordPrompt({ title, sub, confirm, submitText = "Continue", onSubmit, onCancel }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const go = () => {
    if (pw.length < 4) { setErr("Use at least 4 characters"); return; }
    if (confirm && pw !== pw2) { setErr("Passwords don’t match"); return; }
    onSubmit?.(pw);
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span className="circ" style={{ width: 38, height: 38, borderRadius: 12, background: "var(--acDim)", color: "var(--ac)" }}><Ico name="lock" size={19} /></span>
          <div style={{ color: "var(--text)", fontSize: 17, fontWeight: 800 }}>{title}</div>
        </div>
        {sub && <div style={{ color: "var(--muted)", fontSize: 13, margin: "2px 0 14px" }}>{sub}</div>}

        <div style={field}>
          <input type={show ? "text" : "password"} value={pw} autoFocus placeholder="Password"
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && !confirm && go()} style={input} />
          <span onClick={() => setShow((s) => !s)} style={{ cursor: "pointer", color: "var(--faint)" }}>
            <Ico name={show ? "eyeOff" : "eye"} size={18} />
          </span>
        </div>
        {confirm && (
          <div style={{ ...field, marginTop: 10 }}>
            <input type={show ? "text" : "password"} value={pw2} placeholder="Confirm password"
              onChange={(e) => { setPw2(e.target.value); setErr(""); }}
              onKeyDown={(e) => e.key === "Enter" && go()} style={input} />
          </div>
        )}
        {err && <div style={{ color: "var(--red)", fontSize: 12.5, marginTop: 8, fontWeight: 600 }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={onCancel} style={{ ...btn, background: "var(--surface)", color: "var(--text)", border: "var(--cardBorder)" }}>Cancel</button>
          <button onClick={go} style={{ ...btn, background: "var(--ac)", color: "#fff" }}>{submitText}</button>
        </div>
      </div>
    </div>
  );
}

const wrap = { position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
const card = { width: "100%", maxWidth: 360, background: "var(--bg)", border: "var(--cardBorder)", borderRadius: 22, padding: 20, boxShadow: "var(--elev)" };
const field = { display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "var(--cardBorder)", borderRadius: 13, padding: "12px 14px" };
const input = { flex: 1, border: "none", outline: "none", background: "transparent", color: "var(--text)", fontSize: 15, fontWeight: 600 };
const btn = { flex: 1, border: "none", borderRadius: 13, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer" };
