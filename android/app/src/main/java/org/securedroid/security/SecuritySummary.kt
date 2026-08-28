package org.securedroid.security

/**

* Lightweight representation of the security assessment intended

* for dashboards and Capacitor/JS responses.

* 

* It deliberately exposes only measurable results.
  */
  data class SecuritySummary(
  val score: Int,
  val grade: String,
  val status: SecurityStatus,
  val totalChecks: Int,
  val verifiedChecks: Int,
  val supportedChecks: Int,
  val warningChecks: Int,
  val unknownChecks: Int,
  val unavailableChecks: Int,
  val generatedAt: Long
  ) {
  
  companion object {
  
   fun fromReport(
     report: SecurityReport
 ): SecuritySummary {

     return SecuritySummary(
         score = report.score.coerceIn(0, 100),
         grade = report.grade,
         status = report.status,
         totalChecks = report.checks.size,
         verifiedChecks = report.verifiedCount,
         supportedChecks = report.supportedCount,
         warningChecks = report.warningCount,
         unknownChecks = report.unknownCount,
         unavailableChecks = report.unavailableCount,
         generatedAt = report.generatedAt
     )
 }
  
  }
  }
