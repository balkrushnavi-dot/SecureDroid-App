package org.securedroid.security

/**

* Builds the final SecurityReport from individual measurable checks.

* 

* This class contains aggregation logic only.

* It does not perform device inspection itself.
  */
  object SecurityReportBuilder {
  
  fun build(
  checks: List<SecurityCheck>,
  score: Int,
  grade: String,
  generatedAt: Long = System.currentTimeMillis()
  ): SecurityReport {
  
   val normalizedScore = score.coerceIn(0, 100)

 val overallStatus = determineOverallStatus(checks)

 return SecurityReport(
     score = normalizedScore,
     grade = grade,
     status = overallStatus,
     checks = checks,
     generatedAt = generatedAt
 )
  
  }
  
  private fun determineOverallStatus(
  checks: List<SecurityCheck>
  ): SecurityStatus {
  
   if (checks.isEmpty()) {
     return SecurityStatus.UNKNOWN
 }

 return when {
     checks.any {
         it.status == SecurityStatus.WARNING
     } -> SecurityStatus.WARNING

     checks.any {
         it.status == SecurityStatus.UNKNOWN
     } -> SecurityStatus.UNKNOWN

     checks.any {
         it.status == SecurityStatus.UNAVAILABLE
     } -> SecurityStatus.UNAVAILABLE

     checks.all {
         it.status == SecurityStatus.VERIFIED
     } -> SecurityStatus.VERIFIED

     checks.any {
         it.status == SecurityStatus.SUPPORTED
     } -> SecurityStatus.SUPPORTED

     else -> SecurityStatus.UNKNOWN
 }
  
  }
  }
