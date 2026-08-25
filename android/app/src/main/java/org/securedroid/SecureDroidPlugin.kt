package org.securedroid

import android.content.Context
import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import org.securedroid.apps.models.AppInfo

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidPlugin : Plugin() {
    
    companion object {
        private const val TAG = "SecureDroidPlugin"
    }
    
    private lateinit var appScanner: AppScanner
    private lateinit var vpnManager: SecureVpnManager
    private lateinit var hardeningAnalyzer: HardeningAnalyzer
    
    override fun load() {
        super.load()
        val context = context ?: return
        appScanner = AppScanner(context)
        vpnManager = SecureVpnManager(context)
        hardeningAnalyzer = HardeningAnalyzer()
    }
    
    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apps = appScanner.scanAllApps()
                val appArray = JSONArray()
                
                apps.forEach { enhancedApp ->
                    val appJson = JSONObject().apply {
                        put("packageName", enhancedApp.baseInfo.packageName)
                        put("appName", enhancedApp.baseInfo.appName)
                        put("versionName", enhancedApp.baseInfo.versionName)
                        put("versionCode", enhancedApp.baseInfo.versionCode)
                        put("isSystemApp", enhancedApp.baseInfo.isSystemApp)
                        put("installTime", enhancedApp.baseInfo.installTime)
                        put("updateTime", enhancedApp.baseInfo.lastUpdateTime)
                        put("isSideloaded", enhancedApp.isSideloaded)
                        put("installSource", enhancedApp.installSource)
                        put("securityScore", enhancedApp.securityScore)
                        put("privacyScore", enhancedApp.privacyScore)
                        put("riskLevel", enhancedApp.riskLevel.name)
                        put("riskColor", enhancedApp.riskColor)
                        put("riskIcon", enhancedApp.riskIcon)
                        
                        // Permissions
                        val permissionsArray = JSONArray()
                        enhancedApp.permissions.forEach { permission ->
                            val permJson = JSONObject().apply {
                                put("name", permission.name)
                                put("isGranted", permission.isGranted)
                                put("riskLevel", permission.riskLevel)
                                put("description", permission.description)
                            }
                            permissionsArray.put(permJson)
                        }
                        put("permissions", permissionsArray)
                    }
                    appArray.put(appJson)
                }
                
                val result = JSObject()
                result.put("apps", appArray)
                call.resolve(result)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error getting installed apps", e)
                call.reject("Failed to get installed apps: ${e.message}")
            }
        }
    }
    
    @PluginMethod
    fun getDeviceHardening(call: PluginCall) {
        try {
            val report = hardeningAnalyzer.getHardeningReport()
            val result = JSObject()
            
            result.put("screenLock", report.screenLock)
            result.put("encryption", report.encryption)
            result.put("securityPatch", report.securityPatch)
            result.put("usbDebugging", report.usbDebugging)
            result.put("developerOptions", report.developerOptions)
            result.put("unknownSources", report.unknownSources)
            result.put("vpnStatus", report.vpnStatus)
            
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting hardening report", e)
            call.reject("Failed to get hardening report")
        }
    }
    
    @PluginMethod
    fun startVpn(call: PluginCall) {
        try {
            vpnManager.startVpn()
            val result = JSObject()
            result.put("success", true)
            result.put("message", "VPN started successfully")
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting VPN", e)
            call.reject("Failed to start VPN: ${e.message}")
        }
    }
    
    @PluginMethod
    fun stopVpn(call: PluginCall) {
        try {
            vpnManager.stopVpn()
            val result = JSObject()
            result.put("success", true)
            result.put("message", "VPN stopped successfully")
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping VPN", e)
            call.reject("Failed to stop VPN: ${e.message}")
        }
    }
    
    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        try {
            val status = vpnManager.getVpnStatus()
            val result = JSObject()
            result.put("isConnected", status.isConnected)
            result.put("isActive", status.isActive)
            result.put("message", status.message)
            call.resolve(result)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting VPN status", e)
            call.reject("Failed to get VPN status")
        }
    }
    
    @PluginMethod
    fun scanForRisks(call: PluginCall) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apps = appScanner.scanAllApps()
                val riskyApps = apps.filter { 
                    it.riskLevel in listOf(AppRiskLevel.HIGH, AppRiskLevel.CRITICAL)
                }
                
                val result = JSObject()
                result.put("totalApps", apps.size)
                result.put("riskyApps", riskyApps.size)
                result.put("riskDetails", JSONArray().apply {
                    riskyApps.forEach { app ->
                        put(JSONObject().apply {
                            put("name", app.baseInfo.appName)
                            put("riskLevel", app.riskLevel.name)
                            put("securityScore", app.securityScore)
                            put("privacyScore", app.privacyScore)
                            put("reason", getRiskReason(app))
                        })
                    }
                })
                
                call.resolve(result)
            } catch (e: Exception) {
                Log.e(TAG, "Error scanning for risks", e)
                call.reject("Failed to scan for risks")
            }
        }
    }
    
    private fun getRiskReason(app: EnhancedAppInfo): String {
        val reasons = mutableListOf<String>()
        
        if (app.isSideloaded) {
            reasons.add("Sideloaded app (not from Play Store)")
        }
        
        val dangerousPermissions = app.permissions.filter { 
            it.isGranted && it.riskLevel == "HIGH"
        }
        
        if (dangerousPermissions.isNotEmpty()) {
            reasons.add("Has ${dangerousPermissions.size} dangerous permissions")
        }
        
        if (app.permissions.size > 20) {
            reasons.add("Requests ${app.permissions.size} permissions")
        }
        
        return reasons.joinToString("; ")
    }
}You 
