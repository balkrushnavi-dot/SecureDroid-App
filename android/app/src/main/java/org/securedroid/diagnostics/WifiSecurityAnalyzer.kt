package org.securedroid.diagnostics

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.util.Log

data class WifiSecurityFinding(
    val id: String,
    val level: String, // "INFO", "WARNING", "CRITICAL"
    val summary: String
)

data class WifiSecurityReport(
    val isConnected: Boolean,
    val isWifi: Boolean,
    val isSecure: Boolean,
    val findings: List<WifiSecurityFinding>
)

class WifiSecurityAnalyzer(private val context: Context) {
    companion object {
        private const val TAG = "WifiSecurityAnalyzer"
    }

    fun analyze(): WifiSecurityReport {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager
        val activeNetwork = connectivityManager?.activeNetwork
        val capabilities = connectivityManager?.getNetworkCapabilities(activeNetwork)

        if (activeNetwork == null || capabilities == null) {
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

        val isWifi = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
        val isCellular = capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
        val hasInternet = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        val isValidated = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)

        val findings = mutableListOf<WifiSecurityFinding>()
        var isSecure = true

        if (!hasInternet) {
            findings.add(
                WifiSecurityFinding(
                    id = "NO_INTERNET",
                    level = "INFO",
                    summary = "Connected network lacks internet capability."
                )
            )
        }

        if (isWifi) {
            findings.add(
                WifiSecurityFinding(
                    id = "WIFI_CONNECTED",
                    level = "INFO",
                    summary = "Device is connected via Wi-Fi."
                )
            )
        } else if (isCellular) {
            findings.add(
                WifiSecurityFinding(
                    id = "CELLULAR_CONNECTED",
                    level = "INFO",
                    summary = "Device is connected via Cellular data."
                )
            )
        }

        if (!isValidated && hasInternet) {
            isSecure = false
            findings.add(
                WifiSecurityFinding(
                    id = "UNVALIDATED_NETWORK",
                    level = "WARNING",
                    summary = "Network connection is unvalidated (possible captive portal or restricted access)."
                )
            )
        }

        return WifiSecurityReport(
            isConnected = true,
            isWifi = isWifi,
            isSecure = isSecure,
            findings = findings
        )
    }
}
