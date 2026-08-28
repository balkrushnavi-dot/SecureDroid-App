package org.securedroid.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.VpnService
import org.securedroid.diagnostics.WifiSecurityAnalyzer
import org.securedroid.vpn.DomainBlocklistManager
import org.securedroid.vpn.SecureVpnManager
import org.securedroid.vpn.VpnState

enum class NetworkSecurityStatus {
    SECURE,
    WARNING,
    DISCONNECTED,
    ERROR,
    UNKNOWN
}

data class NetworkSecurityReport(
    val status: NetworkSecurityStatus,
    val vpnState: VpnState,
    val vpnPermissionGranted: Boolean,
    val networkConnected: Boolean,
    val wifiConnected: Boolean,
    val internetAvailable: Boolean,
    val networkValidated: Boolean,
    val blockedDomainCount: Int,
    val allowedDomainCount: Int,
    val findings: List<String>
)

class NetworkSecurityManager(
    private val context: Context
) {

    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE)
            as? ConnectivityManager

    private val vpnManager =
        SecureVpnManager(context)

    private val blocklistManager =
        DomainBlocklistManager(context)

    private val wifiAnalyzer =
        WifiSecurityAnalyzer(context)

    /**
     * Returns whether Android currently allows SecureDroid
     * to establish a VPN.
     *
     * VpnService.prepare() returns null when permission is already granted.
     */
    fun isVpnPermissionGranted(): Boolean {
        return try {
            VpnService.prepare(context) == null
        } catch (_: Exception) {
            false
        }
    }

    fun getVpnState(): VpnState {
        return vpnManager.getState()
    }

    fun isVpnConnected(): Boolean {
        return vpnManager.isConnected()
    }

    /**
     * Starts the application-level VPN.
     *
     * This does not provide kernel-level firewall enforcement.
     */
    fun startVpn(): Boolean {
        return vpnManager.start()
    }

    fun stopVpn() {
        vpnManager.stop()
    }

    fun getBlockedDomains(): Set<String> {
        return blocklistManager.getBlockedDomains()
    }

    fun getAllowedDomains(): Set<String> {
        return blocklistManager.getAllowedDomains()
    }

    fun addBlockedDomain(domain: String): Boolean {
        return blocklistManager.addBlockedDomain(domain)
    }

    fun removeBlockedDomain(domain: String): Boolean {
        return blocklistManager.removeBlockedDomain(domain)
    }

    fun addAllowedDomain(domain: String): Boolean {
        return blocklistManager.addAllowedDomain(domain)
    }

    fun removeAllowedDomain(domain: String): Boolean {
        return blocklistManager.removeAllowedDomain(domain)
    }

    fun isDomainBlocked(domain: String): Boolean {
        return blocklistManager.isBlocked(domain)
    }

    /**
     * Performs a network security assessment using information
     * exposed through ConnectivityManager and the VPN state.
     */
    fun analyze(): NetworkSecurityReport {
        val findings = mutableListOf<String>()

        val vpnState = vpnManager.getState()
        val vpnPermissionGranted = isVpnPermissionGranted()

        val activeNetwork = connectivityManager?.activeNetwork
        val capabilities =
            if (activeNetwork != null) {
                connectivityManager?.getNetworkCapabilities(activeNetwork)
            } else {
                null
            }

        val networkConnected =
            activeNetwork != null && capabilities != null

        val wifiConnected =
            capabilities?.hasTransport(
                NetworkCapabilities.TRANSPORT_WIFI
            ) == true

        val internetAvailable =
            capabilities?.hasCapability(
                NetworkCapabilities.NET_CAPABILITY_INTERNET
            ) == true

        val networkValidated =
            capabilities?.hasCapability(
                NetworkCapabilities.NET_CAPABILITY_VALIDATED
            ) == true

        /*
         * VPN permission is separate from VPN connection state.
         */
        if (!vpnPermissionGranted) {
            findings.add(
                "SecureDroid does not currently have Android VPN authorization."
            )
        }

        if (!networkConnected) {
            findings.add(
                "No active network connection was detected."
            )

            return NetworkSecurityReport(
                status = NetworkSecurityStatus.DISCONNECTED,
                vpnState = vpnState,
                vpnPermissionGranted = vpnPermissionGranted,
                networkConnected = false,
                wifiConnected = false,
                internetAvailable = false,
                networkValidated = false,
                blockedDomainCount =
                    blocklistManager.getBlockedDomains().size,
                allowedDomainCount =
                    blocklistManager.getAllowedDomains().size,
                findings = findings
            )
        }

        if (!internetAvailable) {
            findings.add(
                "The active network does not currently expose internet capability."
            )
        }

        if (internetAvailable && !networkValidated) {
            findings.add(
                "The active network is not validated by Android."
            )
        }

        when (vpnState) {
            VpnState.CONNECTED -> {
                findings.add(
                    "SecureDroid application-level VPN is connected."
                )
            }

            VpnState.CONNECTING -> {
                findings.add(
                    "SecureDroid application-level VPN is connecting."
                )
            }

            VpnState.DISCONNECTING -> {
                findings.add(
                    "SecureDroid application-level VPN is disconnecting."
                )
            }

            VpnState.ERROR -> {
                findings.add(
                    "SecureDroid VPN is in an error state."
                )
            }

            VpnState.DISCONNECTED -> {
                findings.add(
                    "SecureDroid VPN is disconnected."
                )
            }
        }

        val status =
            when {
                vpnState == VpnState.ERROR ->
                    NetworkSecurityStatus.ERROR

                vpnState != VpnState.CONNECTED ->
                    NetworkSecurityStatus.WARNING

                internetAvailable && networkValidated ->
                    NetworkSecurityStatus.SECURE

                else ->
                    NetworkSecurityStatus.WARNING
            }

        /*
         * Run the lower-level Wi-Fi/network assessment as well.
         *
         * Its result is deliberately not converted into a claim
         * that the Wi-Fi encryption protocol is known. Android's
         * NetworkCapabilities API does not expose WPA/WPA2/WPA3
         * security details here.
         */
        val wifiReport = wifiAnalyzer.analyze()

        wifiReport.findings.forEach { finding ->
            if (finding.level != "INFO") {
                findings.add(finding.summary)
            }
        }

        return NetworkSecurityReport(
            status = status,
            vpnState = vpnState,
            vpnPermissionGranted = vpnPermissionGranted,
            networkConnected = networkConnected,
            wifiConnected = wifiConnected,
            internetAvailable = internetAvailable,
            networkValidated = networkValidated,
            blockedDomainCount =
                blocklistManager.getBlockedDomains().size,
            allowedDomainCount =
                blocklistManager.getAllowedDomains().size,
            findings = findings.distinct()
        )
    }

    /**
     * Returns a simple connectivity snapshot.
     */
    fun getConnectivitySnapshot(): Map<String, Boolean> {
        val network = connectivityManager?.activeNetwork
        val capabilities =
            connectivityManager?.getNetworkCapabilities(network)

        return mapOf(
            "connected" to (network != null && capabilities != null),
            "wifi" to (
                capabilities?.hasTransport(
                    NetworkCapabilities.TRANSPORT_WIFI
                ) == true
            ),
            "cellular" to (
                capabilities?.hasTransport(
                    NetworkCapabilities.TRANSPORT_CELLULAR
                ) == true
            ),
            "internet" to (
                capabilities?.hasCapability(
                    NetworkCapabilities.NET_CAPABILITY_INTERNET
                ) == true
            ),
            "validated" to (
                capabilities?.hasCapability(
                    NetworkCapabilities.NET_CAPABILITY_VALIDATED
                ) == true
            ),
            "vpn" to vpnManager.isConnected()
        )
    }
}
