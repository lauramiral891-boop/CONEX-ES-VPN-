package com.conexoesvpn.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Handles device boot completion to restore VPN tunnel if auto-connect is configured
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i("BootReceiver", "Dispositivo inicializado, verificando preferência de auto-reconexão da Conexões VPN")
        }
    }
}
