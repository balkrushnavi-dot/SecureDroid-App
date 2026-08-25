package org.securedroid

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class SecureDroidModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    override fun getName() = "SecureDroidModule"
    
    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val apps = AppScanner(reactContext).getInstalledApps()
            // Convert to JSON and return
            promise.resolve(convertAppsToJson(apps))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
    
    @ReactMethod
    fun startVPN(promise: Promise) {
        try {
            val intent = Intent(reactContext, VpnService::class.java)
            intent.action = "START"
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("VPN_ERROR", e.message)
        }
    }
}
