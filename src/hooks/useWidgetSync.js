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
  // Everything the snapshot reads has to be watched, or the widget quietly keeps
  // showing an older one: editing quick actions never re-synced, so a new
  // shortcut only appeared on the next launch.
  const quickActions = store.quickActions;
  const expCats = store.expCats;
  const bills = store.bills;
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
  }, [banks, txns, savings, currency, quickActions, expCats, bills]); // eslint-disable-line react-hooks/exhaustive-deps
}
