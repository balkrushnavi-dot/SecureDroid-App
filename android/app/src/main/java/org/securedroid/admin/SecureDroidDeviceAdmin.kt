package org.securedroid.admin

import android.content.ComponentName
import android.content.Context

class SecureDroidDeviceAdmin(
    private val context: Context
) {

    private val policyService =
        DevicePolicyManagerService(context)

    fun isEnabled(): Boolean {
        val component = ComponentName(
            context,
            SecureDroidDeviceAdminReceiver::class.java
        )

        return policyService.isAdminActive(component)
    }

    fun getPolicy(): AdminPolicy {
        return policyService.getPolicy()
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        return policyService.setCameraDisabled(disabled)
    }

    fun isCameraDisabled(): Boolean {
        return policyService.isCameraDisabled()
    }
}
