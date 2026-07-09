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
import { currentMonth, fmt, today } from "./format.js";
import { billPeriod, isBillPaidForKey } from "./billfreq.js";
import { translate, currentLang } from "./i18n.js";
import { KEYS, loadKey } from "./store.js";

const native = () => Capacitor.isNativePlatform();

// An OS notification banner has no surrounding dir="rtl" the way the in-app
// UI does, so each line's direction/alignment gets guessed independently from
// its own first strong character — title and body ended up on opposite sides.
// A leading U+200E (left-to-right mark) forces every line to the same
// left-aligned block, title and body stacked flush under each other, exactly
// like the English notifications — the Arabic words still shape correctly
// within it, only the paragraph's overall alignment is pinned.
const pinLeft = (s) => (currentLang() === "ar" ? "‎" + s : s);

// Title pairs the name with its category ("Anghami · Bill"), body pairs the
// amount with the relative due date ("£10 · Due tomorrow") — this plugin's
// iOS layer has no `subtitle` field, so the category has to live somewhere
// visible, and grouping it with the name (not the amount) is what reads as
// one sentence instead of two unrelated fragments.
// `at` is the moment the OS will actually fire this, so the day count is
// measured from there, not from now.
function dueRelative(dueDate, at) {
  const days = Math.round((dueDateTime(dueDate) - at) / 86400000);
  if (days <= 0) return translate("notif.dueToday");
  if (days === 1) return translate("notif.dueTomorrow");
  return translate("notif.dueInDays", { n: days });
}

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

function dueDateTime(dueDate) {
  return new Date(dueDate + "T09:00:00");
}

function idealReminderTime(dueDate, reminderDays) {
  const d = dueDateTime(dueDate);
  d.setDate(d.getDate() - (reminderDays ?? 2));
  return d;
}

// The ideal reminder time (due date − reminderDays) can already be in the
// past — e.g. a bill due tomorrow with a 2-day lead time. Rather than
// silently dropping the reminder, fire it almost immediately as long as the
// bill itself isn't overdue yet. Only truly skip once the due date has passed.
function scheduleTimeFor(dueDate, reminderDays, now) {
  const ideal = idealReminderTime(dueDate, reminderDays);
  if (ideal > now) return ideal;
  const due = dueDateTime(dueDate);
  if (due <= now) return null; // already overdue — nothing useful to remind about
  return new Date(now.getTime() + 5000);
}

