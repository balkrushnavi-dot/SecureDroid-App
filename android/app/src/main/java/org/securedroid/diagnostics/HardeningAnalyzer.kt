package org.securedroid.diagnostics

import java.time.LocalDate
import java.time.Period
import java.time.YearMonth

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
    private val context: android.content.Context
) {

    private val diagnostics =
        DeviceDiagnostics(context)

    fun analyze(): HardeningReport {
        val findings =
            mutableListOf<HardeningFinding>()

        val status =
            diagnostics.getSecurityStatus()

        var score = 100

        // ---------------------------------------------------------
        // Screen lock
        // ---------------------------------------------------------

        if (status.hasScreenLock) {
            findings.add(
                HardeningFinding(
                    id = "SCREEN_LOCK_ENABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Screen lock is configured."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "NO_SCREEN_LOCK",
                    level = HardeningLevel.CRITICAL,
                    summary = "No secure screen lock is configured."
                )
            )

            score -= 25
        }

        // ---------------------------------------------------------
        // Encryption
        // ---------------------------------------------------------

        when (status.encryptionState) {
            DiagnosticState.YES -> {
                findings.add(
                    HardeningFinding(
                        id = "DEVICE_ENCRYPTED",
                        level = HardeningLevel.GOOD,
                        summary = "Device encryption is reported as active."
                    )
                )
            }

            DiagnosticState.NO -> {
                findings.add(
                    HardeningFinding(
                        id = "DEVICE_NOT_ENCRYPTED",
                        level = HardeningLevel.CRITICAL,
                        summary = "Device encryption is reported as inactive."
                    )
                )

                score -= 20
            }

            DiagnosticState.UNKNOWN -> {
                findings.add(
                    HardeningFinding(
                        id = "ENCRYPTION_STATUS_UNKNOWN",
                        level = HardeningLevel.WARNING,
                        summary = "Device encryption status could not be reliably verified."
                    )
                )
            }
        }

        // ---------------------------------------------------------
        // USB debugging
        // ---------------------------------------------------------

        if (status.usbDebuggingEnabled) {
            findings.add(
                HardeningFinding(
                    id = "USB_DEBUGGING_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "USB debugging is enabled."
                )
            )

            score -= 10
        } else {
            findings.add(
                HardeningFinding(
                    id = "USB_DEBUGGING_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "USB debugging is disabled."
                )
            )
        }

        // ---------------------------------------------------------
        // Developer options
        // ---------------------------------------------------------

        if (status.developerOptionsEnabled) {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "Developer Options are enabled."
                )
            )

            score -= 10
        } else {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Developer Options are disabled."
                )
            )
        }

        // ---------------------------------------------------------
        // Unknown sources
        // ---------------------------------------------------------

        when (status.unknownSourcesState) {
            DiagnosticState.YES -> {
                findings.add(
                    HardeningFinding(
                        id = "UNKNOWN_SOURCES_ENABLED",
                        level = HardeningLevel.WARNING,
                        summary = "Unknown-source installation capability is enabled."
                    )
                )

                score -= 10
            }

            DiagnosticState.NO -> {
                findings.add(
                    HardeningFinding(
                        id = "UNKNOWN_SOURCES_DISABLED",
                        level = HardeningLevel.GOOD,
                        summary = "Unknown-source installation capability is restricted."
                    )
                )
            }

            DiagnosticState.UNKNOWN -> {
                findings.add(
                    HardeningFinding(
                        id = "UNKNOWN_SOURCES_STATUS_UNKNOWN",
                        level = HardeningLevel.WARNING,
                        summary = "A device-wide unknown-sources status cannot be reliably determined by this app."
                    )
                )
            }
        }

        // ---------------------------------------------------------
        // Security patch
        // ---------------------------------------------------------

        evaluateSecurityPatch(
            status.securityPatchLevel,
            findings
        ) { deduction ->
            score -= deduction
        }

        // ---------------------------------------------------------
        // Biometrics
        // ---------------------------------------------------------

        if (status.biometricAvailable &&
            status.biometricEnrolled
        ) {
            findings.add(
                HardeningFinding(
                    id = "BIOMETRIC_AVAILABLE",
                    level = HardeningLevel.GOOD,
                    summary = "Biometric authentication is available and enrolled."
                )
            )
        } else if (status.biometricAvailable) {
            findings.add(
                HardeningFinding(
                    id = "BIOMETRIC_NOT_ENROLLED",
                    level = HardeningLevel.WARNING,
                    summary = "Biometric hardware is available but no biometric is enrolled."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "BIOMETRIC_UNAVAILABLE",
                    level = HardeningLevel.WARNING,
                    summary = "No usable biometric authentication was detected."
                )
            )
        }

        // ---------------------------------------------------------
        // Android Keystore
        // ---------------------------------------------------------

        if (status.keyStoreAvailable) {
            findings.add(
                HardeningFinding(
                    id = "ANDROID_KEYSTORE_AVAILABLE",
                    level = HardeningLevel.GOOD,
                    summary = "Android Keystore is available."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "ANDROID_KEYSTORE_UNAVAILABLE",
                    level = HardeningLevel.CRITICAL,
                    summary = "Android Keystore could not be accessed."
                )
            )

            score -= 20
        }

        // ---------------------------------------------------------
        // StrongBox
        // ---------------------------------------------------------

        if (status.strongBoxAvailable) {
            findings.add(
                HardeningFinding(
                    id = "STRONGBOX_AVAILABLE",
                    level = HardeningLevel.GOOD,
                    summary = "StrongBox-backed key generation is available."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "STRONGBOX_UNAVAILABLE",
                    level = HardeningLevel.WARNING,
                    summary = "StrongBox-backed key generation was not detected."
                )
            )
        }

        return HardeningReport(
            score = score.coerceIn(0, 100),
            findings = findings
        )
    }

    private fun evaluateSecurityPatch(
        patchLevel: String,
        findings: MutableList<HardeningFinding>,
        deduct: (Int) -> Unit
    ) {
        if (patchLevel.isBlank() ||
            patchLevel.startsWith("1970")
        ) {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Security patch level could not be determined."
                )
            )

            return
        }

        val patchDate =
            try {
                LocalDate.parse(
                    "$patchLevel-01"
                )
            } catch (_: Exception) {
                try {
                    YearMonth.parse(patchLevel)
                        .atDay(1)
                } catch (_: Exception) {
                    null
                }
            }

        if (patchDate == null) {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_INVALID",
                    level = HardeningLevel.WARNING,
                    summary = "Security patch level format is not recognized: $patchLevel"
                )
            )

            return
        }

        findings.add(
            HardeningFinding(
                id = "SECURITY_PATCH_DETECTED",
                level = HardeningLevel.GOOD,
                summary = "Security patch level: $patchLevel"
            )
        )

        val monthsOld =
            Period.between(
                patchDate,
                LocalDate.now()
            ).toTotalMonths()

        if (monthsOld >= 6) {
            deduct(15)

            findings.add(
                HardeningFinding(
                    id = "STALE_SECURITY_PATCH",
                    level = HardeningLevel.WARNING,
                    summary = "Security patch is approximately $monthsOld months old."
                )
            )
        }
    }
}
