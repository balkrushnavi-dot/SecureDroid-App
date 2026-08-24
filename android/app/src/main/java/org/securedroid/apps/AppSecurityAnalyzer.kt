
package org.securedroid.apps

import android.Manifest
import android.os.Build

enum class AppRiskLevel {
    LOW,
    MEDIUM,
    HIGH
}

data class AppSecurityFinding(
    val code: String,
    val title: String,
    val description: String,
    val severity: AppRiskLevel,
    val points: Int
)

data class AppSecurityAssessment(
    val packageName: String,
    val appName: String,
    val score: Int,
    val riskLevel: AppRiskLevel,
    val findings: List<AppSecurityFinding>
)

class AppSecurityAnalyzer {

    fun analyze(
        app: InstalledAppInfo
    ): AppSecurityAssessment {

        val findings = mutableListOf<AppSecurityFinding>()

        val permissions =
            app.requestedPermissions.toSet()

        if (Manifest.permission.CAMERA in permissions) {
            findings += AppSecurityFinding(
                code = "CAMERA_PERMISSION",
                title = "Camera permission requested",
                description =
                    "This application requests access to the device camera.",
                severity = AppRiskLevel.MEDIUM,
                points = 10
            )
        }

        if (Manifest.permission.RECORD_AUDIO in permissions) {
            findings += AppSecurityFinding(
                code = "MICROPHONE_PERMISSION",
                title = "Microphone permission requested",
                description =
                    "This application requests access to the device microphone.",
                severity = AppRiskLevel.MEDIUM,
                points = 10
            )
        }

        if (Manifest.permission.ACCESS_FINE_LOCATION in permissions ||
            Manifest.permission.ACCESS_COARSE_LOCATION in permissions
        ) {
            findings += AppSecurityFinding(
                code = "LOCATION_PERMISSION",
                title = "Location permission requested",
                description =
                    "This application requests access to device location.",
                severity = AppRiskLevel.MEDIUM,
                points = 10
            )
        }

        if (Manifest.permission.READ_CONTACTS in permissions ||
            Manifest.permission.WRITE_CONTACTS in permissions
        ) {
            findings += AppSecurityFinding(
                code = "CONTACTS_PERMISSION",
                title = "Contacts permission requested",
                description =
                    "This application requests access to contacts.",
                severity = AppRiskLevel.MEDIUM,
                points = 10
            )
        }

        if (Manifest.permission.READ_SMS in permissions ||
            Manifest.permission.SEND_SMS in permissions ||
            Manifest.permission.RECEIVE_SMS in permissions
        ) {
            findings += AppSecurityFinding(
                code = "SMS_PERMISSION",
                title = "SMS permission requested",
                description =
                    "This application requests access to SMS functionality.",
                severity = AppRiskLevel.HIGH,
                points = 20
            )
        }

        if (app.targetSdk < Build.VERSION_CODES.S) {
            findings += AppSecurityFinding(
                code = "OLD_TARGET_SDK",
                title = "Old Android target",
                description =
                    "The application targets an older Android API level.",
                severity = AppRiskLevel.MEDIUM,
                points = 15
            )
        }

        val score =
            findings.sumOf { it.points }
                .coerceIn(0, 100)

        val riskLevel =
            when {
                score >= 40 -> AppRiskLevel.HIGH
                score >= 20 -> AppRiskLevel.MEDIUM
                else -> AppRiskLevel.LOW
            }

        return AppSecurityAssessment(
            packageName = app.packageName,
            appName = app.appName,
            score = score,
            riskLevel = riskLevel,
            findings = findings
        )
    }
}
