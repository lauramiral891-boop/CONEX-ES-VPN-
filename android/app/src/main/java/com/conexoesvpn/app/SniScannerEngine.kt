package com.conexoesvpn.app

import android.util.Log
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.Socket
import javax.net.ssl.SNIHostName
import javax.net.ssl.SSLParameters
import javax.net.ssl.SSLSocket
import javax.net.ssl.SSLSocketFactory

/**
 * Native Android TLS SNI and DNS Diagnostic Scanner Engine
 *
 * Implements low-level socket connections, DNS timing,
 * and SSL/TLS Handshake evaluation with Server Name Indication.
 */
class SniScannerEngine {

    companion object {
        const val TAG = "SniScannerEngine"
    }

    data class ScanResult(
        val host: String,
        val port: Int,
        val operator: String,
        val status: String, // COMPATÍVEL, PARCIAL, FALHOU, BLOQUEIO POSSÍVEL, DNS COM FALHA, TLS COM FALHA
        val dnsTimeMs: Long,
        val tcpTimeMs: Long,
        val tlsTimeMs: Long,
        val totalTimeMs: Long,
        val resolvedIp: String,
        val cipher: String,
        val tlsProtocol: String,
        val message: String
    )

    fun testHost(host: String, port: Int = 443, operator: String = "UNITEL"): ScanResult {
        val startTime = System.currentTimeMillis()
        var dnsTime: Long = 0
        var tcpTime: Long = 0
        var tlsTime: Long = 0
        var resolvedIp = ""
        var cipher = ""
        var tlsProtocol = ""

        // 1. DNS Resolution
        val dnsStart = System.currentTimeMillis()
        val inetAddress: InetAddress
        try {
            inetAddress = InetAddress.getByName(host)
            dnsTime = System.currentTimeMillis() - dnsStart
            resolvedIp = inetAddress.hostAddress ?: ""
        } catch (e: Exception) {
            val total = System.currentTimeMillis() - startTime
            return ScanResult(
                host = host,
                port = port,
                operator = operator,
                status = "DNS COM FALHA",
                dnsTimeMs = System.currentTimeMillis() - dnsStart,
                tcpTimeMs = 0,
                tlsTimeMs = 0,
                totalTimeMs = total,
                resolvedIp = "",
                cipher = "",
                tlsProtocol = "",
                message = "Falha ao resolver domínio: ${e.message}"
            )
        }

        // 2. TCP Connect
        val socket = Socket()
        val tcpStart = System.currentTimeMillis()
        try {
            socket.connect(InetSocketAddress(inetAddress, port), 4000)
            tcpTime = System.currentTimeMillis() - tcpStart
        } catch (e: Exception) {
            val total = System.currentTimeMillis() - startTime
            return ScanResult(
                host = host,
                port = port,
                operator = operator,
                status = if (e.message?.contains("reset", ignoreCase = true) == true) "BLOQUEIO POSSÍVEL" else "FALHOU",
                dnsTimeMs = dnsTime,
                tcpTimeMs = System.currentTimeMillis() - tcpStart,
                tlsTimeMs = 0,
                totalTimeMs = total,
                resolvedIp = resolvedIp,
                cipher = "",
                tlsProtocol = "",
                message = "Erro de conexão TCP na porta $port: ${e.message}"
            )
        }

        // 3. TLS Handshake with SNI
        val tlsStart = System.currentTimeMillis()
        var sslSocket: SSLSocket? = null
        try {
            val factory = SSLSocketFactory.getDefault() as SSLSocketFactory
            sslSocket = factory.createSocket(socket, host, port, true) as SSLSocket

            val sslParams = SSLParameters()
            sslParams.serverNames = listOf(SNIHostName(host))
            sslSocket.sslParameters = sslParams
            sslSocket.soTimeout = 4000

            sslSocket.startHandshake()
            tlsTime = System.currentTimeMillis() - tlsStart

            val session = sslSocket.session
            cipher = session.cipherSuite
            tlsProtocol = session.protocol

            val total = System.currentTimeMillis() - startTime
            return ScanResult(
                host = host,
                port = port,
                operator = operator,
                status = "COMPATÍVEL",
                dnsTimeMs = dnsTime,
                tcpTimeMs = tcpTime,
                tlsTimeMs = tlsTime,
                totalTimeMs = total,
                resolvedIp = resolvedIp,
                cipher = cipher,
                tlsProtocol = tlsProtocol,
                message = "SNI perfeitamente compatível. Handshake concluído com $tlsProtocol."
            )
        } catch (e: Exception) {
            val total = System.currentTimeMillis() - startTime
            val isReset = e.message?.contains("reset", ignoreCase = true) == true
            return ScanResult(
                host = host,
                port = port,
                operator = operator,
                status = if (isReset) "BLOQUEIO POSSÍVEL" else "TLS COM FALHA",
                dnsTimeMs = dnsTime,
                tcpTimeMs = tcpTime,
                tlsTimeMs = System.currentTimeMillis() - tlsStart,
                totalTimeMs = total,
                resolvedIp = resolvedIp,
                cipher = cipher,
                tlsProtocol = tlsProtocol,
                message = "Falha no handshake TLS com SNI=$host: ${e.message}"
            )
        } finally {
            try {
                sslSocket?.close()
                socket.close()
            } catch (ignored: Exception) {}
        }
    }

    /**
     * Advanced Multi-Port TCP & TLS Scan for Android Native Bridge
     */
    fun testHostMultiPort(host: String, ports: IntArray = intArrayOf(80, 443, 8080, 8443), operator: String = "UNITEL"): String {
        val baseResult = testHost(host, 443, operator)
        val portStatusList = mutableListOf<String>()

        for (p in ports) {
            val pStart = System.currentTimeMillis()
            var pOpen = false
            var pStatus = "FECHADO"
            try {
                val s = Socket()
                s.connect(InetSocketAddress(host, p), 2000)
                pOpen = true
                pStatus = "ABERTO"
                s.close()
            } catch (e: Exception) {
                pStatus = if (e.message?.contains("reset", ignoreCase = true) == true) "RESET" else "FECHADO"
            }
            val pTime = System.currentTimeMillis() - pStart
            portStatusList.add("""{"port":$p,"isOpen":$pOpen,"status":"$pStatus","timeMs":$pTime}""")
        }

        return """
        {
            "host": "$host",
            "operator": "$operator",
            "overallStatus": "${baseResult.status}",
            "dnsTimeMs": ${baseResult.dnsTimeMs},
            "tcpTimeMs": ${baseResult.tcpTimeMs},
            "tlsTimeMs": ${baseResult.tlsTimeMs},
            "resolvedIp": "${baseResult.resolvedIp}",
            "cipher": "${baseResult.cipher}",
            "tlsProtocol": "${baseResult.tlsProtocol}",
            "ports": [${portStatusList.joinToString(",")}],
            "details": "${baseResult.message}",
            "origin": "Dispositivo Móvel (Nativo / SIM)"
        }
        """.trimIndent()
    }
}

