// Saver — tapping an OS notification (from outside the app, or app killed)
// jumps straight to the bill/installment it was about, instead of dropping the
// user on Home. Matches the in-app notification inbox, which already does this
// via each item's `nav` (see lib/notifications.js).
import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { dayRangeLabel } from "./format.js";

const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// The Monday-Sunday week immediately before the current one, regardless of
// which day the user actually taps the notification on (it stays "last
// week", not a rolling 7 days back from today).
function lastWeekRange() {
  const now = new Date();
  const thisMonday = new Date(now);
  thisMonday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const lastSunday = new Date(thisMonday); lastSunday.setDate(thisMonday.getDate() - 1);
  const lastMonday = new Date(lastSunday); lastMonday.setDate(lastSunday.getDate() - 6);
  const from = iso(lastMonday), to = iso(lastSunday);
  return { mode: "range", from, to, label: dayRangeLabel(from, to) };
}

export function useNotificationTaps(store, push, setBreakdownDate) {
  const stateRef = useRef({ store, push, setBreakdownDate });
  stateRef.current = { store, push, setBreakdownDate };

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const handler = ({ notification }) => {
      const extra = notification?.extra;
      if (!extra) return;
      const { store: s, push: p, setBreakdownDate: setBd } = stateRef.current;
      if (extra.kind === "bill") {
        const bill = (s.bills || []).find((b) => b.id === extra.id);
        if (bill) p({ type: "sub", bill });
      } else if (extra.kind === "installment") {
        const inst = (s.installments || []).find((i) => i.id === extra.id);
        if (inst) p({ type: "inst", instId: inst.id });
      } else if (extra.kind === "weeklyRecap") {
        setBd?.(lastWeekRange());
        p({ type: "breakdown" });
      }
    };
    const sub = LocalNotifications.addListener("localNotificationActionPerformed", handler);
    return () => { sub.then((h) => h.remove()); };
  }, []);
}
