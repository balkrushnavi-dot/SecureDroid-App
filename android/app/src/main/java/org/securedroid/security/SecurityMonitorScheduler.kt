package org.securedroid.security

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**

* Schedules periodic SecureDroid security assessments.

* 

* WorkManager controls execution according to Android's background

* execution rules. SecureDroid does not maintain a permanent

* background service for security scanning.
  */
  object SecurityMonitorScheduler {
  
  private const val WORK_NAME = "securedroid_security_monitor"
  
  /**
  
  * Starts or replaces the periodic security assessment.
  
  * 
  
  * Android WorkManager enforces its minimum periodic interval.
    */
    fun schedule(context: Context) {
    
    val constraints = Constraints.Builder()
    .setRequiresBatteryNotLow(true)
    .build()
    
    val request =
    PeriodicWorkRequestBuilder<SecurityMonitorService>(
    15,
    TimeUnit.MINUTES
    )
    .setConstraints(constraints)
    .build()
    
    WorkManager
    .getInstance(context.applicationContext)
    .enqueueUniquePeriodicWork(
    WORK_NAME,
    ExistingPeriodicWorkPolicy.UPDATE,
    request
    )
    }
  
  /**
  
  * Stops periodic security assessments.
    */
    fun cancel(context: Context) {
    
    WorkManager
    .getInstance(context.applicationContext)
    .cancelUniqueWork(WORK_NAME)
    }
  
  /**
  
  * Requests a one-time assessment immediately.
  
  * 
  
  * Useful when the user manually presses "Scan Now".
    */
    fun runNow(context: Context) {
    
    val request =
    androidx.work.OneTimeWorkRequestBuilder<SecurityMonitorService>()
    .build()
    
    WorkManager
    .getInstance(context.applicationContext)
    .enqueue(request)
    }
    }
