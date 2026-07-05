// Re-syncs scheduled OS notifications whenever the data they depend on
// changes (bills/installments added, edited, paid; today's first transaction
// logged, which cancels today's expense-log reminder; the iCloud backup
// toggle, which turns the backup reminder on/off) or the user toggles
// notifications on/off. No-op on the web / when disabled, see
// syncScheduledNotifications() for the actual scheduling logic.
import { useEffect } from "react";
import { syncScheduledNotifications } from "./localNotifications.js";
import { today } from "./format.js";

export function useLocalNotifications(store) {
  const billsKey = JSON.stringify((store.bills || []).map((b) => [b.id, b.dueDay, b.reminderDays, b.payments?.length, b.stoppedMonth]));
  const instKey = JSON.stringify((store.installments || []).map((i) => [i.id, i.dueDay, i.reminderDays, i.paidInstallments, i.stopped, i.status]));
  const loggedToday = (store.txns || []).some((t) => t.date === today());

  useEffect(() => {
    syncScheduledNotifications(store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.notificationsEnabled, store.iCloudBackupEnabled, billsKey, instKey, loggedToday]);
}
