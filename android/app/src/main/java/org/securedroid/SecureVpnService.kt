package org.securedroid.network

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import org.securedroid.app.MainActivity

class SecureVpnService : VpnService() {

    companion object {
        const val ACTION_START = "org.securedroid.action.START_VPN"
        const val ACTION_STOP = "org.securedroid.action.STOP_VPN"

        const val EXTRA_DNS_SERVER = "dns_server"

        const val NOTIFICATION_CHANNEL_ID =
            "securedroid_vpn"

        const val NOTIFICATION_ID = 1001
    }

    private var vpnInterface: ParcelFileDescriptor? = null

    @Volatile
    private var isRunning = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {

        when (intent?.action) {

            ACTION_STOP -> {
                stopVpn()
                stopSelf()
                return START_NOT_STICKY
            }

            ACTION_START, null -> {
                if (!isRunning) {
                    val dnsServer =
                        intent?.getStringExtra(EXTRA_DNS_SERVER)
                            ?: "1.1.1.1"

                    startVpn(dnsServer)
                }
            }
        }

        return START_STICKY
    }

    private fun startVpn(dnsServer: String) {

        if (isRunning) {
            return
        }

        try {
            val configureIntent = Intent(
                this,
                MainActivity::class.java
            )

            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                configureIntent,
                PendingIntent.FLAG_IMMUTABLE or
                    PendingIntent.FLAG_UPDATE_CURRENT
            )

            val builder = Builder()
                .setSession("SecureDroid")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer(dnsServer)
                .setConfigureIntent(pendingIntent)

            vpnInterface?.close()
            vpnInterface = builder.establish()

            if (vpnInterface != null) {
                isRunning = true

                startForeground(
                    NOTIFICATION_ID,
                    createNotification()
                )
            } else {
                isRunning = false
            }

        } catch (_: Exception) {
            isRunning = false

            try {
                vpnInterface?.close()
            } catch (_: Exception) {
            }

            vpnInterface = null
        }
    }

    private fun stopVpn() {

        isRunning = false

        try {
            vpnInterface?.close()
        } catch (_: Exception) {
        }

        vpnInterface = null
    }

    fun isVpnRunning(): Boolean {
        return isRunning && vpnInterface != null
    }

    override fun onDestroy() {
        stopVpn()
        super.onDestroy()
    }

    override fun onBind(intent: Intent): IBinder? {
        return super.onBind(intent)
    }

    private fun createNotificationChannel() {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "SecureDroid VPN",
                NotificationManager.IMPORTANCE_LOW
            )

            channel.description =
                "SecureDroid VPN protection status"

            val manager =
                getSystemService(NotificationManager::class.java)

            manager?.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {

        val intent = Intent(
            this,
            MainActivity::class.java
        )

        val pendingIntent = PendingIntent.getActivity(
            this,
            1,
            intent,
            PendingIntent.FLAG_IMMUTABLE or
                PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(
            this,
            NOTIFICATION_CHANNEL_ID
        )
            .setContentTitle("SecureDroid VPN")
            .setContentText("VPN protection is active")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }
}
