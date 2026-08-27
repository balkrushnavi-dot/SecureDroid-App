package org.securedroid.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import org.securedroid.MainActivity

class SecureVpnService : VpnService() {

    companion object {
        private const val TAG = "SecureVpnService"
        const val ACTION_START = "org.securedroid.action.START_VPN"
        const val ACTION_STOP = "org.securedroid.action.STOP_VPN"
        const val NOTIFICATION_CHANNEL_ID = "securedroid_vpn"
        const val NOTIFICATION_ID = 1001
    }

    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "VPN Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand: action=${intent?.action}")

        when (intent?.action) {
            ACTION_STOP -> {
                stopVpn()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_START, null -> {
                if (vpnInterface == null) {
                    Log.d(TAG, "Starting VPN...")
                    startVpn()
                }
            }
        }

        return START_STICKY
    }

    private fun startVpn() {
        try {
            val builder = Builder()
                .setSession("SecureDroid")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer("1.1.1.1")

            vpnInterface = builder.establish()

            if (vpnInterface != null) {
                startForeground(NOTIFICATION_ID, createNotification())
                VpnStateStore.set(VpnState.CONNECTED)
                Log.d(TAG, "VPN CONNECTED")
            } else {
                VpnStateStore.set(VpnState.ERROR)
                Log.e(TAG, "VPN connection failed - null interface")
            }

        } catch (e: Exception) {
            VpnStateStore.set(VpnState.ERROR)
            Log.e(TAG, "VPN start failed", e)
        }
    }

    private fun stopVpn() {
        try {
            vpnInterface?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN", e)
        }
        vpnInterface = null
        VpnStateStore.set(VpnState.DISCONNECTED)
        Log.d(TAG, "VPN DISCONNECTED")
        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }

    override fun onBind(intent: Intent): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "SecureDroid VPN",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("SecureDroid VPN")
            .setContentText("VPN protection is active")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }
}
