package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class SecureVpnManager(
    private val context: Context
) {

    fun getState(): VpnState =
        VpnStateStore.get()

    fun isConnected(): Boolean =
        VpnStateStore.get() == VpnState.CONNECTED

    fun start(): Boolean {

        val currentState = VpnStateStore.get()

        if (
            currentState == VpnState.CONNECTING ||
            currentState == VpnState.CONNECTED
        ) {
            return false
        }

        VpnStateStore.set(VpnState.CONNECTING)

        return try {

            val intent =
                Intent(
                    context,
                    SecureVpnService::class.java
                ).apply {
                    action =
                        SecureVpnService.ACTION_START
                }

            ContextCompat.startForegroundService(
                context,
                intent
            )

            // Do NOT set CONNECTED here.
            // SecureVpnService reports CONNECTED to VpnStateStore
            // only after builder.establish() actually succeeds.
            true

        } catch (_: Exception) {

            VpnStateStore.set(VpnState.ERROR)
            false
        }
    }

    fun stop() {

        if (VpnStateStore.get() == VpnState.DISCONNECTED) {
            return
        }

        VpnStateStore.set(VpnState.DISCONNECTING)

        val intent =
            Intent(
                context,
                SecureVpnService::class.java
            ).apply {
                action =
                    SecureVpnService.ACTION_STOP
            }

        try {

            context.startService(intent)

            // Do NOT set DISCONNECTED here.
            // SecureVpnService reports DISCONNECTED to VpnStateStore
            // once it has actually torn down the VPN interface.

        } catch (_: Exception) {

            VpnStateStore.set(VpnState.ERROR)
        }
    }
}
