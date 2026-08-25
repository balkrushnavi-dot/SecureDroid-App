package org.securedroid.vpn

import android.content.Context
import android.content.Intent

class SecureVpnManager(private val context: Context) {
    
    data class VpnStatus(
        val isConnected: Boolean = false,
        val isActive: Boolean = false,
        val message: String = "VPN is disconnected"
    )
    
    fun startVpn() {
        val intent = Intent(context, SecureVpnService::class.java)
        intent.action = "START"
        context.startService(intent)
    }
    
    fun stopVpn() {
        val intent = Intent(context, SecureVpnService::class.java)
        intent.action = "STOP"
        context.stopService(intent)
    }
    
    fun getVpnStatus(): VpnStatus {
        // Check if VPN is running
        // This would need to check the service state
        return VpnStatus(
            isConnected = false,
            isActive = false,
            message = "VPN is disconnected"
        )
    }
}
