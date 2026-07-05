// One-time, fresh-install-only correction: re-derives currency (and the
// Arabic/English prompt flag) from the device's true native Region, since the
// JS guess made at first-run (navigator.language) can be wrong on iOS.
// `data.regionCorrected` is false only right after a fresh install (see
// firstRunDefaults.js); every existing/returning install defaults to true
// and is left untouched.
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { getDeviceRegion } from "../lib/deviceRegion.js";
import { currencyForRegion, needsLangChoiceForRegion } from "../lib/firstRunDefaults.js";

export function useNativeRegionCorrection(data, set) {
  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios" || data.regionCorrected) return;
    (async () => {
      const region = await getDeviceRegion().catch(() => null);
      if (region) {
        const currency = currencyForRegion(region);
        if (currency !== data.currency) set("currency", currency);
        const needsLangChoice = needsLangChoiceForRegion(region);
        if (needsLangChoice !== data.needsLangChoice) set("needsLangChoice", needsLangChoice);
      }
      set("regionCorrected", true);
    })();
  }, [data.regionCorrected]);
}
