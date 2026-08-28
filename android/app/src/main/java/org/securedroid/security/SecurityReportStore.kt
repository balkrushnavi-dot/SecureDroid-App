package org.securedroid.security

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**

* Stores the latest security report locally.

* 

* This is a temporary lightweight persistence layer.

* Sensitive security data should eventually move to the

* application's encrypted database/storage layer.
  */
  class SecurityReportStore(
  context: Context
  ) {
  
  companion object {
  private const val PREFS_NAME = "securedroid_security_report"
  private const val KEY_REPORT = "latest_report"
  }
  
  private val prefs = context.applicationContext.getSharedPreferences(
  PREFS_NAME,
  Context.MODE_PRIVATE
  )
  
  fun save(report: SecurityReport): Boolean {
  return try {
  val json = JSONObject().apply {
  put("score", report.score)
  put("grade", report.grade)
  put("status", report.status.name)
  put("generatedAt", report.generatedAt)
  
           val checksJson = JSONArray()

         report.checks.forEach { check ->
             checksJson.put(
                 JSONObject().apply {
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
             )
         }

         put("checks", checksJson)
     }

     prefs.edit()
         .putString(KEY_REPORT, json.toString())
         .apply()

     true

 } catch (_: Exception) {
     false
 }
  
  }
  
  fun getLatest(): SecurityReport? {
  return try {
  val raw = prefs.getString(KEY_REPORT, null)
  ?: return null
  
       jsonToReport(JSONObject(raw))

 } catch (_: Exception) {
     null
 }
  
  }
  
  fun clear(): Boolean {
  return try {
  prefs.edit()
  .remove(KEY_REPORT)
  .apply()
  
       true

 } catch (_: Exception) {
     false
 }
  
  }
  
  private fun jsonToReport(
  json: JSONObject
  ): SecurityReport {
  
   val checksJson =
     json.optJSONArray("checks") ?: JSONArray()

 val checks = mutableListOf<SecurityCheck>()

 for (index in 0 until checksJson.length()) {

     val item =
         checksJson.optJSONObject(index)
             ?: continue

     checks.add(
         SecurityCheck(
             id = item.optString("id"),
             name = item.optString("name"),
             status = parseStatus(
                 item.optString("status")
             ),
             scoreImpact = item.optInt(
                 "scoreImpact",
                 0
             ),
             summary = item.optString("summary"),
             evidence = item.optNullableString("evidence"),
             limitation = item.optNullableString("limitation"),
             remediation = item.optNullableString("remediation")
         )
     )
 }

 return SecurityReport(
     score = json.optInt("score", 0)
         .coerceIn(0, 100),

     grade = json.optString(
         "grade",
         "UNKNOWN"
     ),

     status = parseStatus(
         json.optString("status")
     ),

     checks = checks,

     generatedAt = json.optLong(
         "generatedAt",
         0L
     )
 )
  
  }
  
  private fun parseStatus(
  value: String
  ): SecurityStatus {
  return try {
  SecurityStatus.valueOf(value)
  } catch (_: IllegalArgumentException) {
  SecurityStatus.UNKNOWN
  }
  }
  
  private fun JSONObject.optNullableString(
  key: String
  ): String? {
  if (!has(key) || isNull(key)) {
  return null
  }
  
   return optString(key).takeIf {
     it.isNotBlank()
 }
  
  }
  }
