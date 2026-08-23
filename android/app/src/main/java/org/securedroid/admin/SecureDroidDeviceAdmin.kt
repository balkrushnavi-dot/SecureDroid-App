package org.securedroid.admin

import android.content.Context

class SecureDroidDeviceAdmin(
    context: Context
) {

    private val policyService =
        DevicePolicyManagerService(context)

    fun isEnabled(): Boolean {
        return policyService.isAdminActive()
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
