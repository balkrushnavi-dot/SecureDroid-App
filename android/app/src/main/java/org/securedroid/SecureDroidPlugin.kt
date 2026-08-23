package org.securedroid.app

import com.getcapacitor.Plugin
import com.getcapacitor.JSObject
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.securedroid.admin.DevicePolicyManagerService
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.space.SecureSpaceManager
import org.securedroid.security.KeyStoreManager

@CapacitorPlugin(name = "SecureDroidNative")
class SecureDroidPlugin : Plugin() {

    @PluginMethod
    fun getDiagnostics(call: com.getcapacitor.PluginCall) {
        val context = context
        val diagnostics = DeviceDiagnostics(context)
        val report = diagnostics.generateReport()

        val ret = JSObject().apply {
            put("deviceModel", report.deviceModel)
            put("androidVersion", report.androidVersion)
            put("sdkInt", report.sdkInt)
            put("securityPatch", report.securityPatch)
            put("isDeviceOwner", report.isDeviceOwner)
            put("isHardwareKeystoreBacked", report.isHardwareKeystoreBacked)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun getWorkspaceStatus(call: com.getcapacitor.PluginCall) {
        val spaceManager = SecureSpaceManager(context)
        val ret = JSObject().apply {
            put("isLocked", spaceManager.isLocked)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun setWorkspaceLock(call: com.getcapacitor.PluginCall) {
        val lock = call.getBoolean("lock", true) ?: true
        val spaceManager = SecureSpaceManager(context)
        if (lock) {
            spaceManager.lockSpace()
        } else {
            spaceManager.unlockSpace()
        }
        val ret = JSObject().apply {
            put("isLocked", spaceManager.isLocked)
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun checkDeviceOwner(call: com.getcapacitor.PluginCall) {
        val policyService = DevicePolicyManagerService(context)
        val ret = JSObject().apply {
            put("isDeviceOwner", policyService.isDeviceOwnerActive())
            put("statusSummary", policyService.getPolicyStatusSummary())
        }
        call.resolve(ret)
    }
}
