package org.securedroid.security

/**

* Represents the security state of an individual security check.
* 
* IMPORTANT:
* UNKNOWN means SecureDroid cannot reliably verify the condition.
* It must never be converted into GOOD/SECURE merely because
* the required Android API is unavailable.
  */
  enum class SecurityStatus {
  VERIFIED,
  SUPPORTED,
  UNKNOWN,
  WARNING,
  UNAVAILABLE,
  ERROR
  }

/**

* Severity used when calculating the overall security score.
  */
  enum class SecuritySeverity {
  INFO,
  LOW,
package org.securedroid.security

/**
 * Represents the security state of an individual security check.
 *
 * UNKNOWN means SecureDroid cannot reliably verify the condition.
 * It must never be converted into VERIFIED merely because
 * the required Android API is unavailable.
 */
enum class SecurityStatus {
    VERIFIED,
    SUPPORTED,
    UNKNOWN,
    WARNING,
    UNAVAILABLE,
    ERROR
}

/**
 * Severity used when calculating the overall security score.
 */
enum class SecuritySeverity {
    INFO,
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL
}

/**
 * A single measurable security observation.
 */
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

/**
 * Complete security-monitor snapshot.
 */
data class SecurityStatusReport(
    val timestamp: Long,
    val overallStatus: SecurityStatus,
    val score: Int,
    val checks: List<SecurityCheck>
) {

    /**
     * Returns the number of checks that produced actionable warnings.
     */
    val warningCount: Int
        get() = checks.count {
            it.status == SecurityStatus.WARNING ||
                it.status == SecurityStatus.ERROR
        }

    /**
     * Returns the number of checks that could not be verified.
     */
    val unknownCount: Int
        get() = checks.count {
            it.status == SecurityStatus.UNKNOWN ||
                it.status == SecurityStatus.UNAVAILABLE
        }

    /**
     * Returns true only when every check is real
     * and verified/supported.
     */
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
