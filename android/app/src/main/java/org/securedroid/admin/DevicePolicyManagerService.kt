package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(
    context: Context
) {

    private val devicePolicyManager =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager

    private val adminComponent =
        ComponentName(
            context,
            SecureDroidDeviceAdminReceiver::class.java
        )

    fun isAdminActive(): Boolean {
        return devicePolicyManager.isAdminActive(adminComponent)
    }

    fun getPolicy(): AdminPolicy {
        return AdminPolicy(
            cameraDisabled = if (isAdminActive()) {
                devicePolicyManager.getCameraDisabled(null)
            } else {
                false
            }
        )
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        if (!isAdminActive()) {
            return false
        }

        devicePolicyManager.setCameraDisabled(
            adminComponent,
            disabled
        )

        return true
    }

    fun isCameraDisabled(): Boolean {
        return if (isAdminActive()) {
            devicePolicyManager.getCameraDisabled(null)
        } else {
            false
        }
    }
}
