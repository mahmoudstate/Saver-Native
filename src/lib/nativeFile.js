// Cross-platform file export.
// Native (iOS): write to a temp file, then open the OS share sheet
// ("Save to Files" → iCloud Drive, AirDrop, etc.).
// Web: fall back to a normal browser download.
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

// Returns true if the file was handed off (shared/downloaded), false if cancelled.
export async function exportTextFile(name, text, dialogTitle = "Save backup") {
  if (!Capacitor.isNativePlatform()) {
    const blob = new Blob([text], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
    return true;
  }

  // Write into the cache dir, then share the file URI.
  const w = await Filesystem.writeFile({
    path: name,
    data: text,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  try {
    await Share.share({ title: dialogTitle, url: w.uri, dialogTitle });
    return true;
  } catch {
    return false; // user dismissed the share sheet
  }
}
