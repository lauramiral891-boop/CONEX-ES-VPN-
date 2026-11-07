import net from 'net';
import tls from 'tls';
import dns from 'dns';
import { 
  FullConnectivityReport, 
  HackerAiStatus, 
  OperatorType, 
  SshProbeResult, 
  HttpProxyProbeResult, 
  TestedPortResult 
} from '../types/vpn';
import { ZeroRatingManager } from './zeroRatingCatalog';

export class ConnectivityEngine {
  /**
   * Execute full multi-protocol diagnostic battery on a domain or IP
   */
  public static async runFullTest(
    host: string, 
    operator: OperatorType = 'UNITEL'
  ): Promise<FullConnectivityReport> {
    const cleanHost = host.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    const startTime = Date.now();

    const report: FullConnectivityReport = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      host: cleanHost,
      operator,
      timestamp: new Date().toISOString(),
      overallStatus: 'FALHA NA CONEXÃO',
      dns: {
        ipv4: [],
        ipv6: [],
        timeMs: 0,
        status: 'FAIL'
      },
      tcpPorts: [],
      tls: {
        tested: false,
        timeMs: 0,
        authorized: false
      },
      ssh: {
        port: 22,
        isOpen: false,
        timeMs: 0,
        status: 'SSH_CLOSED'
      },
      httpProxy: {
        port: 8080,
        isOpen: false,
        allowsConnect: false,
        timeMs: 0,
        status: 'NOT_A_PROXY'
      },
      totalLatencyMs: 0,
      technicalSummary: ''
    };

    // 1. DNS Resolution (IPv4 + IPv6)
    const dnsStart = Date.now();
    try {
      const ipv4 = await dns.promises.resolve4(cleanHost);
      report.dns.ipv4 = ipv4;
    } catch {}

    try {
      const ipv6 = await dns.promises.resolve6(cleanHost);
      report.dns.ipv6 = ipv6;
    } catch {}

    report.dns.timeMs = Date.now() - dnsStart;
    report.dns.status = (report.dns.ipv4.length > 0 || report.dns.ipv6.length > 0) ? 'OK' : 'FAIL';

    if (report.dns.status === 'FAIL') {
      report.totalLatencyMs = Date.now() - startTime;
      report.overallStatus = 'FALHA NA CONEXÃO';
      report.technicalSummary = `Falha na resolução DNS para ${cleanHost}. O domínio não possui registos de endereço válidos.`;
      return report;
    }

    const primaryIp = report.dns.ipv4[0] || report.dns.ipv6[0];

    // 2. Parallel Multi-Port TCP Probes (80, 443, 8080, 8443)
    const portsToTest = [80, 443, 8080, 8443];
    report.tcpPorts = await Promise.all(
      portsToTest.map(port => this.probeTcpPort(primaryIp, port))
    );

    // 3. TLS Handshake Probe (Port 443 or 8443)
    const tlsPortObj = report.tcpPorts.find(p => (p.port === 443 || p.port === 8443) && p.isOpen);
    const chosenTlsPort = tlsPortObj ? tlsPortObj.port : 443;

    if (tlsPortObj) {
      report.tls = await this.probeTlsHandshake(cleanHost, primaryIp, chosenTlsPort);
    }

    // 4. SSH Banner Probe (Port 22)
    report.ssh = await this.probeSshBanner(primaryIp, 22);

    // 5. HTTP Proxy CONNECT Probe (Port 8080 or 80)
    const proxyPort = report.tcpPorts.find(p => p.port === 8080 && p.isOpen) ? 8080 : 80;
    report.httpProxy = await this.probeHttpConnect(cleanHost, primaryIp, proxyPort);

    // 6. Zero-Rating Verification
    const zrResult = await ZeroRatingManager.verifyZeroRating(cleanHost, operator);
    report.zeroRating = {
      isZeroRated: zrResult.isZeroRated,
      status: zrResult.status === 'ACESSO PATROCINADO CONFIRMADO' ? 'ACESSO PATROCINADO CONFIRMADO' : 'ACESSO NORMAL',
      details: zrResult.details
    };

