package org.securedroid.security

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**

* Periodic background security assessment.

* 

* Uses WorkManager instead of a permanently running service.
  */
  class SecurityMonitorService(
  appContext: Context,
  workerParams: WorkerParameters
  ) : CoroutineWorker(appContext, workerParams) {
  
  override suspend fun doWork(): Result {
  return try {
  withContext(Dispatchers.IO) {
  
           val monitor = SecurityMonitor(
             applicationContext
         )

         val report = monitor.analyze()

         /*
          * The current worker performs the assessment.
          *
          * Persistence/notification should be connected here
          * once the corresponding repository exists.
          */
         lastReport = report
     }

     Result.success()

 } catch (_: Exception) {
     Result.retry()
 }
  
  }
  
  companion object {
  
   @Volatile
 private var lastReport: SecurityReport? = null

 fun getLastReport(): SecurityReport? {
     return lastReport
 }
  
  }
  }
