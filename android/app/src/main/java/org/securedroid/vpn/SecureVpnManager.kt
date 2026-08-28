package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.util.Log
import androidx.core.content.ContextCompat

class SecureVpnManager(
private val context: Context
) {

companion object {
    private const val TAG = "SecureVpnManager"
    private const val DNS_SERVER = "1.1.1.1"
}

fun getState(): VpnState {
    return VpnStateStore.get()
}

fun isConnected(): Boolean {
    return getState() == VpnState.CONNECTED
}

fun start(): Boolean {

    val currentState = getState()

    Log.d(
        TAG,
        "start() called, current state=$currentState"
    )

    if (
        currentState == VpnState.CONNECTING ||
        currentState == VpnState.CONNECTED
    ) {
        Log.d(
            TAG,
            "VPN is already connecting or connected"
        )

        return false
    }

    /*
     * The VPN permission should normally be checked by the
     * Capacitor plugin before calling this method.
     *
     * We check again here so this manager cannot accidentally
     * start the service without Android VPN authorization.
     */
    val prepareIntent =
        VpnService.prepare(context)

    if (prepareIntent != null) {

        Log.w(
            TAG,
            "VPN permission has not been granted"
        )

        return false
    }

    VpnStateStore.set(
        VpnState.CONNECTING
    )

    Log.d(
        TAG,
        "VPN state set to CONNECTING"
    )

    val intent =
        Intent(
            context,
            SecureVpnService::class.java
        ).apply {

            action =
                SecureVpnService.ACTION_START

            putExtra(
                SecureVpnService.EXTRA_DNS_SERVER,
                DNS_SERVER
            )
        }

    return try {

        ContextCompat.startForegroundService(
            context,
            intent
        )

        Log.d(
            TAG,
            "VPN foreground service start requested"
        )

        true

    } catch (e: SecurityException) {

        Log.e(
            TAG,
            "SecurityException while starting VPN service",
            e
        )

        VpnStateStore.set(
            VpnState.ERROR
        )

        false

    } catch (e: Exception) {

        Log.e(
            TAG,
            "Failed to start VPN service",
            e
        )

        VpnStateStore.set(
            VpnState.ERROR
        )

        false
    }
}

fun stop() {

    val currentState =
        getState()

    Log.d(
        TAG,
        "stop() called, current state=$currentState"
    )

    if (
        currentState == VpnState.DISCONNECTED
    ) {
        Log.d(
            TAG,
            "VPN is already disconnected"
        )

        return
    }

    if (
        currentState == VpnState.DISCONNECTING
    ) {
        Log.d(
            TAG,
            "VPN is already disconnecting"
        )

        return
    }

    VpnStateStore.set(
        VpnState.DISCONNECTING
    )

    Log.d(
        TAG,
        "VPN state set to DISCONNECTING"
    )

    val intent =
        Intent(
            context,
            SecureVpnService::class.java
        ).apply {

            action =
                SecureVpnService.ACTION_STOP
        }

    try {

        /*
         * This is an explicit service intent, so startService()
         * is sufficient for the stop request.
         */
        context.startService(intent)

        Log.d(
            TAG,
            "VPN stop request sent"
        )

    } catch (e: SecurityException) {

        Log.e(
            TAG,
            "SecurityException while stopping VPN service",
            e
        )

        VpnStateStore.set(
            VpnState.ERROR
        )

    } catch (e: Exception) {

        Log.e(
            TAG,
            "Failed to stop VPN service",
            e
        )

        VpnStateStore.set(
            VpnState.ERROR
        )
    }
}


}
