package org.securedroid.security

/**

* Represents one measurable security check performed by SecureDroid.
* 
* A check must describe what the application can actually observe.
* It must never imply system/kernel/firmware privileges that the
* application does not possess.
  */
  data class SecurityCheck(
  val id: String,
  val name: String,
  val status: SecurityStatus,
  val scoreImpact: Int = 0,
  val summary: String,
  val evidence: String? = null,
  val limitation: String? = null,
  val remediation: String? = null
  )
