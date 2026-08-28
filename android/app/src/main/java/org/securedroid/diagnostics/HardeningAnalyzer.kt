package org.securedroid.diagnostics

import android.content.Context
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.time.temporal.ChronoUnit

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
    context: Context
) {

    private val diagnostics =
        DeviceDiagnostics(context)

    fun analyze(): HardeningReport {
        val findings =
            mutableListOf<HardeningFinding>()

        val status =
            diagnostics.getSecurityStatus()

        var score = 100

        /*
         * Screen lock
         */
        if (status.hasScreenLock) {
            findings.add(
                HardeningFinding(
                    id = "SCREEN_LOCK_ENABLED",
                    level = HardeningLevel.GOOD,
                    summary = "A secure screen lock is configured."
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

        /*
         * USB debugging
         */
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

        /*
         * Developer options
         */
        if (status.developerOptionsEnabled) {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "Developer Options are enabled."
                )
            )

            score -= 5
        } else {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_DISABLED",
                    level = HardeningLevel.GOOD,
                    summary = "Developer Options are disabled."
                )
            )
        }

        /*
         * Unknown sources
         *
         * DeviceDiagnostics deliberately does not claim a
         * global state on modern Android.
         */
        findings.add(
            HardeningFinding(
                id = "UNKNOWN_SOURCES_STATUS_UNAVAILABLE",
                level = HardeningLevel.WARNING,
                summary = "Global unknown-source installation status cannot be reliably determined by this app on modern Android."
            )
        )

        /*
         * Security patch
         */
        evaluateSecurityPatch(
            status.securityPatchLevel,
            findings
        )

        /*
         * Encryption
         *
         * Unknown != unencrypted.
         */
        if (!status.encryptionStatusKnown) {
            findings.add(
                HardeningFinding(
                    id = "ENCRYPTION_STATUS_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Device encryption status could not be verified."
                )
            )
        } else if (status.isDeviceEncrypted) {
            findings.add(
                HardeningFinding(
                    id = "DEVICE_ENCRYPTED",
                    level = HardeningLevel.GOOD,
                    summary = "Android reports device storage as encrypted."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "DEVICE_NOT_ENCRYPTED",
                    level = HardeningLevel.CRITICAL,
                    summary = "Android reports that device storage is not encrypted."
                )
            )

            score -= 20
        }

        /*
         * Biometric authentication
         */
        when {
            status.biometricEnrolled -> {
                findings.add(
                    HardeningFinding(
                        id = "BIOMETRIC_ENROLLED",
                        level = HardeningLevel.GOOD,
                        summary = "Biometric authentication is available and enrolled."
                    )
                )
            }

            status.biometricAvailable -> {
                findings.add(
                    HardeningFinding(
                        id = "BIOMETRIC_NOT_ENROLLED",
                        level = HardeningLevel.WARNING,
                        summary = "Biometric hardware is available but no supported biometric is enrolled."
                    )
                )
            }

            else -> {
                findings.add(
                    HardeningFinding(
                        id = "BIOMETRIC_UNAVAILABLE",
                        level = HardeningLevel.WARNING,
                        summary = "Supported biometric authentication is unavailable."
                    )
                )
            }
        }

        /*
         * Android Keystore
         */
        if (status.keyStoreAvailable) {
            findings.add(
                HardeningFinding(
                    id = "KEYSTORE_AVAILABLE",
                    level = HardeningLevel.GOOD,
                    summary = "Android Keystore is available."
                )
            )
        } else {
            findings.add(
                HardeningFinding(
                    id = "KEYSTORE_UNAVAILABLE",
                    level = HardeningLevel.CRITICAL,
                    summary = "Android Keystore could not be accessed."
                )
            )

            score -= 20
        }

        /*
         * StrongBox
         */
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
                    summary = "StrongBox-backed key generation could not be verified."
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
        findings: MutableList<HardeningFinding>
    ) {
        if (patchLevel.isBlank()) {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Android security patch level is unavailable."
                )
            )
            return
        }

        val patch =
            try {
                YearMonth.parse(
                    patchLevel,
                    DateTimeFormatter.ofPattern("yyyy-MM")
                )
            } catch (_: DateTimeParseException) {
                null
            }

        if (patch == null) {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_INVALID",
                    level = HardeningLevel.WARNING,
                    summary = "Android reported an unrecognized security patch level: $patchLevel"
                )
            )
            return
        }

        val current =
            YearMonth.now()

        val age =
            ChronoUnit.MONTHS.between(
                patch,
                current
            )

        when {
            age <= 6 -> {
                findings.add(
                    HardeningFinding(
                        id = "SECURITY_PATCH_CURRENT",
                        level = HardeningLevel.GOOD,
                        summary = "Security patch level: $patchLevel"
                    )
                )
            }

            age <= 12 -> {
                findings.add(
                    HardeningFinding(
                        id = "SECURITY_PATCH_AGING",
                        level = HardeningLevel.WARNING,
                        summary = "Security patch is approximately $age months old ($patchLevel)."
                    )
                )
            }

            else -> {
                findings.add(
                    HardeningFinding(
                        id = "STALE_SECURITY_PATCH",
                        level = HardeningLevel.WARNING,
                        summary = "Security patch is approximately $age months old ($patchLevel). Update Android if an update is available."
                    )
                )
            }
        }
    }
}
