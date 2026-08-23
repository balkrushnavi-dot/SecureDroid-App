package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(private val context: Context) {

    private val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
    private val adminComponent = ComponentName(context, SecureDroidDeviceAdmin::class.java)

    fun isDeviceOwnerActive(): Boolean {
        return try {
            dpm?.isDeviceOwnerApp(context.packageName) ?: false
        } catch (e: Exception) {
            false
        }
    }

    fun isProfileOwnerActive(): Boolean {
        return try {
            dpm?.isProfileOwnerApp(context.packageName) ?: false
        } catch (e: Exception) {
            false
        }
    }

    fun getPolicyStatusSummary(): String {
        return when {
            isDeviceOwnerActive() -> "Active (Device Owner Mode)"
            isProfileOwnerActive() -> "Active (Managed Profile Mode)"
            else -> "Inactive (Normal Mode - Application Level Only)"
        }
    }

    fun applyScreenCaptureRestriction(restrict: Boolean) {
        if (isDeviceOwnerActive()) {
            try {
                dpm?.setScreenCaptureDisabled(adminComponent, restrict)
            } catch (e: Exception) {
                // Handle or log restriction failure gracefully
            }
        }
    }
}