    report.totalLatencyMs = Date.now() - startTime;

    // 7. Synthesize Overall Status
    const openPorts = report.tcpPorts.filter(p => p.isOpen);
    const hasReset = report.tcpPorts.some(p => p.status === 'RESET');

    if (zrResult.isZeroRated) {
      report.overallStatus = 'ACESSO PATROCINADO CONFIRMADO';
      report.technicalSummary = `Domínio patrocinado oficial da rede ${operator} com conectividade ativa.`;
    } else if (report.tls.authorized && openPorts.some(p => p.port === 443)) {
      report.overallStatus = 'SERVIDOR COMPATÍVEL';
      report.technicalSummary = `Servidor perfeitamente compatível com SNI e TLS válido (${report.tls.version}, ${report.tls.cipher}).`;
    } else if (report.tls.tested && report.tls.version) {
      report.overallStatus = 'TLS FUNCIONAL';
      report.technicalSummary = `Handshake TLS bem-sucedido na porta ${chosenTlsPort}. Versão: ${report.tls.version}.`;
    } else if (openPorts.length > 0) {
      report.overallStatus = 'PORTA DISPONÍVEL';
      report.technicalSummary = `Portas abertas para tráfego: ${openPorts.map(p => p.port).join(', ')}.`;
    } else if (report.dns.status === 'OK') {
      report.overallStatus = 'DNS FUNCIONAL';
      report.technicalSummary = `DNS resolvido com sucesso (${report.dns.ipv4.join(', ')}), porém as portas TCP testadas não responderam.`;
    } else {
      report.overallStatus = hasReset ? 'FALHA NA CONEXÃO' : 'FALHA NA CONEXÃO';
      report.technicalSummary = `Incapaz de estabelecer conexão TCP ou TLS.`;
    }

