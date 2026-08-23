package org.securedroid.network

import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor

class SecureVpnService : VpnService() {

    private var vpnInterface: ParcelFileDescriptor? = null
    private var isRunning = false

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (!isRunning) {
            startVpnTunnel()
        }
        return START_STICKY
    }

    private fun startVpnTunnel() {
        try {
            // Safe PendingIntent flag handling for modern Android versions (API 31+)
            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                Intent(this, org.securedroid.MainActivity::class.java),
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val builder = Builder()
                .addAddress("10.0.0.2", 24)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("1.1.1.1")
                .setSession("SecureDroid Application Firewall")
                .setConfigureIntent(pendingIntent)

            vpnInterface = builder.establish()
            isRunning = true
        } catch (e: Exception) {
            isRunning = false
        }
    }

    override fun onDestroy() {
        isRunning = false
        try {
            vpnInterface?.close()
            vpnInterface = null
        } catch (e: Exception) {
            // Handle cleanup safely
        }
        super.onDestroy()
    }
}
