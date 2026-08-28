package org.securedroid.vpn

import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.util.Log
import androidx.core.content.ContextCompat

class SecureVpnManager(
    private val context: Context
) {

    companion object {
        private const val TAG = "SecureVpnManager"
        private const val DEFAULT_DNS_SERVER = "1.1.1.1"
    }

    fun getState(): VpnState {
        return VpnStateStore.get()
    }

    fun isConnected(): Boolean {
        return getState() == VpnState.CONNECTED
    }

    /**
     * Returns true when Android has already granted this application
     * permission to establish a VPN.
     */
    fun hasVpnPermission(): Boolean {
        return try {
            VpnService.prepare(context) == null
        } catch (e: Exception) {
            Log.e(
                TAG,
                "Unable to determine VPN permission",
                e
            )
            false
        }
    }

    /**
     * Requests the VPN service to start.
     *
     * IMPORTANT:
     * This only requests service startup. The actual connection state
     * is determined by SecureVpnService after Builder.establish().
     */
    fun start(
        dnsServer: String = DEFAULT_DNS_SERVER
    ): Boolean {

        val currentState = VpnStateStore.get()

        Log.d(
            TAG,
            "start() called, currentState=$currentState"
        )

        if (!hasVpnPermission()) {

            Log.w(
                TAG,
                "VPN permission has not been granted"
            )

            return false
        }

        if (
            currentState == VpnState.CONNECTING ||
            currentState == VpnState.CONNECTED
        ) {

            Log.d(
                TAG,
                "VPN is already connecting or connected"
            )

            return false
        }

        val sanitizedDns =
            dnsServer
                .trim()
                .takeIf { it.isNotEmpty() }
                ?: DEFAULT_DNS_SERVER

        VpnStateStore.set(
            VpnState.CONNECTING
        )

        Log.d(
            TAG,
            "VPN state set to CONNECTING"
        )

        return try {

            val intent =
                Intent(
                    context,
                    SecureVpnService::class.java
                ).apply {

                    action =
                        SecureVpnService.ACTION_START

                    putExtra(
                        SecureVpnService.EXTRA_DNS_SERVER,
                        sanitizedDns
                    )
                }

            ContextCompat.startForegroundService(
                context,
                intent
            )

            Log.d(
                TAG,
                "VPN service start request sent"
            )

            true

        } catch (e: SecurityException) {

            Log.e(
                TAG,
                "SecurityException while starting VPN service",
                e
            )

            VpnStateStore.set(
                VpnState.ERROR
            )

            false

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Failed to start VPN service",
                e
            )

            VpnStateStore.set(
                VpnState.ERROR
            )

            false
        }
    }

    /**
     * Requests VPN shutdown.
     *
     * The service is responsible for closing the actual VPN
     * interface and setting DISCONNECTED.
     */
    fun stop() {

        val currentState =
            VpnStateStore.get()

        Log.d(
            TAG,
            "stop() called, currentState=$currentState"
        )

        if (
            currentState == VpnState.DISCONNECTED
        ) {

            Log.d(
                TAG,
                "VPN is already disconnected"
            )

            return
        }

        VpnStateStore.set(
            VpnState.DISCONNECTING
        )

        Log.d(
            TAG,
            "VPN state set to DISCONNECTING"
        )

        try {

            val intent =
                Intent(
                    context,
                    SecureVpnService::class.java
                ).apply {

                    action =
                        SecureVpnService.ACTION_STOP
                }

            /*
             * The service already exists when a VPN is active,
             * so startService() is sufficient for delivering the
             * stop command.
             */
            context.startService(intent)

            Log.d(
                TAG,
                "VPN stop request sent"
            )

        } catch (e: SecurityException) {

            Log.e(
                TAG,
                "SecurityException while stopping VPN",
                e
            )

            VpnStateStore.set(
                VpnState.ERROR
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Failed to stop VPN service",
                e
            )

            VpnStateStore.set(
                VpnState.ERROR
            )
        }
    }
}
