package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class SecureVpnManager(
    private val context: Context
) {

    @Volatile
    private var state =
        VpnState.DISCONNECTED

    fun getState(): VpnState =
        state

    fun isConnected(): Boolean =
        state == VpnState.CONNECTED

    fun start(): Boolean {

        if (
            state == VpnState.CONNECTING ||
            state == VpnState.CONNECTED
        ) {
            return false
        }

        state = VpnState.CONNECTING

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

            state = VpnState.CONNECTED

            true

        } catch (_: Exception) {

            state = VpnState.ERROR
            false
        }
    }

    fun stop() {

        if (
            state == VpnState.DISCONNECTED
        ) {
            return
        }

        state =
            VpnState.DISCONNECTING

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

            state =
                VpnState.DISCONNECTED

        } catch (_: Exception) {

            state = VpnState.ERROR
        }
    }

    internal fun updateState(
        newState: VpnState
    ) {
        state = newState
    }
}
