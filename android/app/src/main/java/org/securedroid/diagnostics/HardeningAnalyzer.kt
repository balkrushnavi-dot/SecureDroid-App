package org.securedroid.diagnostics

import android.content.Context
import android.os.Build

data class HardeningFinding(
    val id: String,
    val level: HardeningLevel,
    val summary: String
)

enum class HardeningLevel {
    GOOD,
    WARNING,
    CRITICAL
}

data class HardeningReport(
    val score: Int,
    val findings: List<HardeningFinding>
)

class HardeningAnalyzer(
    private val context: Context
) {

    private val diagnostics = DeviceDiagnostics(context)

    fun analyze(): HardeningReport {
        val findings = mutableListOf<HardeningFinding>()
        val status = diagnostics.getSecurityStatus()

        // Screen lock check
        if (!status.hasScreenLock) {
            findings.add(
                HardeningFinding(
                    id = "NO_SCREEN_LOCK",
                    level = HardeningLevel.CRITICAL,
                    summary = "Screen lock is not configured. Your device is vulnerable to physical access attacks."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "SCREEN_LOCK_ENABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Screen lock is configured."
                )
            )
        }

        // USB debugging check
        if (status.usbDebuggingEnabled) {
            findings.add(
                HardeningFinding(
                    id = "USB_DEBUGGING_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "USB debugging is enabled. Disable it in Developer Options when not in use."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "USB_DEBUGGING_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "USB debugging is disabled."
                )
            )
        }

        // Developer options check
        if (status.developerOptionsEnabled) {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "Developer Options are enabled. Disable them when not in use to reduce attack surface."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Developer Options are disabled."
                )
            )
        }

        // Unknown sources check
        if (status.unknownSourcesEnabled) {
            findings.add(
                HardeningFinding(
                    id = "UNKNOWN_SOURCES_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "Installation from unknown sources is enabled. Only enable when necessary for legitimate apps."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "UNKNOWN_SOURCES_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Installation from unknown sources is restricted."
                )
            )
        }

        // Security patch check
        val patchLevel = status.securityPatchLevel
        if (patchLevel.isNotEmpty() && !patchLevel.startsWith("1970")) {
            findings.add(
                HardeningFinding(
                    id = "SECURITY_PATCH_GOOD",
                    level = HardeningLevel.GOOD,
                    summary = "Security patch level: $patchLevel"
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Security patch level is unknown. Your device may be outdated."
                )
            )
        }

        // Device encryption check
        if (status.isDeviceEncrypted) {
            findings.add(
                HardeningFinding(
                    id = "DEVICE_ENCRYPTED",
                    level = HardeningLevel.GOOD,
                    summary = "Device storage is encrypted."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "DEVICE_NOT_ENCRYPTED",
                    level = HardeningLevel.CRITICAL,
                    summary = "Device storage is not encrypted. Enable encryption in Security Settings."
                )
            )
        }

        // Biometric check
        if (status.biometricAvailable && status.biometricEnrolled) {
            findings.add(
                HardeningFinding(
                    id = "BIOMETRIC_AVAILABLE",
                    level = HardeningLevel.GOOD,
                    summary = "Biometric authentication is available and enrolled."
                )
            )
        }

        // Calculate score (100 - deductions)
        var score = 100

        if (!status.hasScreenLock) score -= 25
        if (!status.isDeviceEncrypted) score -= 20
        if (status.usbDebuggingEnabled) score -= 10
        if (status.developerOptionsEnabled) score -= 10
        if (status.unknownSourcesEnabled) score -= 10

        val stalePatchCheck = status.securityPatchLevel
        if (stalePatchCheck.isNotEmpty() && !stalePatchCheck.startsWith("1970")) {
            // Check if patch is older than 6 months
            try {
                val parts = stalePatchCheck.split("-")
                if (parts.size == 2) {
                    val year = parts[0].toIntOrNull() ?: 0
                    val month = parts[1].toIntOrNull() ?: 0
                    // If patch is from 2025 or earlier, it's stale
                    if (year < 2026) {
                        score -= 15
                        findings.add(
                            HardeningFinding(
                                id = "STALE_SECURITY_PATCH",
                                level = HardeningLevel.WARNING,
                                summary = "Security patch is outdated ($stalePatchCheck). Update your device."
                            )
                        )
                    }
                }
            } catch (_: Exception) {
                // Ignore parsing errors
            }
        }

        score = score.coerceIn(0, 100)

        return HardeningReport(
            score = score,
            findings = findings
        )
    }
}
