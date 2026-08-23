package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class SecureDroidDeviceAdmin(
    private val context: Context
) {

    private val devicePolicyManager: DevicePolicyManager =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)
            as DevicePolicyManager

    private val adminComponent: ComponentName =
        ComponentName(
            context,
            SecureDroidDeviceAdminReceiver::class.java
        )

    fun isEnabled(): Boolean {
        return try {
            devicePolicyManager.isAdminActive(adminComponent)
        } catch (_: Exception) {
            false
        }
    }

    fun isCameraDisabled(): Boolean {
        if (!isEnabled()) {
            return false
        }

        return try {
            devicePolicyManager.getCameraDisabled(null)
        } catch (_: Exception) {
            false
        }
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        if (!isEnabled()) {
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
        } catch (_: Exception) {
            false
        }
    }
}
