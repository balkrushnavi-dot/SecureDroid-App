package org.securedroid.security

/**

* Result returned when SecureDroid performs a security assessment.

* 

* Separates successful assessments from failures so the UI does not

* accidentally display an old or incomplete score as a fresh result.
  */
  sealed class SecurityAssessmentResult {
  
  data class Success(
  val report: SecurityReport
  ) : SecurityAssessmentResult()
  
  data class Failure(
  val message: String,
  val cause: String? = null,
  val timestamp: Long = System.currentTimeMillis()
  ) : SecurityAssessmentResult()
  }
