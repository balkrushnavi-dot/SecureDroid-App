package org.securedroid.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder

class SecureVpnService : VpnService() {

    private var vpnInterface: android.os.ParcelFileDescriptor? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        when (intent?.action) {
            ACTION_START -> {
                startForegroundService()
                startVpn()
            }

            ACTION_STOP -> {
                stopVpn()
            }
        }

        return START_NOT_STICKY
    }

    private fun startForegroundService() {
        createNotificationChannel()

        val notification = Notification.Builder(
            this,
            NOTIFICATION_CHANNEL_ID
        )
            .setContentTitle("SecureDroid VPN")
            .setContentText("Secure VPN service is running")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .build()

        startForeground(
            NOTIFICATION_ID,
            notification
        )
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager =
                getSystemService(NOTIFICATION_SERVICE)
                    as NotificationManager

            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "SecureDroid VPN",
                NotificationManager.IMPORTANCE_LOW
            )

            manager.createNotificationChannel(channel)
        }
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

        if (vpnInterface == null) {
            stopSelf()
        }
    }

    private fun stopVpn() {
        vpnInterface?.close()
        vpnInterface = null

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        vpnInterface?.close()
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

        private const val NOTIFICATION_CHANNEL_ID =
            "securedroid_vpn"

        private const val NOTIFICATION_ID = 1001
    }
}
