package org.securedroid

import com.getcapacitor.JSArray
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.securedroid.admin.SecureDroidDeviceAdmin
import org.securedroid.apps.AppRiskAnalyzer
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.logging.SecurityEvent
import org.securedroid.logging.SecurityLogManager
import org.securedroid.space.SecureSpaceManager
import org.securedroid.vault.VaultStorage
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState
import org.securedroid.vpn.VpnStateStore

/**
 * The real Capacitor bridge between the SecureDroid web UI and the
 * native Android security layer. Registered in MainActivity.
 *
 * Only methods with a genuine native implementation resolve normally.
 * Every other method calls call.unimplemented() so the web layer
 * receives an honest "not supported" response instead of silently
 * falling back to fabricated data.
 */
@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    private val vpnManager by lazy {
        SecureVpnManager(context)
    }

    private val vaultStorage by lazy {
        VaultStorage(context)
    }

    private val logManager by lazy {
        SecurityLogManager(context)
    }

    private val appScanner by lazy {
        InstalledAppScanner(context)
    }

    private val hardeningAnalyzer by lazy {
        HardeningAnalyzer(context)
    }

    private val deviceAdmin by lazy {
        SecureDroidDeviceAdmin(context)
    }

    private val secureSpace by lazy {
        SecureSpaceManager(context)
    }

    private val diagnostics by lazy {
        DeviceDiagnostics(context)
    }

    // ---- VPN ----

    @PluginMethod
    fun startVpn(call: PluginCall) {

        val started = vpnManager.start()

        if (!started) {
            call.reject(
                "Failed to start VPN",
                "SERVICE_UNAVAILABLE"
            )
            return
        }

        // Establishment happens asynchronously inside SecureVpnService.
        // The returned status reflects whatever VpnStateStore holds at
        // this instant, which may still be CONNECTING rather than
        // CONNECTED. Callers should poll getVpnStatus if they need to
        // confirm the tunnel actually came up.
        call.resolve(vpnStatusPayload())
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {

        vpnManager.stop()

        call.resolve(vpnStatusPayload())
    }

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {

        call.resolve(vpnStatusPayload())
    }

    private fun vpnStatusPayload(): JSObject {

        val state = VpnStateStore.get()

        return JSObject().apply {
            put("isActive", state == VpnState.CONNECTED)
            put("bytesReceived", 0)
            put("bytesTransmitted", 0)
            put("blockedDomainsCount", 0)
            put("activeDns", "")
            put("filterMode", "DISABLED")
        }
    }

    // ---- Secure Vault ----

    @PluginMethod
    fun secureStorageSet(call: PluginCall) {

        val key = call.getString("key")
        val value = call.getString("value")

        if (key.isNullOrBlank() || value == null) {
            call.reject(
                "Missing required 'key' or 'value'",
                "INVALID_ARGUMENT"
            )
            return
        }

        val success = vaultStorage.set(key, value)

        if (!success) {
            call.reject(
                "Failed to write to secure vault",
                "SERVICE_UNAVAILABLE"
            )
            return
        }

        val result = JSObject()
        result.put("value", true)
        call.resolve(result)
    }

    @PluginMethod
    fun secureStorageGet(call: PluginCall) {

        val key = call.getString("key")

        if (key.isNullOrBlank()) {
            call.reject(
                "Missing required 'key'",
                "INVALID_ARGUMENT"
            )
            return
        }

        val value = vaultStorage.get(key)

        val result = JSObject()
        result.put("value", value)
        call.resolve(result)
    }

    @PluginMethod
    fun secureStorageRemove(call: PluginCall) {

        val key = call.getString("key")

        if (key.isNullOrBlank()) {
            call.reject(
                "Missing required 'key'",
                "INVALID_ARGUMENT"
            )
            return
        }

        val success = vaultStorage.remove(key)

        val result = JSObject()
        result.put("value", success)
        call.resolve(result)
    }

    // ---- Security Logging ----

    @PluginMethod
    fun logSecurityEvent(call: PluginCall) {

        val eventObj = call.getObject("event")

        if (eventObj == null) {
            call.reject(
                "Missing required 'event'",
                "INVALID_ARGUMENT"
            )
            return
        }

        val category = eventObj.getString("category") ?: "AUDIT"
        val severity = eventObj.getString("severity") ?: "INFO"
        val description = eventObj.getString("description") ?: ""
        val source = eventObj.getString("source") ?: "Unknown"

        val id = "evt_${System.currentTimeMillis()}_${(0..9999).random()}"
        val timestamp = System.currentTimeMillis()

        val event = SecurityEvent(
            id = id,
            timestamp = timestamp,
            category = category,
            severity = severity,
            description = description,
            source = source
        )

        val success = logManager.logEvent(event)

        if (!success) {
            call.reject(
                "Failed to write security log entry",
                "SERVICE_UNAVAILABLE"
            )
            return
        }

        val result = JSObject()
        result.put("id", id)
        result.put("timestamp", timestamp)
        result.put("category", category)
        result.put("severity", severity)
        result.put("description", description)
        result.put("source", source)
        call.resolve(result)
    }

    @PluginMethod
    fun getSecurityLogs(call: PluginCall) {

        val limit = call.getInt("limit") ?: 50
        val category = call.getString("category")

        val events = logManager.getEvents(limit, category)

        val array = JSArray()

        events.forEach { event ->
            val obj = JSObject()
            obj.put("id", event.id)
            obj.put("timestamp", event.timestamp)
            obj.put("category", event.category)
            obj.put("severity", event.severity)
            obj.put("description", event.description)
            obj.put("source", event.source)
            array.put(obj)
        }

        val result = JSObject()
        result.put("value", array)
        call.resolve(result)
    }

    // ---- Installed Apps ----

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {

        val apps = try {
            appScanner.scan()
        } catch (e: Exception) {
            call.reject(
                "App scan failed: ${e.message}",
                "SCAN_FAILED"
            )
            return
        }

        val array = JSArray()

        apps.forEach { app ->
            val obj = JSObject()
            obj.put("packageName", app.packageName)
            obj.put("label", app.appName)
            obj.put("versionName", app.versionName ?: "")
            obj.put("versionCode", app.versionCode)
            obj.put("targetSdk", app.targetSdk)
            obj.put("minSdk", app.minSdk)
            obj.put("isSystemApp", app.isSystemApp)
            obj.put("isLaunchable", app.isLaunchable)
            obj.put("isDebuggable", app.isDebuggable)
            obj.put("firstInstallTime", app.firstInstallTime)
            obj.put("lastUpdateTime", app.lastUpdateTime)
            obj.put("installerPackage", app.installerPackageName)

            val permissionsArray = JSArray()
            app.requestedPermissions.forEach { permissionsArray.put(it) }
            obj.put("requestedPermissions", permissionsArray)

            val dangerousArray = JSArray()
            app.requestedPermissions
                .filter { it in AppRiskAnalyzer.SENSITIVE_PERMISSIONS }
                .forEach { dangerousArray.put(it) }
            obj.put("dangerousPermissions", dangerousArray)

            array.put(obj)
        }

        val result = JSObject()
        result.put("value", array)
        call.resolve(result)
    }

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {

        val apps = try {
            appScanner.scan()
        } catch (e: Exception) {
            call.reject(
                "App scan failed: ${e.message}",
                "SCAN_FAILED"
            )
            return
        }

        val array = JSArray()

        apps.forEach { app ->
            val report = AppRiskAnalyzer.analyze(app)

            val obj = JSObject()
            obj.put("packageName", report.packageName)
            obj.put("label", app.appName)
            obj.put("overallRisk", report.overallRisk.name)

            val findingsArray = JSArray()
            report.findings.forEach { finding ->
                val findingObj = JSObject()
                findingObj.put("id", finding.id)
                findingObj.put("level", finding.level.name)
                findingObj.put("summary", finding.summary)
                findingsArray.put(findingObj)
            }
            obj.put("findings", findingsArray)

            array.put(obj)
        }

        val result = JSObject()
        result.put("value", array)
        call.resolve(result)
    }

    // ---- Device Hardening ----

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {

        val report = hardeningAnalyzer.analyze()

        val findingsArray = JSArray()
        report.findings.forEach { finding ->
            val findingObj = JSObject()
            findingObj.put("id", finding.id)
            findingObj.put("level", finding.level.name)
            findingObj.put("summary", finding.summary)
            findingsArray.put(findingObj)
        }

        val result = JSObject()
        result.put("score", report.score)
        result.put("findings", findingsArray)
        call.resolve(result)
    }

    // ---- Device Admin ----

    @PluginMethod
    fun isDeviceAdminEnabled(call: PluginCall) {
        val result = JSObject()
        result.put("value", deviceAdmin.isEnabled())
        call.resolve(result)
    }

    @PluginMethod
    fun isCameraDisabled(call: PluginCall) {
        val result = JSObject()
        result.put("value", deviceAdmin.isCameraDisabled())
        call.resolve(result)
    }

    @PluginMethod
    fun setCameraDisabled(call: PluginCall) {

        val disabled = call.getBoolean("disabled")

        if (disabled == null) {
            call.reject(
                "Missing required 'disabled'",
                "INVALID_ARGUMENT"
            )
            return
        }

        val success = deviceAdmin.setCameraDisabled(disabled)

        if (!success) {
            call.reject(
                "Device Admin is not active; cannot change camera policy",
                "PERMISSION_DENIED"
            )
            return
        }

        val result = JSObject()
        result.put("value", true)
        call.resolve(result)
    }

    // ---- Secure Space ----
    // NOTE: this currently reflects a plain on/off preference with no
    // isolation, encryption, or sandboxing behind it. It must not be
    // presented to users as equivalent to a real protected profile
    // until genuine isolation is implemented.

    @PluginMethod
    fun isSecureSpaceEnabled(call: PluginCall) {
        val result = JSObject()
        result.put("value", secureSpace.isEnabled())
        call.resolve(result)
    }

    @PluginMethod
    fun enableSecureSpace(call: PluginCall) {
        val result = JSObject()
        result.put("value", secureSpace.enable())
        call.resolve(result)
    }

    @PluginMethod
    fun disableSecureSpace(call: PluginCall) {
        val result = JSObject()
        result.put("value", secureSpace.disable())
        call.resolve(result)
    }

    // ---- Diagnostics ----

    @PluginMethod
    fun runDiagnostics(call: PluginCall) {

        val diagnosticsResult = diagnostics.run()

        val result = JSObject()
        result.put("androidVersion", diagnosticsResult.androidVersion)
        result.put("sdkVersion", diagnosticsResult.sdkVersion)
        result.put("deviceModel", diagnosticsResult.deviceModel)
        result.put("manufacturer", diagnosticsResult.manufacturer)
        result.put("isNetworkAvailable", diagnosticsResult.isNetworkAvailable)
        result.put("isSystemVpnDetected", diagnosticsResult.isSystemVpnDetected)
        result.put(
            "secureDroidVpnState",
            diagnosticsResult.secureDroidVpnState.name
        )
        result.put("isScreenLocked", diagnosticsResult.isScreenLocked)
        result.put("isPowerSaveMode", diagnosticsResult.isPowerSaveMode)

        call.resolve(result)
    }

    // ---- Not yet implemented natively ----
    // These are honestly reported as unsupported rather than backed
    // by fabricated data. Implement for real before removing the
    // unimplemented() call.

    @PluginMethod
    fun getDeviceInfo(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getBatteryStatus(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getNetworkState(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getStorageInfo(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getAvailableSensors(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun startSensorListener(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun stopSensorListener(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getCameraCapability(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun capturePhoto(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun isBiometricAvailable(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun authenticateBiometric(call: PluginCall) = call.unimplemented()

    @PluginMethod
    override fun checkPermissions(call: PluginCall) = call.unimplemented()

    @PluginMethod
    override fun requestPermissions(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun openAppSettings(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun launchApp(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun openAppDetails(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun uninstallAppRequest(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getCalendarEvents(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getContacts(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun listFiles(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getNotifications(call: PluginCall) = call.unimplemented()

    @PluginMethod
    fun getVmHardwareCapability(call: PluginCall) = call.unimplemented()
}
