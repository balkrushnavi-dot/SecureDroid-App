package org.securedroid.audit

import android.content.Context
import org.securedroid.logging.SecurityEvent
import org.securedroid.logging.SecurityLogManager
import org.securedroid.security.SecurityCheck
import org.securedroid.security.SecurityMonitor
import org.securedroid.security.SecuritySeverity
import org.securedroid.security.SecurityStatus
import org.securedroid.security.SecurityStatusReport
import java.util.UUID

class SecurityAuditManager(
    context: Context
) {

    private val securityMonitor = SecurityMonitor(context)
    private val securityLogManager = SecurityLogManager(context)

    fun runAudit(): SecurityStatusReport {
        val report = securityMonitor.getSecurityStatus()
        
        report.checks.forEach { check ->
            if (shouldLog(check)) {
                logCheck(check)
            }
        }
        
        return report
    }

    fun getCurrentStatus(): SecurityStatusReport {
        return securityMonitor.getSecurityStatus()
    }

    fun getEvents(
        limit: Int = 100,
        category: String? = null
    ): List<SecurityEvent> {
        return securityLogManager.getEvents(
            limit = limit.coerceIn(1, 1000),
            category = category
        )
    }

    fun clearEvents(): Boolean {
        return securityLogManager.clearAll()
    }

    fun recordEvent(
        category: String,
        severity: String,
        description: String,
        source: String
    ): Boolean {
        if (category.isBlank() || description.isBlank() || source.isBlank()) {
            return false
        }

        val normalizedSeverity = normalizeSeverity(severity)

        return securityLogManager.logEvent(
            SecurityEvent(
                id = UUID.randomUUID().toString(),
                timestamp = System.currentTimeMillis(),
                category = category.trim(),
                severity = normalizedSeverity,
                description = description.trim(),
                source = source.trim()
            )
        )
    }

    fun recordCheck(check: SecurityCheck): Boolean {
        if (!shouldLog(check)) {
            return false
        }

        return logCheck(check)
    }

    private fun shouldLog(
        check: SecurityCheck
    ): Boolean {
        return when (check.status) {
            SecurityStatus.WARNING,
            SecurityStatus.ERROR -> true

            SecurityStatus.UNKNOWN,
            SecurityStatus.UNAVAILABLE ->
                check.severity >= SecuritySeverity.MEDIUM

            SecurityStatus.VERIFIED,
            SecurityStatus.SUPPORTED -> false
        }
    }

    private fun logCheck(
        check: SecurityCheck
    ): Boolean {
        val severity = when (check.severity) {
            SecuritySeverity.INFO -> "INFO"
            SecuritySeverity.LOW -> "LOW"
            SecuritySeverity.MEDIUM -> "MEDIUM"
            SecuritySeverity.HIGH -> "HIGH"
            SecuritySeverity.CRITICAL -> "CRITICAL"
            else -> "INFO"
        }

        val statusText = when (check.status) {
            SecurityStatus.VERIFIED -> "VERIFIED"
            SecurityStatus.SUPPORTED -> "SUPPORTED"
            SecurityStatus.UNKNOWN -> "UNKNOWN"
            SecurityStatus.WARNING -> "WARNING"
            SecurityStatus.UNAVAILABLE -> "UNAVAILABLE"
            SecurityStatus.ERROR -> "ERROR"
            else -> "UNKNOWN"
        }

        val description = buildString {
            append(check.summary)

            append(" [status=")
            append(statusText)
            append("]")

            check.evidence
                ?.takeIf { it.isNotBlank() }
                ?.let {
                    append(" Evidence: ")
                    append(it)
                }

            check.remediation
                ?.takeIf { it.isNotBlank() }
                ?.let {
                    append(" Remediation: ")
                    append(it)
                }
        }

        return securityLogManager.logEvent(
            SecurityEvent(
                id = UUID.randomUUID().toString(),
                timestamp = System.currentTimeMillis(),
                category = "SECURITY_AUDIT",
                severity = severity,
                description = description,
                source = "SecurityMonitor:${check.id}"
            )
        )
    }

    private fun normalizeSeverity(
        severity: String
    ): String {
        return when (severity.trim().uppercase()) {
            "INFO" -> "INFO"
            "LOW" -> "LOW"
            "MEDIUM" -> "MEDIUM"
            "HIGH" -> "HIGH"
            "CRITICAL" -> "CRITICAL"
            "WARNING" -> "MEDIUM"
            "ERROR" -> "HIGH"
            else -> "INFO"
        }
    }
}
