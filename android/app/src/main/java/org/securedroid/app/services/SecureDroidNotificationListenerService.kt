package com.securedroid.app.services

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class SecureDroidNotificationListenerService : NotificationListenerService() {

    companion object {
        val capturedNotifications = mutableListOf<Map<String, Any>>()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        super.onNotificationPosted(sbn)
        if (sbn == null) return

        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        val item = mapOf(
            "id" to sbn.key,
            "packageName" to sbn.packageName,
            "title" to title,
            "text" to text,
            "timestamp" to sbn.postTime,
            "isClearable" to sbn.isClearable
        )

        synchronized(capturedNotifications) {
            capturedNotifications.add(0, item)
            if (capturedNotifications.size > 100) {
                capturedNotifications.removeAt(capturedNotifications.size - 1)
            }
        }
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification?) {
        super.onNotificationRemoved(sbn)
    }
}
