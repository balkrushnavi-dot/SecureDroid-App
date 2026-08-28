package org.securedroid.security

/**

* Aggregated security assessment produced by SecureDroid.

* 

* Only contains information that SecureDroid can actually observe

* or calculate from application-visible evidence.
  */
  data class SecurityReport(
  val score: Int,
  val grade: String,
  val status: SecurityStatus,
  val checks: List<SecurityCheck>,
  val generatedAt: Long
  ) {
  
  val criticalCount: Int
  get() = checks.count {
  it.status == SecurityStatus.WARNING
  }
  
  val unknownCount: Int
  get() = checks.count {
  it.status == SecurityStatus.UNKNOWN
  }
  
  val unavailableCount: Int
  get() = checks.count {
  it.status == SecurityStatus.UNAVAILABLE
  }
  
  val verifiedCount: Int
  get() = checks.count {
  it.status == SecurityStatus.VERIFIED
  }
  
  val supportedCount: Int
  get() = checks.count {
  it.status == SecurityStatus.SUPPORTED
  }
  val warningCount: Int
    get() = checks.count {
        it.status == SecurityStatus.WARNING
    }
  }
