
package org.securedroid.vpn

import android.util.Log
import java.util.concurrent.atomic.AtomicReference

/**

Process-local store for the current VPN state.

The VPN service and Capacitor plugin can both access this object

safely from different threads.
*/
object VpnStateStore {

private const val TAG = "VpnStateStore"

private val state =
AtomicReference(VpnState.DISCONNECTED)

/**

Returns the current VPN state.
*/
fun get(): VpnState {
return state.get()
}

/**

Updates the current VPN state.
*/
fun set(newState: VpnState) {

val previousState =
state.getAndSet(newState)

if (previousState != newState) {
Log.d(
TAG,
"VPN state changed: $previousState -> $newState"
)
} else {
Log.d(
TAG,
"VPN state unchanged: $newState"
)
}
}

/**

Resets the state when the application/service is starting

from a clean process state.
*/
fun reset() {

val previousState =
state.getAndSet(
VpnState.DISCONNECTED
)

Log.d(
TAG,
"VPN state reset: $previousState -> ${VpnState.DISCONNECTED}"
)
}
}
