package org.securedroid.diagnostics

import android.content.Context
import android.os.Build
import org.securedroid.admin.DevicePolicyManagerService
import org.securedroid.security.KeyStoreManager

data class DiagnosticReport(
    val deviceModel: String,
    val androidVersion: String,
    val sdkInt: Int,
    val securityPatch: String,
    val isDeviceOwner: Boolean,
    val isHardwareKeystoreBacked: Boolean
)

class DeviceDiagnostics(private val context: Context) {

    private val devicePolicyService = DevicePolicyManagerService(context)
    private val keyStoreManager = KeyStoreManager(context)

    fun generateReport(): DiagnosticReport {
        return DiagnosticReport(
            deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}",
            androidVersion = Build.VERSION.RELEASE ?: "Unknown",
            sdkInt = Build.VERSION.SDK_INT,
            securityPatch = Build.VERSION.SECURITY_PATCH ?: "Unknown",
            isDeviceOwner = devicePolicyService.isDeviceOwnerActive(),
            isHardwareKeystoreBacked = keyStoreManager.isHardwareBacked()
        )
    }
}
