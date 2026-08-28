package org.securedroid.security

import android.content.Context

/**

* Initializes SecureDroid's periodic security assessment scheduling.

* 

* Call initialize() once from Application.onCreate().
  */
  object SecurityMonitorSchedulerInitializer {
  
  private const val PREFS_NAME = "securedroid_scheduler"
  private const val KEY_INITIALIZED = "security_monitor_initialized"
  
  fun initialize(context: Context) {
  
   val appContext = context.applicationContext

 val prefs = appContext.getSharedPreferences(
     PREFS_NAME,
     Context.MODE_PRIVATE
 )

 /*
  * Scheduling is idempotent because
  * SecurityMonitorScheduler uses unique work.
  */
 SecurityMonitorScheduler.schedule(appContext)

 prefs.edit()
     .putBoolean(KEY_INITIALIZED, true)
     .apply()
  
  }
  
  fun isInitialized(context: Context): Boolean {
  
   return context.applicationContext
     .getSharedPreferences(
         PREFS_NAME,
         Context.MODE_PRIVATE
     )
     .getBoolean(
         KEY_INITIALIZED,
         false
     )
  
  }
  }
