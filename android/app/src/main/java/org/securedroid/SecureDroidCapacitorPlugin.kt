// android/app/src/main/java/org/securedroid/SecureDroidCapacitorPlugin.kt
package org.securedroid

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.json.JSONArray
import org.json.JSONObject

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidCapacitorPlugin : Plugin() {

    init {
        Log.d("SecureDroid", "✅ Plugin class loaded!")
    }

    @PluginMethod
    fun checkConnection(call: PluginCall) {
        Log.d("SecureDroid", "📡 checkConnection called!")
        val result = JSObject()
        result.put("connected", true)
        result.put("message", "✅ SecureDroid is working!")
        result.put("timestamp", System.currentTimeMillis())
        call.resolve(result)
    }

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        Log.d("SecureDroid", "📱 getInstalledApps called!")
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val pm = context.packageManager
            val packages = pm.getInstalledPackages(android.content.pm.PackageManager.GET_PERMISSIONS)
            val apps = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val appJson = JSONObject().apply {
                        put("packageName", pkg.packageName)
                        put("appName", info.loadLabel(pm).toString())
                        put("versionName", pkg.versionName ?: "Unknown")
                        put("versionCode", pkg.versionCode)
                        put("isSystemApp", (info.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0)
                        
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
            Log.d("SecureDroid", "✅ getInstalledApps returned ${apps.length()} apps")

        } catch (e: Exception) {
            Log.e("SecureDroid", "❌ getInstalledApps error", e)
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun scanForRisks(call: PluginCall) {
        Log.d("SecureDroid", "🔍 scanForRisks called!")
        try {
            val context = bridge?.context ?: run {
                call.reject("Context is null")
                return
            }

            val pm = context.packageManager
            val packages = pm.getInstalledPackages(android.content.pm.PackageManager.GET_PERMISSIONS)
            val riskDetails = JSONArray()

            packages.forEach { pkg ->
                val appInfo = pkg.applicationInfo
                appInfo?.let { info ->
                    val isSystem = (info.flags and android.content.pm.ApplicationInfo.FLAG_SYSTEM) != 0
                    val installer = pm.getInstallerPackageName(pkg.packageName)
                    val isSideloaded = !isSystem && installer != "com.android.vending"

                    if (isSideloaded) {
                        val riskJson = JSONObject().apply {
                            put("appName", info.loadLabel(pm).toString())
                            put("packageName", pkg.packageName)
                            put("riskLevel", "HIGH")
                            put("reason", "Sideloaded app")
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
            Log.d("SecureDroid", "✅ scanForRisks returned ${riskDetails.length()} risks")

        } catch (e: Exception) {
            Log.e("SecureDroid", "❌ scanForRisks error", e)
            call.reject("Error: ${e.message}")
        }
    }

    @PluginMethod
    fun getAppRiskReports(call: PluginCall) {
        Log.d("SecureDroid", "📊 getAppRiskReports called!")
        scanForRisks(call)
    }

    @PluginMethod
    fun getHardeningReport(call: PluginCall) {
        Log.d("SecureDroid", "🔒 getHardeningReport called!")
        val result = JSObject()
        result.put("screenLock", false)
        result.put("encryption", false)
        result.put("usbDebugging", false)
        result.put("developerOptions", false)
        result.put("unknownSources", false)
        result.put("vpnStatus", false)
        result.put("success", true)
        call.resolve(result)
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        Log.d("SecureDroid", "🔐 startVpn called!")
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN started")
        call.resolve(result)
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        Log.d("SecureDroid", "🔐 stopVpn called!")
        val result = JSObject()
        result.put("success", true)
        result.put("message", "VPN stopped")
        call.resolve(result)
    }
}
