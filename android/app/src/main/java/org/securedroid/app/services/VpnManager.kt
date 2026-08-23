package org.securedroid.app.services

import android.content.Context
import android.content.Intent
import org.securedroid.network.SecureVpnService

class VpnManager(private val context: Context) {

    fun startVpn(blocklist: List<String> = emptyList(), dnsServer: String = "1.1.1.1"): Boolean {
        return try {
            val intent = Intent(context, SecureVpnService::class.java).apply {
                putStringArrayListExtra("blocklist", ArrayList(blocklist))
                putExtra("dns_server", dnsServer)
            }
            context.startService(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun stopVpn(): Boolean {
        return try {
            val intent = Intent(context, SecureVpnService::class.java)
            context.stopService(intent)
            true
        } catch (e: Exception) {
            false
        }
    }

    fun isVpnActive(): Boolean {
        // Return active state based on service or connection manager check
        return false
    }
}
