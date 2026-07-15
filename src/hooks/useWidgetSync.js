// Pushes the latest numbers (and rasterised logos) into the widget's shared
// App Group storage whenever the money data changes, and once on launch. iOS
// only for now. Safe no-op until the native SaverWidget plugin is wired, so
// the web build never breaks.
import { useEffect } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { buildWidgetData } from "../lib/widgetData.js";

const SaverWidget = registerPlugin("SaverWidget");

export function useWidgetSync(store) {
  const banks = store.banks;
  const txns = store.txns;
  const savings = store.savings;
  const currency = store.currency;
  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios") return;
    let cancelled = false;
    buildWidgetData(store)
      .then((data) => {
        if (cancelled) return;
        try { SaverWidget.sync({ data: JSON.stringify(data) }); } catch { /* plugin not ready */ }
      })
      .catch(() => { /* ignore */ });
    return () => { cancelled = true; };
  }, [banks, txns, savings, currency]); // eslint-disable-line react-hooks/exhaustive-deps
}
