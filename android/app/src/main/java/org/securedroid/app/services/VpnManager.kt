package org.securedroid.app.services

import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import org.securedroid.network.SecureVpnService

class VpnManager(
    private val context: Context
) {

    companion object {
        private const val DEFAULT_DNS = "1.1.1.1"

        @Volatile
        private var active = false

        @Volatile
        private var dns = DEFAULT_DNS
    }

    /**
     * Returns the Android VPN permission intent.
     *
     * If this returns null, VPN permission has already been granted.
     */
    fun prepareVpn(): Intent? {
        return VpnService.prepare(context)
    }

    /**
     * Starts SecureDroid VPN after Android VPN permission
     * has been granted.
     */
    fun startVpn(
        blocklist: List<String> = emptyList(),
        dnsServer: String = DEFAULT_DNS
    ): Boolean {

        // Android requires user approval before a VPN can start.
        if (VpnService.prepare(context) != null) {
            return false
        }

        val selectedDns =
            dnsServer.trim().ifEmpty { DEFAULT_DNS }

        dns = selectedDns

        /*
         * Keep the blocklist available for the service API.
         *
         * NOTE:
         * The current SecureVpnService does not yet implement
         * packet-level blocklist enforcement.
         */
        val intent = Intent(
            context,
            SecureVpnService::class.java
        ).apply {
            action = SecureVpnService.ACTION_START

            putStringArrayListExtra(
                SecureVpnService.EXTRA_BLOCKLIST,
                ArrayList(blocklist)
            )

            putExtra(
                SecureVpnService.EXTRA_DNS_SERVER,
                selectedDns
            )
        }

        return try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            active = true
            true

        } catch (_: Exception) {

            active = false
            false
        }
    }

    /**
     * Stops the SecureDroid VPN service.
     */
    fun stopVpn(): Boolean {

        val intent = Intent(
            context,
            SecureVpnService::class.java
        ).apply {
            action = SecureVpnService.ACTION_STOP
        }

        return try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            active = false
            true

        } catch (_: Exception) {

            active = false
            false
        }
    }

    /**
     * Returns the locally tracked VPN state.
     */
    fun isVpnActive(): Boolean {
        return active
    }

    /**
     * Returns the DNS server currently requested by SecureDroid.
     */
    fun getDnsServer(): String {
        return dns
    }

    /**
     * Allows the VPN service to synchronize its actual state.
     */
    fun setActive(value: Boolean) {
        active = value
    }
}
