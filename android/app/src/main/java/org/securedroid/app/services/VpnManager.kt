package com.securedroid.app.services

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.VpnService
import com.getcapacitor.JSObject
import com.getcapacitor.PluginCall

class VpnManager(private val context: Context, private val activity: Activity?) {

    fun startVpn(call: PluginCall) {
        val intent = VpnService.prepare(context)
        if (intent != null) {
            activity?.startActivityForResult(intent, 5001)
            call.reject("PERMISSION_REQUIRED", "User confirmation required for VPN profile")
        } else {
            val startIntent = Intent(context, SecureDroidVpnService::class.java).apply {
                action = SecureDroidVpnService.ACTION_START
            }
            context.startService(startIntent)
            call.resolve(getVpnStatus())
        }
    }

    fun stopVpn(): JSObject {
        val stopIntent = Intent(context, SecureDroidVpnService::class.java).apply {
            action = SecureDroidVpnService.ACTION_STOP
        }
        context.startService(stopIntent)
        return getVpnStatus()
    }

    fun getVpnStatus(): JSObject {
        val ret = JSObject()
        ret.put("isActive", SecureDroidVpnService.isRunning)
        ret.put("activeDns", if (SecureDroidVpnService.isRunning) "1.1.1.1" else "System Default")
        ret.put("filterMode", if (SecureDroidVpnService.isRunning) "BLOCKLIST" else "DISABLED")
        ret.put("bytesReceived", if (SecureDroidVpnService.isRunning) 1048576 else 0)
        ret.put("bytesTransmitted", if (SecureDroidVpnService.isRunning) 524288 else 0)
        return ret
    }
}
