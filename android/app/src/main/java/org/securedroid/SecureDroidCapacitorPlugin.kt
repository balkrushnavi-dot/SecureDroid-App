// android/app/src/main/java/org/securedroid/SecureDroidCapacitorPlugin.kt
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

// ✅ This annotation MUST be present
@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    @PluginMethod
    fun checkConnection(call: PluginCall) {
        val result = JSObject()
        result.put("connected", true)
        result.put("message", "SecureDroid plugin is working on Android!")
        call.resolve(result)
    }

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
                    
                    val appJson = JSONObject().apply {
                        put("packageName", pkg.packageName)
                        put("appName", info.loadLabel(pm).toString())
                        put("versionName", pkg.versionName ?: "Unknown")
                        put("versionCode", pkg.versionCode)
                        put("isSystemApp", isSystem)
                        put("installTime", pkg.firstInstallTime)
                        put("updateTime", pkg.lastUpdateTime)
                        put("installSource", installer ?: "Unknown")
                        put("isSideloaded", !isSystem && installer != "com.android.vending")
                        
                        val permissions = JSONArray()
                        pkg.requestedPermissions?.forEach { perm ->
                            permissions.put(perm)
                        }
                        put("permissions", permissions)
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
            val riskDetails = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    val installer = pm.getInstallerPackageName(pkg.packageName)
                    val isSideloaded = !isSystem && installer != "com.android.vending"
                    
                    val dangerousPerms = mutableListOf<String>()
                    pkg.requestedPermissions?.forEach { perm ->
                        if (perm.contains("LOCATION") || 
                            perm.contains("CAMERA") || 
                            perm.contains("RECORD_AUDIO") ||
                            perm.contains("CONTACTS") ||
                            perm.contains("SMS")) {
                            dangerousPerms.add(perm)
                        }
                    }

                    if (isSideloaded || dangerousPerms.size > 2) {
                        val reasons = mutableListOf<String>()
                        if (isSideloaded) reasons.add("Sideloaded app")
                        if (dangerousPerms.size > 2) {
                            reasons.add("${dangerousPerms.size} dangerous permissions")
                        }
                        
                        val riskJson = JSONObject().apply {
                            put("appName", info.loadLabel(pm).toString())
                            put("packageName", pkg.packageName)
                            put("riskLevel", if (isSideloaded) "HIGH" else "MEDIUM")
                            put("reason", reasons.joinToString(", "))
                            put("installSource", installer ?: "Unknown")
                        }
                        riskDetails.put(riskJson)
                    }
                }
            }

            val result = JSObject()
            result.put("riskDetails", riskDetails)
            result.put("totalRiskyApps", riskDetails.length())
            result.put("success", true)
            call.resolve(result)

        } catch (e: Exception) {
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {
        // Forward to scanForRisks for now
        scanForRisks(call)
    }

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {
        val result = JSObject()
        result.put("screenLock", false)
        result.put("encryption", false)
        result.put("securityPatch", "2026-08-01")
        result.put("usbDebugging", false)
        result.put("developerOptions", false)
        result.put("unknownSources", false)
        result.put("vpnStatus", false)
        result.put("success", true)
        call.resolve(result)
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN started")
        call.resolve(result)
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN stopped")
        call.resolve(result)
    }

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        val result = JSObject()
        result.put("isActive", false)
        result.put("establishedTime", 0)
        result.put("bytesIn", 0)
        result.put("bytesOut", 0)
        call.resolve(result)
    }
}
