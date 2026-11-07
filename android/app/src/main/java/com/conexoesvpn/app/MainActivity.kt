package com.conexoesvpn.app

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast

/**
 * Main Bridge Activity connecting the Web Dashboard with the Official Android WireGuard Backend
 */
class MainActivity : Activity() {

    companion object {
        const val VPN_REQUEST_CODE = 4096
    }

    private lateinit var webView: WebView
    private var pendingServerName: String = ""
    private var pendingServerIp: String = ""
    private var pendingOperator: String = "UNITEL"
    private var pendingRawConfig: String = ""

    private val vpnStateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == ConexoesVpnService.BROADCAST_VPN_STATE) {
                val state = intent.getStringExtra("state") ?: "DISCONNECTED"
                val serverIp = intent.getStringExtra("server_ip") ?: ""
                val speedDown = intent.getLongExtra("speed_down", 0)
                val speedUp = intent.getLongExtra("speed_up", 0)
                val bytesIn = intent.getLongExtra("bytes_in", 0)
                val bytesOut = intent.getLongExtra("bytes_out", 0)
                val duration = intent.getIntExtra("duration_sec", 0)
                val errorMessage = intent.getStringExtra("error_message") ?: ""

                // Dispatch state event to JavaScript web interface
                runOnUiThread {
                    val escapedError = errorMessage.replace("'", "\\'")
                    webView.evaluateJavascript(
                        "window.onNativeVpnEvent && window.onNativeVpnEvent('$state', '$serverIp', $speedDown, $speedUp, $bytesIn, $bytesOut, $duration, '$escapedError');",
                        null
                    )
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT
            webViewClient = WebViewClient()
            addJavascriptInterface(WebAppInterface(this@MainActivity), "AndroidVpnBridge")
        }

        setContentView(webView)

        // Register receiver for VPN state broadcasts
        val filter = IntentFilter(ConexoesVpnService.BROADCAST_VPN_STATE)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(vpnStateReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(vpnStateReceiver, filter)
        }

        // Load the Conexões VPN interface bundled in assets
        webView.loadUrl("file:///android_asset/dist/index.html")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST_CODE && resultCode == RESULT_OK) {
            startNativeWireGuardService(pendingServerName, pendingServerIp, pendingOperator, pendingRawConfig)
        } else if (requestCode == VPN_REQUEST_CODE) {
            Toast.makeText(this, "Permissão do sistema necessária para ativar a VPN", Toast.LENGTH_LONG).show()
        }
    }

    /**
     * Request system authorization via official VpnService.prepare()
     */
    fun requestVpnPermission(serverName: String, serverIp: String, operator: String, rawConfig: String) {
        pendingServerName = serverName
        pendingServerIp = serverIp
        pendingOperator = operator
        pendingRawConfig = rawConfig

        val prepareIntent = VpnService.prepare(this)
        if (prepareIntent != null) {
            startActivityForResult(prepareIntent, VPN_REQUEST_CODE)
        } else {
            startNativeWireGuardService(serverName, serverIp, operator, rawConfig)
        }
    }

    private fun startNativeWireGuardService(
        serverName: String,
        serverIp: String,
        operator: String,
        rawConfig: String
    ) {
        val intent = Intent(this, ConexoesVpnService::class.java).apply {
            action = ConexoesVpnService.ACTION_CONNECT
            putExtra(ConexoesVpnService.EXTRA_SERVER_NAME, serverName)
            putExtra(ConexoesVpnService.EXTRA_SERVER_IP, serverIp)
            putExtra(ConexoesVpnService.EXTRA_OPERATOR, operator)
            putExtra(ConexoesVpnService.EXTRA_RAW_CONFIG, rawConfig)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    fun stopNativeWireGuardService() {
        val intent = Intent(this, ConexoesVpnService::class.java).apply {
            action = ConexoesVpnService.ACTION_DISCONNECT
        }
        startService(intent)
    }

    override fun onDestroy() {
        unregisterReceiver(vpnStateReceiver)
        super.onDestroy()
    }

    /**
     * JavaScript Bridge Interface exposed to React Web Interface
     */
    inner class WebAppInterface(private val activity: MainActivity) {
        @JavascriptInterface
        fun startVpn(serverName: String, serverIp: String, operator: String, rawConfig: String) {
            activity.runOnUiThread {
                activity.requestVpnPermission(serverName, serverIp, operator, rawConfig)
            }
        }

        @JavascriptInterface
        fun stopVpn() {
            activity.runOnUiThread {
                activity.stopNativeWireGuardService()
            }
        }

        @JavascriptInterface
        fun getNetworkInfo(): String {
            return try {
                val cm = activity.getSystemService(Context.CONNECTIVITY_SERVICE) as? android.net.ConnectivityManager
                val activeNetwork = cm?.activeNetwork
                val caps = cm?.getNetworkCapabilities(activeNetwork)
                val isWifi = caps?.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI) == true
                val isCellular = caps?.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR) == true
                val type = if (isWifi) "WIFI" else if (isCellular) "CELLULAR" else "ETHERNET/OUTRO"
                """{"type":"$type","isCellular":$isCellular,"isWifi":$isWifi}"""
            } catch (e: Exception) {
                """{"type":"DESCONHECIDO","isCellular":false,"isWifi":false}"""
            }
        }

        @JavascriptInterface
        fun testSni(host: String, port: Int, operator: String): String {
            val engine = SniScannerEngine()
            val result = engine.testHost(host, port, operator)
            return """
            {
                "host": "${result.host}",
                "port": ${result.port},
                "operator": "${result.operator}",
                "status": "${result.status}",
                "dnsTimeMs": ${result.dnsTimeMs},
                "tcpTimeMs": ${result.tcpTimeMs},
                "tlsTimeMs": ${result.tlsTimeMs},
                "totalTimeMs": ${result.totalTimeMs},
                "resolvedIps": ["${result.resolvedIp}"],
                "cipher": "${result.cipher}",
                "tlsVersion": "${result.tlsProtocol}",
                "details": "${result.message}",
                "origin": "Dispositivo Móvel (Nativo / SIM)"
            }
            """.trimIndent()
        }

        @JavascriptInterface
        fun testConnectivityFull(host: String, operator: String): String {
            val engine = SniScannerEngine()
            return engine.testHostMultiPort(host, intArrayOf(80, 443, 8080, 8443), operator)
        }
    }
}
