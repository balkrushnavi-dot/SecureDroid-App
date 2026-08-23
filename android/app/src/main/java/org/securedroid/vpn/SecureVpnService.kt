package org.securedroid.vpn

import android.content.Intent
import android.net.VpnService
import android.os.IBinder

class SecureVpnService : VpnService() {

    private var vpnInterface: Builder? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        when (intent?.action) {
            ACTION_START -> startVpn()
            ACTION_STOP -> stopVpn()
        }

        return START_NOT_STICKY
    }

    private fun startVpn() {
        if (vpnInterface != null) {
            return
        }

        vpnInterface = Builder()
            .setSession("SecureDroid VPN")
            .addAddress("10.0.0.2", 32)
            .addRoute("0.0.0.0", 0)
            .establish()
            ?.let {
                // Keep the interface alive while the service is running.
                // The current implementation establishes the VPN tunnel
                // but does not provide an external VPN gateway.
                vpnInterface
            }
    }

    private fun stopVpn() {
        vpnInterface = null
        stopSelf()
    }

    override fun onDestroy() {
        vpnInterface = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent): IBinder? {
        return super.onBind(intent)
    }

    companion object {
        const val ACTION_START =
            "org.securedroid.vpn.action.START"

        const val ACTION_STOP =
            "org.securedroid.vpn.action.STOP"
    }
}
