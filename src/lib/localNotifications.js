// Saver — schedules real iOS notifications (Settings ▸ Notifications ▸ Saver)
// for upcoming bills and installments, entirely on-device (no server, no push
// service — matches the app's offline-first privacy model).
//
// Flow: user opts in via the in-app toggle (store.notificationsEnabled) →
// requestNotifPermission() asks the native OS permission once → every time
// bills/installments change, syncScheduledNotifications() clears everything
// Saver previously scheduled and re-schedules fresh from current data, so
// stale/paid reminders never linger.
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { currentMonth } from "./format.js";
import { billPeriod, isBillPaidForKey } from "./billfreq.js";
import { translate } from "./i18n.js";

const native = () => Capacitor.isNativePlatform();

export async function notifPermissionStatus() {
  if (!native()) return "unsupported";
  try { return (await LocalNotifications.checkPermissions()).display; } catch { return "unsupported"; }
}

export async function requestNotifPermission() {
  if (!native()) return false;
  try { return (await LocalNotifications.requestPermissions()).display === "granted"; } catch { return false; }
}

// Stable positive 31-bit int id from a string key — Capacitor notification
// ids must be plain integers, and we need the same key to always map to the
// same id so re-syncing correctly replaces (not duplicates) a reminder.
function idFor(key) {
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = ((h * 33) ^ key.charCodeAt(i)) >>> 0;
  return h % 2147483647;
}

function atReminderTime(dueDate, reminderDays) {
  const d = new Date(dueDate + "T09:00:00");
  d.setDate(d.getDate() - (reminderDays ?? 2));
  return d;
}

export async function syncScheduledNotifications(store) {
  if (!native()) return;
  const perm = await notifPermissionStatus();
  if (perm !== "granted") return;

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) });

  if (!store.notificationsEnabled) return;

  const now = new Date();
  const notifications = [];

  (store.bills || []).forEach((b) => {
    const per = billPeriod(b, new Date().toISOString().slice(0, 10));
    if (!per.dueDate || isBillPaidForKey(b, per.key)) return;
    const at = atReminderTime(per.dueDate, b.reminderDays);
    if (at <= now) return;
    notifications.push({ id: idFor(`bill-${b.id}-${per.key}`), title: b.name, body: translate("notif.osDueOn", { date: per.dueDate }), schedule: { at } });
  });

  (store.installments || []).forEach((i) => {
    if (i.stopped || i.status === "completed") return;
    if ((i.paidInstallments || 0) >= (i.totalInstallments || 0)) return;
    const cm = currentMonth();
    if (i.payments?.some((p) => p.month === cm)) return;
    const dueDate = `${cm}-${String(Math.min(28, Math.max(1, i.dueDay || 1))).padStart(2, "0")}`;
    const at = atReminderTime(dueDate, i.reminderDays);
    if (at <= now) return;
    notifications.push({ id: idFor(`inst-${i.id}-${cm}`), title: i.name || i.company || translate("notif.instFallback"), body: translate("notif.osDueOn", { date: dueDate }), schedule: { at } });
  });

  if (notifications.length) await LocalNotifications.schedule({ notifications });
}
