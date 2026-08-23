
package com.securedroid.app

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.securedroid.app.services.*

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidPlugin : Plugin() {

    private val deviceInfoManager by lazy { DeviceInfoManager(context) }
    private val batteryManager by lazy { BatteryManager(context) }
    private val networkManager by lazy { NetworkManager(context) }
    private val storageManager by lazy { StorageManager(context) }
    private val sensorManager by lazy { SensorManager(context) }
    private val biometricManager by lazy { BiometricManager(activity) }
    private val permissionManager by lazy { PermissionManager(activity) }
    private val appManager by lazy { AppManager(context) }
    private val calendarManager by lazy { CalendarManager(context) }
    private val contactsManager by lazy { ContactsManager(context) }
    private val fileManager by lazy { FileManager(context) }
    private val securityManager by lazy { SecurityManager(context) }
    private val secureStorageManager by lazy { SecureStorageManager(context) }
    private val securityLogManager by lazy { SecurityLogManager(context) }
    private val vpnManager by lazy { VpnManager(context, activity) }

    @PluginMethod
    fun getDeviceInfo(call: PluginCall) {
        try {
            val data = deviceInfoManager.getDeviceInfo()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("DEVICE_INFO_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun getBatteryStatus(call: PluginCall) {
        try {
            val data = batteryManager.getBatteryStatus()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("BATTERY_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun getNetworkState(call: PluginCall) {
        try {
            val data = networkManager.getNetworkState()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("NETWORK_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun getStorageInfo(call: PluginCall) {
        try {
            val data = storageManager.getStorageInfo()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("STORAGE_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun getAvailableSensors(call: PluginCall) {
        try {
            val data = sensorManager.getAvailableSensors()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("SENSOR_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun isBiometricAvailable(call: PluginCall) {
        try {
            val data = biometricManager.isBiometricAvailable()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("BIOMETRIC_CHECK_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun authenticateBiometric(call: PluginCall) {
        val title = call.getString("title") ?: "Authenticate"
        val subtitle = call.getString("subtitle")
        val description = call.getString("description")

        biometricManager.authenticate(title, subtitle, description, object : BiometricManager.BiometricAuthCallback {
            override fun onSuccess() {
                val data = JSObject().apply {
                    put("authenticated", true)
                    put("authType", "BIOMETRIC_STRONG")
                    put("timestamp", System.currentTimeMillis())
                }
                val ret = JSObject().apply {
                    put("success", true)
                    put("data", data)
                    put("runtimePlatform", "android_native")
                }
                call.resolve(ret)
            }

            override fun onError(errorCode: Int, errString: CharSequence) {
                val ret = JSObject().apply {
                    put("success", false)
                    put("errorCode", "AUTHENTICATION_FAILED")
                    put("message", errString.toString())
                    put("recoverable", true)
                }
                call.resolve(ret)
            }

            override fun onFailed() {
                val ret = JSObject().apply {
                    put("success", false)
                    put("errorCode", "AUTHENTICATION_FAILED")
                    put("message", "Biometric verification failed.")
                    put("recoverable", true)
                }
                call.resolve(ret)
            }
        })
    }

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val data = appManager.getInstalledApps()
            val ret = JSObject().apply {
                put("success", true)
                put("data", data)
                put("runtimePlatform", "android_native")
                put("isSupported", true)
            }
            call.resolve(ret)
        } catch (e: Exception) {
            call.reject("APP_MANAGER_ERROR", e.localizedMessage, e)
        }
    }

    @PluginMethod
    fun launchApp(call: PluginCall) {
        val pkg = call.getString("packageName")
        if (pkg == null) {
            call.reject("INVALID_ARGUMENT", "Package name is required")
            return
        }
        val launched = appManager.launchApp(pkg)
        val ret = JSObject().apply {
            put("success", launched)
            put("data", launched)
            if (!launched) {
                put("errorCode", "SERVICE_UNAVAILABLE")
                put("message", "Could not launch package $pkg")
            }
        }
        call.resolve(ret)
    }

    @PluginMethod
    fun openAppSettings(call: PluginCall) {
        permissionManager.openAppSettings()
        call.resolve(JSObject().apply { put("success", true) })
    }

    @PluginMethod
    fun secureStorageSet(call: PluginCall) {
        val key = call.getString("key")
        val value = call.getString("value")
        if (key == null || value == null) {
            call.reject("INVALID_ARGUMENT", "Key and value required")
            return
        }
        val success = secureStorageManager.set(key, value)
        call.resolve(JSObject().apply { put("success", success); put("data", success) })
    }

    @PluginMethod
    fun secureStorageGet(call: PluginCall) {
        val key = call.getString("key")
        if (key == null) {
            call.reject("INVALID_ARGUMENT", "Key required")
            return
        }
        val value = secureStorageManager.get(key)
        call.resolve(JSObject().apply { put("success", true); put("data", value) })
    }

    @PluginMethod
    fun secureStorageRemove(call: PluginCall) {
        val key = call.getString("key")
        if (key == null) {
            call.reject("INVALID_ARGUMENT", "Key required")
            return
        }
        val removed = secureStorageManager.remove(key)
        call.resolve(JSObject().apply { put("success", removed); put("data", removed) })
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        vpnManager.startVpn(call)
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        val status = vpnManager.stopVpn()
        call.resolve(JSObject().apply { put("success", true); put("data", status) })
    }

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        val status = vpnManager.getVpnStatus()
        call.resolve(JSObject().apply { put("success", true); put("data", status) })
    }

    @PluginMethod
    fun getVmHardwareCapability(call: PluginCall) {
        val data = securityManager.getVmHardwareCapability()
        call.resolve(JSObject().apply {
            put("success", true)
            put("data", data)
            put("runtimePlatform", "android_native")
        })
    }
}
