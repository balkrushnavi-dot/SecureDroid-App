package org.securedroid.diagnostics

import android.app.KeyguardManager
import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.PowerManager
import org.securedroid.vpn.VpnState
import org.securedroid.vpn.VpnStateStore

data class DeviceDiagnosticsResult(
    val androidVersion: String,
    val sdkVersion: Int,
    val deviceModel: String,
    val manufacturer: String,
    val isNetworkAvailable: Boolean,
    val isSystemVpnDetected: Boolean,
    val secureDroidVpnState: VpnState,
    val isScreenLocked: Boolean,
    val isPowerSaveMode: Boolean
)

class DeviceDiagnostics(
    private val context: Context
) {

    fun run(): DeviceDiagnosticsResult {

        val connectivityManager =
            context.getSystemService(
                Context.CONNECTIVITY_SERVICE
            ) as ConnectivityManager

        val keyguardManager =
            context.getSystemService(
                Context.KEYGUARD_SERVICE
            ) as KeyguardManager

        val powerManager =
            context.getSystemService(
                Context.POWER_SERVICE
            ) as PowerManager

        val network =
            connectivityManager.activeNetwork

        val capabilities =
            network?.let {
                connectivityManager.getNetworkCapabilities(it)
            }

        val networkAvailable =
            capabilities?.hasCapability(
                NetworkCapabilities.NET_CAPABILITY_INTERNET
            ) == true

        val vpnDetectedBySystem =
            capabilities?.hasTransport(
                NetworkCapabilities.TRANSPORT_VPN
            ) == true

        val screenLocked =
            if (
                Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.M
            ) {
                keyguardManager.isDeviceLocked
            } else {
                @Suppress("DEPRECATION")
                keyguardManager.isKeyguardLocked
            }

        return DeviceDiagnosticsResult(
            androidVersion =
                Build.VERSION.RELEASE ?: "Unknown",

            sdkVersion =
                Build.VERSION.SDK_INT,

            deviceModel =
                Build.MODEL ?: "Unknown",

            manufacturer =
                Build.MANUFACTURER ?: "Unknown",

            isNetworkAvailable =
                networkAvailable,

            isSystemVpnDetected =
                vpnDetectedBySystem,

            secureDroidVpnState =
                VpnStateStore.get(),

            isScreenLocked =
                screenLocked,

            isPowerSaveMode =
                powerManager.isPowerSaveMode
        )
    }
}
