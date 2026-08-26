// app/src/main/java/org/securedroid/SecureDroidCapacitorPlugin.kt
package org.securedroid

import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.json.JSONObject

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val pm = context.packageManager
            val packages = pm.getInstalledPackages(
                PackageManager.GET_PERMISSIONS or 
                PackageManager.GET_META_DATA
            )
            val apps = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    val installer = pm.getInstallerPackageName(pkg.packageName)
                    
                    // Get permissions
                    val permissions = JSONArray()
                    val dangerousPermissions = JSONArray()
                    pkg.requestedPermissions?.forEach { perm ->
                        permissions.put(perm)
                        if (isDangerousPermission(perm)) {
                            dangerousPermissions.put(perm)
                        }
                    }

                    val appJson = JSONObject().apply {
                        put("packageName", pkg.packageName)
                        put("label", info.loadLabel(pm).toString())
                        put("versionName", pkg.versionName ?: "Unknown")
                        put("versionCode", pkg.versionCode)
                        put("targetSdk", pkg.applicationInfo?.targetSdkVersion ?: 0)
                        put("minSdk", pkg.applicationInfo?.minSdkVersion ?: 0)
                        put("isSystemApp", isSystem)
                        put("isLaunchable", isLaunchable(pm, pkg.packageName))
                        put("firstInstallTime", pkg.firstInstallTime)
                        put("lastUpdateTime", pkg.lastUpdateTime)
                        put("requestedPermissions", permissions)
                        put("grantedPermissions", permissions) // Simplified
                        put("dangerousPermissions", dangerousPermissions)
                        put("installerPackage", installer ?: "")
                        put("isDebuggable", (info.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0)
                        put("enabled", pkg.applicationInfo?.enabled ?: true)
                    }
                    apps.put(appJson)
                }
            }

            val result = JSObject()
            result.put("apps", apps)
            result.put("count", apps.length())
            result.put("success", true)
            call.resolve(result)

        } catch (e: Exception) {
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun scanForRisks(call: PluginCall) {
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val pm = context.packageManager
            val packages = pm.getInstalledPackages(
                PackageManager.GET_PERMISSIONS or 
                PackageManager.GET_META_DATA
            )
            val riskReports = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    val installer = pm.getInstallerPackageName(pkg.packageName)
                    val isSideloaded = !isSystem && 
                        installer != "com.android.vending" && 
                        installer != "com.google.android.feedback"

                    val dangerousPerms = mutableListOf<String>()
                    pkg.requestedPermissions?.forEach { perm ->
                        if (isDangerousPermission(perm)) {
                            dangerousPerms.add(perm)
                        }
                    }

                    val findings = JSONArray()
                    var overallRisk = "LOW"
                    val riskSignals = mutableListOf<JSONObject>()

                    // Check 1: Sideloaded
                    if (isSideloaded) {
                        overallRisk = if (dangerousPerms.size > 0) "HIGH" else "MEDIUM"
                        riskSignals.add(JSONObject().apply {
                            put("id", "sideloaded-${pkg.packageName}")
                            put("level", "HIGH")
                            put("summary", "App was sideloaded from ${installer ?: "unknown source"}")
                        })
                    }

                    // Check 2: Dangerous permissions
                    if (dangerousPerms.size >= 3) {
                        if (overallRisk != "HIGH") overallRisk = "MEDIUM"
                        riskSignals.add(JSONObject().apply {
                            put("id", "dangerous-perms-${pkg.packageName}")
                            put("level", if (dangerousPerms.size > 4) "HIGH" else "MEDIUM")
                            put("summary", "Has ${dangerousPerms.size} dangerous permissions: ${dangerousPerms.joinToString(", ")}")
                        })
                    }

                    // Check 3: Debuggable
                    if ((info.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                        overallRisk = if (overallRisk == "LOW") "MEDIUM" else overallRisk
                        riskSignals.add(JSONObject().apply {
                            put("id", "debuggable-${pkg.packageName}")
                            put("level", "HIGH")
                            put("summary", "App is debuggable - allows memory inspection")
                        })
                    }

                    // Check 4: Low target SDK
                    val targetSdk = info.targetSdkVersion
                    if (targetSdk > 0 && targetSdk < 31) {
                        if (overallRisk == "LOW") overallRisk = "MEDIUM"
                        riskSignals.add(JSONObject().apply {
                            put("id", "legacy-sdk-${pkg.packageName}")
                            put("level", "MEDIUM")
                            put("summary", "Targets legacy SDK ${targetSdk} (bypasses modern security)")
                        })
                    }

                    // Only include if there are findings
                    if (riskSignals.isNotEmpty()) {
                        val report = JSONObject().apply {
                            put("packageName", pkg.packageName)
                            put("label", info.loadLabel(pm).toString())
                            put("overallRisk", overallRisk)
                            put("findings", JSONArray().apply {
                                riskSignals.forEach { signal -> put(signal) }
                            })
                        }
                        riskReports.put(report)
                    }
                }
            }

            val result = JSObject()
            result.put("reports", riskReports)
            result.put("count", riskReports.length())
            result.put("success", true)
            call.resolve(result)

        } catch (e: Exception) {
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {
        // This method is called by your UI
        // We'll reuse scanForRisks logic
        scanForRisks(call)
    }

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val result = JSObject().apply {
                put("screenLock", false)
                put("encryption", false)
                put("securityPatch", "2026-08-01")
                put("usbDebugging", false)
                put("developerOptions", false)
                put("unknownSources", false)
                put("vpnStatus", false)
                put("success", true)
            }
            call.resolve(result)

        } catch (e: Exception) {
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun checkConnection(call: PluginCall) {
        val result = JSObject()
        result.put("connected", true)
        result.put("message", "SecureDroid plugin is working!")
        call.resolve(result)
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        // TODO: Implement VPN start
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN started (simulated)")
        call.resolve(result)
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        // TODO: Implement VPN stop
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN stopped (simulated)")
        call.resolve(result)
    }

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        val result = JSObject()
        result.put("isActive", false)
        result.put("establishedTime", 0)
        result.put("bytesIn", 0)
        result.put("bytesOut", 0)
        result.put("activeTunnelType", "NONE")
        result.put("connectedServer", "")
        call.resolve(result)
    }

    // Helper methods
    private fun isDangerousPermission(permission: String): Boolean {
        return permission.contains("LOCATION") ||
               permission.contains("CAMERA") ||
               permission.contains("RECORD_AUDIO") ||
               permission.contains("CONTACTS") ||
               permission.contains("SMS") ||
               permission.contains("CALL_PHONE") ||
               permission.contains("READ_EXTERNAL_STORAGE") ||
               permission.contains("WRITE_EXTERNAL_STORAGE")
    }

    private fun isLaunchable(pm: PackageManager, packageName: String): Boolean {
        return try {
            val intent = pm.getLaunchIntentForPackage(packageName)
            intent != null
        } catch (_: Exception) {
            false
        }
    }
}
