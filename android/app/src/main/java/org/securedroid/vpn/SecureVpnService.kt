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
import java.util.concurrent.atomic.AtomicBoolean

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

        private const val DEFAULT_DNS_SERVER = "1.1.1.1"
        private const val VPN_ADDRESS = "10.0.0.2"
        private const val VPN_PREFIX_LENGTH = 32
    }

    private var vpnInterface: ParcelFileDescriptor? = null

    private val running = AtomicBoolean(false)
    private val establishing = AtomicBoolean(false)

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
            "onStartCommand action=$action startId=$startId"
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

                if (running.get()) {
                    Log.d(TAG, "VPN is already running")

                    updateNotification(
                        "VPN protection is active"
                    )

                    return START_STICKY
                }

                if (establishing.get()) {
                    Log.d(TAG, "VPN establishment already in progress")

                    return START_STICKY
                }

                val dnsServer =
                    intent?.getStringExtra(EXTRA_DNS_SERVER)
                        ?.trim()
                        ?.takeIf { it.isNotEmpty() }
                        ?: DEFAULT_DNS_SERVER

                startVpn(dnsServer)
            }

            else -> {
                Log.w(
                    TAG,
                    "Unknown VPN service action: $action"
                )
            }
        }

        return START_STICKY
    }

    private fun startVpn(dnsServer: String) {

        if (running.get()) {
            Log.d(TAG, "startVpn ignored: already running")
            return
        }

        if (!establishing.compareAndSet(false, true)) {
            Log.d(TAG, "startVpn ignored: already establishing")
            return
        }

        VpnStateStore.set(VpnState.CONNECTING)

        Log.d(
            TAG,
            "VPN state changed to CONNECTING"
        )

        try {

            /*
             * A foreground notification must be active before
             * performing the VPN establishment work.
             */
            startForeground(
                NOTIFICATION_ID,
                createNotification(
                    "VPN is connecting..."
                )
            )

            /*
             * Always close an old interface before creating
             * another one.
             */
            closeVpnInterface()

            val configureIntent =
                Intent(this, MainActivity::class.java)

            val pendingIntent =
                PendingIntent.getActivity(
                    this,
                    0,
                    configureIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or
                        PendingIntent.FLAG_IMMUTABLE
                )

            /*
             * Android's VpnService.Builder creates the local TUN
             * interface.
             *
             * IMPORTANT:
             *
             * This establishes the Android VPN interface only.
             * It does NOT provide a remote VPN tunnel or packet
             * forwarding by itself.
             */
            val builder =
                Builder()
                    .setSession("SecureDroid")
                    .setConfigureIntent(pendingIntent)
                    .addAddress(
                        VPN_ADDRESS,
                        VPN_PREFIX_LENGTH
                    )
                    .addRoute(
                        "0.0.0.0",
                        0
                    )
                    .addDnsServer(dnsServer)

            /*
             * Establish the VPN interface.
             */
            Log.d(
                TAG,
                "Calling VpnService.Builder.establish()"
            )

            val establishedInterface =
                builder.establish()

            if (establishedInterface == null) {

                val message =
                    "Android could not establish the VPN interface"

                Log.e(TAG, message)

                closeVpnInterface()

                establishing.set(false)
                running.set(false)

                VpnStateStore.set(VpnState.ERROR)

                sendErrorBroadcast(message)

                stopForegroundSafely()

                return
            }

            vpnInterface = establishedInterface

            /*
             * At this point Android successfully created the VPN
             * interface.
             *
             * We deliberately do not call this a fully functional
             * Internet tunnel because this service currently has
             * no packet forwarding implementation.
             */
            running.set(true)
            establishing.set(false)

            VpnStateStore.set(VpnState.CONNECTED)

            Log.d(
                TAG,
                "VPN interface established successfully"
            )

            Log.w(
                TAG,
                "VPN interface is active, but no packet-forwarding " +
                    "backend is configured. This service does not " +
                    "provide a remote Internet tunnel by itself."
            )

            updateNotification(
                "VPN interface is active"
            )

        } catch (e: SecurityException) {

            handleStartFailure(
                "Security exception while establishing VPN: " +
                    (e.message ?: "unknown security error"),
                e
            )

        } catch (e: IOException) {

            handleStartFailure(
                "I/O exception while establishing VPN: " +
                    (e.message ?: "unknown I/O error"),
                e
            )

        } catch (e: Exception) {

            handleStartFailure(
                "${e.javaClass.simpleName}: " +
                    (e.message ?: "unknown VPN error"),
                e
            )
        }
    }

    private fun handleStartFailure(
        errorMessage: String,
        throwable: Throwable
    ) {

        Log.e(
            TAG,
            errorMessage,
            throwable
        )

        running.set(false)
        establishing.set(false)

        closeVpnInterface()

        VpnStateStore.set(VpnState.ERROR)

        sendErrorBroadcast(errorMessage)

        stopForegroundSafely()
    }

    private fun stopVpn() {

        Log.d(TAG, "Stopping VPN")

        /*
         * Mark the service as no longer running before closing
         * the descriptor so concurrent start/stop requests cannot
         * mistake the old interface for an active VPN.
         */
        running.set(false)
        establishing.set(false)

        VpnStateStore.set(VpnState.DISCONNECTING)

        Log.d(
            TAG,
            "VPN state changed to DISCONNECTING"
        )

        closeVpnInterface()

        VpnStateStore.set(VpnState.DISCONNECTED)

        Log.d(
            TAG,
            "VPN state changed to DISCONNECTED"
        )

        stopForegroundSafely()
    }

    private fun closeVpnInterface() {

        val interfaceToClose = vpnInterface

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

        } catch (e: IOException) {

            Log.e(
                TAG,
                "Failed to close VPN interface",
                e
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Unexpected error closing VPN interface",
                e
            )
        }
    }

    private fun sendErrorBroadcast(
        errorMessage: String
    ) {

        try {

            val intent =
                Intent(ACTION_VPN_ERROR).apply {
                    setPackage(packageName)

                    putExtra(
                        EXTRA_ERROR_MESSAGE,
                        errorMessage
                    )
                }

            sendBroadcast(intent)

            Log.d(
                TAG,
                "VPN error broadcast sent: $errorMessage"
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Failed to send VPN error broadcast",
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

    override fun onRevoke() {

        Log.w(
            TAG,
            "VPN permission revoked by Android"
        )

        running.set(false)
        establishing.set(false)

        closeVpnInterface()

        VpnStateStore.set(
            VpnState.DISCONNECTED
        )

        stopForegroundSafely()

        super.onRevoke()
    }

    override fun onBind(
        intent: Intent
    ): IBinder? {

        /*
         * VpnService requires the system VPN binding.
         */
        return super.onBind(intent)
    }

    private fun createNotificationChannel() {

        if (Build.VERSION.SDK_INT <
            Build.VERSION_CODES.O
        ) {
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

        val manager =
            getSystemService(
                NotificationManager::class.java
            )

        manager?.createNotificationChannel(channel)

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
            ).apply {
                flags =
                    Intent.FLAG_ACTIVITY_SINGLE_TOP or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

        val pendingIntent =
            PendingIntent.getActivity(
                this,
                1,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    PendingIntent.FLAG_IMMUTABLE
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

    private fun updateNotification(
        content: String
    ) {

        val manager =
            getSystemService(
                NotificationManager::class.java
            )

        manager?.notify(
            NOTIFICATION_ID,
            createNotification(content)
        )
    }

    private fun stopForegroundSafely() {

        try {

            if (Build.VERSION.SDK_INT >=
                Build.VERSION_CODES.TIRAMISU
            ) {

                stopForeground(
                    STOP_FOREGROUND_REMOVE
                )

            } else {

                @Suppress("DEPRECATION")
                stopForeground(true)
            }

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Failed to stop foreground service",
                e
            )
        }
    }
}
