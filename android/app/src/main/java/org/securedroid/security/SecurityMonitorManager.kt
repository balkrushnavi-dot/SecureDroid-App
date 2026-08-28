package org.securedroid.security

import android.content.Context

/**

* Application-facing manager for SecureDroid security assessments.

* 

* Provides a single entry point for:

* - running an assessment

* - retrieving the latest assessment

* - retrieving the dashboard summary

* - clearing stored assessment data
    */
    class SecurityMonitorManager(
    context: Context
    ) {
  
  private val appContext = context.applicationContext
  
  private val monitor = SecurityMonitor(appContext)
  
  private val reportStore = SecurityReportStore(
  appContext
  )
  
  /**
  
  * Runs a complete security assessment and stores
  
  * the resulting report.
    */
    fun scan(): SecurityReport {
    
    val report = monitor.analyze()
    
    reportStore.save(report)
    
    return report
    }
  
  /**
  
  * Returns the most recently stored security report.
  * 
  * Does not perform a new scan.
    */
    fun getLatestReport(): SecurityReport? {
    return reportStore.getLatest()
    }
  
  /**
  
  * Returns a lightweight dashboard representation.
    */
    fun getLatestSummary(): SecuritySummary? {
    
    val report = reportStore.getLatest()
    ?: return null
    
    return SecuritySummary.fromReport(report)
    }
  
  /**
  
  * Runs a fresh scan and returns the dashboard summary.
    */
    fun scanSummary(): SecuritySummary {
    
    val report = scan()
    
    return SecuritySummary.fromReport(report)
    }
  
  /**
  
  * Deletes the locally stored security assessment.
    */
    fun clearStoredReport(): Boolean {
    return reportStore.clear()
    }
    }
