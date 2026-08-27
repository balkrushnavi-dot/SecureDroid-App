package org.securedroid.apps

/**
 * Application-level security analyzer.
 *
 * IMPORTANT:
 * This analyzer evaluates observable package metadata only.
 * It does NOT claim malware detection or behavioral analysis.
 *
 * A normal camera/location/microphone permission is NOT automatically
 * considered a security vulnerability.
 *
 * Only higher-impact signals are treated as meaningful findings.
 */
class AppSecurityAnalyzer {

    enum class RiskLevel {
        LOW,
        MEDIUM,
        HIGH
    }

    data class Finding(
        val code: String,
        val title: String,
        val description: String,
        val severity: RiskLevel,
        val points: Int
    )

    data class Assessment(
        val packageName: String,
        val appName: String,
        val score: Int,
        val riskLevel: RiskLevel,
        val findings: List<Finding>
    )

    /*
     * These permissions represent materially broader capabilities.
     *
     * CAMERA, LOCATION, MICROPHONE, CONTACTS etc. are intentionally
     * excluded. Those permissions are common and are not vulnerabilities
     * by themselves.
     */
    private val highImpactPermissions = mapOf(
        "android.permission.READ_SMS" to
            "Can read SMS messages",

        "android.permission.RECEIVE_SMS" to
            "Can receive/intercept SMS messages",

        "android.permission.SEND_SMS" to
            "Can send SMS messages",

        "android.permission.READ_CALL_LOG" to
            "Can read call history",

        "android.permission.WRITE_CALL_LOG" to
            "Can modify call history",

        "android.permission.SYSTEM_ALERT_WINDOW" to
            "Can draw overlays above other applications",

        "android.permission.REQUEST_INSTALL_PACKAGES" to
            "Can request installation of additional applications",

        "android.permission.WRITE_SECURE_SETTINGS" to
            "Requests access to protected system settings",

        "android.permission.BIND_ACCESSIBILITY_SERVICE" to
            "Declares an Accessibility Service with broad screen/input access",

        "android.permission.BIND_DEVICE_ADMIN" to
            "Declares Device Administrator capability"
    )

    private val trustedInstallers = setOf(
        "com.android.vending",                 // Google Play
        "com.amazon.venezia",                 // Amazon Appstore
        "com.sec.android.app.samsungapps",    // Galaxy Store
        "com.xiaomi.mipicks",                 // Xiaomi GetApps
        "com.xiaomi.market",
        "com.huawei.appmarket"
    )

    /*
     * Android 12+ is API 31.
     *
     * We do NOT flag system applications for this rule because OEM
     * system components frequently have legacy target metadata.
     */
    private const val LEGACY_TARGET_SDK = 31

    fun analyze(app: InstalledAppInfo): Assessment {

        val findings = mutableListOf<Finding>()

        /*
         * ---------------------------------------------------------
         * 1. DEBUGGABLE APPLICATION
         * ---------------------------------------------------------
         */
        if (app.isDebuggable) {

            findings += Finding(
                code = "DEBUGGABLE_APPLICATION",
                title = "Debuggable application",
                description =
                    "Package ${app.packageName} is marked android:debuggable=true. " +
                    "Debuggable builds expose additional debugging capabilities " +
                    "and should not normally be used for production applications.",
                severity = RiskLevel.HIGH,
                points = 35
            )
        }

        /*
         * ---------------------------------------------------------
         * 2. INSTALL SOURCE
         * ---------------------------------------------------------
         *
         * A missing installer is UNKNOWN, not automatically malicious.
         */
        if (!app.isSystemApp) {

            val installer = app.installerPackageName

            when {

                installer == null -> {
                    findings += Finding(
                        code = "UNKNOWN_INSTALLER",
                        title = "Installation source unknown",
                        description =
                            "Android did not provide a recorded installer for this " +
                            "application. This is evidence of an unknown installation " +
                            "source, not proof of malicious software.",
                        severity = RiskLevel.LOW,
                        points = 5
                    )
                }

                installer !in trustedInstallers -> {
                    findings += Finding(
                        code = "UNTRUSTED_INSTALLER",
                        title = "Unrecognized installation source",
                        description =
                            "The package was installed by $installer, which is not " +
                            "one of SecureDroid's recognized application stores.",
                        severity = RiskLevel.MEDIUM,
                        points = 15
                    )
                }
            }
        }

        /*
         * ---------------------------------------------------------
         * 3. HIGH-IMPACT PERMISSIONS
         * ---------------------------------------------------------
         *
         * We inspect DECLARED permissions.
         *
         * This does NOT claim that the permission is currently granted.
         */
        val declaredHighImpactPermissions =
            app.requestedPermissions
                .filter { it in highImpactPermissions }
                .distinct()

        if (declaredHighImpactPermissions.isNotEmpty()) {

            val permissionDescriptions =
                declaredHighImpactPermissions
                    .mapNotNull { highImpactPermissions[it] }

            val count = declaredHighImpactPermissions.size

            val severity =
                when {
                    count >= 4 -> RiskLevel.HIGH
                    count >= 2 -> RiskLevel.MEDIUM
                    else -> RiskLevel.LOW
                }

            val points =
                when {
                    count >= 4 -> 30
                    count >= 2 -> 18
                    else -> 8
                }

            findings += Finding(
                code = "HIGH_IMPACT_PERMISSIONS",
                title = "High-impact permission footprint",
                description =
                    "The application declares $count high-impact permission(s): " +
                    permissionDescriptions.joinToString("; ") +
                    ". Declaration alone does not prove that these permissions " +
                    "are currently granted or being abused.",
                severity = severity,
                points = points
            )
        }

        /*
         * ---------------------------------------------------------
         * 4. LEGACY TARGET SDK
         * ---------------------------------------------------------
         */
        if (
            !app.isSystemApp &&
            app.targetSdk > 0 &&
            app.targetSdk < LEGACY_TARGET_SDK
        ) {

            findings += Finding(
                code = "LEGACY_TARGET_SDK",
                title = "Legacy target SDK",
                description =
                    "The application targets Android API ${app.targetSdk}. " +
                    "Older target SDK levels may miss newer Android platform " +
                    "security behavior and compatibility restrictions.",
                severity = RiskLevel.MEDIUM,
                points = 15
            )
        }

        /*
         * ---------------------------------------------------------
         * RISK CALCULATION
         * ---------------------------------------------------------
         *
         * score = RISK SCORE, not a device security score.
         */
        val riskPoints =
            findings.sumOf { it.points }.coerceIn(0, 100)

        val riskLevel =
            when {
                findings.any { it.severity == RiskLevel.HIGH } ->
                    RiskLevel.HIGH

                findings.any { it.severity == RiskLevel.MEDIUM } ->
                    RiskLevel.MEDIUM

                findings.isNotEmpty() ->
                    RiskLevel.LOW

                else ->
                    RiskLevel.LOW
            }

        return Assessment(
            packageName = app.packageName,
            appName = app.appName,
            score = riskPoints,
            riskLevel = riskLevel,
            findings = findings
        )
    }
}
