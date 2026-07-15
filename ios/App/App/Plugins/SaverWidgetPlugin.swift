import Foundation
import Capacitor
import WidgetKit

// Bridge that hands the web app's numbers to the home screen widget. The web
// side calls sync({ data }) with a JSON string; we drop it into the shared App
// Group so the widget extension can read it, then ask WidgetKit to redraw.
//
// Registration: this is a local plugin, exactly like ICloudBackupPlugin. It
// registers through the CAP_PLUGIN macro in SaverWidgetPlugin.m (not through
// packageClassList, which is only for the SPM plugins pulled from
// node_modules). Both this .swift and the .m must be added to the App target
// in Xcode; once they are, sync() works with no capacitor.config.json edits.
@objc(SaverWidgetPlugin)
public class SaverWidgetPlugin: CAPPlugin {
    // Must match the App Group id added to BOTH the App target and the widget
    // target in Xcode (Signing & Capabilities).
    private let appGroup = "group.com.savertrack.app"
    private let key = "widgetData"

    @objc func sync(_ call: CAPPluginCall) {
        let json = call.getString("data") ?? "{}"
        if let defaults = UserDefaults(suiteName: appGroup) {
            defaults.set(json, forKey: key)
        }
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }
        call.resolve()
    }
}
