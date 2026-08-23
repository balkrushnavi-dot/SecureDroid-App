package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(
    context: Context
) {

    private val devicePolicyManager: DevicePolicyManager =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)
            as DevicePolicyManager

    private val adminComponent: ComponentName =
        ComponentName(
            context,
            SecureDroidDeviceAdminReceiver::class.java
        )

    fun isAdminActive(): Boolean {
        return devicePolicyManager.isAdminActive(adminComponent)
    }

    fun getPolicy(): AdminPolicy {
        if (!isAdminActive()) {
            return AdminPolicy()
        }

        return AdminPolicy(
            cameraDisabled = devicePolicyManager.getCameraDisabled(null)
        )
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        if (!isAdminActive()) {
            return false
        }

        return try {
            devicePolicyManager.setCameraDisabled(
                adminComponent,
                disabled
            )
            true
        } catch (_: SecurityException) {
            false
        }
    }

    fun isCameraDisabled(): Boolean {
        return if (isAdminActive()) {
            devicePolicyManager.getCameraDisabled(null)
        } else {
            false
        }
    }
}
