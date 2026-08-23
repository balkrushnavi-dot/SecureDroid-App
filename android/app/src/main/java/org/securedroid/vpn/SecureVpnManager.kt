package org.securedroid.vpn

import android.content.Context

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

        /*
         * The actual Android VPN connection is established
         * by SecureVpnService after user authorization.
         */
        return true
    }

    fun stop() {
        state = VpnState.DISCONNECTING

        /*
         * SecureVpnService performs the actual shutdown.
         */
        state = VpnState.DISCONNECTED
    }

    internal fun updateState(newState: VpnState) {
        state = newState
    }
}
