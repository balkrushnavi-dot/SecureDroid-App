package org.securedroid

import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONArray
import org.json.JSONObject
import org.securedroid.vpn.SecureVpnService

class SecureDroidModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val appScanner = AppScanner(reactContext)

    override fun getName() = "SecureDroidModule"

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val apps = appScanner.getInstalledApps()
            val jsonArray = JSONArray()

            apps.forEach { app ->
                val appJson = JSONObject().apply {
                    put("packageName", app.packageName)
                    put("appName", app.appName)
                    put("versionName", app.versionName)
                    put("versionCode", app.versionCode)
                    put("isSystemApp", app.isSystemApp)
                    put("installTime", app.installTime)
                    put("updateTime", app.updateTime)
                    put("isSideloaded", app.isSideloaded)
                    put("installSource", app.installSource)
                    
                    // Permissions
                    val permissionsArray = JSONArray()
                    app.permissions.forEach { permission ->
                        permissionsArray.put(
                            JSONObject().apply {
                                put("name", permission)
                                put("riskLevel", getPermissionRiskLevel(permission))
                                put("description", getPermissionDescription(permission))
                            }
                        )
                    }
                    put("permissions", permissionsArray)
                    
                    // Risk assessment
                    put("securityScore", calculateSecurityScore(app))
                    put("privacyScore", calculatePrivacyScore(app))
                    put("riskLevel", getRiskLevel(app))
                }
                jsonArray.put(appJson)
            }

            val result = JSONObject().apply {
                put("apps", jsonArray)
                put("success", true)
            }

            promise.resolve(result.toString())

        } catch (e: Exception) {
            promise.reject("ERROR", "Failed to get installed apps: ${e.message}")
        }
    }

    @ReactMethod
    fun startVpn(promise: Promise) {
        try {
            val intent = Intent(reactContext, SecureVpnService::class.java)
            intent.action = "START"
            reactContext.startService(intent)
            
            val result = JSONObject().apply {
                put("success", true)
                put("message", "VPN started successfully")
            }
            promise.resolve(result.toString())

        } catch (e: Exception) {
            promise.reject("VPN_ERROR", "Failed to start VPN: ${e.message}")
        }
    }

    @ReactMethod
    fun stopVpn(promise: Promise) {
        try {
            val intent = Intent(reactContext, SecureVpnService::class.java)
            intent.action = "STOP"
            reactContext.stopService(intent)

            val result = JSONObject().apply {
                put("success", true)
                put("message", "VPN stopped successfully")
            }
            promise.resolve(result.toString())

        } catch (e: Exception) {
            promise.reject("VPN_ERROR", "Failed to stop VPN: ${e.message}")
        }
    }

    @ReactMethod
    fun scanForRisks(promise: Promise) {
        try {
            val riskyApps = appScanner.getRiskyApps()
            val result = JSONObject().apply {
                put("totalRiskyApps", riskyApps.size)
                put("riskDetails", JSONArray().apply {
                    riskyApps.forEach { app ->
                        put(JSONObject().apply {
                            put("appName", app.appName)
                            put("packageName", app.packageName)
                            put("riskLevel", getRiskLevel(app))
                            put("reason", getRiskReason(app))
                        })
                    }
                })
                put("success", true)
            }
            promise.resolve(result.toString())

        } catch (e: Exception) {
            promise.reject("SCAN_ERROR", "Failed to scan for risks: ${e.message}")
        }
    }

    // Helper methods
    private fun getPermissionRiskLevel(permission: String): String {
        return when {
            permission.contains("LOCATION") -> "HIGH"
            permission.contains("CAMERA") -> "HIGH"
            permission.contains("RECORD_AUDIO") -> "HIGH"
            permission.contains("CONTACTS") -> "HIGH"
            permission.contains("SMS") -> "HIGH"
            permission.contains("CALL_PHONE") -> "HIGH"
            permission.contains("STORAGE") -> "MEDIUM"
            permission.contains("ACCOUNTS") -> "MEDIUM"
            permission.contains("INTERNET") -> "MEDIUM"
            else -> "LOW"
        }
    }

    private fun getPermissionDescription(permission: String): String {
        return when {
            permission.contains("LOCATION") -> "Access to device location"
            permission.contains("CAMERA") -> "Access to camera"
            permission.contains("RECORD_AUDIO") -> "Access to microphone"
            permission.contains("CONTACTS") -> "Access to contacts"
            permission.contains("SMS") -> "Access to SMS messages"
            permission.contains("CALL_PHONE") -> "Can make phone calls"
            permission.contains("STORAGE") -> "Access to storage"
            permission.contains("INTERNET") -> "Internet access"
            permission.contains("ACCOUNTS") -> "Access to accounts"
            else -> "Permission: $permission"
        }
    }

    private fun calculateSecurityScore(app: AppScanner.AppInfo): Int {
        var score = 100

        if (app.isSideloaded) score -= 20
        if (app.permissions.size > 15) score -= 15
        
        val dangerousPermissions = app.permissions.count { 
            getPermissionRiskLevel(it) == "HIGH" 
        }
        score -= dangerousPermissions * 5

        return maxOf(0, minOf(100, score))
    }

    private fun calculatePrivacyScore(app: AppScanner.AppInfo): Int {
        var score = 100
        
        val privacySensitive = listOf(
            "LOCATION" to 20,
            "CAMERA" to 15,
            "RECORD_AUDIO" to 15,
            "CONTACTS" to 15,
            "SMS" to 15,
            "CALL_PHONE" to 10,
            "STORAGE" to 10,
            "ACCOUNTS" to 10
        )

        privacySensitive.forEach { (keyword, deduction) ->
            if (app.permissions.any { it.contains(keyword) }) {
                score -= deduction
            }
        }

        return maxOf(0, minOf(100, score))
    }

    private fun getRiskLevel(app: AppScanner.AppInfo): String {
        val score = calculateSecurityScore(app)
        return when {
            score < 40 -> "CRITICAL"
            score < 60 -> "HIGH"
            score < 80 -> "MEDIUM"
            else -> "LOW"
        }
    }

    private fun getRiskReason(app: AppScanner.AppInfo): String {
        val reasons = mutableListOf<String>()

        if (app.isSideloaded) {
            reasons.add("Sideloaded app (not from Play Store)")
        }

        val dangerousPermissions = app.permissions.filter {
            getPermissionRiskLevel(it) == "HIGH"
        }
        if (dangerousPermissions.isNotEmpty()) {
            reasons.add("Has ${dangerousPermissions.size} dangerous permissions")
        }

        if (app.permissions.size > 15) {
            reasons.add("Requests ${app.permissions.size} permissions")
        }

        return reasons.joinToString("; ")
    }
}
