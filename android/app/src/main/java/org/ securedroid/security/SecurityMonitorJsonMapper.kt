package org.securedroid.security

import org.json.JSONArray
import org.json.JSONObject

/**

* Converts SecureDroid security models into JSON objects suitable

* for the Capacitor bridge.

* 

* No security claim is added during serialization.
  */
  object SecurityMonitorJsonMapper {
  
  fun reportToJson(
  report: SecurityReport
  ): JSONObject {
  
   return JSONObject().apply {
     put("score", report.score)
     put("grade", report.grade)
     put("status", report.status.name)
     put("generatedAt", report.generatedAt)

     put(
         "counts",
         JSONObject().apply {
             put("total", report.checks.size)
             put("verified", report.verifiedCount)
             put("supported", report.supportedCount)
             put("warning", report.warningCount)
             put("unknown", report.unknownCount)
             put("unavailable", report.unavailableCount)
         }
     )

     put(
         "checks",
         JSONArray().apply {
             report.checks.forEach { check ->
                 put(checkToJson(check))
             }
         }
     )
 }
  
  }
  
  fun summaryToJson(
  summary: SecuritySummary
  ): JSONObject {
  
   return JSONObject().apply {
     put("score", summary.score)
     put("grade", summary.grade)
     put("status", summary.status.name)
     put("totalChecks", summary.totalChecks)
     put("verifiedChecks", summary.verifiedChecks)
     put("supportedChecks", summary.supportedChecks)
     put("warningChecks", summary.warningChecks)
     put("unknownChecks", summary.unknownChecks)
     put("unavailableChecks", summary.unavailableChecks)
     put("generatedAt", summary.generatedAt)
 }
  
  }
  
  private fun checkToJson(
  check: SecurityCheck
  ): JSONObject {
  
   return JSONObject().apply {
     put("id", check.id)
     put("name", check.name)
     put("status", check.status.name)
     put("scoreImpact", check.scoreImpact)
     put("summary", check.summary)

     check.evidence?.let {
         put("evidence", it)
     }

     check.limitation?.let {
         put("limitation", it)
     }

     check.remediation?.let {
         put("remediation", it)
     }
 }
  
  }
  }
