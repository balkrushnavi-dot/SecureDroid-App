package org.securedroid.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import org.securedroid.MainActivity

object SecurityNotificationManager {

    const val CHANNEL_THREAT_ALERTS = "securedroid_threat_alerts"
    const val CHANNEL_VULNERABILITY_ALERTS = "securedroid_vulnerability_alerts"
    const val CHANNEL_BACKGROUND_MONITOR = "securedroid_background_monitor"

    private const val NOTIFICATION_ID_BASE_APP = 10000
    private const val NOTIFICATION_ID_BASE_VULN = 20000
    private const val NOTIFICATION_ID_TEST = 99999

    /**
     * Creates notification channels for high-priority background security alerts.
     * Safe to call repeatedly (idempotent).
     */
    fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager =
                context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                    ?: return

            // Channel 1: High-risk application threat alerts
            val threatChannel = NotificationChannel(
                CHANNEL_THREAT_ALERTS,
                "SecureDroid Threat Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Immediate alerts when high-risk or malicious applications are detected"
                enableLights(true)
                lightColor = Color.RED
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 150, 300)
                setShowBadge(true)
            }

            // Channel 2: System and device security vulnerability alerts
            val vulnChannel = NotificationChannel(
                CHANNEL_VULNERABILITY_ALERTS,
                "SecureDroid Security Vulnerabilities",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alerts for critical device hardening issues, missing encryption, or unpatched vulnerabilities"
                enableLights(true)
                lightColor = Color.parseColor("#F59E0B") // Amber
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 200, 100, 200)
                setShowBadge(true)
            }

            // Channel 3: Periodic WorkManager background scan summaries
            val monitorChannel = NotificationChannel(
                CHANNEL_BACKGROUND_MONITOR,
                "SecureDroid Background Monitor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Background scan status and routine defense updates"
                setShowBadge(false)
            }

            notificationManager.createNotificationChannels(
                listOf(threatChannel, vulnChannel, monitorChannel)
            )
        }
    }

    /**
     * Checks if notification permission is granted.
     */
    fun hasNotificationPermission(context: Context): Boolean {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) return false
        }
        return NotificationManagerCompat.from(context).areNotificationsEnabled()
    }

    /**
     * Sends a high-priority local notification when a high-risk application is detected.
     */
    fun sendHighRiskAppAlert(
        context: Context,
        appName: String,
        packageName: String,
        riskReason: String,
        findingCount: Int
    ): Boolean {
        createNotificationChannels(context)

        if (!hasNotificationPermission(context)) {
            return false
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("action", "OPEN_APP_AUDIT")
            putExtra("packageName", packageName)
            putExtra("source", "WorkManager_SecurityAlert")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            packageName.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationId = NOTIFICATION_ID_BASE_APP + (packageName.hashCode() and 0x7FFF)

        val bigText = buildString {
            append("SecureDroid background WorkManager scan detected a high-risk application on your device:\n\n")
            append("• Application: $appName\n")
            append("• Package: $packageName\n")
            append("• Critical Risk: $riskReason\n")
            if (findingCount > 1) {
                append("• Total Risk Findings: $findingCount\n")
            }
            append("\nTap to inspect permissions, install origin, and apply recommended defenses.")
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_THREAT_ALERTS)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle("⚠️ High-Risk App Alert: $appName")
            .setContentText("Risk detected: $riskReason")
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setColor(Color.parseColor("#E11D48")) // Rose-600
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .build()

        return try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
            true
        } catch (_: SecurityException) {
            false
        }
    }

    /**
     * Sends a local notification when a critical system or device vulnerability is detected.
     */
    fun sendVulnerabilityAlert(
        context: Context,
        vulnerabilityId: String,
        title: String,
        summary: String,
        severity: String,
        recommendation: String? = null
    ): Boolean {
        createNotificationChannels(context)

        if (!hasNotificationPermission(context)) {
            return false
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("action", "OPEN_DEVICE_SECURITY")
            putExtra("vulnerabilityId", vulnerabilityId)
            putExtra("source", "WorkManager_VulnerabilityAlert")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            vulnerabilityId.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationId = NOTIFICATION_ID_BASE_VULN + (vulnerabilityId.hashCode() and 0x7FFF)

        val bigText = buildString {
            append("SecureDroid background WorkManager scan identified a $severity vulnerability:\n\n")
            append("• Issue: $title\n")
            append("• Finding: $summary\n")
            if (!recommendation.isNullOrBlank()) {
                append("• Action Required: $recommendation\n")
            }
            append("\nTap to view device security posture and resolve this vulnerability.")
        }

        val color = if (severity.equals("CRITICAL", ignoreCase = true)) {
            Color.parseColor("#DC2626") // Red
        } else {
            Color.parseColor("#D97706") // Amber
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_VULNERABILITY_ALERTS)
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setContentTitle("🛡️ Security Vulnerability: $title")
            .setContentText(summary)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setColor(color)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .build()

        return try {
            NotificationManagerCompat.from(context).notify(notificationId, notification)
            true
        } catch (_: SecurityException) {
            false
        }
    }

    /**
     * Sends a test security alert notification for user verification.
     */
    fun sendTestAlert(
        context: Context,
        title: String = "SecureDroid Background Monitor Active",
        message: String = "WorkManager security scanner is active and protecting this device.",
        severity: String = "INFO"
    ): Boolean {
        createNotificationChannels(context)

        if (!hasNotificationPermission(context)) {
            return false
        }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("action", "OPEN_SECURITY_DASHBOARD")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            NOTIFICATION_ID_TEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = if (severity.equals("HIGH", ignoreCase = true) || severity.equals("CRITICAL", ignoreCase = true)) {
            CHANNEL_THREAT_ALERTS
        } else {
            CHANNEL_BACKGROUND_MONITOR
        }

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(
                "$message\n\nWorkManager periodic background tasks will alert you immediately if any high-risk application or security vulnerability is detected."
            ))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setColor(Color.parseColor("#0284C7")) // Sky-600
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        return try {
            NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_TEST, notification)
            true
        } catch (_: SecurityException) {
            false
        }
    }
}
