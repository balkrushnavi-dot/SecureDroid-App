package org.securedroid.security

import android.content.Context

/**

* High-level coordinator for SecureDroid security assessments.

* 

* This is the preferred native entry point for the Capacitor plugin.
  */
  class SecurityAssessmentManager(
  context: Context
  ) {
  
  private val appContext = context.applicationContext
  
  private val monitor =
  SecurityMonitor(appContext)
  
  private val reportStore =
  SecurityReportStore(appContext)
  
  /**
  
  * Runs a fresh assessment.
  
  * 
  
  * A failed assessment never produces a fabricated security score.
    */
    fun assess(): SecurityAssessmentResult {
    
    return try {
    
     val report = monitor.analyze()

 if (report.checks.isEmpty()) {
     SecurityAssessmentResult.Failure(
         message = "Security assessment produced no checks."
     )
 } else {

     reportStore.save(report)

     SecurityAssessmentResult.Success(
         report = report
     )
 }
    
    } catch (e: Exception) {
    
     SecurityAssessmentResult.Failure(
     message = "Security assessment failed.",
     cause = e.javaClass.simpleName
 )
    
    }
    }
  
  /**
  
  * Returns the latest successfully stored assessment.
    */
    fun getLatest(): SecurityAssessmentResult {
    
    val report = reportStore.getLatest()
    
    return if (report != null) {
    SecurityAssessmentResult.Success(report)
    } else {
    SecurityAssessmentResult.Failure(
    message = "No security assessment is available."
    )
    }
    }
  
  /**
  
  * Returns the latest report without performing a scan.
    */
    fun getLatestReport(): SecurityReport? {
    return reportStore.getLatest()
    }
  
  /**
  
  * Deletes the stored assessment.
    */
    fun clear(): Boolean {
    return reportStore.clear()
    }
    }
