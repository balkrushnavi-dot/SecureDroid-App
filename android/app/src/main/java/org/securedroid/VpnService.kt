package org.securedroid

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.VpnService
import android.os.Build
import androidx.core.app.NotificationCompat
import java.io.FileDescriptor

class SecurityVpnService : VpnService() {
    
    companion object {
        private const val CHANNEL_ID = "vpn_channel"
        private const val NOTIFICATION_ID = 1001
    }
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "START" -> startVpn()
            "STOP" -> stopVpn()
        }
        return START_STICKY
    }
    
    private fun startVpn() {
        startForeground(NOTIFICATION_ID, createNotification())
        
        val builder = Builder()
            .setAddresses("10.0.0.1", 32)
            .setRoutes("0.0.0.0", 0)
            .addDnsServer("1.1.1.1")
            .addDnsServer("8.8.8.8")
            .setBlocking(true)
            .setSession("SecureDroid VPN")
            .setMtu(1500)
        
        try {
            val fd = builder.establish()
            // Start packet processing
            startPacketProcessing(fd)
        } catch (e: Exception) {
            Log.e("VpnService", "Failed to start VPN", e)
        }
    }
    
    private fun startPacketProcessing(fd: FileDescriptor) {
        // Simple packet processing
        // For now, just keep the connection alive
        Thread {
            while (true) {
                Thread.sleep(1000)
            }
        }.start()
    }
    
    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SecureDroid Active")
            .setContentText("Your device is protected")
            .setSmallIcon(R.drawable.ic_security)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "VPN Service",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java)
                .createNotificationChannel(channel)
        }
    }
}
