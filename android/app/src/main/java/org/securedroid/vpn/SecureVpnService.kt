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
import java.io.IOException

class SecureVpnService : VpnService() {

companion object {
    private const val TAG = "SecureVpnService"

    const val ACTION_START = "org.securedroid.action.START_VPN"
    const val ACTION_STOP = "org.securedroid.action.STOP_VPN"

    const val EXTRA_DNS_SERVER = "dns_server"

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

    Log.d(TAG, "VPN service created")
}

override fun onStartCommand(
    intent: Intent?,
    flags: Int,
    startId: Int
): Int {

    val action = intent?.action

    Log.d(
        TAG,
        "onStartCommand: action=$action startId=$startId"
    )

    when (action) {

        ACTION_STOP -> {
            Log.d(TAG, "Received VPN stop request")

            stopVpn()
            stopSelfResult(startId)

            return START_NOT_STICKY
        }

        ACTION_START,
        null -> {

            if (isRunning) {
                Log.d(TAG, "VPN already running")
                return START_STICKY
            }

            if (isEstablishing) {
                Log.d(TAG, "VPN establishment already in progress")
                return START_STICKY
            }

            val dnsServer =
                intent?.getStringExtra(EXTRA_DNS_SERVER)
                    ?.takeIf { it.isNotBlank() }
                    ?: DEFAULT_DNS_SERVER

            Log.d(
                TAG,
                "Starting VPN with DNS server: $dnsServer"
            )

            startVpn(dnsServer)
        }

        else -> {
            Log.w(TAG, "Unknown VPN service action: $action")
        }
    }

    return START_STICKY
}

private fun startVpn(dnsServer: String) {

    if (isRunning || isEstablishing) {
        Log.d(
            TAG,
            "startVpn ignored: already running or establishing"
        )
        return
    }

    isEstablishing = true

    VpnStateStore.set(VpnState.CONNECTING)

    Log.d(TAG, "VPN state: CONNECTING")

    try {

        /*
         * Android requires the VPN service to enter the foreground
         * before establishing the VPN interface.
         */
        startForeground(
            NOTIFICATION_ID,
            createNotification("VPN is connecting...")
        )

        val configureIntent =
            Intent(this, MainActivity::class.java)

        val pendingIntent =
            PendingIntent.getActivity(
                this,
                0,
                configureIntent,
                PendingIntent.FLAG_IMMUTABLE or
                    PendingIntent.FLAG_UPDATE_CURRENT
            )

        /*
         * Close an old interface before creating a new one.
         */
        closeVpnInterface()

        val builder =
            Builder()
                .setSession("SecureDroid")
                .addAddress(
                    VPN_ADDRESS,
                    VPN_PREFIX
                )
                .addRoute(
                    VPN_ROUTE,
                    VPN_ROUTE_PREFIX
                )
                .addDnsServer(dnsServer)
                .setConfigureIntent(pendingIntent)

        /*
         * The VPN interface is intentionally configured as a
         * full-device route.
         *
         * This creates the Android VPN tunnel interface.
         *
         * IMPORTANT:
         * This does not by itself implement packet forwarding.
         * A real VPN proxy/tunnel engine must read packets from
         * the ParcelFileDescriptor and forward/filter them.
         */
        Log.d(TAG, "Establishing VPN interface...")

        val establishedInterface =
            builder.establish()

        if (establishedInterface == null) {

            val errorMessage =
                "Android VPN establishment returned a null interface"

            Log.e(TAG, errorMessage)

            isRunning = false
            isEstablishing = false

            closeVpnInterface()

            VpnStateStore.set(VpnState.ERROR)

            sendErrorBroadcast(errorMessage)

            stopForegroundSafely()

            return
        }

        vpnInterface = establishedInterface

        isRunning = true
        isEstablishing = false

        VpnStateStore.set(VpnState.CONNECTED)

        Log.d(
            TAG,
            "VPN interface established successfully"
        )

        Log.d(
            TAG,
            "VPN state: CONNECTED"
        )

        startForeground(
            NOTIFICATION_ID,
            createNotification("VPN protection is active")
        )

    } catch (e: SecurityException) {

        handleVpnError(
            "Security exception: ${e.message ?: "VPN permission denied"}",
            e
        )

    } catch (e: IOException) {

        handleVpnError(
            "IO exception: ${e.message ?: "Unable to establish VPN interface"}",
            e
        )

    } catch (e: Exception) {

        handleVpnError(
            "${e.javaClass.simpleName}: ${e.message ?: "Unable to establish VPN"}",
            e
        )
    }
}

private fun handleVpnError(
    message: String,
    exception: Exception
) {

    Log.e(
        TAG,
        "VPN establishment failed: $message",
        exception
    )

    isRunning = false
    isEstablishing = false

    closeVpnInterface()

    VpnStateStore.set(VpnState.ERROR)

    sendErrorBroadcast(message)

    stopForegroundSafely()
}

private fun sendErrorBroadcast(
    errorMessage: String
) {

    try {

        val intent =
            Intent(ACTION_VPN_ERROR).apply {
                putExtra(
                    EXTRA_ERROR_MESSAGE,
                    errorMessage
                )

                /*
                 * Keep the broadcast scoped to this application.
                 */
                setPackage(packageName)
            }

        sendBroadcast(intent)

        Log.d(
            TAG,
            "VPN error broadcast sent: $errorMessage"
        )

    } catch (e: Exception) {

        Log.e(
            TAG,
            "Unable to send VPN error broadcast",
            e
        )
    }
}

private fun stopVpn() {

    Log.d(TAG, "Stopping VPN")

    isRunning = false
    isEstablishing = false

    closeVpnInterface()

    VpnStateStore.set(VpnState.DISCONNECTED)

    Log.d(
        TAG,
        "VPN state: DISCONNECTED"
    )

    stopForegroundSafely()
}

private fun closeVpnInterface() {

    val interfaceToClose =
        vpnInterface

    vpnInterface = null

    if (interfaceToClose == null) {
        return
    }

    try {

        interfaceToClose.close()

        Log.d(
            TAG,
            "VPN interface closed"
        )

    } catch (e: Exception) {

        Log.e(
            TAG,
            "Error closing VPN interface",
            e
        )
    }
}

private fun stopForegroundSafely() {

    try {

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE)
        } else {
            @Suppress("DEPRECATION")
            stopForeground(true)
        }

    } catch (e: Exception) {

        Log.w(
            TAG,
            "Unable to stop foreground notification",
            e
        )
    }
}

