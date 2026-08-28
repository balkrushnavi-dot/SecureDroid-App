package org.securedroid.security

import org.securedroid.diagnostics.HardeningReport
import org.securedroid.apps.AppRiskReport
import org.securedroid.apps.RiskLevel

/**
 * Calculates SecureDroid's measurable security score.
 * 
 * Important:
 * - This score only uses evidence available to the application.
 * - It does not claim kernel, firmware, Verified Boot, SELinux,
 *   or other system-level security that the app cannot verify.
 * - Score is normalized to 0..100.
 */
object SecurityScoreCalculator {

    data class ScoreResult(
        val score: Int,
        val grade: String,
        val reasons: List<String>
    )

    fun calculate(
        hardeningReport: HardeningReport? = null,
        appRiskReports: List<AppRiskReport> = emptyList(),
        vpnConnected: Boolean = false
    ): ScoreResult {

        var score = 100
        val reasons = mutableListOf<String>()

        /*
         * Device hardening
         */
        hardeningReport?.let { report ->

            /*
             * Use the hardening analyzer's measurable score,
             * but do not subtract the same findings again.
             */
            score = report.score.coerceIn(0, 100)

            report.findings
                .filter { it.level.name == "CRITICAL" }
                .forEach {
                    reasons.add(it.summary)
                }

            report.findings
                .filter { it.level.name == "WARNING" }
                .forEach {
                    reasons.add(it.summary)
                }
        }

        /*
         * Application risk.
         *
         * Do not count every risky app equally.
         * Multiple low-risk apps should not destroy the score.
         */
        val highRiskApps =
            appRiskReports.count {
                it.overallRisk == RiskLevel.HIGH
            }

        val mediumRiskApps =
            appRiskReports.count {
                it.overallRisk == RiskLevel.MEDIUM
            }

        when {
            highRiskApps > 0 -> {
                val deduction = (highRiskApps * 8).coerceAtMost(30)
                score -= deduction

                reasons.add(
                    "$highRiskApps installed app(s) have high assessed risk."
                )
            }

            mediumRiskApps > 0 -> {
                val deduction = (mediumRiskApps * 3).coerceAtMost(15)
                score -= deduction

                reasons.add(
                    "$mediumRiskApps installed app(s) have medium assessed risk."
                )
            }
        }

        /*
         * Application-level VPN protection.
         *
         * VPN status is treated as an additional protection signal,
         * not proof that all traffic is secure.
         */
        if (vpnConnected) {
            reasons.add(
                "SecureDroid application-level VPN protection is connected."
            )
        } else {
            score -= 10

            reasons.add(
                "SecureDroid application-level VPN protection is not connected."
            )
        }

        score = score.coerceIn(0, 100)

        return ScoreResult(
            score = score,
            grade = gradeFor(score),
            reasons = reasons.distinct()
        )
    }

    fun calculate(checks: List<SecurityCheck>): ScoreResult {
        var score = 100
        val reasons = mutableListOf<String>()
        checks.forEach { check ->
            score += check.scoreImpact
            if (check.scoreImpact < 0) {
                reasons.add(check.summary)
            }
        }
        val finalScore = score.coerceIn(0, 100)
        return ScoreResult(
            score = finalScore,
            grade = gradeFor(finalScore),
            reasons = reasons
        )
    }

    fun calculate(status: SecurityStatusReport): Int {
        return status.score
    }

    fun calculate(report: SecurityReport): Int {
        return report.score
    }

    fun calculate(status: SecurityStatus): Int {
        return when (status) {
            SecurityStatus.VERIFIED -> 100
            SecurityStatus.SUPPORTED -> 85
            SecurityStatus.UNKNOWN -> 65
            SecurityStatus.WARNING -> 50
            SecurityStatus.UNAVAILABLE -> 40
            SecurityStatus.ERROR -> 20
        }
    }

    fun gradeFor(score: Int): String {
        return SecurityScorePolicy.gradeFor(score)
    }
}

