package org.securedroid.security

import android.content.Context
import android.os.Build
import org.securedroid.diagnostics.DeviceDiagnostics
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.diagnostics.HardeningLevel
import org.securedroid.diagnostics.WifiSecurityAnalyzer
import java.util.Calendar

/**
 * Central security observation layer for SecureDroid.
 *
 * SecurityMonitor reports only security conditions that SecureDroid
 * can actually observe through application-accessible Android APIs.
 *
 * It must never claim to verify:
 * - kernel integrity
 * - firmware integrity
 * - Verified Boot / AVB
 * - SELinux enforcement
 * - bootloader state
 * - carrier security
 * - Wi-Fi encryption type unless directly verified
 */
class SecurityMonitor(
    private val context: Context
) {

    private val deviceDiagnostics = DeviceDiagnostics(context)
    private val hardeningAnalyzer = HardeningAnalyzer(context)
    private val wifiSecurityAnalyzer = WifiSecurityAnalyzer(context)

    /**
     * Performs a fresh security assessment.
     */
    fun collectStatus(): SecurityStatusReport {
        val timestamp = System.currentTimeMillis()
        val checks = mutableListOf<SecurityCheck>()

        collectDeviceChecks(checks)
        collectHardeningChecks(checks)
        collectNetworkChecks(checks)
        collectPlatformChecks(checks)

        val score = calculateScore(checks)
        val overallStatus = calculateOverallStatus(checks)

        return SecurityStatusReport(
            timestamp = timestamp,
            overallStatus = overallStatus,
            score = score,
            checks = checks
        )
    }

    /**
     * Returns the current security status.
     */
    fun getStatus(): SecurityStatusReport {
        return collectStatus()
    }

    /**
     * Performs a fresh security analysis.
     *
     * Used by SecurityMonitorManager and background workers.
     */
    fun analyze(): SecurityStatusReport {
        return collectStatus()
    }

    /**
     * Collects device-level security observations.
     */
    private fun collectDeviceChecks(
        checks: MutableList<SecurityCheck>
    ) {
        val status = try {
            deviceDiagnostics.getSecurityStatus()
        } catch (e: Exception) {
            checks.add(
                SecurityCheck(
                    id = "DEVICE_DIAGNOSTICS_ERROR",
                    name = "Device diagnostics",
                    status = SecurityStatus.ERROR,
                    severity = SecuritySeverity.HIGH,
                    summary = "SecureDroid could not collect device security information.",
                    evidence = e.javaClass.simpleName,
                    remediation = "Retry the security scan.",
                    isReal = true
                )
            )
            return
        }

        /*
         * Screen lock
         */
        checks.add(
            SecurityCheck(
                id = "SCREEN_LOCK",
                name = "Screen lock",
                status = if (status.hasScreenLock) {
                    SecurityStatus.VERIFIED
                } else {
                    SecurityStatus.WARNING
                },
                severity = if (status.hasScreenLock) {
                    SecuritySeverity.INFO
                } else {
                    SecuritySeverity.CRITICAL
                },
                summary = if (status.hasScreenLock) {
                    "A secure screen lock is configured."
                } else {
                    "No secure screen lock is configured."
                },
                remediation = if (status.hasScreenLock) {
                    null
                } else {
                    "Configure a PIN, password, or supported secure screen lock."
                },
                isReal = true
            )
        )

        /*
         * Device encryption.
         *
         * The existing DeviceDiagnostics implementation does not
         * directly prove encryption, therefore this remains UNKNOWN.
         */
        checks.add(
            SecurityCheck(
                id = "DEVICE_ENCRYPTION",
                name = "Device encryption",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.MEDIUM,
                summary = "Device encryption status cannot currently be verified reliably by SecureDroid.",
                evidence = "Current DeviceDiagnostics encryption check does not directly verify encryption.",
                remediation = "Use a platform-supported encryption-state check before reporting encryption as verified.",
                isReal = true
            )
        )

        /*
         * Android security patch.
         */
        checks.add(
            SecurityCheck(
                id = "SECURITY_PATCH",
                name = "Android security patch",
                status = getPatchStatus(status.securityPatchLevel),
                severity = SecuritySeverity.MEDIUM,
                summary = if (status.securityPatchLevel.isBlank()) {
                    "Android security patch level is unavailable."
                } else {
                    "Android security patch level: ${status.securityPatchLevel}"
                },
                evidence = status.securityPatchLevel.ifBlank { null },
                remediation = "Install the latest available Android security update.",
                isReal = true
            )
        )

        /*
         * USB debugging.
         */
        checks.add(
            SecurityCheck(
                id = "ADB_DEBUGGING",
                name = "USB debugging",
                status = if (status.usbDebuggingEnabled) {
                    SecurityStatus.WARNING
                } else {
                    SecurityStatus.VERIFIED
                },
                severity = if (status.usbDebuggingEnabled) {
                    SecuritySeverity.MEDIUM
                } else {
                    SecuritySeverity.INFO
                },
                summary = if (status.usbDebuggingEnabled) {
                    "USB debugging is enabled."
                } else {
                    "USB debugging is disabled."
                },
                remediation = if (status.usbDebuggingEnabled) {
                    "Disable USB debugging when it is not required."
                } else {
                    null
                },
                isReal = true
            )
        )

        /*
         * Developer options.
         */
        checks.add(
            SecurityCheck(
                id = "DEVELOPER_OPTIONS",
                name = "Developer Options",
                status = if (status.developerOptionsEnabled) {
                    SecurityStatus.WARNING
                } else {
                    SecurityStatus.VERIFIED
                },
                severity = if (status.developerOptionsEnabled) {
                    SecuritySeverity.LOW
                } else {
                    SecuritySeverity.INFO
                },
                summary = if (status.developerOptionsEnabled) {
                    "Developer Options are enabled."
                } else {
                    "Developer Options are disabled."
                },
                remediation = if (status.developerOptionsEnabled) {
                    "Disable Developer Options when they are not needed."
                } else {
                    null
                },
                isReal = true
            )
        )

        /*
         * Unknown-source installation.
         */
        checks.add(
            SecurityCheck(
                id = "UNKNOWN_SOURCES",
                name = "Unknown-source installation",
                status = if (status.unknownSourcesEnabled) {
                    SecurityStatus.WARNING
                } else {
                    SecurityStatus.VERIFIED
                },
                severity = if (status.unknownSourcesEnabled) {
                    SecuritySeverity.MEDIUM
                } else {
                    SecuritySeverity.INFO
                },
                summary = if (status.unknownSourcesEnabled) {
                    "Installation from unknown sources is enabled or reported as enabled."
                } else {
                    "Unknown-source installation is restricted."
                },
                remediation = if (status.unknownSourcesEnabled) {
                    "Disable installation from unknown sources when it is not required."
                } else {
                    null
                },
                isReal = true
            )
        )

        /*
         * Biometric authentication.
         */
        val biometricStatus = when {
            status.biometricAvailable && status.biometricEnrolled ->
                SecurityStatus.SUPPORTED

            !status.biometricAvailable ->
                SecurityStatus.UNAVAILABLE

            else ->
                SecurityStatus.WARNING
        }

        val biometricSeverity = when {
            status.biometricAvailable && status.biometricEnrolled ->
                SecuritySeverity.INFO

            !status.biometricAvailable ->
                SecuritySeverity.INFO

            else ->
                SecuritySeverity.LOW
        }

        val biometricSummary = when {
            status.biometricAvailable && status.biometricEnrolled ->
                "Biometric hardware is available and a biometric is enrolled."

            !status.biometricAvailable ->
                "No supported biometric hardware was detected."

            else ->
                "Biometric hardware is available but no biometric is enrolled."
        }

        checks.add(
            SecurityCheck(
                id = "BIOMETRIC",
                name = "Biometric authentication",
                status = biometricStatus,
                severity = biometricSeverity,
                summary = biometricSummary,
                remediation = if (
                    status.biometricAvailable &&
                    !status.biometricEnrolled
                ) {
                    "Enroll a biometric if appropriate for your security configuration."
                } else {
                    null
                },
                isReal = true
            )
        )

        /*
         * Android Keystore.
         */
        val keyStoreAvailable = try {
            deviceDiagnostics.getKeyStoreStatus()
        } catch (_: Exception) {
            false
        }

        checks.add(
            SecurityCheck(
                id = "ANDROID_KEYSTORE",
                name = "Android Keystore",
                status = if (keyStoreAvailable) {
                    SecurityStatus.SUPPORTED
                } else {
                    SecurityStatus.UNAVAILABLE
                },
                severity = if (keyStoreAvailable) {
                    SecuritySeverity.INFO
                } else {
                    SecuritySeverity.HIGH
                },
                summary = if (keyStoreAvailable) {
                    "Android Keystore is available to SecureDroid."
                } else {
                    "Android Keystore could not be accessed."
                },
                evidence = if (keyStoreAvailable) {
                    "SecureDroid successfully accessed the Android Keystore."
                } else {
                    null
                },
                remediation = if (keyStoreAvailable) {
                    null
                } else {
                    "Retry the check or investigate the device's Keystore implementation."
                },
                isReal = true
            )
        )

        /*
         * StrongBox.
         */
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            val strongBoxAvailable = try {
                deviceDiagnostics.hasStrongBox()
            } catch (_: Exception) {
                false
            }

            checks.add(
                SecurityCheck(
                    id = "STRONGBOX",
                    name = "StrongBox",
                    status = if (strongBoxAvailable) {
                        SecurityStatus.SUPPORTED
                    } else {
                        SecurityStatus.UNKNOWN
                    },
                    severity = SecuritySeverity.INFO,
                    summary = if (strongBoxAvailable) {
                        "StrongBox-backed key generation appears to be available."
                    } else {
                        "StrongBox availability could not be confirmed."
                    },
                    evidence = if (strongBoxAvailable) {
                        "A StrongBox-backed test key was generated successfully."
                    } else {
                        "The current test did not confirm StrongBox availability."
                    },
                    remediation = if (strongBoxAvailable) {
                        null
                    } else {
                        "Use a device with StrongBox support if hardware-backed StrongBox storage is required."
                    },
                    isReal = true
                )
            )
        } else {
            checks.add(
                SecurityCheck(
                    id = "STRONGBOX",
                    name = "StrongBox",
                    status = SecurityStatus.UNAVAILABLE,
                    severity = SecuritySeverity.INFO,
                    summary = "StrongBox APIs are unavailable on this Android version.",
                    evidence = "Android API level ${Build.VERSION.SDK_INT} is below API 28.",
                    remediation = null,
                    isReal = true
                )
            )
        }
    }

    /**
     * Collects device-hardening observations.
     */
    private fun collectHardeningChecks(
        checks: MutableList<SecurityCheck>
    ) {
        val report = try {
            hardeningAnalyzer.analyze()
        } catch (e: Exception) {
            checks.add(
                SecurityCheck(
                    id = "HARDENING_ANALYZER_ERROR",
                    name = "Device hardening analysis",
                    status = SecurityStatus.ERROR,
                    severity = SecuritySeverity.HIGH,
                    summary = "Hardening analysis failed.",
                    evidence = e.javaClass.simpleName,
                    remediation = "Retry the security scan.",
                    isReal = true
                )
            )
            return
        }

        report.findings.forEach { finding ->

            val securityStatus = when (finding.level) {
                HardeningLevel.GOOD ->
                    SecurityStatus.VERIFIED

                HardeningLevel.WARNING ->
                    SecurityStatus.WARNING

                HardeningLevel.CRITICAL ->
                    SecurityStatus.WARNING

                else ->
                    SecurityStatus.UNKNOWN
            }

            val securitySeverity = when (finding.level) {
                HardeningLevel.GOOD ->
                    SecuritySeverity.INFO

                HardeningLevel.WARNING ->
                    SecuritySeverity.MEDIUM

                HardeningLevel.CRITICAL ->
                    SecuritySeverity.CRITICAL

                else ->
                    SecuritySeverity.MEDIUM
            }

            checks.add(
                SecurityCheck(
                    id = "HARDENING_${finding.id}",
                    name = "Hardening: ${finding.id}",
                    status = securityStatus,
                    severity = securitySeverity,
                    summary = finding.summary,
                    evidence = null,
                    remediation = null,
                    isReal = true
                )
            )
        }
    }

    /**
     * Collects network observations.
     *
     * This deliberately does not claim to identify WPA2/WPA3
     * or inspect encrypted application traffic.
     */
    private fun collectNetworkChecks(
        checks: MutableList<SecurityCheck>
    ) {
        val report = try {
            wifiSecurityAnalyzer.analyze()
        } catch (e: Exception) {
            checks.add(
                SecurityCheck(
                    id = "NETWORK_ANALYZER_ERROR",
                    name = "Network security analysis",
                    status = SecurityStatus.ERROR,
                    severity = SecuritySeverity.MEDIUM,
                    summary = "Network security analysis failed.",
                    evidence = e.javaClass.simpleName,
                    remediation = "Retry the network security check.",
                    isReal = true
                )
            )
            return
        }

        if (!report.isConnected) {
            checks.add(
                SecurityCheck(
                    id = "NETWORK_CONNECTION",
                    name = "Network connection",
                    status = SecurityStatus.SUPPORTED,
                    severity = SecuritySeverity.INFO,
                    summary = "No active network connection was detected.",
                    evidence = null,
                    remediation = null,
                    isReal = true
                )
            )
            return
        }

        checks.add(
            SecurityCheck(
                id = "NETWORK_CONNECTION",
                name = "Network connection",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = if (report.isWifi) {
                    "An active Wi-Fi connection was detected."
                } else {
                    "An active non-Wi-Fi network connection was detected."
                },
                evidence = null,
                remediation = null,
                isReal = true
            )
        )

        /*
         * report.isSecure is treated only as Android's available
         * connectivity validation. It is NOT treated as proof of
         * WPA2/WPA3 or Wi-Fi encryption.
         */
        checks.add(
            SecurityCheck(
                id = "NETWORK_VALIDATION",
                name = "Network validation",
                status = if (report.isSecure) {
                    SecurityStatus.SUPPORTED
                } else {
                    SecurityStatus.WARNING
                },
                severity = if (report.isSecure) {
                    SecuritySeverity.INFO
                } else {
                    SecuritySeverity.MEDIUM
                },
                summary = if (report.isSecure) {
                    "The active network passed the available connectivity validation."
                } else {
                    "The active network is not validated by Android."
                },
                evidence = null,
                remediation = if (report.isSecure) {
                    null
                } else {
                    "Check the network, captive portal, or connectivity restrictions."
                },
                isReal = true
            )
        )
    }

    /**
     * Collects platform-level observations.
     */
    private fun collectPlatformChecks(
        checks: MutableList<SecurityCheck>
    ) {
        checks.add(
            SecurityCheck(
                id = "ANDROID_VERSION",
                name = "Android version",
                status = SecurityStatus.VERIFIED,
                severity = SecuritySeverity.INFO,
                summary = "Running Android API level ${Build.VERSION.SDK_INT}.",
                evidence = "SDK_INT=${Build.VERSION.SDK_INT}",
                remediation = null,
                isReal = true
            )
        )

        /*
         * SecureDroid deliberately does not claim to verify:
         *
         * - Verified Boot / AVB
         * - SELinux enforcement
         * - kernel integrity
         * - bootloader lock state
         * - firmware integrity
         */
        checks.add(
            SecurityCheck(
                id = "PLATFORM_INTEGRITY",
                name = "Platform integrity",
                status = SecurityStatus.UNKNOWN,
                severity = SecuritySeverity.INFO,
                summary = "SecureDroid cannot independently verify firmware, kernel, Verified Boot, or SELinux state from its current application-level APIs.",
                evidence = null,
                remediation = "Use supported Android attestation or platform-provided evidence when available.",
                isReal = true
            )
        )
    }

    /**
     * Converts Android's YYYY-MM patch format into a security status.
     *
     * This is a freshness heuristic, not proof that a patch is
     * the newest patch available for the specific device.
     */
    private fun getPatchStatus(
        patchLevel: String
    ): SecurityStatus {

        if (patchLevel.isBlank()) {
            return SecurityStatus.UNKNOWN
        }

        return try {
            val parts = patchLevel.split("-")

            if (parts.size != 2) {
                return SecurityStatus.UNKNOWN
            }

            val year = parts[0].toIntOrNull()
            val month = parts[1].toIntOrNull()

            if (
                year == null ||
                month == null ||
                month !in 1..12
            ) {
                return SecurityStatus.UNKNOWN
            }

            val calendar = Calendar.getInstance()

            val currentYear = calendar.get(Calendar.YEAR)
            val currentMonth = calendar.get(Calendar.MONTH) + 1

            val monthsBehind =
                (currentYear - year) * 12 +
                    (currentMonth - month)

            when {
                monthsBehind < 0 ->
                    SecurityStatus.UNKNOWN

                monthsBehind <= 3 ->
                    SecurityStatus.VERIFIED

                else ->
                    SecurityStatus.WARNING
            }
        } catch (_: Exception) {
            SecurityStatus.UNKNOWN
        }
    }

    /**
     * Calculates the overall security state.
     *
     * Unknown/unavailable does not automatically mean insecure.
     */
    private fun calculateOverallStatus(
        checks: List<SecurityCheck>
    ): SecurityStatus {

        if (checks.isEmpty()) {
            return SecurityStatus.UNKNOWN
        }

        if (checks.any {
                it.status == SecurityStatus.ERROR
            }
        ) {
            return SecurityStatus.ERROR
        }

        if (checks.any {
                it.status == SecurityStatus.WARNING &&
                    it.severity == SecuritySeverity.CRITICAL
            }
        ) {
            return SecurityStatus.WARNING
        }

        if (checks.any {
                it.status == SecurityStatus.WARNING
            }
        ) {
            return SecurityStatus.WARNING
        }

        if (checks.any {
                it.status == SecurityStatus.UNKNOWN ||
                    it.status == SecurityStatus.UNAVAILABLE
            }
        ) {
            return SecurityStatus.UNKNOWN
        }

        return SecurityStatus.VERIFIED
    }

    /**
     * Calculates a bounded 0-100 security score.
     *
     * UNKNOWN and UNAVAILABLE receive a small confidence penalty,
     * rather than being treated as confirmed vulnerabilities.
     */
    private fun calculateScore(
        checks: List<SecurityCheck>
    ): Int {

        if (checks.isEmpty()) {
            return 0
        }

        var score = 100

        checks.forEach { check ->

            when (check.status) {

                SecurityStatus.VERIFIED,
                SecurityStatus.SUPPORTED -> {
                    // No deduction.
                }

                SecurityStatus.WARNING -> {
                    score -= when (check.severity) {
                        SecuritySeverity.INFO -> 2
                        SecuritySeverity.LOW -> 5
                        SecuritySeverity.MEDIUM -> 10
                        SecuritySeverity.HIGH -> 15
                        SecuritySeverity.CRITICAL -> 25
                    }
                }

                SecurityStatus.UNKNOWN,
                SecurityStatus.UNAVAILABLE -> {
                    /*
                     * Unknown is not equivalent to insecure.
                     */
                    score -= 2
                }

                SecurityStatus.ERROR -> {
                    score -= 15
                }
            }
        }

        return score.coerceIn(0, 100)
    }
}
