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

        val notification =
            Notification.Builder(
                this,
                NOTIFICATION_CHANNEL_ID
            )
                .setContentTitle("SecureDroid VPN")
                .setContentText("Secure VPN service is running")
                .setSmallIcon(
                    android.R.drawable.ic_lock_lock
                )
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
                getSystemService(
                    NOTIFICATION_SERVICE
                ) as NotificationManager

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

        VpnStateStore.set(
            VpnState.CONNECTING
        )

        try {

            vpnInterface = Builder()
                .setSession("SecureDroid VPN")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .establish()

            if (vpnInterface == null) {
                VpnStateStore.set(
                    VpnState.ERROR
                )

                stopVpn()
                return
            }

            VpnStateStore.set(
                VpnState.CONNECTED
            )

        } catch (_: Exception) {

            VpnStateStore.set(
                VpnState.ERROR
            )

            stopVpn()
        }
    }

    private fun stopVpn() {

        VpnStateStore.set(
            VpnState.DISCONNECTING
        )

        vpnInterface?.close()
        vpnInterface = null

        VpnStateStore.set(
            VpnState.DISCONNECTED
        )

        stopForeground(
            STOP_FOREGROUND_REMOVE
        )

        stopSelf()
    }

    override fun onDestroy() {

        vpnInterface?.close()
        vpnInterface = null

        VpnStateStore.set(
            VpnState.DISCONNECTED
        )

        super.onDestroy()
    }

    override fun onBind(
        intent: Intent
    ): IBinder? {
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
