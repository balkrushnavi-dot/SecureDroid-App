package org.securedroid.security

import android.content.Context

/**

* Repository boundary for SecureDroid security assessments.

* 

* Keeps scanning, persistence, and UI/Capacitor access separated.
  */
  class SecurityMonitorRepository(
  context: Context
  ) {
  
  private val appContext = context.applicationContext
  
  private val manager =
  SecurityMonitorManager(appContext)
  
  /**
  
  * Performs a fresh security assessment.
    */
    fun scan(): SecurityReport {
    return manager.scan()
    }
  
  /**
  
  * Returns the latest stored assessment.
    */
    fun getLatestReport(): SecurityReport? {
    return manager.getLatestReport()
    }
  
  /**
  
  * Returns the latest dashboard summary.
    */
    fun getLatestSummary(): SecuritySummary? {
    return manager.getLatestSummary()
    }
  
  /**
  
  * Performs a fresh assessment and returns its summary.
    */
    fun scanSummary(): SecuritySummary {
    return manager.scanSummary()
    }
  
  /**
  
  * Removes the stored assessment.
    */
    fun clearReport(): Boolean {
    return manager.clearStoredReport()
    }
    }
