package org.securedroid.security

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.securedroid.apps.AppRiskAnalyzer
import org.securedroid.apps.InstalledAppScanner
import org.securedroid.apps.RiskLevel
import org.securedroid.diagnostics.HardeningAnalyzer
import org.securedroid.diagnostics.HardeningLevel
import org.securedroid.diagnostics.WifiSecurityAnalyzer
import org.securedroid.logging.SecurityEvent
import org.securedroid.logging.SecurityLogManager
import org.securedroid.notification.SecurityNotificationManager

/**
 * WorkManager CoroutineWorker that performs automated background security monitoring.
 * Detects high-risk applications, device vulnerabilities, and insecure network configurations,
 * posting high-priority local notifications when security threats are identified.
 */
class SecurityMonitorService(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val alertPrefs: SharedPreferences by lazy {
        applicationContext.getSharedPreferences(PREFS_ALERT_HISTORY, Context.MODE_PRIVATE)
    }

    private val logManager by lazy {
        SecurityLogManager(applicationContext)
    }

    override suspend fun doWork(): Result {
        return try {
            withContext(Dispatchers.IO) {
                performSecurityScan()
            }
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Background security monitor worker failed", e)
            Result.retry()
        }
    }

    private fun performSecurityScan() {
        val startTime = System.currentTimeMillis()
        Log.i(TAG, "Starting WorkManager background security scan...")

        // Ensure notification channels are initialized
        SecurityNotificationManager.createNotificationChannels(applicationContext)

        var highRiskCount = 0
        var vulnerabilityCount = 0
        var totalApps = 0

        val newAlerts = mutableListOf<String>()

        // 1. Scan and analyze installed applications
        try {
            val appScanner = InstalledAppScanner(applicationContext)
            val installedApps = appScanner.scan()
            totalApps = installedApps.size

            installedApps.forEach { app ->
                // Analyze risk for user-installed applications
                if (!app.isSystemApp) {
                    val report = AppRiskAnalyzer.analyze(app)

                    if (report.overallRisk == RiskLevel.HIGH || report.findings.any { it.level == RiskLevel.HIGH }) {
                        highRiskCount++

                        val primaryFinding = report.findings.firstOrNull { it.level == RiskLevel.HIGH }
                            ?: report.findings.firstOrNull()
                        val reason = primaryFinding?.summary ?: "Declares critical dangerous permissions"

                        // Deduplicate: check if this high-risk app alert was notified recently
                        val alertKey = "app_alert_${app.packageName}"
                        val lastNotified = alertPrefs.getLong(alertKey, 0L)
                        val shouldNotify = (startTime - lastNotified) > ALERT_THROTTLE_WINDOW_MS

                        if (shouldNotify) {
                            val posted = SecurityNotificationManager.sendHighRiskAppAlert(
                                context = applicationContext,
                                appName = app.appName,
                                packageName = app.packageName,
                                riskReason = reason,
                                findingCount = report.findings.size
                            )

                            if (posted) {
                                alertPrefs.edit().putLong(alertKey, startTime).apply()
                                newAlerts.add("High-risk app: ${app.appName}")
                            }
                        }

                        // Always log threat in local security audit log
                        logManager.logEvent(
                            SecurityEvent(
                                id = "wm_app_${app.packageName}_${startTime}",
                                timestamp = startTime,
                                category = "THREAT_ALERT",
                                severity = "HIGH",
                                description = "Background scan detected high-risk app: ${app.appName} (${app.packageName}). $reason",
                                source = "WorkManager"
                            )
                        )
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "App inventory scan encountered error in background", e)
        }

        // 2. Scan and analyze device hardening posture
        try {
            val hardeningAnalyzer = HardeningAnalyzer(applicationContext)
            val hardeningReport = hardeningAnalyzer.analyze()

            val criticalFindings = hardeningReport.findings.filter {
                it.level == HardeningLevel.CRITICAL ||
                it.id == "NO_SCREEN_LOCK" ||
                it.id == "DEVICE_NOT_ENCRYPTED" ||
                it.id == "KEYSTORE_UNAVAILABLE"
            }

            criticalFindings.forEach { finding ->
                vulnerabilityCount++

                val alertKey = "vuln_alert_${finding.id}"
                val lastNotified = alertPrefs.getLong(alertKey, 0L)
                val shouldNotify = (startTime - lastNotified) > ALERT_THROTTLE_WINDOW_MS

                val title = when (finding.id) {
                    "NO_SCREEN_LOCK" -> "No Secure Screen Lock"
                    "DEVICE_NOT_ENCRYPTED" -> "Device Storage Unencrypted"
                    "KEYSTORE_UNAVAILABLE" -> "Keystore Hardware Failure"
                    else -> "System Hardening Vulnerability"
                }

                val recommendation = when (finding.id) {
                    "NO_SCREEN_LOCK" -> "Configure a PIN, password, or biometric screen lock in Settings."
                    "DEVICE_NOT_ENCRYPTED" -> "Enable device encryption to protect personal data."
                    else -> "Review security settings in SecureDroid Device Security."
                }

                if (shouldNotify) {
                    val posted = SecurityNotificationManager.sendVulnerabilityAlert(
                        context = applicationContext,
                        vulnerabilityId = finding.id,
                        title = title,
                        summary = finding.summary,
                        severity = "CRITICAL",
                        recommendation = recommendation
                    )

                    if (posted) {
                        alertPrefs.edit().putLong(alertKey, startTime).apply()
                        newAlerts.add("Vulnerability: $title")
                    }
                }

                // Log vulnerability event
                logManager.logEvent(
                    SecurityEvent(
                        id = "wm_vuln_${finding.id}_${startTime}",
                        timestamp = startTime,
                        category = "VULNERABILITY",
                        severity = "HIGH",
                        description = "Background scan detected critical vulnerability: $title. ${finding.summary}",
                        source = "WorkManager"
                    )
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Device hardening check encountered error in background", e)
        }

        // 3. Scan Wi-Fi security
        try {
            val wifiAnalyzer = WifiSecurityAnalyzer(applicationContext)
            val wifiReport = wifiAnalyzer.analyze()

            if (wifiReport.isConnected && wifiReport.isWifi && !wifiReport.isSecure) {
                vulnerabilityCount++
                val alertKey = "wifi_insecure_network"
                val lastNotified = alertPrefs.getLong(alertKey, 0L)
                val shouldNotify = (startTime - lastNotified) > ALERT_THROTTLE_WINDOW_MS

                if (shouldNotify) {
                    val posted = SecurityNotificationManager.sendVulnerabilityAlert(
                        context = applicationContext,
                        vulnerabilityId = "INSECURE_WIFI",
                        title = "Insecure Wi-Fi Network",
                        summary = "Connected to an open or unencrypted wireless network.",
                        severity = "WARNING",
                        recommendation = "Enable SecureDroid VPN protection or disconnect from untrusted Wi-Fi."
                    )

                    if (posted) {
                        alertPrefs.edit().putLong(alertKey, startTime).apply()
                    }
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Wi-Fi security check encountered error in background", e)
        }

        // Log routine background scan summary
        val scanSummary = "Background scan finished in ${System.currentTimeMillis() - startTime}ms. " +
                "Scanned $totalApps apps. Found $highRiskCount high-risk apps, $vulnerabilityCount vulnerabilities."

        logManager.logEvent(
            SecurityEvent(
                id = "wm_scan_complete_${startTime}",
                timestamp = startTime,
                category = "BACKGROUND_SCAN",
                severity = if (highRiskCount > 0) "HIGH" else if (vulnerabilityCount > 0) "WARNING" else "INFO",
                description = scanSummary,
                source = "WorkManager"
            )
        )

        // Store latest scan status
        val scanResult = BackgroundScanSummary(
            timestamp = startTime,
            durationMs = System.currentTimeMillis() - startTime,
            appsScanned = totalApps,
            highRiskAppsCount = highRiskCount,
            vulnerabilitiesCount = vulnerabilityCount,
            alertsPosted = newAlerts.size,
            status = if (highRiskCount > 0) "THREATS_DETECTED" else if (vulnerabilityCount > 0) "WARNINGS_DETECTED" else "SECURE"
        )

        lastScanSummary = scanResult

        alertPrefs.edit()
            .putLong(KEY_LAST_SCAN_TIME, startTime)
            .putInt(KEY_LAST_APPS_SCANNED, totalApps)
            .putInt(KEY_LAST_HIGH_RISK_COUNT, highRiskCount)
            .putInt(KEY_LAST_VULN_COUNT, vulnerabilityCount)
            .putString(KEY_LAST_STATUS, scanResult.status)
            .apply()

        Log.i(TAG, "WorkManager background scan completed successfully. $scanSummary")
    }

    data class BackgroundScanSummary(
        val timestamp: Long,
        val durationMs: Long,
        val appsScanned: Int,
        val highRiskAppsCount: Int,
        val vulnerabilitiesCount: Int,
        val alertsPosted: Int,
        val status: String
    )

    companion object {
        private const val TAG = "SecurityMonitorWorker"
        private const val PREFS_ALERT_HISTORY = "securedroid_alert_history"
        private const val ALERT_THROTTLE_WINDOW_MS = 12 * 60 * 60 * 1000L // 12 hours between duplicate alerts

        const val KEY_LAST_SCAN_TIME = "last_scan_timestamp"
        const val KEY_LAST_APPS_SCANNED = "last_apps_scanned"
        const val KEY_LAST_HIGH_RISK_COUNT = "last_high_risk_count"
        const val KEY_LAST_VULN_COUNT = "last_vuln_count"
        const val KEY_LAST_STATUS = "last_status"

        @Volatile
        private var lastScanSummary: BackgroundScanSummary? = null

        fun getLastScanSummary(): BackgroundScanSummary? = lastScanSummary

        fun getStoredScanSummary(context: Context): BackgroundScanSummary? {
            val prefs = context.getSharedPreferences(PREFS_ALERT_HISTORY, Context.MODE_PRIVATE)
            val time = prefs.getLong(KEY_LAST_SCAN_TIME, 0L)
            if (time == 0L) return null

            return BackgroundScanSummary(
                timestamp = time,
                durationMs = 0L,
                appsScanned = prefs.getInt(KEY_LAST_APPS_SCANNED, 0),
                highRiskAppsCount = prefs.getInt(KEY_LAST_HIGH_RISK_COUNT, 0),
                vulnerabilitiesCount = prefs.getInt(KEY_LAST_VULN_COUNT, 0),
                alertsPosted = 0,
                status = prefs.getString(KEY_LAST_STATUS, "SECURE") ?: "SECURE"
            )
        }
    }
}
