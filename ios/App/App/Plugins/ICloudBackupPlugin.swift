import Foundation
import Capacitor

// Writes/reads the auto-backup file to the app's iCloud ubiquity container
// (Documents), so the encrypted backup syncs across the user's devices via
// iCloud Drive. The container id must match App.entitlements.
//
// IMPORTANT: Capacitor only loads a plugin if its class name is listed in
// "packageClassList" in ios/App/App/capacitor.config.json (see
// CapacitorBridge.swift's registerPlugins()). That file is fully regenerated
// by `npx cap sync`/`cap copy` from node_modules. It does NOT know about this
// local, hand-written plugin, so every sync silently drops
// "ICloudBackupPlugin" from the list. After running cap sync, always re-add
// "ICloudBackupPlugin" to that array by hand, or the app builds fine but every
// call to this plugin fails with "plugin is not implemented on ios".
// The ICloudBackupPlugin.m CAP_PLUGIN macro is NOT what registers this plugin
// (that mechanism only supplies jsName/method metadata). packageClassList is
// the actual switch that turns it on.
@objc(ICloudBackupPlugin)
public class ICloudBackupPlugin: CAPPlugin {
    private let containerId = "iCloud.com.savertrack.app"
    private let fileName = "Saver_AutoBackup.json"

    private func documentsURL() -> URL? {
        guard let container = FileManager.default.url(forUbiquityContainerIdentifier: containerId) else { return nil }
        let docs = container.appendingPathComponent("Documents")
        if !FileManager.default.fileExists(atPath: docs.path) {
            try? FileManager.default.createDirectory(at: docs, withIntermediateDirectories: true)
        }
        return docs.appendingPathComponent(fileName)
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .utility).async {
            let available = FileManager.default.url(forUbiquityContainerIdentifier: self.containerId) != nil
            call.resolve(["available": available])
        }
    }

    @objc func writeBackup(_ call: CAPPluginCall) {
        guard let text = call.getString("data") else {
            call.reject("Missing 'data'")
            return
        }
        DispatchQueue.global(qos: .utility).async {
            guard let url = self.documentsURL() else {
                call.reject("iCloud container unavailable")
                return
            }
            do {
                try text.write(to: url, atomically: true, encoding: .utf8)
                call.resolve()
            } catch {
                call.reject("Write failed: \(error.localizedDescription)")
            }
        }
    }

    @objc func readBackup(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .utility).async {
            guard let url = self.documentsURL(), FileManager.default.fileExists(atPath: url.path) else {
                call.resolve(["data": NSNull()])
                return
            }
            do {
                let text = try String(contentsOf: url, encoding: .utf8)
                call.resolve(["data": text])
            } catch {
                call.reject("Read failed: \(error.localizedDescription)")
            }
        }
    }

    // The true device Region (Settings → General → Language & Region), read
    // straight from the system. Needed because WKWebView's navigator.language
    // collapses to "en-US" on-device when the app only bundles generic
    // "en"/"ar" localizations, regardless of the actual Region setting.
    @objc func getRegion(_ call: CAPPluginCall) {
        let region: String?
        if #available(iOS 16, *) {
            region = Locale.current.region?.identifier
        } else {
            region = Locale.current.regionCode
        }
        call.resolve(["region": region ?? NSNull()])
    }
}