override fun onDestroy() {

    Log.d(
        TAG,
        "VPN service onDestroy"
    )

    stopVpn()

    super.onDestroy()
}

override fun onBind(
    intent: Intent
): IBinder? {

    return super.onBind(intent)
}

private fun createNotificationChannel() {

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
        return
    }

    val manager =
        getSystemService(
            NotificationManager::class.java
        )

    if (manager == null) {
        Log.w(
            TAG,
            "NotificationManager unavailable"
        )
        return
    }

    val channel =
        NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            "SecureDroid VPN",
            NotificationManager.IMPORTANCE_LOW
        ).apply {

            description =
                "SecureDroid VPN protection status"

            setShowBadge(false)
        }

    manager.createNotificationChannel(channel)

    Log.d(
        TAG,
        "VPN notification channel created"
    )
}

private fun createNotification(
    content: String
): Notification {

    val intent =
        Intent(
            this,
            MainActivity::class.java
        )

    val pendingIntent =
        PendingIntent.getActivity(
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
        .setContentText(content)
        .setSmallIcon(
            android.R.drawable.ic_lock_lock
        )
        .setOngoing(true)
        .setAutoCancel(false)
        .setContentIntent(pendingIntent)
        .setCategory(
            NotificationCompat.CATEGORY_SERVICE
        )
        .setPriority(
            NotificationCompat.PRIORITY_LOW
        )
        .build()
}

companion object Constants {
    private const val DEFAULT_DNS_SERVER = "1.1.1.1"

    private const val VPN_ADDRESS = "10.0.0.2"
    private const val VPN_PREFIX = 32

    private const val VPN_ROUTE = "0.0.0.0"
    private const val VPN_ROUTE_PREFIX = 0
}


}
