package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.core.content.ContextCompat

class SecureVpnManager(
    private val context: Context
) {

    companion object {
        private const val TAG = "SecureVpnManager"
    }

    fun getState(): VpnState = VpnStateStore.get()

    fun isConnected(): Boolean = VpnStateStore.get() == VpnState.CONNECTED

    fun start(): Boolean {
        val currentState = VpnStateStore.get()
        Log.d(TAG, "start() called, current state: $currentState")

        if (currentState == VpnState.CONNECTING || currentState == VpnState.CONNECTED) {
            Log.d(TAG, "VPN already connecting or connected, ignoring start")
            return false
        }

        VpnStateStore.set(VpnState.CONNECTING)
        Log.d(TAG, "Set state to CONNECTING")

        return try {
            val intent = Intent(context, SecureVpnService::class.java).apply {
                action = SecureVpnService.ACTION_START
                putExtra(SecureVpnService.EXTRA_DNS_SERVER, "1.1.1.1")
            }

            ContextCompat.startForegroundService(context, intent)
            Log.d(TAG, "VPN service start intent sent")
            true

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start VPN service", e)
            VpnStateStore.set(VpnState.ERROR)
            false
        }
    }

    fun stop() {
        Log.d(TAG, "stop() called, current state: ${VpnStateStore.get()}")

        if (VpnStateStore.get() == VpnState.DISCONNECTED) {
            Log.d(TAG, "VPN already disconnected")
            return
        }

        VpnStateStore.set(VpnState.DISCONNECTING)
        Log.d(TAG, "Set state to DISCONNECTING")

        val intent = Intent(context, SecureVpnService::class.java).apply {
            action = SecureVpnService.ACTION_STOP
        }

        try {
            context.startService(intent)
            Log.d(TAG, "VPN stop service intent sent")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to stop VPN service", e)
            VpnStateStore.set(VpnState.ERROR)
        }
    }
}
