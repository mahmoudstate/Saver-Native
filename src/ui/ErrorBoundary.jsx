// Saver — top-level error boundary. Catches any render/runtime crash so the app
// never shows a blank white screen. Offers a self-contained backup export + reload.
// Class component on purpose (error boundaries can't be hooks). Reads storage
// directly via KEYS so it works even when the store/app state is broken.
import { Component } from "react";
import { KEYS, loadKey } from "../lib/store.js";

export default class ErrorBoundary extends Component {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info?.componentStack);
  }

  exportBackup = () => {
    try {
      const date = new Date().toISOString().slice(0, 10);
      const payload = { _app: "Saver", _version: 3, _exported: date };
      for (const k in KEYS) payload[k] = loadKey(KEYS[k], null);
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Saver_Backup_${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Backup failed:", e);
    }
  };

  reload = () => window.location.reload();

  render() {
    if (!this.state.crashed) return this.props.children;
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center", background: "var(--bg, #fff)", color: "var(--text, #111)" }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>Something went wrong</div>
        <div style={{ fontSize: 14, opacity: 0.7, maxWidth: 320, lineHeight: 1.5 }}>
          The app hit an unexpected error. Your data is safe on this device — back it up first, then reload.
        </div>
        <button onClick={this.exportBackup} style={{ padding: "12px 22px", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 15, cursor: "pointer", background: "var(--ac, #5FE3C0)", color: "var(--onAc, #0b3b32)" }}>
          Download backup
        </button>
        <button onClick={this.reload} style={{ padding: "12px 22px", borderRadius: 14, border: "1px solid var(--line, #ddd)", fontWeight: 700, fontSize: 15, cursor: "pointer", background: "transparent", color: "inherit" }}>
          Reload app
        </button>
      </div>
    );
  }
}
