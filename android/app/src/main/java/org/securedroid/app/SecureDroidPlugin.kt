package org.securedroid.app

import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import org.securedroid.admin.SecureDroidDeviceAdmin
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.space.SecureSpaceManager
import org.securedroid.vault.SecureVault
import org.securedroid.vpn.SecureVpnManager

@CapacitorPlugin(name = "SecureDroid")
class SecureDroidPlugin : Plugin() {

    private val admin by lazy {
        SecureDroidDeviceAdmin(context)
    }

    private val appScanner by lazy {
        InstalledAppScanner(context)
    }

    private val diagnostics by lazy {
        DeviceDiagnostics(context)
    }

    private val secureSpace by lazy {
        SecureSpaceManager(context)
    }

    private val vault by lazy {
        SecureVault()
    }

    private val vpn by lazy {
        SecureVpnManager(context)
    }

    @PluginMethod
    fun getSecurityStatus(call: PluginCall) {
        try {
            val diagnostic = diagnostics.run()

            val data = JSObject().apply {
                put("adminEnabled", admin.isEnabled())
                put("cameraDisabled", admin.isCameraDisabled())
                put("vpnConnected", vpn.isConnected())
                put("vpnState", vpn.getState().name)
                put("secureSpaceEnabled", secureSpace.isEnabled())
                put("networkAvailable", diagnostic.isNetworkAvailable)
                put("vpnActive", diagnostic.isVpnActive)
                put("screenLocked", diagnostic.isScreenLocked)
                put("powerSaveMode", diagnostic.isPowerSaveMode)
            }

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("data", data)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "SECURITY_STATUS_ERROR",
                e.message ?: "Unable to get security status",
                e
            )
        }
    }

    @PluginMethod
    fun getDeviceDiagnostics(call: PluginCall) {
        try {
            val result = diagnostics.run()

            val data = JSObject().apply {
                put("androidVersion", result.androidVersion)
                put("sdkVersion", result.sdkVersion)
                put("deviceModel", result.deviceModel)
                put("manufacturer", result.manufacturer)
                put("networkAvailable", result.isNetworkAvailable)
                put("vpnActive", result.isVpnActive)
                put("screenLocked", result.isScreenLocked)
                put("powerSaveMode", result.isPowerSaveMode)
            }

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("data", data)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "DIAGNOSTICS_ERROR",
                e.message ?: "Unable to run diagnostics",
                e
            )
        }
    }

    @PluginMethod
    fun getInstalledApps(call: PluginCall) {
        try {
            val apps = appScanner.scan()

            val array = com.getcapacitor.JSArray()

            apps.forEach { app ->
                array.put(
                    JSObject().apply {
                        put("packageName", app.packageName)
                        put("appName", app.appName)
                        put("versionName", app.versionName)
                        put("versionCode", app.versionCode)
                        put("isSystemApp", app.isSystemApp)
                        put("isEnabled", app.isEnabled)
                    }
                )
            }

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("data", array)
                    put("count", apps.size)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "APP_SCAN_ERROR",
                e.message ?: "Unable to scan installed applications",
                e
            )
        }
    }

    @PluginMethod
    fun isAppInstalled(call: PluginCall) {
        val packageName = call.getString("packageName")

        if (packageName.isNullOrBlank()) {
            call.reject(
                "INVALID_ARGUMENT",
                "packageName is required"
            )
            return
        }

        try {
            val installed = appScanner.isInstalled(packageName)

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("data", installed)
                    put("packageName", packageName)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "APP_CHECK_ERROR",
                e.message ?: "Unable to check application",
                e
            )
        }
    }

    @PluginMethod
    fun getAdminStatus(call: PluginCall) {
        try {
            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("enabled", admin.isEnabled())
                    put("cameraDisabled", admin.isCameraDisabled())
                }
            )
        } catch (e: Exception) {
            call.reject(
                "ADMIN_STATUS_ERROR",
                e.message ?: "Unable to get administrator status",
                e
            )
        }
    }

    @PluginMethod
    fun setCameraDisabled(call: PluginCall) {
        val disabled = call.getBoolean("disabled")

        if (disabled == null) {
            call.reject(
                "INVALID_ARGUMENT",
                "disabled is required"
            )
            return
        }

        try {
            val success = admin.setCameraDisabled(disabled)

            call.resolve(
                JSObject().apply {
                    put("success", success)
                    put("data", success)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "CAMERA_POLICY_ERROR",
                e.message ?: "Unable to change camera policy",
                e
            )
        }
    }

    @PluginMethod
    fun getSecureSpaceStatus(call: PluginCall) {
        call.resolve(
            JSObject().apply {
                put("success", true)
                put("enabled", secureSpace.isEnabled())
            }
        )
    }

    @PluginMethod
    fun setSecureSpace(call: PluginCall) {
        val enabled = call.getBoolean("enabled")

        if (enabled == null) {
            call.reject(
                "INVALID_ARGUMENT",
                "enabled is required"
            )
            return
        }

        val success = secureSpace.setEnabled(enabled)

        call.resolve(
            JSObject().apply {
                put("success", success)
                put("enabled", secureSpace.isEnabled())
            }
        )
    }

    @PluginMethod
    fun encrypt(call: PluginCall) {
        val data = call.getString("data")

        if (data == null) {
            call.reject(
                "INVALID_ARGUMENT",
                "data is required"
            )
            return
        }

        try {
            val encrypted = vault.encrypt(data)

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put(
                        "data",
                        JSObject().apply {
                            put("ciphertext", encrypted.ciphertext)
                            put("iv", encrypted.iv)
                        }
                    )
                }
            )
        } catch (e: Exception) {
            call.reject(
                "ENCRYPTION_ERROR",
                e.message ?: "Unable to encrypt data",
                e
            )
        }
    }

    @PluginMethod
    fun decrypt(call: PluginCall) {
        val ciphertext = call.getString("ciphertext")
        val iv = call.getString("iv")

        if (ciphertext == null || iv == null) {
            call.reject(
                "INVALID_ARGUMENT",
                "ciphertext and iv are required"
            )
            return
        }

        try {
            val decrypted = vault.decrypt(
                SecureVault.EncryptedData(
                    ciphertext = ciphertext,
                    iv = iv
                )
            )

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("data", decrypted)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "DECRYPTION_ERROR",
                e.message ?: "Unable to decrypt data",
                e
            )
        }
    }

    @PluginMethod
    fun startVpn(call: PluginCall) {
        try {
            val started = vpn.start()

            call.resolve(
                JSObject().apply {
                    put("success", started)
                    put("state", vpn.getState().name)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "VPN_START_ERROR",
                e.message ?: "Unable to start VPN",
                e
            )
        }
    }

    @PluginMethod
    fun stopVpn(call: PluginCall) {
        try {
            vpn.stop()

            call.resolve(
                JSObject().apply {
                    put("success", true)
                    put("state", vpn.getState().name)
                }
            )
        } catch (e: Exception) {
            call.reject(
                "VPN_STOP_ERROR",
                e.message ?: "Unable to stop VPN",
                e
            )
        }
    }

    @PluginMethod
    fun getVpnStatus(call: PluginCall) {
        call.resolve(
            JSObject().apply {
                put("success", true)
                put("connected", vpn.isConnected())
                put("state", vpn.getState().name)
            }
        )
    }
}
