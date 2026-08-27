package org.securedroid.apps

/**
 * Produces a factual risk assessment for an installed app based on
 * real, checkable signals. This deliberately does NOT claim malware
 * detection, virus scanning, or any capability this app does not
 * actually have. Every finding here corresponds to a real Android
 * API fact about the app (its declared permissions, install source,
 * and target SDK) — nothing is inferred about the app's actual
 * behavior, which this app has no way to observe.
 */

enum class RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}

data class RiskFinding(
    val id: String,
    val level: RiskLevel,
    val summary: String
)

data class AppRiskReport(
    val packageName: String,
    val overallRisk: RiskLevel,
    val findings: List<RiskFinding>
)

object AppRiskAnalyzer {

    // Permissions with real, well-documented potential for abuse if
    // misused. This list is intentionally conservative: it flags
    // permissions that grant broad capability (reading messages,
    // drawing over other apps, installing packages, accessibility
    // access), not every permission an app might request.
    // Exposed (not private) so other analyzers/bridges can reuse the
    // same definition instead of maintaining a second, possibly
    // inconsistent list.
    val SENSITIVE_PERMISSIONS = mapOf(
        "android.permission.READ_SMS" to "Can read text messages",
        "android.permission.RECEIVE_SMS" to "Can intercept incoming text messages",
        "android.permission.READ_CALL_LOG" to "Can read call history",
        "android.permission.SYSTEM_ALERT_WINDOW" to "Can draw over other apps",
        "android.permission.BIND_ACCESSIBILITY_SERVICE" to "Can use Accessibility Service (broad screen/input access)",
        "android.permission.REQUEST_INSTALL_PACKAGES" to "Can prompt to install other apps",
        "android.permission.WRITE_SECURE_SETTINGS" to "Can modify protected system settings",
        "android.permission.BIND_DEVICE_ADMIN" to "Can request Device Administrator privileges",
        "android.permission.READ_CONTACTS" to "Can read your contacts",
        "android.permission.RECORD_AUDIO" to "Can record audio",
        "android.permission.CAMERA" to "Can access the camera",
        "android.permission.ACCESS_FINE_LOCATION" to "Can access precise location"
    )

    // Google Play requires apps to target a recent API level; an app
    // meaningfully behind that bar is a real, checkable signal that
    // it may not benefit from newer platform security defaults.
    private const val STALE_TARGET_SDK_THRESHOLD = 29 // Android 10

    private val KNOWN_APP_STORES = setOf(
        "com.android.vending",                    // Google Play
        "com.google.android.packageinstaller",    // Android Package Installer
        "com.android.packageinstaller",           // Legacy Package Installer
        "com.amazon.venezia",                     // Amazon Appstore
        "com.sec.android.app.samsungapps",        // Galaxy Store
        "com.xiaomi.mipicks",                     // Xiaomi GetApps
        "com.xiaomi.market",                      // Xiaomi Market
        "com.huawei.appmarket"                    // Huawei AppGallery
    )

    fun analyze(app: InstalledAppInfo): AppRiskReport {

        val findings = mutableListOf<RiskFinding>()

        // System apps are pre-installed by the device manufacturer
        // and are not evaluated for sideload/store-source risk.
        if (!app.isSystemApp) {

            val installer = app.installerPackageName

            if (installer == null) {
                findings.add(
                    RiskFinding(
                        id = "SIDELOADED",
                        level = RiskLevel.MEDIUM,
                        summary = "No installer recorded — likely sideloaded " +
                            "(installed outside a known app store)"
                    )
                )
            } else if (installer !in KNOWN_APP_STORES) {
                findings.add(
                    RiskFinding(
                        id = "UNKNOWN_INSTALLER",
                        level = RiskLevel.LOW,
                        summary = "Installed by an unrecognized source: $installer"
                    )
                )
            }
        }

        /*
         * IMPORTANT: System apps (Bluetooth, Phone Services, Google Play Services,
         * System UI, etc.) legitimately require many sensitive permissions to function.
         * They should NOT be flagged as HIGH risk for having permissions
         * that are expected for their system role.
         */
        if (!app.isSystemApp) {

            val sensitiveGranted =
                app.requestedPermissions.filter {
                    it in SENSITIVE_PERMISSIONS
                }

            if (sensitiveGranted.isNotEmpty()) {
                val level =
                    if (sensitiveGranted.size >= 4) {
                        RiskLevel.HIGH
                    } else if (sensitiveGranted.size >= 2) {
                        RiskLevel.MEDIUM
                    } else {
                        RiskLevel.LOW
                    }

                findings.add(
                    RiskFinding(
                        id = "SENSITIVE_PERMISSIONS",
                        level = level,
                        summary = "Requests ${sensitiveGranted.size} sensitive " +
                            "permission(s): " +
                            sensitiveGranted.mapNotNull {
                                SENSITIVE_PERMISSIONS[it]
                            }.joinToString(", ")
                    )
                )
            }
        }

        if (!app.isSystemApp && app.targetSdk in 1 until STALE_TARGET_SDK_THRESHOLD) {
            findings.add(
                RiskFinding(
                    id = "STALE_TARGET_SDK",
                    level = RiskLevel.LOW,
                    summary = "Targets an old Android API level " +
                        "(${app.targetSdk}); may not benefit from " +
                        "current platform security defaults"
                )
            )
        }

        val overallRisk =
            when {
                findings.any { it.level == RiskLevel.HIGH } -> RiskLevel.HIGH
                findings.any { it.level == RiskLevel.MEDIUM } -> RiskLevel.MEDIUM
                findings.isNotEmpty() -> RiskLevel.LOW
                else -> RiskLevel.LOW
            }

        return AppRiskReport(
            packageName = app.packageName,
            overallRisk = overallRisk,
            findings = findings
        )
    }
}
