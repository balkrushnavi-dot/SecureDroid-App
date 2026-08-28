package org.securedroid.vpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.NetworkCapabilities
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor
import android.util.Log
import androidx.core.app.NotificationCompat
import org.securedroid.MainActivity
import java.io.IOException

class SecureVpnService : VpnService() {

    companion object {
        private const val TAG = "SecureVpnService"

        const val ACTION_START = "org.securedroid.action.START_VPN"
        const val ACTION_STOP = "org.securedroid.action.STOP_VPN"

        const val EXTRA_DNS_SERVER = "dns_server"
        const val EXTRA_ERROR = "error"

        const val NOTIFICATION_CHANNEL_ID = "securedroid_vpn"
        const val NOTIFICATION_ID = 1001

        const val ACTION_VPN_ERROR = "org.securedroid.action.VPN_ERROR"
        const val EXTRA_ERROR_MESSAGE = "error_message"
    }

    private var vpnInterface: ParcelFileDescriptor? = null

    @Volatile
    private var isRunning = false

    @Volatile
    private var isEstablishing = false

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        Log.d(TAG, "VPN Service created")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand: action=${intent?.action}")

        when (intent?.action) {
            ACTION_STOP -> {
                Log.d(TAG, "Stopping VPN")
                stopVpn()
                stopSelf()
                return START_NOT_STICKY
            }

            ACTION_START, null -> {
                if (isRunning) {
                    Log.d(TAG, "VPN already running")
                    return START_STICKY
                }

                if (isEstablishing) {
                    Log.d(TAG, "VPN already establishing")
                    return START_STICKY
                }

                val dnsServer = intent?.getStringExtra(EXTRA_DNS_SERVER) ?: "1.1.1.1"
                Log.d(TAG, "Starting VPN with DNS: $dnsServer")
                startVpn(dnsServer)
            }
        }

        return START_STICKY
    }

    private fun startVpn(dnsServer: String) {
        if (isRunning || isEstablishing) {
            Log.d(TAG, "startVpn: already running or establishing")
            return
        }

        isEstablishing = true
        VpnStateStore.set(VpnState.CONNECTING)
        Log.d(TAG, "VPN state: CONNECTING")

        try {
            startForeground(NOTIFICATION_ID, createNotification("VPN is connecting..."))

            val configureIntent = Intent(this, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                this,
                0,
                configureIntent,
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val builder = Builder()
                .setSession("SecureDroid")
                .addAddress("10.0.0.2", 32)
                .addRoute("0.0.0.0", 0)
                .addDnsServer(dnsServer)
                // Add a fallback DNS server for reliability
                .addDnsServer("1.0.0.1")
                .setConfigureIntent(pendingIntent)

            if (Build.VERSION.SDK_INT >= 34) {
                Log.d(TAG, "Adding allowFamily for Android 14+")
                try {
                    val allowFamilyMethod = Builder::class.java.getMethod(
                        "allowFamily",
                        Int::class.java
                    )
                    allowFamilyMethod.invoke(builder, 1)
                    allowFamilyMethod.invoke(builder, 2)
                    Log.d(TAG, "allowFamily invoked successfully")
                } catch (e: Exception) {
                    Log.w(TAG, "allowFamily not available, continuing without it", e)
                }
            }

            vpnInterface?.close()
            vpnInterface = null

            Log.d(TAG, "Establishing VPN interface...")
            vpnInterface = builder.establish()

            if (vpnInterface != null) {
                isRunning = true
                isEstablishing = false
                VpnStateStore.set(VpnState.CONNECTED)
                Log.d(TAG, "VPN established successfully, state: CONNECTED")
                startForeground(NOTIFICATION_ID, createNotification("VPN protection is active"))
            } else {
                isRunning = false
                isEstablishing = false
                VpnStateStore.set(VpnState.ERROR)
                val errorMsg = "VPN establishment returned null interface"
                Log.e(TAG, errorMsg)
                sendErrorBroadcast(errorMsg)
            }

        } catch (e: SecurityException) {
            val errorMsg = "Security exception: ${e.message}"
            Log.e(TAG, "VPN establishment failed: SecurityException", e)
            isRunning = false
            isEstablishing = false
            VpnStateStore.set(VpnState.ERROR)
            sendErrorBroadcast(errorMsg)

            try {
                vpnInterface?.close()
            } catch (_: Exception) {}
            vpnInterface = null

        } catch (e: IOException) {
            val errorMsg = "IO exception: ${e.message}"
            Log.e(TAG, "VPN establishment failed: IOException", e)
            isRunning = false
            isEstablishing = false
            VpnStateStore.set(VpnState.ERROR)
            sendErrorBroadcast(errorMsg)

            try {
                vpnInterface?.close()
            } catch (_: Exception) {}
            vpnInterface = null

        } catch (e: Exception) {
            val errorMsg = "${e.javaClass.simpleName}: ${e.message}"
            Log.e(TAG, "VPN establishment failed: ${e.javaClass.simpleName} - ${e.message}", e)
            isRunning = false
            isEstablishing = false
            VpnStateStore.set(VpnState.ERROR)
            sendErrorBroadcast(errorMsg)

            try {
                vpnInterface?.close()
            } catch (_: Exception) {}
            vpnInterface = null
        }
    }

    private fun sendErrorBroadcast(errorMessage: String) {
        try {
            val intent = Intent(ACTION_VPN_ERROR).apply {
                putExtra(EXTRA_ERROR_MESSAGE, errorMessage)
            }
            sendBroadcast(intent)
            Log.d(TAG, "Error broadcast sent: $errorMessage")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send error broadcast", e)
        }
    }

    private fun stopVpn() {
        Log.d(TAG, "Stopping VPN")

        isRunning = false
        isEstablishing = false

        try {
            vpnInterface?.close()
            Log.d(TAG, "VPN interface closed")
        } catch (e: Exception) {
            Log.e(TAG, "Error closing VPN interface", e)
        }
        vpnInterface = null

        VpnStateStore.set(VpnState.DISCONNECTED)
        Log.d(TAG, "VPN state: DISCONNECTED")

        stopForeground(STOP_FOREGROUND_REMOVE)
    }

    override fun onDestroy() {
        Log.d(TAG, "VPN Service onDestroy")
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
            channel.description = "SecureDroid VPN protection status"

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
            Log.d(TAG, "Notification channel created")
        }
    }

    private fun createNotification(content: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            1,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("SecureDroid VPN")
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
}
