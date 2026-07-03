// Saver — bridges to SpeechBridgePlugin (ios/App/App/SpeechBridgePlugin.swift),
// our own on-device speech-to-text wrapper around Apple's Speech framework.
import { registerPlugin } from "@capacitor/core";

export const NativeSpeech = registerPlugin("SpeechBridge");
