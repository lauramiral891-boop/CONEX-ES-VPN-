package com.conexoesvpn.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build

/**
 * Foreground Service Notification Manager for Conexões VPN
 *
 * Provides real-time bandwidth meters, connection duration,
 * and quick actions: Desconectar, Reconectar, Abrir Aplicação.
 */
class VpnNotificationManager(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "conexoes_vpn_channel"
        const val NOTIFICATION_ID = 1001
    }

    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Conexões VPN - Túnel Ativo",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notificação persistente com estatísticas do túnel VPN"
                setShowBadge(false)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            }
            notificationManager.createNotificationChannel(channel)
        }
    }

    fun createNotification(
        status: String,
        server: String,
        speedDown: Long,
        speedUp: Long,
        durationSec: Int
    ): Notification {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Desconectar
        val disconnectIntent = Intent(context, ConexoesVpnService::class.java).apply {
            action = ConexoesVpnService.ACTION_DISCONNECT
        }
        val disconnectPendingIntent = PendingIntent.getService(
            context, 1, disconnectIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action: Reconectar
        val reconnectIntent = Intent(context, ConexoesVpnService::class.java).apply {
            action = ConexoesVpnService.ACTION_RECONNECT
        }
        val reconnectPendingIntent = PendingIntent.getService(
            context, 2, reconnectIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val downFormatted = formatBytesPerSec(speedDown)
        val upFormatted = formatBytesPerSec(speedUp)
        val timeFormatted = formatDuration(durationSec)

        val contentText = "$status em $server • ↓ $downFormatted | ↑ $upFormatted • $timeFormatted"

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(context, CHANNEL_ID)
        } else {
            @Suppress("DEPRECATION")
            Notification.Builder(context)
        }

        return builder
            .setContentTitle("Conexões VPN — $status")
            .setContentText(contentText)
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setContentIntent(openAppPendingIntent)
            .setOngoing(true)
            .setAutoCancel(false)
            // Quick action 1: Desconectar
            .addAction(
                Notification.Action.Builder(
                    android.R.drawable.ic_menu_close_clear_cancel,
                    "Desconectar",
                    disconnectPendingIntent
                ).build()
            )
            // Quick action 2: Reconectar
            .addAction(
                Notification.Action.Builder(
                    android.R.drawable.ic_menu_rotate,
                    "Reconectar",
                    reconnectPendingIntent
                ).build()
            )
            .build()
    }

    fun updateNotification(
        status: String,
        server: String,
        speedDown: Long,
        speedUp: Long,
        durationSec: Int
    ) {
        val notification = createNotification(status, server, speedDown, speedUp, durationSec)
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun formatBytesPerSec(bytes: Long): String {
        return when {
            bytes >= 1048576 -> String.format("%.1f MB/s", bytes / 1048576.0)
            bytes >= 1024 -> String.format("%d KB/s", bytes / 1024)
            else -> "$bytes B/s"
        }
    }

    private fun formatDuration(seconds: Int): String {
        val hrs = seconds / 3600
        val mins = (seconds % 3600) / 60
        val secs = seconds % 60
        return String.format("%02d:%02d:%02d", hrs, mins, secs)
    }
}
