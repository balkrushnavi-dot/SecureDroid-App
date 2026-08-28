package org.securedroid.security

/**

* Executes and aggregates security checks.

* 

* This class deliberately does not contain device-specific inspection

* logic. Individual analyzers remain responsible for collecting evidence.
  */
  class SecurityCheckEngine {
  
  fun evaluate(
  checks: List<SecurityCheck>,
  score: Int,
  grade: String
  ): SecurityReport {
  
   val normalizedChecks = checks
     .distinctBy { it.id }
     .map { check ->
         check.copy(
             scoreImpact = check.scoreImpact.coerceIn(-100, 100)
         )
     }

 return SecurityReportBuilder.build(
     checks = normalizedChecks,
     score = score,
     grade = grade
 )
  
  }
  
  fun getWarnings(
  report: SecurityReport
  ): List<SecurityCheck> {
  return report.checks.filter {
  it.status == SecurityStatus.WARNING
  }
  }
  
  fun getUnknownChecks(
  report: SecurityReport
  ): List<SecurityCheck> {
  return report.checks.filter {
  it.status == SecurityStatus.UNKNOWN
  }
  }
  
  fun getVerifiedChecks(
  report: SecurityReport
  ): List<SecurityCheck> {
  return report.checks.filter {
  it.status == SecurityStatus.VERIFIED
  }
  }
  }
