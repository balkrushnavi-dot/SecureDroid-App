package org.securedroid.security

/**

* Central policy for translating measurable security conditions

* into score deductions.

* 

* Keep scoring rules here instead of scattering magic numbers

* throughout analyzers.
  */
  object SecurityScorePolicy {
  
  const val MAX_SCORE = 100
  const val MIN_SCORE = 0
  
  const val VPN_DISCONNECTED_DEDUCTION = 10
  
  const val HIGH_RISK_APP_DEDUCTION = 8
  const val MEDIUM_RISK_APP_DEDUCTION = 3
  
  const val MAX_HIGH_RISK_APP_DEDUCTION = 30
  const val MAX_MEDIUM_RISK_APP_DEDUCTION = 15
  
  fun clamp(score: Int): Int {
  return score.coerceIn(
  MIN_SCORE,
  MAX_SCORE
  )
  }
  
  fun highRiskAppDeduction(
  count: Int
  ): Int {
  return (count * HIGH_RISK_APP_DEDUCTION)
  .coerceAtMost(MAX_HIGH_RISK_APP_DEDUCTION)
  }
  
  fun mediumRiskAppDeduction(
  count: Int
  ): Int {
  return (count * MEDIUM_RISK_APP_DEDUCTION)
  .coerceAtMost(MAX_MEDIUM_RISK_APP_DEDUCTION)
  }
  
  fun gradeFor(
  score: Int
  ): String {
  
   return when (clamp(score)) {
     in 90..100 -> "EXCELLENT"
     in 80..89 -> "GOOD"
     in 70..79 -> "FAIR"
     in 50..69 -> "WEAK"
     else -> "CRITICAL"
 }
  
  }
  }
