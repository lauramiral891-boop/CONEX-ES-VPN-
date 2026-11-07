package com.conexoesvpn.app

import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log

/**
 * Conexões VPN — Native Foreground Service hosting the Official WireGuard Backend
 *
 * Manages the WireGuard tunnel lifecycle, real network statistics polling,
 * foreground persistent notification, and automatic handover recovery.
 */
class ConexoesVpnService : Service() {

    companion object {
        const val TAG = "ConexoesVpnService"
        const val ACTION_CONNECT = "com.conexoesvpn.app.ACTION_CONNECT"
        const val ACTION_DISCONNECT = "com.conexoesvpn.app.ACTION_DISCONNECT"
        const val ACTION_RECONNECT = "com.conexoesvpn.app.ACTION_RECONNECT"
        const val BROADCAST_VPN_STATE = "com.conexoesvpn.app.VPN_STATE_CHANGED"

        const val EXTRA_SERVER_NAME = "server_name"
        const val EXTRA_SERVER_IP = "server_ip"
        const val EXTRA_OPERATOR = "operator"
        const val EXTRA_RAW_CONFIG = "raw_config"
    }

    private var wireGuardManager: WireGuardTunnelManager? = null
    private var isConnected = false
    private var connectedTimestamp: Long = 0

    private var currentServerName: String = "Servidor WireGuard"
    private var currentServerIp: String = ""
    private var currentOperator: String = "UNITEL"
    private var currentRawConfig: String = ""

    private lateinit var notificationManager: VpnNotificationManager
    private lateinit var connectivityManager: ConnectivityManager
    private var networkCallback: ConnectivityManager.NetworkCallback? = null

    private val mainHandler = Handler(Looper.getMainLooper())
    private val statsPollingIntervalMs = 1000L

