// Saver — voice-to-expense bottom sheet: records speech, sends the transcript
// to Saver-AI-Server for parsing, then lets the user confirm before it fills
// the Add screen's amount/category/note.
import { useEffect, useState } from "react";
import Ico from "./Ico.jsx";
import CatTile from "./CatTile.jsx";
import BankLogo from "./BankLogo.jsx";
import { fmt } from "../lib/format.js";
import { useVoiceExpense } from "../lib/useVoiceExpense.js";
import { resolveCat } from "./cats.js";
import { useT } from "../lib/i18n.js";

export default function VoiceExpenseSheet({ expCats, banks, lang, onApply, onClose }) {
  const tr = useT();
  // The speech language is independent of the app's display language — a
  // user running the app in English may still want to speak Arabic.
  const [voiceLang, setVoiceLang] = useState(lang);
  const { phase, transcript, result, error, start, stop, reset } = useVoiceExpense({ expCats, banks, lang: voiceLang });

  useEffect(() => { start(); /* (re)start listening on open, and whenever voiceLang changes */ }, [voiceLang]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => { stop(); onClose(); };
  const retry = () => { reset(); start(); };

  return (
    <>
      <div className="dim" onClick={close} />
      <div className="sheet" role="dialog" aria-label={tr("voice.title")}>
        <div className="grab" />
        <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -.3 }}>{tr("voice.title")}</div>
          <div className="grow" style={{ flex: 1 }} />
          <div className="hib" style={{ background: "var(--surface2)", color: "var(--muted)" }} onClick={close}><Ico name="close" size={18} /></div>
        </div>

        {(phase === "listening" || phase === "idle") && (
          <div style={{ textAlign: "center", padding: "28px 0 10px" }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
              {["en", "ar"].map((l) => (
                <div key={l} onClick={() => l !== voiceLang && setVoiceLang(l)}
                  style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: "pointer", background: voiceLang === l ? "var(--ac)" : "var(--surface2)", color: voiceLang === l ? "var(--onacc)" : "var(--muted)" }}>
                  {l === "en" ? "English" : "العربية"}
                </div>
              ))}
            </div>
            <div className={phase === "listening" ? "voice-pulse" : ""} style={{ width: 72, height: 72, borderRadius: 36, background: "var(--acDim)", color: "var(--acText)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Ico name="mic" size={30} />
            </div>
            <div style={{ fontWeight: 700 }}>{tr("voice.listening")}</div>
            <div className="caption" style={{ marginTop: 6, minHeight: 18 }}>{transcript || tr("voice.tapToSpeak")}</div>
          </div>
        )}

        {phase === "processing" && (
          <div style={{ textAlign: "center", padding: "28px 0 10px" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: "var(--acDim)", color: "var(--acText)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Ico name="sparkles" size={28} />
            </div>
            <div style={{ fontWeight: 700 }}>{tr("voice.processing")}</div>
            <div className="caption" style={{ marginTop: 6 }}>{transcript}</div>
          </div>
        )}

        {phase === "done" && result && (
          <>
            <div className="field" style={{ marginTop: 10 }}>
              <CatTile cat={result.matchedCat ? resolveCat({ catId: result.matchedCat.id, catGlyph: result.matchedCat.glyph, catName: result.matchedCat.name }) : "other"} name={result.matchedCat?.name || result.category} size={42} />
              <div style={{ minWidth: 0 }}>
                <div className="fl">{result.merchant || tr("voice.title")}</div>
                <div className="fv">{result.matchedCat?.name || result.category || tr("add.whyCategory")}</div>
              </div>
              <div className="tnum" style={{ fontWeight: 800, fontSize: 18 }}>{fmt(result.amount)}</div>
            </div>
            {result.matchedBank && (
              <div className="field" style={{ marginTop: 8 }}>
                <BankLogo name={result.matchedBank.name} domain={result.matchedBank.domain} glyph={result.matchedBank.glyph} color={result.matchedBank.color} size={42} radius={13} iconSize={19} />
                <div style={{ minWidth: 0 }}>
                  <div className="fl">{tr("add.account")}</div>
                  <div className="fv">{result.matchedBank.name}</div>
                </div>
              </div>
            )}
            <div className="caption" style={{ marginTop: 10, textAlign: "center" }}>{tr("voice.confirmHint")}</div>
            <div className="cta" style={{ display: "flex", gap: 10, marginTop: 16, position: "static" }}>
              <div className="btn btn-full" style={{ background: "var(--surface2)", color: "var(--text)" }} onClick={retry}>{tr("voice.tryAgain")}</div>
              <div className="btn btn-primary btn-full" onClick={() => onApply(result)}><Ico name="check" size={19} />{tr("voice.useThis")}</div>
            </div>
          </>
        )}

        {phase === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0 10px" }}>
            <div style={{ fontWeight: 700, color: "var(--red)" }}>
              {error === "permission-denied" ? tr("voice.errorPermission") : error === "no-speech" ? tr("voice.errorNoSpeech") : tr("voice.errorGeneric")}
            </div>
            <div className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={retry}>{tr("voice.tryAgain")}</div>
          </div>
        )}
      </div>
    </>
  );
}
