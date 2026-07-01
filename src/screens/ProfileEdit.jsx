// Saver — Edit profile (opened from the Profile gear): name, photo, currency.
import { useState, useRef } from "react";
import Ico from "../ui/Ico.jsx";
import AvatarCropper from "../ui/AvatarCropper.jsx";
import { CURRENCIES } from "../lib/format.js";
import { useT } from "../lib/i18n.js";

function CurrencySheet({ value, onPick, onClose }) {
  const tr = useT();
  return (
    <>
      <div className="dim" onClick={onClose} />
      <div className="sheet">
        <div className="grab" />
        <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: -.3 }}>{tr("pedit.currency")}</div>
        <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 600, margin: "3px 0 14px" }}>{tr("pedit.currencyCaption")}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: "52vh", overflowY: "auto" }}>
          {CURRENCIES.map((cur) => (
            <div key={cur.code} className="icard" onClick={() => { onPick(cur.code); onClose(); }} style={{ cursor: "pointer", border: value === cur.code ? "1.5px solid var(--ac)" : "1px solid var(--catTileBorder)" }}>
              <span className="circ" style={{ width: 38, height: 38, borderRadius: 11, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, lineHeight: 1 }}>{cur.flag}</span>
              <div style={{ flex: 1 }}><div className="nm">{cur.code}</div><div className="mt">{tr("currencies." + cur.code)}</div></div>
              {value === cur.code && <span className="amtb"><Ico name="check" size={18} color="var(--ac)" /></span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}><div className="btn btn-secondary btn-full" onClick={onClose}>{tr("ui.done")}</div></div>
      </div>
    </>
  );
}

export default function ProfileEdit({ store, back }) {
  const { username, avatar, currency } = store;
  const [name, setName] = useState(username || "");
  const [cur, setCur] = useState(currency); // draft — committed on Save, like the name
  const [curOpen, setCurOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState(null); // image awaiting crop
  const fileRef = useRef(null);
  const initial = (name || username || "Y").slice(0, 1).toUpperCase();
  const tr = useT();

  // read the picked file → open the cropper; the cropper produces the final avatar
  const onFile = (e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = () => setCropSrc(r.result); r.readAsDataURL(f); } e.target.value = ""; };
  const save = () => { store.set("username", name.trim()); store.set("currency", cur); store.flash({ title: tr("pedit.profileSaved"), sub: name.trim() || tr("profile.yourName"), color: "var(--success)", icon: "check" }); back(); };

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("profile.editProfile")}</div><div className="grow" /></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, position: "relative", zIndex: 1, paddingTop: 6 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", overflow: "hidden", background: "rgba(255,255,255,.28)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 34, color: "var(--heroText)" }}>
              {avatar ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initial}
            </div>
            <div onClick={() => fileRef.current?.click()} style={{ position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: "50%", background: "var(--ac)", color: "var(--onAcc, #11231d)", display: "flex", alignItems: "center", justifyContent: "center", border: "2.5px solid var(--hero)", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,.25)" }}><Ico name="camera" size={15} color="#11231d" /></div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          {avatar
            ? <div onClick={() => store.set("avatar", "")} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--heroSub)", cursor: "pointer" }}>{tr("pedit.removePhoto")}</div>
            : <div onClick={() => fileRef.current?.click()} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--heroSub)", cursor: "pointer" }}>{tr("pedit.addPhoto")}</div>}
        </div>
      </div>

      <div className="over">{tr("profile.yourName")}</div>
      <label className="field" style={{ marginBottom: 18 }}>
        <span className="circ" style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface2)", color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="user" size={19} /></span>
        <div style={{ flex: 1 }}><div className="fl">{tr("editor.name")}</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("profile.yourName")} style={{ border: "none", background: "none", outline: "none", color: "var(--text)", font: "inherit", fontSize: 15, fontWeight: 700, marginTop: 2, width: "100%" }} />
        </div><span className="chev"><Ico name="pencil" size={17} /></span>
      </label>

      <div className="over">{tr("pedit.preferences")}</div>
      <div className="icard" onClick={() => setCurOpen(true)} style={{ cursor: "pointer" }}>
        <span className="circ" style={{ width: 36, height: 36, borderRadius: 11, background: "var(--acDim)", color: "var(--ac)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ico name="coins" size={19} /></span>
        <div className="nm">{tr("pedit.currency")}</div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, color: "var(--faint)" }}><span style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 16, lineHeight: 1 }}>{CURRENCIES.find((c) => c.code === cur)?.flag}</span>{cur}</span><Ico name="chev" size={18} /></div>
      </div>

      <div className="cta"><div className="btn btn-primary btn-full" onClick={save}><Ico name="check" size={18} />{tr("editor.saveShort")}</div></div>

      {curOpen && <CurrencySheet value={cur} onPick={(c) => setCur(c)} onClose={() => setCurOpen(false)} />}
      {cropSrc && <AvatarCropper src={cropSrc} onCancel={() => setCropSrc(null)} onDone={(d) => { store.set("avatar", d); setCropSrc(null); }} />}
    </div>
  );
}
