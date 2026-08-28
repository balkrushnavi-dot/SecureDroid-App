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
    val isSecure: Boolean?,
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

        val activeNetwork =
            connectivityManager?.activeNetwork

        val capabilities =
            activeNetwork?.let {
                connectivityManager.getNetworkCapabilities(it)
            }

        if (activeNetwork == null ||
            capabilities == null
        ) {
            return WifiSecurityReport(
                isConnected = false,
                isWifi = false,
                isSecure = null,
                findings = listOf(
                    WifiSecurityFinding(
                        id = "NO_NETWORK",
                        level = "INFO",
                        summary = "No active network connection detected."
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

        val findings =
            mutableListOf<WifiSecurityFinding>()

        /*
         * This analyzer can determine connectivity characteristics,
         * but it cannot reliably determine the Wi-Fi encryption mode
         * from NetworkCapabilities alone.
         *
         * Therefore isSecure means "network validation state is
         * acceptable", NOT "Wi-Fi encryption is guaranteed."
         */
        var secure: Boolean? = null

        if (isWifi) {
            findings.add(
                WifiSecurityFinding(
                    id = "WIFI_CONNECTED",
                    level = "INFO",
                    summary = "Device is connected through Wi-Fi."
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
        } else {
            findings.add(
                WifiSecurityFinding(
                    id = "OTHER_TRANSPORT",
                    level = "INFO",
                    summary = "Device is connected through a non-Wi-Fi/non-cellular transport."
                )
            )
        }

        if (!hasInternet) {
            findings.add(
                WifiSecurityFinding(
                    id = "NO_INTERNET",
                    level = "INFO",
                    summary = "The active network does not advertise internet capability."
                )
            )
        } else if (!isValidated) {
            findings.add(
                WifiSecurityFinding(
                    id = "UNVALIDATED_NETWORK",
                    level = "WARNING",
                    summary = "The network has internet capability but Android has not validated internet access."
                )
            )

            secure = null
        } else {
            findings.add(
                WifiSecurityFinding(
                    id = "NETWORK_VALIDATED",
                    level = "INFO",
                    summary = "Android reports the active network as validated."
                )
            )

            secure = true
        }

        return WifiSecurityReport(
            isConnected = true,
            isWifi = isWifi,
            isSecure = secure,
            findings = findings
        )
    }
}
