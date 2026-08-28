package org.securedroid

import android.app.Application
import org.securedroid.notification.SecurityNotificationManager
import org.securedroid.security.SecurityMonitorSchedulerInitializer

class SecureDroidApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Create high-importance notification channels for security alerts
        SecurityNotificationManager.createNotificationChannels(this)

        // Initialize WorkManager periodic security monitor
        SecurityMonitorSchedulerInitializer.initialize(this)
    }
}
