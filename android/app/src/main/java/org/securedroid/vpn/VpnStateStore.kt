package org.securedroid.vpn

import android.util.Log
import java.util.concurrent.atomic.AtomicReference

object VpnStateStore {

    private const val TAG = "VpnStateStore"
    private val state = AtomicReference(VpnState.DISCONNECTED)

    fun get(): VpnState = state.get()

    fun set(newState: VpnState) {
        state.set(newState)
        Log.d(TAG, "State set to: $newState")
    }
}
