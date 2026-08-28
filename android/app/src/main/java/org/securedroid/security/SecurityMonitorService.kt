package org.securedroid.security

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SecurityMonitorService(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            withContext(Dispatchers.IO) {

                val monitor = SecurityMonitor(
                    applicationContext
                )

                val report = monitor.getSecurityStatus()

                lastReport = report
            }

            Result.success()

        } catch (_: Exception) {
            Result.retry()
        }
    }

    companion object {

        @Volatile
        private var lastReport: SecurityStatusReport? = null

        fun getLastReport(): SecurityStatusReport? {
            return lastReport
        }
    }
}
