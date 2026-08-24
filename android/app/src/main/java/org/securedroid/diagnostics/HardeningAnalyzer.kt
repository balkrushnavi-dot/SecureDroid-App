package org.securedroid.diagnostics

import android.app.KeyguardManager
import android.content.Context
import android.os.Build
import android.provider.Settings
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.TimeUnit

/**
 * Produces a factual device-hardening assessment based on real,
 * queryable Android settings and platform state. Every finding here
 * corresponds to an actual API value on the device — no network
 * calls, no fabricated "threat intelligence", nothing claimed that
 * cannot be independently verified by the user in their own device
 * Settings app.
 */

enum class HardeningLevel {
    GOOD,
    WARNING,
    CRITICAL
}

data class HardeningFinding(
    val id: String,
    val level: HardeningLevel,
    val summary: String
)

data class HardeningReport(
    val score: Int, // 0-100
    val findings: List<HardeningFinding>
)

class HardeningAnalyzer(
    private val context: Context
) {

    // Google requires devices to receive security patches at least
    // roughly monthly/quarterly under Android compatibility programs.
    // A patch level meaningfully older than this is a real, checkable
    // staleness signal.
    private val STALE_PATCH_MONTHS = 6

    fun analyze(): HardeningReport {

        val findings = mutableListOf<HardeningFinding>()

        // 1. Screen lock strength
        val keyguardManager =
            context.getSystemService(
                Context.KEYGUARD_SERVICE
            ) as KeyguardManager

        val hasSecureLock =
            try {
                keyguardManager.isDeviceSecure
            } catch (_: Exception) {
                null
            }

        when (hasSecureLock) {
            false -> findings.add(
                HardeningFinding(
                    id = "NO_SCREEN_LOCK",
                    level = HardeningLevel.CRITICAL,
                    summary = "No PIN, pattern, password, or biometric " +
                        "screen lock is set"
                )
            )
            null -> findings.add(
                HardeningFinding(
                    id = "SCREEN_LOCK_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Screen lock status could not be determined"
                )
            )
            true -> {} // secure, no finding needed
        }

        // 2. USB debugging (ADB)
        val adbEnabled =
            try {
                Settings.Global.getInt(
                    context.contentResolver,
                    Settings.Global.ADB_ENABLED,
                    0
                ) == 1
            } catch (_: Exception) {
                false
            }

        if (adbEnabled) {
            findings.add(
                HardeningFinding(
                    id = "USB_DEBUGGING_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "USB debugging (ADB) is enabled"
                )
            )
        }

        // 3. Developer options
        val devOptionsEnabled =
            try {
                Settings.Global.getInt(
                    context.contentResolver,
                    Settings.Global.DEVELOPMENT_SETTINGS_ENABLED,
                    0
                ) == 1
            } catch (_: Exception) {
                false
            }

        if (devOptionsEnabled) {
            findings.add(
                HardeningFinding(
                    id = "DEVELOPER_OPTIONS_ENABLED",
                    level = HardeningLevel.WARNING,
                    summary = "Developer options are enabled"
                )
            )
        }

        // 4. Security patch staleness
        val patchAgeMonths = securityPatchAgeMonths()

        if (patchAgeMonths == null) {
            findings.add(
                HardeningFinding(
                    id = "PATCH_DATE_UNKNOWN",
                    level = HardeningLevel.WARNING,
                    summary = "Could not determine security patch date"
                )
            )
        } else if (patchAgeMonths >= STALE_PATCH_MONTHS) {
            findings.add(
                HardeningFinding(
                    id = "STALE_SECURITY_PATCH",
                    level = HardeningLevel.CRITICAL,
                    summary = "Security patch is approximately " +
                        "$patchAgeMonths months old " +
                        "(${Build.VERSION.SECURITY_PATCH})"
                )
            )
        }

        // 5. Unknown sources (only meaningfully checkable as a
        // single global setting on Android 7 and below; from Android
        // 8+ this is granted per-app, so a single global answer would
        // misrepresent the real, per-app state. We do not fabricate
        // a global answer for 8+.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            val unknownSourcesEnabled =
                try {
                    @Suppress("DEPRECATION")
                    Settings.Secure.getInt(
                        context.contentResolver,
                        Settings.Secure.INSTALL_NON_MARKET_APPS,
                        0
                    ) == 1
                } catch (_: Exception) {
                    false
                }

            if (unknownSourcesEnabled) {
                findings.add(
                    HardeningFinding(
                        id = "UNKNOWN_SOURCES_ENABLED",
                        level = HardeningLevel.WARNING,
                        summary = "Installing apps from unknown sources " +
                            "is allowed"
                    )
                )
            }
        }

        val score = computeScore(findings)

        return HardeningReport(
            score = score,
            findings = findings
        )
    }

    private fun securityPatchAgeMonths(): Int? {

        val patchDateString = Build.VERSION.SECURITY_PATCH

        if (patchDateString.isNullOrBlank()) {
            return null
        }

        return try {

            val format = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            val patchDate = format.parse(patchDateString) ?: return null

            val diffMillis = Date().time - patchDate.time

            TimeUnit.MILLISECONDS.toDays(diffMillis).toInt() / 30

        } catch (_: Exception) {
            null
        }
    }

    private fun computeScore(findings: List<HardeningFinding>): Int {

        var score = 100

        findings.forEach { finding ->
            score -= when (finding.level) {
                HardeningLevel.CRITICAL -> 30
                HardeningLevel.WARNING -> 10
                HardeningLevel.GOOD -> 0
            }
        }

        return score.coerceIn(0, 100)
    }
}
