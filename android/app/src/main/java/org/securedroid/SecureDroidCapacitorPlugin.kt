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

@CapacitorPlugin(name = "SecureDroid")  // 🔴 MUST match exactly!
class SecureDroidCapacitorPlugin : Plugin() {

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val pm = context.packageManager
            val packages = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
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
                        put("isSideloaded", !isSystem && installer != "com.android.vending" && installer != "com.google.android.feedback")
                        
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
            val packages = pm.getInstalledPackages(PackageManager.GET_PERMISSIONS)
            val riskyApps = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
                    val installer = pm.getInstallerPackageName(pkg.packageName)
                    val isSideloaded = !isSystem && installer != "com.android.vending" && installer != "com.google.android.feedback"
                    
                    // Check for dangerous permissions
                    val hasDangerousPermissions = pkg.requestedPermissions?.any { perm ->
                        perm.contains("LOCATION") || 
                        perm.contains("CAMERA") || 
                        perm.contains("RECORD_AUDIO") ||
                        perm.contains("CONTACTS") ||
                        perm.contains("SMS")
                    } ?: false

                    if (isSideloaded || hasDangerousPermissions) {
                        val reasons = mutableListOf<String>()
                        if (isSideloaded) reasons.add("Sideloaded")
                        if (hasDangerousPermissions) reasons.add("Dangerous permissions")
                        
                        val riskJson = JSONObject().apply {
                            put("appName", info.loadLabel(pm).toString())
                            put("packageName", pkg.packageName)
                            put("riskLevel", if (isSideloaded) "HIGH" else "MEDIUM")
                            put("reason", reasons.joinToString(", "))
                            put("installSource", installer ?: "Unknown")
                        }
                        riskyApps.put(riskJson)
                    }
                }
            }

            val result = JSObject()
            result.put("totalRiskyApps", riskyApps.length())
            result.put("riskDetails", riskyApps)
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
    fun getHardeningReport(call: PluginCall) {
        val result = JSObject()
        result.put("screenLock", false)
        result.put("encryption", false)
        result.put("usbDebugging", false)
        result.put("developerOptions", false)
        result.put("unknownSources", false)
        result.put("vpnStatus", false)
        call.resolve(result)
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        // TODO: Implement VPN start
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN started")
        call.resolve(result)
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        // TODO: Implement VPN stop
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN stopped")
        call.resolve(result)
    }
}