// Rotating daily "did you log anything today?" nudge. iOS can't pick a random
// body at delivery time, so instead of one repeating notification with a
// fixed message, a rolling window of individual day-by-day notifications is
// scheduled in advance, each with a different line, deterministically picked
// so the same date always gets the same message (no drift if this resyncs
// mid-day). A day already logged (or already past its reminder time) is
// skipped, so logging an expense before the reminder fires cancels it.
const EXPENSE_REMINDER_HOUR = 20; // 8pm local time
const EXPENSE_REMINDER_DAYS_AHEAD = 14;
const EXPENSE_MSGS = {
  en: [
    "Did you spend anything today?",
    "Quick reminder to add today's expenses.",
    "Don't forget to log today's spending.",
    "Add today's expenses when you get a chance.",
    "A quick note now saves time later.",
    "Take a second to log today's expenses.",
    "Remember to add what you spent today.",
  ],
  ar: [
    "هل صرفت أي شيء اليوم؟",
    "تذكير بسيط لإضافة مصاريف اليوم.",
    "لا تنسَ تسجيل مصاريف اليوم.",
    "أضف مصاريف اليوم متى استطعت.",
    "ملاحظة سريعة الآن توفر وقتك لاحقًا.",
    "خذ لحظة لتسجيل مصاريف اليوم.",
    "تذكر أن تضيف ما صرفته اليوم.",
  ],
};

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dayOfYear(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

function expenseReminderNotifications(store, now) {
  const msgs = EXPENSE_MSGS[currentLang()] || EXPENSE_MSGS.en;
  const loggedDates = new Set((store.txns || []).map((t) => t.date));
  const notifications = [];
  const base = today();
  for (let i = 0; i < EXPENSE_REMINDER_DAYS_AHEAD; i++) {
    const dateStr = i === 0 ? base : addDays(base, i);
    if (loggedDates.has(dateStr)) continue;
    const at = new Date(`${dateStr}T${String(EXPENSE_REMINDER_HOUR).padStart(2, "0")}:00:00`);
    if (at <= now) continue;
    notifications.push({
      id: idFor(`expense-reminder-${dateStr}`),
      title: pinLeft(translate("notif.expenseReminderTitle")),
      body: pinLeft(msgs[dayOfYear(dateStr) % msgs.length]),
      schedule: { at }, sound: "default", extra: { kind: "expenseReminder", date: dateStr },
    });
  }
  return notifications;
}

// One-shot nudge to back up manually, only relevant when the automatic
// iCloud backup is off (it already covers users who leave it on) and it's
// been a while since any backup (auto or manual) — see KEYS.lastBackup.
const BACKUP_REMINDER_DAYS = 30;

function backupReminderNotification(now) {
  const last = loadKey(KEYS.lastBackup, null);
  const at = new Date((last || now.getTime()) + BACKUP_REMINDER_DAYS * 86400000);
  if (at <= now) return null;
  return {
    id: idFor("backup-reminder"),
    title: pinLeft(translate("notif.backupReminderTitle")),
    body: pinLeft(translate("notif.backupReminderBody")),
    schedule: { at }, sound: "default", extra: { kind: "backupReminder" },
  };
}

export async function syncScheduledNotifications(store) {
  if (!native()) return;
  try {
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
      const at = scheduleTimeFor(per.dueDate, b.reminderDays, now);
      if (!at) return;
      notifications.push({
        id: idFor(`bill-${b.id}-${per.key}`),
        title: pinLeft(`${b.name} · ${translate("notif.billCat")}`),
        body: pinLeft(`${fmt(b.amount)} · ${dueRelative(per.dueDate, at)}`),
        schedule: { at }, sound: "default", extra: { kind: "bill", id: b.id },
      });
    });

    (store.installments || []).forEach((i) => {
      if (i.stopped || i.status === "completed") return;
      if ((i.paidInstallments || 0) >= (i.totalInstallments || 0)) return;
      const cm = currentMonth();
      if (i.payments?.some((p) => p.month === cm)) return;
      const dueDate = `${cm}-${String(Math.min(28, Math.max(1, i.dueDay || 1))).padStart(2, "0")}`;
      const at = scheduleTimeFor(dueDate, i.reminderDays, now);
      if (!at) return;
      const label = i.name || i.company || translate("notif.instFallback");
      notifications.push({
        id: idFor(`inst-${i.id}-${cm}`),
        title: pinLeft(`${label} · ${translate("notif.instCat")}`),
        body: pinLeft(`${fmt(i.installmentAmount)} · ${dueRelative(dueDate, at)}`),
        schedule: { at }, sound: "default", extra: { kind: "installment", id: i.id },
      });
    });

    notifications.push(...expenseReminderNotifications(store, now));
    if (!store.iCloudBackupEnabled) {
      const backupReminder = backupReminderNotification(now);
      if (backupReminder) notifications.push(backupReminder);
    }

    // largeIcon has no global capacitor.config equivalent (unlike smallIcon/
    // iconColor) — set per-notification so Android's notification shade shows
    // Saver's full-color logo next to the text, matching Gmail/Play Store etc.
    // Ignored on iOS.
    if (notifications.length) await LocalNotifications.schedule({ notifications: notifications.map((n) => ({ ...n, largeIcon: "ic_notif_large" })) });
  } catch (e) {
    console.error("[notif] syncScheduledNotifications failed:", e);
  }
}
