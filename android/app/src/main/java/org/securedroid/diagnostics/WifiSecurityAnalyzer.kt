package org.securedroid.diagnostics

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

data class WifiSecurityFinding(
    val id: String,
    val level: String,
    val summary: String
)

data class WifiSecurityReport(
    val isConnected: Boolean,
    val isWifi: Boolean,
    val isSecure: Boolean,
    val findings: List<WifiSecurityFinding>
)

class WifiSecurityAnalyzer(
    private val context: Context
) {

    fun analyze(): WifiSecurityReport {
        val connectivityManager =
            context.getSystemService(
                Context.CONNECTIVITY_SERVICE
            ) as? ConnectivityManager

        if (connectivityManager == null) {
            return WifiSecurityReport(
                isConnected = false,
                isWifi = false,
                isSecure = false,
                findings = listOf(
                    WifiSecurityFinding(
                        id = "CONNECTIVITY_SERVICE_UNAVAILABLE",
                        level = "WARNING",
                        summary = "Android connectivity information is unavailable."
                    )
                )
            )
        }

        val activeNetwork =
            connectivityManager.activeNetwork

        if (activeNetwork == null) {
            return WifiSecurityReport(
                isConnected = false,
                isWifi = false,
                isSecure = true,
                findings = listOf(
                    WifiSecurityFinding(
                        id = "NO_NETWORK",
                        level = "INFO",
                        summary = "No active network connection detected."
                    )
                )
            )
        }

        val capabilities =
            connectivityManager.getNetworkCapabilities(
                activeNetwork
            )

        if (capabilities == null) {
            return WifiSecurityReport(
                isConnected = true,
                isWifi = false,
                isSecure = false,
                findings = listOf(
                    WifiSecurityFinding(
                        id = "NETWORK_CAPABILITIES_UNKNOWN",
                        level = "WARNING",
                        summary = "The active network exists, but its capabilities could not be determined."
                    )
                )
            )
        }

        val isWifi =
            capabilities.hasTransport(
                NetworkCapabilities.TRANSPORT_WIFI
            )

        val isCellular =
            capabilities.hasTransport(
                NetworkCapabilities.TRANSPORT_CELLULAR
            )

        val hasInternet =
            capabilities.hasCapability(
                NetworkCapabilities.NET_CAPABILITY_INTERNET
            )

        val isValidated =
            capabilities.hasCapability(
                NetworkCapabilities.NET_CAPABILITY_VALIDATED
            )

        val hasVpn =
            capabilities.hasTransport(
                NetworkCapabilities.TRANSPORT_VPN
            )

        val findings =
            mutableListOf<WifiSecurityFinding>()

        /*
         * This analyzer cannot determine Wi-Fi encryption
         * (WPA2/WPA3/etc.) from NetworkCapabilities alone.
         *
         * Therefore "secure" means only that there is no
         * directly observable network-condition problem.
         */
        var isSecure = true

        if (isWifi) {
            findings.add(
                WifiSecurityFinding(
                    id = "WIFI_CONNECTED",
                    level = "INFO",
                    summary = "Device is connected through Wi-Fi."
                )
            )

            findings.add(
                WifiSecurityFinding(
                    id = "WIFI_ENCRYPTION_UNKNOWN",
                    level = "WARNING",
                    summary = "Wi-Fi link encryption cannot be verified by this analyzer."
                )
            )
        } else if (isCellular) {
            findings.add(
                WifiSecurityFinding(
                    id = "CELLULAR_CONNECTED",
                    level = "INFO",
                    summary = "Device is connected through cellular data."
                )
            )
        }

        if (hasVpn) {
            findings.add(
                WifiSecurityFinding(
                    id = "VPN_TRANSPORT_PRESENT",
                    level = "INFO",
                    summary = "A VPN transport is present on the active network."
                )
            )
        }

        if (!hasInternet) {
            findings.add(
                WifiSecurityFinding(
                    id = "NO_INTERNET",
                    level = "INFO",
                    summary = "The active network does not currently advertise internet capability."
                )
            )
        }

        if (hasInternet && !isValidated) {
            /*
             * This is a connectivity warning, not proof that
             * the network is malicious or insecure.
             */
            findings.add(
                WifiSecurityFinding(
                    id = "NETWORK_NOT_VALIDATED",
                    level = "WARNING",
                    summary = "Android has not validated internet connectivity. This may indicate a captive portal or restricted network."
                )
            )
        }

        /*
         * Never claim Wi-Fi encryption security from this API.
         */
        if (isWifi && !isValidated) {
            isSecure = false
        }

        return WifiSecurityReport(
            isConnected = true,
            isWifi = isWifi,
            isSecure = isSecure,
            findings = findings
        )
    }
}
