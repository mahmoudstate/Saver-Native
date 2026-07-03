// Saver — voice-to-expense: on-device speech recognition (SpeechBridgePlugin,
// our own Swift wrapper around Apple's Speech framework — see
// ios/App/App/SpeechBridgePlugin.swift), then the transcript is sent to our
// own small server (Saver-AI-Server on Vercel), which is the only thing
// holding the Anthropic key. The app never talks to Anthropic directly.
import { useRef, useState, useCallback } from "react";
import { NativeSpeech } from "./nativeSpeech.js";
import { HAPTICS } from "./format.js";

const SERVER_URL = import.meta.env.VITE_AI_SERVER_URL;
const SHARED_SECRET = import.meta.env.VITE_AI_SHARED_SECRET;
const SILENCE_MS = 1500; // auto-stop this long after the transcript last changed

// Best-effort match of the AI's free-text category/merchant guess onto one
// of the user's real categories — falls back to null (user picks manually).
const matchCategory = (expCats, aiCategory, aiMerchant) => {
  const needle = (aiCategory || "").toLowerCase();
  const merchant = (aiMerchant || "").toLowerCase();
  return (
    expCats.find((c) => c.name.toLowerCase() === needle) ||
    expCats.find((c) => needle && c.name.toLowerCase().includes(needle)) ||
    expCats.find((c) => merchant && merchant.includes(c.name.toLowerCase())) ||
    null
  );
};

// Same idea, but against the user's real bank accounts — only fires when the
// AI actually heard a source account mentioned ("...from HSBC").
const matchBank = (banks, aiAccount) => {
  const needle = (aiAccount || "").toLowerCase();
  if (!needle) return null;
  return (
    banks.find((b) => b.name.toLowerCase() === needle) ||
    banks.find((b) => b.name.toLowerCase().includes(needle) || needle.includes(b.name.toLowerCase())) ||
    null
  );
};

export function useVoiceExpense({ expCats, banks = [], lang }) {
  const [phase, setPhase] = useState("idle"); // idle | listening | processing | done | error
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null); // { amount, currency, merchant, category, matchedCat }
  const [error, setError] = useState(null);
  const listenerRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const sessionRef = useRef(0); // guards against a stale start() (e.g. switching voice language mid-listen) clobbering a newer one's refs

  const clearSilenceTimer = () => { if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; } };

  const reset = useCallback(() => {
    setPhase("idle"); setTranscript(""); setResult(null); setError(null);
  }, []);

  const parseTranscript = useCallback(async (text) => {
    setPhase("processing");
    try {
      const res = await fetch(`${SERVER_URL}/api/parse-expense`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-app-secret": SHARED_SECRET },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok || !data.amount) throw new Error(data.error || "no-amount");
      const matchedCat = matchCategory(expCats, data.category, data.merchant);
      const matchedBank = matchBank(banks, data.account);
      setResult({ ...data, matchedCat, matchedBank });
      setPhase("done");
      HAPTICS.success();
    } catch (e) {
      setError(e.message || "parse-failed");
      setPhase("error");
      HAPTICS.warning();
    }
  }, [expCats, banks]);

  const stop = useCallback(async () => {
    clearSilenceTimer();
    try { await NativeSpeech.stop(); } catch { /* already stopped */ }
  }, []);

  const start = useCallback(async () => {
    // Stop whatever session came before (e.g. the user just switched EN/AR)
    // before touching any shared refs, so its late-arriving continuation
    // can't clobber this new session's listener/timer.
    const mySession = ++sessionRef.current;
    clearSilenceTimer();
    try { await NativeSpeech.stop(); } catch { /* nothing was running */ }
    if (sessionRef.current !== mySession) return; // superseded again while stopping

    setError(null);
    setTranscript("");
    try {
      const { granted } = await NativeSpeech.requestPermissions();
      if (sessionRef.current !== mySession) return;
      if (!granted) { setError("permission-denied"); setPhase("error"); return; }

      HAPTICS.medium();
      setPhase("listening");
      let lastMatch = "";

      listenerRef.current = await NativeSpeech.addListener("partialResults", (data) => {
        if (sessionRef.current !== mySession) return;
        lastMatch = data.matches?.[0] || lastMatch;
        setTranscript(lastMatch);
        clearSilenceTimer();
        silenceTimerRef.current = setTimeout(stop, SILENCE_MS);
      });
      if (sessionRef.current !== mySession) return;

      const res = await NativeSpeech.start({ language: lang === "ar" ? "ar-EG" : "en-US" });
      if (sessionRef.current !== mySession) return; // a newer session already owns the listener/timer

      listenerRef.current?.remove();
      listenerRef.current = null;
      clearSilenceTimer();
      const finalText = res?.matches?.[0] || lastMatch;
      if (finalText) await parseTranscript(finalText);
      else { setError("no-speech"); setPhase("error"); }
    } catch (e) {
      if (sessionRef.current !== mySession) return;
      clearSilenceTimer();
      listenerRef.current?.remove();
      listenerRef.current = null;
      setError(e.message || "recognition-failed");
      setPhase("error");
    }
  }, [lang, stop, parseTranscript]);

  return { phase, transcript, result, error, start, stop, reset };
}