    private val statsTicker = object : Runnable {
        private var lastRx: Long = 0
        private var lastTx: Long = 0

        override fun run() {
            if (isConnected && wireGuardManager != null) {
                val (currentRx, currentTx) = wireGuardManager!!.getNetworkStatistics()

                val downSpeed = (currentRx - lastRx).coerceAtLeast(0)
                val upSpeed = (currentTx - lastTx).coerceAtLeast(0)

                lastRx = currentRx
                lastTx = currentTx

                val durationSec = if (connectedTimestamp > 0) {
                    ((System.currentTimeMillis() - connectedTimestamp) / 1000).toInt()
                } else 0

                // Update notification with authentic statistics
                notificationManager.updateNotification(
                    status = "Conectado",
                    server = currentServerName,
                    speedDown = downSpeed,
                    speedUp = upSpeed,
                    durationSec = durationSec
                )

                // Broadcast genuine network bytes to UI
                broadcastState(
                    state = "CONNECTED",
                    ip = currentServerIp,
                    downSpeed = downSpeed,
                    upSpeed = upSpeed,
                    bytesIn = currentRx,
                    bytesOut = currentTx,
                    duration = durationSec
                )

                mainHandler.postDelayed(this, statsPollingIntervalMs)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        notificationManager = VpnNotificationManager(this)
        connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        wireGuardManager = WireGuardTunnelManager(this)
        registerNetworkCallback()
        Log.i(TAG, "Conexões VPN Service criado com WireGuard Backend oficial")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_CONNECT -> {
                currentServerName = intent.getStringExtra(EXTRA_SERVER_NAME) ?: "Servidor WireGuard"
                currentServerIp = intent.getStringExtra(EXTRA_SERVER_IP) ?: ""
                currentOperator = intent.getStringExtra(EXTRA_OPERATOR) ?: "UNITEL"
                currentRawConfig = intent.getStringExtra(EXTRA_RAW_CONFIG) ?: ""
                startVpnTunnel()
            }
            ACTION_DISCONNECT -> {
                stopVpnTunnel()
            }
            ACTION_RECONNECT -> {
                reconnectVpnTunnel()
            }
        }
        return START_STICKY
    }

    /**
     * Start the WireGuard tunnel through the official WireGuard GoBackend
     */
    private fun startVpnTunnel() {
        if (isConnected) {
            Log.w(TAG, "Túnel já está conectado")
            return
        }

        // Show connecting notification
        val notification = notificationManager.createNotification(
            status = "A Conectar...",
            server = currentServerName,
            speedDown = 0,
            speedUp = 0,
            durationSec = 0
        )
        startForeground(VpnNotificationManager.NOTIFICATION_ID, notification)
        broadcastState("CONNECTING", currentServerIp, 0, 0, 0, 0, 0)

        if (currentRawConfig.isBlank()) {
            Log.e(TAG, "Configuração WireGuard (.conf) vazia ou não informada")
            broadcastState("ERROR", currentServerIp, 0, 0, 0, 0, 0, "Perfil WireGuard (.conf) não configurado")
            stopForeground(true)
            return
        }

        wireGuardManager?.startTunnel(
            rawConfig = currentRawConfig,
            onSuccess = {
                isConnected = true
                connectedTimestamp = System.currentTimeMillis()

                notificationManager.updateNotification(
                    status = "Conectado",
                    server = currentServerName,
                    speedDown = 0,
                    speedUp = 0,
                    durationSec = 0
                )

                // Only send CONNECTED when backend confirms Tunnel.State.UP
                broadcastState("CONNECTED", currentServerIp, 0, 0, 0, 0, 0)
                mainHandler.post(statsTicker)
                Log.i(TAG, "Túnel WireGuard oficial confirmado como CONECTADO")
            },
            onError = { errorMessage ->
                isConnected = false
                mainHandler.removeCallbacks(statsTicker)
                stopForeground(true)
                broadcastState("ERROR", currentServerIp, 0, 0, 0, 0, 0, errorMessage)
                Log.e(TAG, "Falha ao estabelecer túnel WireGuard: $errorMessage")
            }
        )
    }

    /**
     * Safely stop the WireGuard tunnel
     */
    private fun stopVpnTunnel() {
        mainHandler.removeCallbacks(statsTicker)

        val finalStats = wireGuardManager?.getNetworkStatistics() ?: Pair(0L, 0L)
        val duration = if (connectedTimestamp > 0) {
            ((System.currentTimeMillis() - connectedTimestamp) / 1000).toInt()
        } else 0

        wireGuardManager?.stopTunnel {
            isConnected = false
            connectedTimestamp = 0
            stopForeground(true)
            broadcastState("DISCONNECTED", "", 0, 0, finalStats.first, finalStats.second, duration)
            Log.i(TAG, "Túnel WireGuard oficial encerrado com sucesso")
        }
    }

    /**
     * Seamless reconnect on network handover (Wi-Fi <-> Cellular)
     */
    private fun reconnectVpnTunnel() {
        if (!isConnected || currentRawConfig.isBlank()) return

        Log.i(TAG, "Restabelecendo rota do túnel após troca de conectividade")
        broadcastState("RECONNECTING", currentServerIp, 0, 0, 0, 0, 0)

        wireGuardManager?.stopTunnel {
            wireGuardManager?.startTunnel(
                rawConfig = currentRawConfig,
                onSuccess = {
                    isConnected = true
                    broadcastState("CONNECTED", currentServerIp, 0, 0, 0, 0, 0)
                    Log.i(TAG, "Túnel reconectado com sucesso")
                },
                onError = { err ->
                    broadcastState("ERROR", currentServerIp, 0, 0, 0, 0, 0, err)
                }
            )
        }
    }

    /**
     * Network callback to detect Wi-Fi / LTE changes
     */
    private fun registerNetworkCallback() {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()

        networkCallback = object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                if (isConnected) {
                    reconnectVpnTunnel()
                }
            }

            override fun onLost(network: Network) {
                super.onLost(network)
                if (isConnected) {
                    broadcastState("RECONNECTING", currentServerIp, 0, 0, 0, 0, 0)
                }
            }
        }

        connectivityManager.registerNetworkCallback(request, networkCallback!!)
    }

    private fun broadcastState(
        state: String,
        ip: String,
        downSpeed: Long,
        upSpeed: Long,
        bytesIn: Long,
        bytesOut: Long,
        duration: Int,
        error: String? = null
    ) {
        val intent = Intent(BROADCAST_VPN_STATE).apply {
            putExtra("state", state)
            putExtra("server_ip", ip)
            putExtra("speed_down", downSpeed)
            putExtra("speed_up", upSpeed)
            putExtra("bytes_in", bytesIn)
            putExtra("bytes_out", bytesOut)
            putExtra("duration_sec", duration)
            if (error != null) putExtra("error_message", error)
        }
        sendBroadcast(intent)
    }

    override fun onDestroy() {
        stopVpnTunnel()
        networkCallback?.let {
            connectivityManager.unregisterNetworkCallback(it)
        }
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
