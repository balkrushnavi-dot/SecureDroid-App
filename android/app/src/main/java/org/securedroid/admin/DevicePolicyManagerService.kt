package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(
    private val context: Context
) {

    private val dpm: DevicePolicyManager =
        context.getSystemService(
            Context.DEVICE_POLICY_SERVICE
        ) as DevicePolicyManager

    private val adminComponent =
        ComponentName(
            context,
            SecureDroidDeviceAdminReceiver::class.java
        )

    fun isAdminActive(): Boolean {
        return try {
            dpm.isAdminActive(adminComponent)
        } catch (_: Exception) {
            false
        }
    }

    fun isDeviceOwnerActive(): Boolean {
        return try {
            dpm.isDeviceOwnerApp(context.packageName)
        } catch (_: Exception) {
            false
        }
    }

    fun isProfileOwnerActive(): Boolean {
        return try {
            dpm.isProfileOwnerApp(context.packageName)
        } catch (_: Exception) {
            false
        }
    }

    fun getPolicyStatusSummary(): String {
        return when {
            isDeviceOwnerActive() ->
                "Active (Device Owner Mode)"

            isProfileOwnerActive() ->
                "Active (Managed Profile Mode)"

            isAdminActive() ->
                "Active (Device Administrator Mode)"

            else ->
                "Inactive (Application Level Only)"
        }
    }

    fun getPolicy(): AdminPolicy {
        return AdminPolicy(
            cameraDisabled = isCameraDisabled(),
            screenCaptureDisabled = isScreenCaptureDisabled(),
            keyguardDisabled = false,
            passwordRequired = false
        )
    }

    fun setCameraDisabled(disabled: Boolean): Boolean {
        return try {
            if (!isAdminActive() && !isDeviceOwnerActive()) {
                return false
            }

            dpm.setCameraDisabled(
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

    fun isCameraDisabled(): Boolean {
        return try {
            dpm.getCameraDisabled(adminComponent)
        } catch (_: Exception) {
            false
        }
    }

    fun setScreenCaptureDisabled(
        disabled: Boolean
    ): Boolean {
        return try {
            if (!isDeviceOwnerActive()) {
                return false
            }

            dpm.setScreenCaptureDisabled(
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

    fun isScreenCaptureDisabled(): Boolean {
        return try {
            dpm.getScreenCaptureDisabled(adminComponent)
        } catch (_: Exception) {
            false
        }
    }

    fun applyScreenCaptureRestriction(
        restrict: Boolean
    ): Boolean {
        return setScreenCaptureDisabled(restrict)
    }
}
