import React, { useEffect } from 'react';

export default function Privacy({ onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div style={{
      background: "#0f0f13", color: "#8888a8", fontFamily: "'Inter', 'Cairo', sans-serif",
      padding: "24px 16px 40px", minHeight: "100vh", display: "flex", flexDirection: "column",
      boxSizing: "border-box"
    }}>
      <div style={{ maxWidth: "520px", margin: "0 auto", width: "100%", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#8888a8", fontSize: 22, cursor: "pointer", padding: "10px 15px 10px 0", display: "flex", alignItems: "center", marginRight: 4 }}>
            <span style={{ display: "block", transform: "translateY(-1px)" }}>❮</span>
          </button>
          <div style={{ color: "#e8e8f0", fontSize: 22, fontWeight: 800 }}>Privacy Policy</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          <div style={{ background: "#17171f", padding: "18px", borderRadius: "16px", border: "1px solid #2a2a38" }}>
            <h3 style={{ color: "#6ee7b7", margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>1. 100% Offline (Local Storage)</h3>
            <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.6", color: "#8888a8" }}>
              <strong style={{ color: "#e8e8f0" }}>Saver</strong> is designed to work completely offline. All your accounts, budgets, and daily expenses are securely stored solely within your device's local storage, protected by your device's own security sandbox.
            </p>
          </div>

          <div style={{ background: "#17171f", padding: "18px", borderRadius: "16px", border: "1px solid #2a2a38" }}>
            <h3 style={{ color: "#60a5fa", margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>2. Zero Data Collection</h3>
            <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.6", color: "#8888a8" }}>
              We do not own external servers to collect your data, nor do we track your movements within the app. Your financial information is yours alone, and no third party can access it.
            </p>
          </div>

          <div style={{ background: "#17171f", padding: "18px", borderRadius: "16px", border: "1px solid #2a2a38" }}>
            <h3 style={{ color: "#e8e8f0", margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>3. Data Safety</h3>
            <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.6", color: "#8888a8" }}>
              The app relies on your device's built-in browser local storage to save records. Your data never leaves your device and is never transmitted over any network. Please remember that permanently clearing your browser cache may erase the data, so we always recommend using the built-in Backup feature.
            </p>
          </div>

          <div style={{ background: "#17171f", padding: "18px", borderRadius: "16px", border: "1px solid #2a2a38" }}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>4. Device Security</h3>
            <p style={{ margin: "0", fontSize: "13.5px", lineHeight: "1.6", color: "#8888a8" }}>
              Your data is protected by your device's native security features, including iOS Sandbox protection on Apple devices. We recommend keeping your device's screen lock and passcode enabled for maximum protection of your financial data.
            </p>
          </div>

        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 40, width: "100%" }}>
        <div style={{ color: "#60a5fa", opacity: 0.8, fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Saver One V1.2</div>
        <div style={{ color: "#60a5fa", opacity: 0.6, fontSize: "10px", fontWeight: "500" }}>Offline & 100% Private · Powered by Mahmoud © 2026</div>
      </div>
    </div>
  );
}
