package org.securedroid.security

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object SecurityMonitorScheduler {

    private const val WORK_NAME = "securedroid_security_monitor"

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

    fun cancel(context: Context) {

        WorkManager
            .getInstance(context.applicationContext)
            .cancelUniqueWork(WORK_NAME)
    }

    fun runNow(context: Context) {

        val request =
            androidx.work.OneTimeWorkRequestBuilder<SecurityMonitorService>()
                .build()

        WorkManager
            .getInstance(context.applicationContext)
            .enqueue(request)
    }
}
