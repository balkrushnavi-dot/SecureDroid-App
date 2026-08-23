package com.securedroid.app.services

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.TrafficStats
import com.getcapacitor.JSArray
import com.getcapacitor.JSObject

class NetworkManager(private val context: Context) {

    fun getNetworkState(): JSObject {
        val ret = JSObject()
        val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

        val activeNetwork = cm.activeNetwork
        val caps = if (activeNetwork != null) cm.getNetworkCapabilities(activeNetwork) else null

        val isConnected = caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        val isValidated = caps != null && caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        val isMetered = caps != null && !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)
        val isVpn = caps != null && caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN)

        var connType = "NONE"
        if (caps != null) {
            when {
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> connType = "WIFI"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> connType = "CELLULAR"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> connType = "ETHERNET"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_BLUETOOTH) -> connType = "BLUETOOTH"
                caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN) -> connType = "VPN"
            }
        }

        ret.put("isConnected", isConnected)
        ret.put("connectionType", connType)
        ret.put("isValidated", isValidated)
        ret.put("isMetered", isMetered)
        ret.put("isVpnActive", isVpn)

        val dnsArray = JSArray()
        dnsArray.put("1.1.1.1")
        dnsArray.put("9.9.9.9")
        ret.put("dnsServers", dnsArray)

        ret.put("rxBytes", TrafficStats.getTotalRxBytes())
        ret.put("txBytes", TrafficStats.getTotalTxBytes())

        if (caps != null) {
            ret.put("downlinkSpeedKbps", caps.linkDownstreamBandwidthKbps)
            ret.put("uplinkSpeedKbps", caps.linkUpstreamBandwidthKbps)
        }

        return ret
    }
}
