package org.securedroid.privacy

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import org.securedroid.apps.InstalledAppInfo
import org.securedroid.apps.InstalledAppScanner

data class PrivacyFinding(
    val id: String,
    val severity: PrivacySeverity,
    val packageName: String,
    val appName: String,
    val description: String
)

enum class PrivacySeverity {
    INFO,
    WARNING,
    HIGH
}

data class PrivacyReport(
    val scannedApps: Int,
    val findings: List<PrivacyFinding>
)

class PrivacyMonitor(
    private val context: Context
) {

    private val scanner = InstalledAppScanner(context)

    fun analyze(): PrivacyReport {
        val apps = try {
            scanner.scan()
        } catch (_: Exception) {
            emptyList()
        }

        val findings = mutableListOf<PrivacyFinding>()

        apps.forEach { app ->
            analyzeApp(app, findings)
        }

        return PrivacyReport(
            scannedApps = apps.size,
            findings = findings
        )
    }

    private fun analyzeApp(
        app: InstalledAppInfo,
        findings: MutableList<PrivacyFinding>
    ) {
        /*
         * System applications are excluded from this privacy-risk
         * heuristic because their permissions frequently reflect
         * legitimate platform functionality.
         */
        if (app.isSystemApp) {
            return
        }

        val permissions = app.requestedPermissions.toSet()

        if (Manifest.permission.RECORD_AUDIO in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "MICROPHONE_ACCESS",
                    severity = PrivacySeverity.WARNING,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests microphone access."
                )
            )
        }

        if (Manifest.permission.CAMERA in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "CAMERA_ACCESS",
                    severity = PrivacySeverity.WARNING,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests camera access."
                )
            )
        }

        if (Manifest.permission.ACCESS_FINE_LOCATION in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "PRECISE_LOCATION",
                    severity = PrivacySeverity.HIGH,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests precise location access."
                )
            )
        }

        if (Manifest.permission.READ_CONTACTS in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "CONTACT_ACCESS",
                    severity = PrivacySeverity.WARNING,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests access to contacts."
                )
            )
        }

        if (Manifest.permission.READ_SMS in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "SMS_ACCESS",
                    severity = PrivacySeverity.HIGH,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests access to SMS messages."
                )
            )
        }

        if (Manifest.permission.READ_CALL_LOG in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "CALL_LOG_ACCESS",
                    severity = PrivacySeverity.HIGH,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests access to call history."
                )
            )

        }

        if (Manifest.permission.SYSTEM_ALERT_WINDOW in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "OVERLAY_ACCESS",
                    severity = PrivacySeverity.HIGH,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests permission to draw over other applications."
                )
            )
        }

        if (Manifest.permission.REQUEST_INSTALL_PACKAGES in permissions) {
            findings.add(
                PrivacyFinding(
                    id = "APP_INSTALL_ACCESS",
                    severity = PrivacySeverity.HIGH,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests permission to initiate installation of other packages."
                )
            )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
            Manifest.permission.BLUETOOTH_SCAN in permissions
        ) {
            findings.add(
                PrivacyFinding(
                    id = "BLUETOOTH_SCAN",
                    severity = PrivacySeverity.WARNING,
                    packageName = app.packageName,
                    appName = app.appName,
                    description = "The application requests Bluetooth scanning capability."
                )
            )
        }
    }

    /**
     * Returns whether a specific permission is currently granted
     * to SecureDroid itself.
     *
     * This does NOT claim that another application has granted
     * or used the permission.
     */
    fun isPermissionGranted(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            permission
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Returns privacy-related permissions currently granted
     * to SecureDroid.
     */
    fun getSecureDroidGrantedPrivacyPermissions(): List<String> {
        val permissions = listOf(
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.READ_CONTACTS
        )

        return permissions.filter {
            isPermissionGranted(it)
        }
    }
}
