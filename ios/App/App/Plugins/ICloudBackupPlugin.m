#import <Capacitor/Capacitor.h>

CAP_PLUGIN(ICloudBackupPlugin, "ICloudBackup",
    CAP_PLUGIN_METHOD(isAvailable, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(writeBackup, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(readBackup, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getRegion, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getLanguage, CAPPluginReturnPromise);
)
