package org.securedroid.security

enum class SecurityStatus {
    VERIFIED,
    SUPPORTED,
    UNKNOWN,
    WARNING,
    UNAVAILABLE,
    ERROR
}

enum class SecuritySeverity {
    INFO,
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;
}

data class SecurityCheck(
    val id: String,
    val name: String,
    val status: SecurityStatus,
    val severity: SecuritySeverity,
    val summary: String,
    val evidence: String? = null,
    val remediation: String? = null,
    val isReal: Boolean = true
)

data class SecurityStatusReport(
    val timestamp: Long,
    val overallStatus: SecurityStatus,
    val score: Int,
    val checks: List<SecurityCheck>,
    val isReal: Boolean = true
) {

    val warningCount: Int
        get() = checks.count {
            it.status == SecurityStatus.WARNING ||
                it.status == SecurityStatus.ERROR
        }

    val unknownCount: Int
        get() = checks.count {
            it.status == SecurityStatus.UNKNOWN ||
                it.status == SecurityStatus.UNAVAILABLE
        }

    val isFullyVerified: Boolean
        get() = checks.isNotEmpty() &&
            checks.all {
                it.isReal &&
                    (
                        it.status == SecurityStatus.VERIFIED ||
                            it.status == SecurityStatus.SUPPORTED
                        )
            }
}
