package com.conexoesvpn.app

import android.content.Context
import android.util.Log
import com.wireguard.android.backend.Backend
import com.wireguard.android.backend.GoBackend
import com.wireguard.android.backend.Statistics
import com.wireguard.android.backend.Tunnel
import com.wireguard.config.Config
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayInputStream
import java.nio.charset.StandardCharsets

/**
 * Conexões VPN — Official WireGuard Android Backend Integration
 *
 * Utilizes the official WireGuard library (com.wireguard.android:tunnel:1.0.20230707)
 * with the native GoBackend userspace engine.
 */
class WireGuardTunnelManager(private val context: Context) {

    companion object {
        const val TAG = "WireGuardTunnelManager"
        const val TUNNEL_NAME = "conexoes0"
    }

    private var backend: Backend? = null
    private val tunnel = ConexoesTunnel(TUNNEL_NAME)
    private val scope = CoroutineScope(Dispatchers.Main)

    init {
        try {
            backend = GoBackend(context)
            Log.i(TAG, "WireGuard GoBackend oficial inicializado com sucesso")
        } catch (e: Exception) {
            Log.e(TAG, "Falha ao instanciar GoBackend: ${e.message}", e)
        }
    }

    /**
     * Start the official WireGuard tunnel with validated configuration
     * Only transitions to CONNECTED when backend confirms Tunnel.State.UP
     */
    fun startTunnel(
        rawConfig: String,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        if (backend == null) {
            onError("WireGuard Backend nativo não disponível no dispositivo")
            return
        }

        scope.launch {
            try {
                // Parse configuration using official WireGuard Config parser
                val config = withContext(Dispatchers.IO) {
                    val stream = ByteArrayInputStream(rawConfig.toByteArray(StandardCharsets.UTF_8))
                    Config.parse(stream)
                }

                Log.i(TAG, "Configuração WireGuard analisada com sucesso: Interface MTU=${config.`interface`.mtu.orElse(1420)}, Peers=${config.peers.size}")

                // Set tunnel state to UP through official GoBackend
                withContext(Dispatchers.IO) {
                    backend!!.setState(tunnel, Tunnel.State.UP, config)
                }

                // Verify real backend state before notifying success
                val currentState = backend!!.getState(tunnel)
                if (currentState == Tunnel.State.UP) {
                    Log.i(TAG, "Túnel WireGuard oficial ATIVO e roteando pacotes (State.UP)")
                    onSuccess()
                } else {
                    Log.w(TAG, "Túnel não atingiu State.UP, estado atual: $currentState")
                    onError("Túnel não estabelecido: estado $currentState")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao iniciar túnel WireGuard oficial: ${e.message}", e)
                onError("Erro na configuração WireGuard: ${e.message}")
            }
        }
    }

    /**
     * Stop the official WireGuard tunnel safely
     */
    fun stopTunnel(onComplete: (() -> Unit)? = null) {
        if (backend == null) {
            onComplete?.invoke()
            return
        }

        scope.launch {
            try {
                withContext(Dispatchers.IO) {
                    backend!!.setState(tunnel, Tunnel.State.DOWN, null)
                }
                Log.i(TAG, "Túnel WireGuard oficial encerrado (State.DOWN)")
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao encerrar túnel WireGuard: ${e.message}", e)
            } finally {
                onComplete?.invoke()
            }
        }
    }

    /**
     * Retrieve authentic byte counters directly from WireGuard kernel/Go backend
     */
    fun getNetworkStatistics(): Pair<Long, Long> {
        return try {
            if (backend != null && tunnel.getState() == Tunnel.State.UP) {
                val stats: Statistics = backend!!.getStatistics(tunnel)
                Pair(stats.totalRx(), stats.totalTx())
            } else {
                Pair(0L, 0L)
            }
        } catch (e: Exception) {
            Pair(0L, 0L)
        }
    }

    fun isConnected(): Boolean {
        return try {
            backend?.getState(tunnel) == Tunnel.State.UP
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Official Tunnel interface implementation
     */
    class ConexoesTunnel(private val name: String) : Tunnel {
        private var state: Tunnel.State = Tunnel.State.DOWN

        override fun getName(): String = name

        override fun onStateChange(newState: Tunnel.State) {
            Log.d(TAG, "WireGuard Tunnel state changed: $state -> $newState")
            state = newState
        }

        fun getState(): Tunnel.State = state
    }
}
