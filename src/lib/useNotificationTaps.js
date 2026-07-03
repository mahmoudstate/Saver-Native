// Saver — tapping an OS notification (from outside the app, or app killed)
// jumps straight to the bill/installment it was about, instead of dropping the
// user on Home. Matches the in-app notification inbox, which already does this
// via each item's `nav` (see lib/notifications.js).
import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export function useNotificationTaps(store, push) {
  const stateRef = useRef({ store, push });
  stateRef.current = { store, push };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handler = ({ notification }) => {
      const extra = notification?.extra;
      if (!extra) return;
      const { store: s, push: p } = stateRef.current;
      if (extra.kind === "bill") {
        const bill = (s.bills || []).find((b) => b.id === extra.id);
        if (bill) p({ type: "sub", bill });
      } else if (extra.kind === "installment") {
        const inst = (s.installments || []).find((i) => i.id === extra.id);
        if (inst) p({ type: "inst", instId: inst.id });
      }
    };
    const sub = LocalNotifications.addListener("localNotificationActionPerformed", handler);
    return () => { sub.then((h) => h.remove()); };
  }, []);
}