    return report;
  }

  /**
   * Probe a single TCP port with timing
   */
  private static probeTcpPort(ip: string, port: number): Promise<TestedPortResult> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = new net.Socket();
      socket.setTimeout(2500);

      socket.on('connect', () => {
        const timeMs = Date.now() - start;
        socket.destroy();
        resolve({
          port,
          protocol: (port === 443 || port === 8443) ? 'HTTPS' : 'HTTP',
          isOpen: true,
          timeMs,
          status: 'ABERTO'
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          port,
          protocol: (port === 443 || port === 8443) ? 'HTTPS' : 'HTTP',
          isOpen: false,
          timeMs: Date.now() - start,
          status: 'TIMEOUT'
        });
      });

      socket.on('error', (err: any) => {
        socket.destroy();
        resolve({
          port,
          protocol: (port === 443 || port === 8443) ? 'HTTPS' : 'HTTP',
          isOpen: false,
          timeMs: Date.now() - start,
          status: err.code === 'ECONNRESET' ? 'RESET' : (err.code === 'ECONNREFUSED' ? 'FECHADO' : 'ERRO')
        });
      });

      socket.connect(port, ip);
    });
  }

  /**
   * Probe TLS Handshake with exact SNI and extract X.509 certificate data
   */
  private static probeTlsHandshake(host: string, ip: string, port: number): Promise<{
    tested: boolean;
    timeMs: number;
    authorized: boolean;
    version?: string;
    cipher?: string;
    certSubject?: string;
    certIssuer?: string;
    validTo?: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = new net.Socket();
      socket.setTimeout(3500);

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          tested: true,
          timeMs: Date.now() - start,
          authorized: false,
          error: 'Timeout na negociação TLS (3500ms)'
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        resolve({
          tested: true,
          timeMs: Date.now() - start,
          authorized: false,
          error: err.message
        });
      });

      socket.connect(port, ip, () => {
        const tlsSocket = tls.connect({
          socket,
          servername: host, // SNI
          rejectUnauthorized: false,
          timeout: 3500
        });

        tlsSocket.on('secureConnect', () => {
          const cert = tlsSocket.getPeerCertificate();
          const cipher = tlsSocket.getCipher();
          const protocol = tlsSocket.getProtocol();

          const rawSubj = cert.subject;
          const rawIssuer = cert.issuer;
          const certSubject = typeof rawSubj === 'object' && rawSubj !== null
            ? (Array.isArray(rawSubj.CN) ? rawSubj.CN.join(', ') : (rawSubj.CN || ''))
            : '';
          const certIssuer = typeof rawIssuer === 'object' && rawIssuer !== null
            ? (Array.isArray(rawIssuer.O) ? rawIssuer.O.join(', ') : (rawIssuer.O || ''))
            : '';

          const res = {
            tested: true,
            timeMs: Date.now() - start,
            authorized: tlsSocket.authorized === true,
            version: protocol || 'TLS',
            cipher: cipher ? `${cipher.name} (${cipher.version})` : undefined,
            certSubject,
            certIssuer,
            validTo: cert.valid_to,
            error: tlsSocket.authorizationError ? String(tlsSocket.authorizationError) : undefined
          };

          try {
            tlsSocket.destroy();
          } catch {}
          resolve(res);
        });

        tlsSocket.on('error', (err) => {
          try {
            tlsSocket.destroy();
          } catch {}
          resolve({
            tested: true,
            timeMs: Date.now() - start,
            authorized: false,
            error: err.message
          });
        });
      });
    });
  }

  /**
   * Probe SSH banner on port 22
   */
  private static probeSshBanner(ip: string, port: number = 22): Promise<SshProbeResult> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = new net.Socket();
      socket.setTimeout(2500);

      socket.on('connect', () => {
        // Connected, wait for server identification banner
      });

      socket.on('data', (data) => {
        const banner = data.toString('utf8').trim();
        const timeMs = Date.now() - start;
        socket.destroy();
        resolve({
          port,
          isOpen: true,
          banner,
          timeMs,
          protocolVersion: banner.startsWith('SSH-') ? banner.split(' ')[0] : undefined,
          status: 'SSH_ONLINE'
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          port,
          isOpen: false,
          timeMs: Date.now() - start,
          status: 'SSH_TIMEOUT'
        });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({
          port,
          isOpen: false,
          timeMs: Date.now() - start,
          status: 'SSH_CLOSED'
        });
      });

      socket.connect(port, ip);
    });
  }

  /**
   * Probe HTTP CONNECT Proxy capability
   */
  private static probeHttpConnect(host: string, ip: string, port: number): Promise<HttpProxyProbeResult> {
    return new Promise((resolve) => {
      const start = Date.now();
      const socket = new net.Socket();
      socket.setTimeout(2500);

      socket.on('connect', () => {
        // Send HTTP CONNECT probe
        socket.write(`CONNECT ${host}:443 HTTP/1.1\r\nHost: ${host}:443\r\nUser-Agent: ConexoesVPN/2.0\r\n\r\n`);
      });

      socket.on('data', (data) => {
        const responseStr = data.toString('utf8');
        const firstLine = responseStr.split('\r\n')[0] || '';
        const match = firstLine.match(/HTTP\/[0-9.]+\s+([0-9]+)/);
        const code = match ? parseInt(match[1], 10) : 0;
        const timeMs = Date.now() - start;
        socket.destroy();

        if (code === 200) {
          resolve({
            port,
            isOpen: true,
            allowsConnect: true,
            statusCode: code,
            timeMs,
            status: 'PROXY_ALLOW'
          });
        } else if (code > 0) {
          resolve({
            port,
            isOpen: true,
            allowsConnect: false,
            statusCode: code,
            timeMs,
            status: 'PROXY_DENIED'
          });
        } else {
          resolve({
            port,
            isOpen: true,
            allowsConnect: false,
            timeMs,
            status: 'NOT_A_PROXY'
          });
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({
          port,
          isOpen: false,
          allowsConnect: false,
          timeMs: Date.now() - start,
          status: 'TIMEOUT'
        });
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({
          port,
          isOpen: false,
          allowsConnect: false,
          timeMs: Date.now() - start,
          status: 'NOT_A_PROXY'
        });
      });

      socket.connect(port, ip);
    });
  }
}
