package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class SecureVpnManager(
    private val context: Context
) {

    @Volatile
    private var state: VpnState = VpnState.DISCONNECTED

    fun getState(): VpnState {
        return state
    }

    fun isConnected(): Boolean {
        return state == VpnState.CONNECTED
    }

    fun start(): Boolean {
        if (state == VpnState.CONNECTED ||
            state == VpnState.CONNECTING
        ) {
            return false
        }

        state = VpnState.CONNECTING

        return try {
            val intent = Intent(
                context,
                SecureVpnService::class.java
            ).apply {
                action = SecureVpnService.ACTION_START
            }

            ContextCompat.startForegroundService(
                context,
                intent
            )

            true
        } catch (_: Exception) {
            state = VpnState.ERROR
            false
        }
    }

    fun stop() {
        if (state == VpnState.DISCONNECTED) {
            return
        }

        state = VpnState.DISCONNECTING

        val intent = Intent(
            context,
            SecureVpnService::class.java
        ).apply {
            action = SecureVpnService.ACTION_STOP
        }

        context.startService(intent)
    }

    internal fun updateState(newState: VpnState) {
        state = newState
    }
}
