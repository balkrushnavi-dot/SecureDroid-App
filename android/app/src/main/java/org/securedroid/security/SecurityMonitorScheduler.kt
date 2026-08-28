package org.securedroid.security

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object SecurityMonitorScheduler {

    const val WORK_NAME = "securedroid_security_monitor"
    private const val PREFS_SCHEDULER = "securedroid_scheduler_prefs"
    private const val KEY_SCHEDULE_ENABLED = "schedule_enabled"
    private const val KEY_INTERVAL_MINUTES = "interval_minutes"

    fun schedule(context: Context, intervalMinutes: Long = 15L) {
        val safeInterval = intervalMinutes.coerceAtLeast(15L) // WorkManager minimum periodic interval is 15 minutes

        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()

        val request = PeriodicWorkRequestBuilder<SecurityMonitorService>(
            safeInterval,
            TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .addTag("security_monitor")
            .build()

        WorkManager.getInstance(context.applicationContext)
            .enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.UPDATE,
                request
            )

        context.applicationContext.getSharedPreferences(PREFS_SCHEDULER, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_SCHEDULE_ENABLED, true)
            .putLong(KEY_INTERVAL_MINUTES, safeInterval)
            .apply()
    }

    fun cancel(context: Context) {
        WorkManager.getInstance(context.applicationContext)
            .cancelUniqueWork(WORK_NAME)

        context.applicationContext.getSharedPreferences(PREFS_SCHEDULER, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_SCHEDULE_ENABLED, false)
            .apply()
    }

    fun runNow(context: Context) {
        val request = OneTimeWorkRequestBuilder<SecurityMonitorService>()
            .addTag("security_monitor_manual")
            .build()

        WorkManager.getInstance(context.applicationContext)
            .enqueue(request)
    }

    fun isScheduled(context: Context): Boolean {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_SCHEDULER, Context.MODE_PRIVATE)
        return prefs.getBoolean(KEY_SCHEDULE_ENABLED, true)
    }

    fun getIntervalMinutes(context: Context): Long {
        val prefs = context.applicationContext.getSharedPreferences(PREFS_SCHEDULER, Context.MODE_PRIVATE)
        return prefs.getLong(KEY_INTERVAL_MINUTES, 15L)
    }
}
