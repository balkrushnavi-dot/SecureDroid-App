package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(
    context: Context
) {

    private val devicePolicyManager =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE)
                as DevicePolicyManager

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
            requireSecureLockScreen = isSecureLockScreenRequired(),
            allowCamera = isCameraAllowed(),
            allowScreenCapture = isScreenCaptureAllowed()
        )
    }

    private fun isSecureLockScreenRequired(): Boolean {
        if (!isAdminActive()) {
            return false
        }

        return devicePolicyManager.getPasswordQuality(adminComponent) !=
                DevicePolicyManager.PASSWORD_QUALITY_UNSPECIFIED
    }

    private fun isCameraAllowed(): Boolean {
        if (!isAdminActive()) {
            return true
        }

        return devicePolicyManager.getCameraDisabled(adminComponent).not()
    }

    private fun isScreenCaptureAllowed(): Boolean {
        if (!isAdminActive()) {
            return true
        }

        return !devicePolicyManager.getScreenCaptureDisabled(adminComponent)
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        if (!isAdminActive()) {
            return false
        }

        devicePolicyManager.setCameraDisabled(
            adminComponent,
            disabled
        )

        return devicePolicyManager.getCameraDisabled(adminComponent) == disabled
    }

    fun setScreenCaptureDisabled(disabled: Boolean): Boolean {
        if (!isAdminActive()) {
            return false
        }

        devicePolicyManager.setScreenCaptureDisabled(
            adminComponent,
            disabled
        )

        return devicePolicyManager.getScreenCaptureDisabled(adminComponent) == disabled
    }
}
