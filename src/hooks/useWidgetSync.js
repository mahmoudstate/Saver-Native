// Pushes the latest numbers (and rasterised logos) into the widget's shared
// App Group storage whenever the money data changes, and once on launch. iOS
// only for now. Safe no-op until the native SaverWidget plugin is wired, so
// the web build never breaks.
import { useEffect, useRef } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { buildWidgetData } from "../lib/widgetData.js";

const SaverWidget = registerPlugin("SaverWidget");

function pushToWidget(store) {
  return buildWidgetData(store)
    .then((data) => {
      try { SaverWidget.sync({ data: JSON.stringify(data) }); } catch { /* plugin not ready */ }
    })
    .catch(() => { /* ignore */ });
}

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

  const storeRef = useRef(store);
  storeRef.current = store;

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

  // WidgetKit's timeline policy is `.never` — once a widget is placed, it only
  // redraws when the app explicitly tells WidgetKit to reload. If a widget got
  // added (or a backup got restored) in the gap before the effect above
  // finished its async build, it's stuck on that snapshot until something else
  // changes the data. Re-pushing on every foreground return closes that gap
  // within seconds of reopening the app, independent of which field changed.
  useEffect(() => {
    if (Capacitor.getPlatform() !== "ios") return;
    const h = CapApp.addListener("appStateChange", ({ isActive }) => {
      if (isActive) pushToWidget(storeRef.current);
    });
    return () => { h.then((l) => l.remove()); };
  }, []);
}
