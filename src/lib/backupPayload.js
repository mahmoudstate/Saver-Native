// Builds the full exportable data payload from whatever is currently in
// localStorage, shared by the manual backup screen and the iCloud auto-backup.
import { today } from "./format.js";
import { KEYS, loadKey } from "./store.js";

export function buildBackupPayload() {
  const payload = { _app: "Saver", _version: 3, _exported: today() };
  for (const k in KEYS) payload[k] = loadKey(KEYS[k], null);
  return payload;
}
