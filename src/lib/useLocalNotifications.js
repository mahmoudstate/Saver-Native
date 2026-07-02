// Re-syncs scheduled OS notifications whenever the data they depend on
// changes (bills/installments added, edited, paid) or the user toggles
// notifications on/off. No-op on the web / when disabled — see
// syncScheduledNotifications() for the actual scheduling logic.
import { useEffect } from "react";
import { syncScheduledNotifications } from "./localNotifications.js";

export function useLocalNotifications(store) {
  const billsKey = JSON.stringify((store.bills || []).map((b) => [b.id, b.dueDay, b.reminderDays, b.payments?.length, b.stoppedMonth]));
  const instKey = JSON.stringify((store.installments || []).map((i) => [i.id, i.dueDay, i.reminderDays, i.paidInstallments, i.stopped, i.status]));

  useEffect(() => {
    syncScheduledNotifications(store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.notificationsEnabled, billsKey, instKey]);
}
