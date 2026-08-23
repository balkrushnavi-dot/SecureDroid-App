package org.securedroid.admin

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context

class DevicePolicyManagerService(
    private val context: Context
) {

    private val dpm: DevicePolicyManager? =
        context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager

    private val adminComponent =
        ComponentName(context, SecureDroidDeviceAdmin::class.java)

    fun isDeviceOwnerActive(): Boolean {
        return try {
            dpm?.isDeviceOwnerApp(context.packageName) == true
        } catch (_: Exception) {
            false
        }
    }

    fun isProfileOwnerActive(): Boolean {
        return try {
            dpm?.isProfileOwnerApp(context.packageName) == true
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

            else ->
                "Inactive (Normal Mode - Application Level Only)"
        }
    }

    fun applyScreenCaptureRestriction(restrict: Boolean): Boolean {
        if (!isDeviceOwnerActive()) {
            return false
        }

        return try {
            dpm?.setScreenCaptureDisabled(
                adminComponent,
                restrict
            )
            true
        } catch (_: SecurityException) {
            false
        } catch (_: Exception) {
            false
        }
    }
}
