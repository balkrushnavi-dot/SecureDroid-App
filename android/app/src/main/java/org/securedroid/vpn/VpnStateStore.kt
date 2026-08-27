package org.securedroid.vpn

import java.util.concurrent.atomic.AtomicReference

object VpnStateStore {

    private val state = AtomicReference(VpnState.DISCONNECTED)

    fun get(): VpnState = state.get()

    fun set(newState: VpnState) {
        state.set(newState)
        Log.d("VpnStateStore", "State set to: $newState")
    }
}
