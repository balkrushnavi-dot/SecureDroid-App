package org.securedroid

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.PermissionInfo
import android.net.VpnService
import android.os.Build
import android.util.Log

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

import org.json.JSONArray
import org.securedroid.apps.AppRiskAnalyzer
import org.securedroid.apps.InstalledAppInfo
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.diagnostics.WifiSecurityAnalyzer
import org.securedroid.logging.SecurityEvent
import org.securedroid.logging.SecurityLogManager
import org.securedroid.vault.VaultStorage
import org.securedroid.vpn.DomainBlocklistManager
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState

import java.security.MessageDigest

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    private val appScanner by lazy {
        InstalledAppScanner(bridge.context.applicationContext)
    }

    private val hardeningAnalyzer by lazy {
        HardeningAnalyzer(bridge.context.applicationContext)
    }

    private val wifiAnalyzer by lazy {
        WifiSecurityAnalyzer(bridge.context.applicationContext)
    }

    private val vpnManager by lazy {
        SecureVpnManager(bridge.context.applicationContext)
    }

    private val blocklistManager by lazy {
        DomainBlocklistManager(bridge.context.applicationContext)
    }

    private val vaultStorage by lazy {
        VaultStorage(bridge.context.applicationContext)
    }

    private val logManager by lazy {
        SecurityLogManager(bridge.context.applicationContext)
    }

    // =========================================================
    // CONNECTION
    // =========================================================

    @PluginMethod
    fun checkConnection(call: PluginCall) {
        try {
            val result = JSObject()
            result.put("connected", true)
            result.put("plugin", "SecureDroid")
            result.put("platform", "android")
            result.put("message", "SecureDroid native security bridge available")
            result.put("timestamp", System.currentTimeMillis())
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "checkConnection failed", e)
            call.reject("Native security bridge unavailable: ${e.message}", e)
        }
    }

    // =========================================================
    // INSTALLED APPLICATION INVENTORY
    // =========================================================

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val apps = appScanner.scan()
            val nativeApps = JSONArray()
            val legacyApps = JSONArray()

            apps.forEach { app ->
                nativeApps.put(installedAppToJson(app))
                legacyApps.put(legacyAppToJson(app))
            }

            val result = JSObject()
            result.put("success", true)
            result.put("data", nativeApps)
            result.put("apps", legacyApps)
            result.put("count", apps.size)
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            call.resolve(result)
            Log.d(TAG, "Returned ${apps.size} installed applications")

        } catch (e: Exception) {
            Log.e(TAG, "getInstalledApps failed", e)
            call.reject("Unable to read installed applications: ${e.message}", e)
        }
    }

    // =========================================================
    // APPLICATION RISK SCAN
    // =========================================================

    @PluginMethod
    fun scanForRisks(call: PluginCall) {
        try {
            val apps = appScanner.scan()
            val riskDetails = JSONArray()

            apps.forEach { app ->
                val report = AppRiskAnalyzer.analyze(app)

                if (report.findings.isEmpty()) {
                    return@forEach
                }

                val findings = JSONArray()
                report.findings.forEach { finding ->
                    val findingJson = JSObject()
                    findingJson.put("id", finding.id)
                    findingJson.put("code", finding.id)
                    findingJson.put("level", finding.level.name)
                    findingJson.put("severity", finding.level.name)
                    findingJson.put("summary", finding.summary)
                    findingJson.put("title", finding.summary)
                    findings.put(findingJson)
                }

                val json = JSObject()
                json.put("appName", app.appName)
                json.put("label", app.appName)
                json.put("packageName", report.packageName)
                json.put("riskLevel", report.overallRisk.name)
                json.put("overallRisk", report.overallRisk.name)
                json.put("findingCount", report.findings.size)
                json.put("findings", findings)
                riskDetails.put(json)
            }

            val result = JSObject()
            result.put("success", true)
            result.put("data", riskDetails)
            result.put("riskDetails", riskDetails)
            result.put("totalRiskyApps", riskDetails.length())
            result.put("totalApps", apps.size)
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "scanForRisks failed", e)
            call.reject("Application security analysis failed: ${e.message}", e)
        }
    }

    // =========================================================
    // APP SECURITY AUDITOR
    // =========================================================

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {
        try {
            val apps = appScanner.scan()
            val reports = JSONArray()

            apps.forEach { app ->
                val report = AppRiskAnalyzer.analyze(app)

                if (report.findings.isEmpty()) {
                    return@forEach
                }

                val findings = JSONArray()
                report.findings.forEach { finding ->
                    val item = JSObject()
                    item.put("id", finding.id)
                    item.put("level", finding.level.name)
                    item.put("summary", finding.summary)
                    findings.put(item)
                }

                val json = JSObject()
                json.put("packageName", report.packageName)
                json.put("label", app.appName)
                json.put("overallRisk", report.overallRisk.name)
                json.put("findings", findings)
                reports.put(json)
            }

            val result = JSObject()
            result.put("success", true)
            result.put("data", reports)
            result.put("reports", reports)
            result.put("totalRiskyApps", reports.length())
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "getAppRiskReports failed", e)
            call.reject("Application risk reports unavailable: ${e.message}", e)
        }
    }

    // =========================================================
    // DEVICE HARDENING & WIFI SECURITY
    // =========================================================

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {
        try {
            val report = hardeningAnalyzer.analyze()

            val findings = JSONArray()
            val findingIds = mutableSetOf<String>()

            report.findings.forEach { finding ->
                findingIds.add(finding.id)
                val json = JSObject()
                json.put("id", finding.id)
                json.put("level", finding.level.name)
                json.put("summary", finding.summary)
                findings.put(json)
            }

            val vpnState = vpnManager.getState()

            val result = JSObject()
            result.put("success", true)

            val data = JSObject()
            data.put("score", report.score)
            data.put("findings", findings)
            result.put("data", data)

            result.put("score", report.score)
            result.put("findings", findings)
            result.put("vpnStatus", vpnState == VpnState.CONNECTED)
            result.put("vpnState", vpnState.name)

            result.put("screenLock", "NO_SCREEN_LOCK" !in findingIds && "SCREEN_LOCK_UNKNOWN" !in findingIds)
            result.put("screenLockStatus", when {
                "NO_SCREEN_LOCK" in findingIds -> "FAIL"
                "SCREEN_LOCK_UNKNOWN" in findingIds -> "UNKNOWN"
                else -> "PASS"
            })

            result.put("usbDebugging", "USB_DEBUGGING_ENABLED" in findingIds)
            result.put("usbDebuggingStatus", if ("USB_DEBUGGING_ENABLED" in findingIds) "WARNING" else "PASS")

            result.put("developerOptions", "DEVELOPER_OPTIONS_ENABLED" in findingIds)
            result.put("developerOptionsStatus", if ("DEVELOPER_OPTIONS_ENABLED" in findingIds) "WARNING" else "PASS")

            result.put("securityPatchStatus", when {
                "STALE_SECURITY_PATCH" in findingIds -> "WARNING"
                "PATCH_DATE_UNKNOWN" in findingIds -> "UNKNOWN"
                else -> "PASS"
            })

            result.put("unknownSources", "UNKNOWN_SOURCES_ENABLED" in findingIds)
            result.put("unknownSourcesStatus", if ("UNKNOWN_SOURCES_ENABLED" in findingIds) "WARNING" else "UNKNOWN")

            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "getHardeningReport failed", e)
            call.reject("Hardening analysis failed: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getDeviceHardening(call: PluginCall) {
        getHardeningReport(call)
    }

    @PluginMethod
    fun getWifiSecurityReport(call: PluginCall) {
        try {
            val report = wifiAnalyzer.analyze()

            val findings = JSONArray()
            report.findings.forEach { finding ->
                val json = JSObject()
                json.put("id", finding.id)
                json.put("level", finding.level)
                json.put("summary", finding.summary)
                findings.put(json)
            }

            val data = JSObject()
            data.put("isConnected", report.isConnected)
            data.put("isWifi", report.isWifi)
            data.put("isSecure", report.isSecure)
            data.put("findings", findings)

            val result = JSObject()
            result.put("success", true)
            result.put("data", data)
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "getWifiSecurityReport failed", e)
            call.reject("Wifi security analysis failed: ${e.message}", e)
        }
    }

    // =========================================================
    // VPN PERMISSION
    // =========================================================

    @PluginMethod
    fun requestVpnPermission(call: PluginCall) {
        try {
            val prepareIntent = VpnService.prepare(bridge.context)

            if (prepareIntent == null) {
                val result = JSObject()
                result.put("success", true)
                result.put("granted", true)
                result.put("state", vpnManager.getState().name)
                result.put("message", "VPN permission already granted")
                call.resolve(result)
                return
            }

            getActivity().startActivity(prepareIntent)

            val result = JSObject()
            result.put("success", true)
            result.put("granted", false)
            result.put("permissionRequested", true)
            result.put("state", vpnManager.getState().name)
            result.put("message", "VPN permission request opened")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "requestVpnPermission failed", e)
            call.reject("Unable to request VPN permission: ${e.message}", e)
        }
    }

    // =========================================================
    // VPN STATUS
    // =========================================================

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        try {
            val state = vpnManager.getState()
            val active = state == VpnState.CONNECTED

            val data = JSObject()
            data.put("isActive", active)
            data.put("state", state.name)
            data.put("establishedTime", if (active) System.currentTimeMillis() else null)
            data.put("bytesReceived", 0)
            data.put("bytesTransmitted", 0)
            data.put("blockedDomainsCount", blocklistManager.getBlockedDomains().size)
            data.put("activeDns", "1.1.1.1")
            data.put("filterMode", "BLOCKLIST")

            val result = JSObject()
            result.put("success", true)
            result.put("data", data)
            result.put("state", state.name)
            result.put("isConnected", active)
            result.put("isActive", active)
            result.put("message", vpnMessage(state))
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            Log.d(TAG, "getVpnStatus: state=$state, active=$active")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "getVpnStatus failed", e)
            call.reject("Unable to determine VPN state: ${e.message}", e)
        }
    }

    // =========================================================
    // VPN START
    // =========================================================

    @PluginMethod
    fun startVpn(call: PluginCall) {
        try {
            val prepareIntent = VpnService.prepare(bridge.context)

            if (prepareIntent != null) {
                val result = JSObject()
                result.put("success", false)
                result.put("permissionRequired", true)
                result.put("state", vpnManager.getState().name)
                result.put("message", "VPN permission is required")
                call.resolve(result)
                return
            }

            val started = vpnManager.start()
            val state = vpnManager.getState()

            val result = JSObject()
            result.put("success", started)
            result.put("permissionRequired", false)
            result.put("state", state.name)
            result.put("message", if (started) "VPN start requested; waiting for connection" else "VPN could not be started")
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            Log.d(TAG, "startVpn: started=$started, state=$state")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "startVpn failed", e)
            call.reject("Unable to start VPN: ${e.message}", e)
        }
    }

    // =========================================================
    // VPN STOP
    // =========================================================

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        try {
            vpnManager.stop()
            val state = vpnManager.getState()

            val result = JSObject()
            result.put("success", true)
            result.put("state", state.name)
            result.put("message", "VPN stop requested")
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")

            Log.d(TAG, "stopVpn: state=$state")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "stopVpn failed", e)
            call.reject("Unable to stop VPN: ${e.message}", e)
        }
    }

    // =========================================================
    // DOMAIN BLOCKLIST & ALLOWLIST MANAGEMENT
    // =========================================================

    @PluginMethod
    fun getBlockedDomains(call: PluginCall) {
        try {
            val blocked = blocklistManager.getBlockedDomains()
            val allowed = blocklistManager.getAllowedDomains()

            val data = JSObject()
            data.put("blockedDomains", JSONArray(blocked))
            data.put("allowedDomains", JSONArray(allowed))

            val result = JSObject()
            result.put("success", true)
            result.put("data", data)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "getBlockedDomains failed", e)
            call.reject("Unable to retrieve blocklists: ${e.message}", e)
        }
    }

    @PluginMethod
    fun addBlockedDomain(call: PluginCall) {
        try {
            val domain = call.getString("domain")
            if (domain.isNullOrBlank()) {
                call.reject("Missing required 'domain'")
                return
            }
            val added = blocklistManager.addBlockedDomain(domain)
            val result = JSObject()
            result.put("success", true)
            result.put("added", added)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "addBlockedDomain failed", e)
            call.reject("Unable to add domain to blocklist: ${e.message}", e)
        }
    }

    @PluginMethod
    fun removeBlockedDomain(call: PluginCall) {
        try {
            val domain = call.getString("domain")
            if (domain.isNullOrBlank()) {
                call.reject("Missing required 'domain'")
                return
            }
            val removed = blocklistManager.removeBlockedDomain(domain)
            val result = JSObject()
            result.put("success", true)
            result.put("removed", removed)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "removeBlockedDomain failed", e)
            call.reject("Unable to remove domain from blocklist: ${e.message}", e)
        }
    }

    @PluginMethod
    fun addAllowedDomain(call: PluginCall) {
        try {
            val domain = call.getString("domain")
            if (domain.isNullOrBlank()) {
                call.reject("Missing required 'domain'")
                return
            }
            val added = blocklistManager.addAllowedDomain(domain)
            val result = JSObject()
            result.put("success", true)
            result.put("added", added)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "addAllowedDomain failed", e)
            call.reject("Unable to add domain to allowlist: ${e.message}", e)
        }
    }

    @PluginMethod
    fun removeAllowedDomain(call: PluginCall) {
        try {
            val domain = call.getString("domain")
            if (domain.isNullOrBlank()) {
                call.reject("Missing required 'domain'")
                return
            }
            val removed = blocklistManager.removeAllowedDomain(domain)
            val result = JSObject()
            result.put("success", true)
            result.put("removed", removed)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "removeAllowedDomain failed", e)
            call.reject("Unable to remove domain from allowlist: ${e.message}", e)
        }
    }

    // =========================================================
    // SECURE STORAGE
    // =========================================================

    @PluginMethod
    fun secureStorageSet(call: PluginCall) {
        try {
            val key = call.getString("key")
            val value = call.getString("value")

            if (key.isNullOrBlank() || value == null) {
                call.reject("Missing required 'key' or 'value'")
                return
            }

            val success = vaultStorage.set(key, value)

            if (!success) {
                call.reject("Failed to write to secure vault")
                return
            }

            val result = JSObject()
            result.put("success", true)
            result.put("data", true)
            result.put("value", true)
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "secureStorageSet failed", e)
            call.reject("Unable to write to secure vault: ${e.message}", e)
        }
    }

    @PluginMethod
    fun secureStorageGet(call: PluginCall) {
        try {
            val key = call.getString("key")

            if (key.isNullOrBlank()) {
                call.reject("Missing required 'key'")
                return
            }

            val value = vaultStorage.get(key)

            val result = JSObject()
            result.put("success", true)
            result.put("data", value)
            result.put("value", value)
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "secureStorageGet failed", e)
            call.reject("Unable to read from secure vault: ${e.message}", e)
        }
    }

    @PluginMethod
    fun secureStorageRemove(call: PluginCall) {
        try {
            val key = call.getString("key")

            if (key.isNullOrBlank()) {
                call.reject("Missing required 'key'")
                return
            }

            val success = vaultStorage.remove(key)

            val result = JSObject()
            result.put("success", true)
            result.put("data", success)
            result.put("value", success)
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "secureStorageRemove failed", e)
            call.reject("Unable to remove secure vault entry: ${e.message}", e)
        }
    }

    // =========================================================
    // SECURITY AUDIT LOG
    // =========================================================

    @PluginMethod
    fun logSecurityEvent(call: PluginCall) {
        try {
            val eventObj = call.getObject("event")

            if (eventObj == null) {
                call.reject("Missing required 'event'")
                return
            }

            val id = "evt_${System.currentTimeMillis()}_${(0..9999).random()}"
            val timestamp = System.currentTimeMillis()
            val category = eventObj.optString("category", "AUDIT")
            val severity = eventObj.optString("severity", "INFO")
            val description = eventObj.optString("description", "")
            val source = eventObj.optString("source", "SecureDroid")

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
                call.reject("Failed to write security log entry")
                return
            }

            val data = JSObject()
            data.put("id", id)
            data.put("timestamp", timestamp)
            data.put("category", category)
            data.put("severity", severity)
            data.put("description", description)
            data.put("source", source)

            val result = JSObject()
            result.put("success", true)
            result.put("data", data)
            result.put("value", data)
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "logSecurityEvent failed", e)
            call.reject("Unable to write security log entry: ${e.message}", e)
        }
    }

    @PluginMethod
    fun getSecurityLogs(call: PluginCall) {
        try {
            val requestedLimit = call.getInt("limit") ?: 50
            val limit = requestedLimit.coerceIn(1, 500)
            val category = call.getString("category")

            val events = logManager.getEvents(limit, category)

            val array = JSONArray()
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
            result.put("success", true)
            result.put("data", array)
            result.put("value", array)
            result.put("isSupported", true)
            result.put("runtimePlatform", "android_native")
            call.resolve(result)

        } catch (e: Exception) {
            Log.e(TAG, "getSecurityLogs failed", e)
            call.reject("Unable to read security logs: ${e.message}", e)
        }
    }

    // =========================================================
    // PACKAGE JSON HELPERS
    // =========================================================

    private fun installedAppToJson(app: InstalledAppInfo): JSObject {
        val packageManager = bridge.context.packageManager
        val packageInfo = getPackageInfoSafe(packageManager, app.packageName)

        val requested = app.requestedPermissions

        val granted = requested.filter { permission ->
            try {
                bridge.context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
            } catch (_: Exception) {
                false
            }
        }

        val dangerous = requested.filter { permission ->
            try {
                val permissionInfo = packageManager.getPermissionInfo(permission, 0)
                (permissionInfo.protectionLevel and PermissionInfo.PROTECTION_MASK_BASE) == PermissionInfo.PROTECTION_DANGEROUS
            } catch (_: Exception) {
                false
            }
        }

        val json = JSObject()
        json.put("packageName", app.packageName)
        json.put("label", app.appName)
        json.put("appName", app.appName)
        json.put("versionName", app.versionName ?: "Unknown")
        json.put("versionCode", app.versionCode)
        json.put("targetSdk", app.targetSdk)
        json.put("minSdk", app.minSdk)
        json.put("isSystemApp", app.isSystemApp)
        json.put("isLaunchable", app.isLaunchable)
        json.put("firstInstallTime", app.firstInstallTime)
        json.put("lastUpdateTime", app.lastUpdateTime)
        json.put("installTime", app.firstInstallTime)
        json.put("updateTime", app.lastUpdateTime)
        json.put("requestedPermissions", JSONArray(requested))
        json.put("permissions", JSONArray(requested))
        json.put("grantedPermissions", JSONArray(granted))
        json.put("dangerousPermissions", JSONArray(dangerous))
        json.put("installerPackage", app.installerPackageName)
        json.put("installSource", app.installerPackageName ?: "UNKNOWN")
        json.put("installerKnown", app.installerPackageName != null)
        json.put("isSideloaded", isSideloaded(app))
        json.put("isDebuggable", app.isDebuggable)
        json.put("enabled", app.isEnabled)
        json.put("isEnabled", app.isEnabled)
        json.put("signingCertSha256", signingCertSha256(packageInfo))

        return json
    }

    private fun legacyAppToJson(app: InstalledAppInfo): JSObject {
        val json = JSObject()
        json.put("packageName", app.packageName)
        json.put("appName", app.appName)
        json.put("versionName", app.versionName ?: "Unknown")
        json.put("versionCode", app.versionCode)
        json.put("isSystemApp", app.isSystemApp)
        json.put("installTime", app.firstInstallTime)
        json.put("updateTime", app.lastUpdateTime)
        json.put("installSource", app.installerPackageName ?: "UNKNOWN")
        json.put("isSideloaded", isSideloaded(app))
        json.put("permissions", JSONArray(app.requestedPermissions))
        return json
    }

    private fun getPackageInfoSafe(packageManager: PackageManager, packageName: String): PackageInfo? {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    packageName,
                    PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong())
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
            }
        } catch (_: Exception) {
            null
        }
    }

    private fun signingCertSha256(packageInfo: PackageInfo?): String? {
        if (packageInfo == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
            return null
        }

        return try {
            val signingInfo = packageInfo.signingInfo ?: return null
            val signers = signingInfo.apkContentsSigners
            if (signers.isEmpty()) return null

            val digest = MessageDigest.getInstance("SHA-256").digest(signers.first().toByteArray())
            digest.joinToString(":") { "%02X".format(it) }

        } catch (_: Exception) {
            null
        }
    }

    private fun isSideloaded(app: InstalledAppInfo): Boolean {
        val installer = app.installerPackageName ?: return false
        if (app.isSystemApp) return false
        return installer !in KNOWN_STORES
    }

    private fun vpnMessage(state: VpnState): String {
        return when (state) {
            VpnState.CONNECTED -> "VPN protection is active"
            VpnState.CONNECTING -> "VPN protection is connecting"
            VpnState.DISCONNECTING -> "VPN protection is disconnecting"
            VpnState.ERROR -> "VPN protection encountered an error"
            VpnState.DISCONNECTED -> "VPN protection is disconnected"
        }
    }

    companion object {
        private const val TAG = "SecureDroid"
        private val KNOWN_STORES = setOf(
            "com.android.vending",
            "com.amazon.venezia",
            "com.sec.android.app.samsungapps",
            "com.google.android.packageinstaller",
            "com.android.packageinstaller"
        )
    }
}
