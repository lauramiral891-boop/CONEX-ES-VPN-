import net from 'net';
import tls from 'tls';
import dns from 'dns';
import { DiscoveredDomain, DiscoverySourceType, TestedPortResult, DiscoveryEngineStats, OperatorType } from '../types/vpn';

// Curated high-probability prefix dictionary for telecom and enterprise services
const TELECOM_SUBDOMAIN_PREFIXES = [
  'api', 'app', 'apps', 'portal', 'recargas', 'loja', 'empresas', 'corporate',
  'my', 'selfcare', 'care', 'careers', 'carreiras', 'agentes', 'cdn', 'static',
  'auth', 'login', 'id', 'conta', 'analytics', 'mail', 'webmail', 'vpn', 'gateway',
  'speedtest', 'dns', 'ns1', 'ns2', 'ussd', 'vas', 'ott', '5g', '4g', 'net',
  'hub', 'status', 'suporte', 'uniteltv', 'basket', 'cacti', 'caf', 'cara',
  '3x3', 'angolamove', 'appmusica', 'unisend', 'pay', 'financas', 'seguro'
];

// Target root operator domains
const OPERATOR_ROOTS: Record<OperatorType, string[]> = {
  UNITEL: ['unitel.ao'],
  AFRICELL: ['africell.ao']
};

export class SniDiscoveryEngine {
  private database: Map<string, DiscoveredDomain> = new Map();
  private isDiscovering: boolean = false;
  private isTesting: boolean = false;
  private continuousTimer: NodeJS.Timeout | null = null;
  private continuousIntervalMs: number = 10 * 60 * 1000; // 10 minutes default
  private continuousEnabled: boolean = false;
  private newlyDiscoveredInSession: number = 0;
  private lastRunTimestamp: string = new Date().toISOString();

  constructor() {
    this.seedInitialDatabase();
  }

  /**
   * Seed database with verified baseline domains
   */
  private seedInitialDatabase() {
    const seeds: Array<{ host: string; operator: OperatorType | 'AMBAS'; source: DiscoverySourceType; category: string }> = [
      { host: 'portal.unitel.ao', operator: 'UNITEL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'unitel.ao', operator: 'UNITEL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'recargas.unitel.ao', operator: 'UNITEL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'netshows.unitel.ao', operator: 'UNITEL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'www.unitel.ao', operator: 'UNITEL', source: 'Web Crawler (Link Extractor)', category: 'Operadora' },
      { host: 'analytics.unitel.ao', operator: 'UNITEL', source: 'Public Directory (HackerTarget)', category: 'Operadora' },
      { host: 'conta.unitel.ao', operator: 'UNITEL', source: 'Web Crawler (Link Extractor)', category: 'Operadora' },
      { host: 'uniteltv.unitel.ao', operator: 'UNITEL', source: 'Web Crawler (Link Extractor)', category: 'Operadora' },
      
      { host: 'africell.ao', operator: 'AFRICELL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'my.africell.ao', operator: 'AFRICELL', source: 'Manual / Preset', category: 'Operadora' },
      { host: 'api.africell.ao', operator: 'AFRICELL', source: 'DNS Wordlist Resolver', category: 'Operadora' },
      { host: 'cdn.africell.ao', operator: 'AFRICELL', source: 'DNS Wordlist Resolver', category: 'Operadora' },
      { host: 'care.africell.ao', operator: 'AFRICELL', source: 'Web Crawler (Link Extractor)', category: 'Operadora' },
      { host: 'careers.africell.ao', operator: 'AFRICELL', source: 'Web Crawler (Link Extractor)', category: 'Operadora' },
      { host: 'agentes.africell.ao', operator: 'AFRICELL', source: 'Public Directory (HackerTarget)', category: 'Operadora' },
      
      { host: 'governo.gov.ao', operator: 'AMBAS', source: 'Manual / Preset', category: 'Governo & Institucional' },
      { host: 'minfin.gov.ao', operator: 'AMBAS', source: 'Manual / Preset', category: 'Governo & Institucional' },
      { host: 'agt.minfin.gov.ao', operator: 'AMBAS', source: 'Manual / Preset', category: 'Governo & Institucional' },
      { host: 'bna.ao', operator: 'AMBAS', source: 'Manual / Preset', category: 'Governo & Institucional' },
      { host: 'inacom.gov.ao', operator: 'AMBAS', source: 'Manual / Preset', category: 'Governo & Institucional' },
      { host: 'cloudflare.com', operator: 'AMBAS', source: 'Manual / Preset', category: 'CDNs Globais' },
      { host: 'one.one.one.one', operator: 'AMBAS', source: 'Manual / Preset', category: 'CDNs Globais' },
      { host: 'fonts.gstatic.com', operator: 'AMBAS', source: 'Manual / Preset', category: 'CDNs Globais' }
    ];

    for (const s of seeds) {
      this.database.set(s.host.toLowerCase(), {
        id: `seed-${s.host.replace(/[^a-zA-Z0-9]/g, '_')}`,
        host: s.host.toLowerCase(),
        operator: s.operator,
        source: s.source,
        firstDiscoveredAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        status: 'DESCOBERTO',
        dnsIpv4: [],
        dnsIpv6: [],
        testedPorts: [],
        preferredPort: 443,
        dnsResolveMs: 0,
        tcpConnectMs: 0,
        tlsHandshakeMs: 0,
        totalLatencyMs: 0,
        details: 'Domínio inicial de referência carregado na base do motor.',
        origin: 'Servidor Gateway (Nuvem / Edge)',
        category: s.category
      });
    }
  }

  /**
   * Run full discovery across all public sources
   */
  public async runDiscovery(targetOperator: OperatorType | 'AMBAS' = 'AMBAS'): Promise<{
    discoveredCount: number;
    newlyFoundCount: number;
    sourcesSummary: Record<string, number>;
  }> {
    if (this.isDiscovering) {
      return {
        discoveredCount: this.database.size,
        newlyFoundCount: 0,
        sourcesSummary: {}
      };
    }

    this.isDiscovering = true;
    this.lastRunTimestamp = new Date().toISOString();
    let newlyFoundCount = 0;
    const sourcesSummary: Record<string, number> = {
      'HackerTarget': 0,
      'Certificate Transparency': 0,
      'Web Crawler': 0,
      'DNS Wordlist Resolver': 0
    };

    const targetRoots: Array<{ domain: string; op: OperatorType }> = [];
    if (targetOperator === 'UNITEL' || targetOperator === 'AMBAS') {
      targetRoots.push({ domain: 'unitel.ao', op: 'UNITEL' });
    }
    if (targetOperator === 'AFRICELL' || targetOperator === 'AMBAS') {
      targetRoots.push({ domain: 'africell.ao', op: 'AFRICELL' });
    }

    try {
      for (const { domain, op } of targetRoots) {
        // Source 1: Public Directory / HackerTarget Hostsearch API
        try {
          const htHosts = await this.queryHackerTarget(domain);
          for (const h of htHosts) {
            const isNew = this.registerCandidate(h, op, 'Public Directory (HackerTarget)');
            if (isNew) {
              newlyFoundCount++;
              sourcesSummary['HackerTarget']++;
            }
          }
        } catch (e) {
          console.warn(`[Discovery] Falha no HackerTarget para ${domain}:`, (e as any).message);
        }

        // Source 2: Certificate Transparency via crt.sh
        try {
          const ctHosts = await this.queryCertificateTransparency(domain);
          for (const h of ctHosts) {
            const isNew = this.registerCandidate(h, op, 'Certificate Transparency (crt.sh)');
            if (isNew) {
              newlyFoundCount++;
              sourcesSummary['Certificate Transparency']++;
            }
          }
        } catch (e) {
          console.warn(`[Discovery] Falha no crt.sh para ${domain}:`, (e as any).message);
        }

        // Source 3: Web Crawler on official landing page
        try {
          const crawledHosts = await this.crawlOperatorPages(domain);
          for (const h of crawledHosts) {
            const isNew = this.registerCandidate(h, op, 'Web Crawler (Link Extractor)');
            if (isNew) {
              newlyFoundCount++;
              sourcesSummary['Web Crawler']++;
            }
          }
        } catch (e) {
          console.warn(`[Discovery] Falha no Crawler para ${domain}:`, (e as any).message);
        }

        // Source 4: Parallel DNS Wordlist Enumeration
        try {
          const dnsFoundHosts = await this.enumerateDnsWordlist(domain);
          for (const h of dnsFoundHosts) {
            const isNew = this.registerCandidate(h, op, 'DNS Wordlist Resolver');
            if (isNew) {
              newlyFoundCount++;
              sourcesSummary['DNS Wordlist Resolver']++;
            }
          }
        } catch (e) {
          console.warn(`[Discovery] Falha no DNS Wordlist para ${domain}:`, (e as any).message);
        }
      }

      this.newlyDiscoveredInSession += newlyFoundCount;
    } finally {
      this.isDiscovering = false;
    }

    return {
      discoveredCount: this.database.size,
      newlyFoundCount,
      sourcesSummary
    };
  }

  /**
   * Source 1: Query HackerTarget API
   */
  private async queryHackerTarget(domain: string): Promise<string[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const res = await fetch(`https://api.hackertarget.com/hostsearch/?q=${domain}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ConexoesVPN-Diagnostic-Engine/2.0' }
      });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const text = await res.text();
      const lines = text.split('\n');
      const found: string[] = [];
      for (const line of lines) {
        const parts = line.split(',');
        if (parts[0] && parts[0].includes(domain)) {
          const clean = parts[0].trim().toLowerCase();
          if (this.isValidDomain(clean)) {
            found.push(clean);
          }
        }
      }
      return found;
    } catch {
      return [];
    }
  }

  /**
   * Source 2: Query Certificate Transparency Logs (crt.sh)
   */
  private async queryCertificateTransparency(domain: string): Promise<string[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);
    try {
      const res = await fetch(`https://crt.sh/?q=%25.${domain}&output=json`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ConexoesVPN-Diagnostic-Engine/2.0' }
      });
      clearTimeout(timeout);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];
      const found = new Set<string>();
      for (const entry of data) {
        const nameVal = entry.name_value || entry.common_name;
        if (typeof nameVal === 'string') {
          const names = nameVal.split('\n');
          for (let n of names) {
            n = n.trim().toLowerCase().replace(/^\*\./, '');
            if (n.endsWith(domain) && this.isValidDomain(n)) {
              found.add(n);
            }
          }
        }
      }
      return Array.from(found);
    } catch {
      return [];
    }
  }

  /**
   * Source 3: Web Crawler Link Extraction on Operator Homepages
   */
  private async crawlOperatorPages(domain: string): Promise<string[]> {
    const targets = [`https://www.${domain}`, `https://${domain}`];
    const found = new Set<string>();

    for (const url of targets) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ConexoesVPN/2.0)' }
        });
        clearTimeout(timeout);
        if (!res.ok) continue;
        const html = await res.text();
        const regex = new RegExp(`[a-zA-Z0-9.-]+\\.${domain.replace('.', '\\.')}`, 'g');
        const matches = html.match(regex);
        if (matches) {
          for (const m of matches) {
            const clean = m.trim().toLowerCase().replace(/^2f/i, '');
            if (this.isValidDomain(clean)) {
              found.add(clean);
            }
          }
        }
      } catch {
        continue;
      }
    }

    return Array.from(found);
  }

  /**
   * Source 4: Fast Async DNS Wordlist Resolution
   */
  private async enumerateDnsWordlist(domain: string): Promise<string[]> {
    const candidates = TELECOM_SUBDOMAIN_PREFIXES.map(p => `${p}.${domain}`);
    const resolved: string[] = [];

    // Parallel batches of 8 to avoid overwhelming resolver
    const batchSize = 8;
    for (let i = 0; i < candidates.length; i += batchSize) {
      const batch = candidates.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (host) => {
          try {
            await dns.promises.resolve4(host);
            resolved.push(host);
          } catch {}
        })
      );
    }

    return resolved;
  }

  /**
   * Register or update candidate in database
   */
  private registerCandidate(
    host: string, 
    operator: OperatorType | 'AMBAS', 
    source: DiscoverySourceType
  ): boolean {
    const cleanHost = host.trim().toLowerCase();
    if (!this.isValidDomain(cleanHost)) return false;

    if (this.database.has(cleanHost)) {
      return false; // Already known
    }

    this.database.set(cleanHost, {
      id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      host: cleanHost,
      operator,
      source,
      firstDiscoveredAt: new Date().toISOString(),
      lastCheckedAt: 'Pendente',
      status: 'DESCOBERTO',
      dnsIpv4: [],
      dnsIpv6: [],
      testedPorts: [],
      preferredPort: 443,
      dnsResolveMs: 0,
      tcpConnectMs: 0,
      tlsHandshakeMs: 0,
      totalLatencyMs: 0,
      details: `Descoberto via ${source}. Aguardando bateria de testes técnicos.`,
      origin: 'Servidor Gateway (Nuvem / Edge)',
      category: cleanHost.includes('unitel') ? 'Unitel' : (cleanHost.includes('africell') ? 'Africell' : 'Geral')
    });

    return true;
  }

  /**
   * Helper: Check if domain string is syntactically valid
   */
  private isValidDomain(host: string): boolean {
    if (!host || host.length > 253 || host.includes(' ') || host.includes('/')) return false;
    const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return regex.test(host);
  }

  /**
   * Comprehensive Multi-Port, IPv4/IPv6 & TLS X.509 Diagnostic Test
   */
  public async testDomain(
    host: string, 
    portsToTest: number[] = [443, 80, 8080, 8443],
    operatorContext: OperatorType = 'UNITEL'
  ): Promise<DiscoveredDomain> {
    const cleanHost = host.trim().toLowerCase();
    let entry = this.database.get(cleanHost);

    if (!entry) {
      entry = {
        id: `manual-${Date.now()}`,
        host: cleanHost,
        operator: operatorContext,
        source: 'Manual / Preset',
        firstDiscoveredAt: new Date().toISOString(),
        lastCheckedAt: new Date().toISOString(),
        status: 'DESCOBERTO',
        dnsIpv4: [],
        dnsIpv6: [],
        testedPorts: [],
        preferredPort: 443,
        dnsResolveMs: 0,
        tcpConnectMs: 0,
        tlsHandshakeMs: 0,
        totalLatencyMs: 0,
        details: '',
        origin: 'Servidor Gateway (Nuvem / Edge)'
      };
      this.database.set(cleanHost, entry);
    }

    const startTime = Date.now();
    entry.lastCheckedAt = new Date().toISOString();

    // 1. DNS Resolution (IPv4 & IPv6)
    const dnsStart = Date.now();
    let ipv4List: string[] = [];
    let ipv6List: string[] = [];

    try {
      ipv4List = await dns.promises.resolve4(cleanHost);
    } catch {}

    try {
      ipv6List = await dns.promises.resolve6(cleanHost);
    } catch {}

    entry.dnsResolveMs = Date.now() - dnsStart;
    entry.dnsIpv4 = ipv4List;
    entry.dnsIpv6 = ipv6List;

    if (ipv4List.length === 0 && ipv6List.length === 0) {
      entry.status = 'DNS COM FALHA';
      entry.failureReason = 'Domínio sem registros IPv4/IPv6 válidos no resolver DNS.';
      entry.totalLatencyMs = Date.now() - startTime;
      entry.details = `Falha na resolução de nomes DNS para ${cleanHost}. O domínio não respondeu com registros A ou AAAA.`;
      return entry;
    }

    const primaryIp = ipv4List[0] || ipv6List[0];

    // 2. Multi-Port Testing (TCP connection to 80, 443, 8080, 8443 in parallel)
    const testedPortsResults = await Promise.all(
      portsToTest.map(async (port) => {
        const portStart = Date.now();
        const protocol = (port === 443 || port === 8443) ? 'HTTPS' : 'HTTP';

        return new Promise<TestedPortResult>((resolve) => {
          const socket = new net.Socket();
          socket.setTimeout(2500);

          socket.on('connect', () => {
            const connectTime = Date.now() - portStart;
            socket.destroy();
            resolve({
              port,
              protocol: protocol as any,
              isOpen: true,
              timeMs: connectTime,
              status: 'ABERTO'
            });
          });

          socket.on('timeout', () => {
            socket.destroy();
            resolve({
              port,
              protocol: protocol as any,
              isOpen: false,
              timeMs: Date.now() - portStart,
              status: 'TIMEOUT'
            });
          });

          socket.on('error', (err: any) => {
            socket.destroy();
            resolve({
              port,
              protocol: protocol as any,
              isOpen: false,
              timeMs: Date.now() - portStart,
              status: err.code === 'ECONNRESET' ? 'RESET' : (err.code === 'ECONNREFUSED' ? 'FECHADO' : 'ERRO')
            });
          });

          socket.connect(port, primaryIp);
        });
      })
    );

    entry.testedPorts = testedPortsResults;

    let tlsHandshakeResult: {
      timeMs: number;
      authorized: boolean;
      version?: string;
      cipher?: string;
      subject?: string;
      issuer?: string;
      validTo?: string;
      error?: string;
    } | null = null;

    // 3. TLS Handshake with exact SNI (on port 443 if open, else 8443)
    const tlsPortCandidate = testedPortsResults.find(p => (p.port === 443 || p.port === 8443) && p.isOpen);
    const chosenTlsPort = tlsPortCandidate ? tlsPortCandidate.port : 443;

    if (tlsPortCandidate) {
      entry.preferredPort = chosenTlsPort;
      const tlsStart = Date.now();

      tlsHandshakeResult = await new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(4000);

        socket.on('timeout', () => {
          socket.destroy();
          resolve({ timeMs: Date.now() - tlsStart, authorized: false, error: 'Timeout de handshake TLS' });
        });

        socket.on('error', (err) => {
          socket.destroy();
          resolve({ timeMs: Date.now() - tlsStart, authorized: false, error: err.message });
        });

        socket.connect(chosenTlsPort, primaryIp, () => {
          const tlsSocket = tls.connect({
            socket,
            servername: cleanHost,
            rejectUnauthorized: false,
            timeout: 4000
          });

          tlsSocket.on('secureConnect', () => {
            const cert = tlsSocket.getPeerCertificate();
            const cipher = tlsSocket.getCipher();
            const protocol = tlsSocket.getProtocol();

            const rawSubj = cert.subject;
            const rawIssuer = cert.issuer;
            const subject = typeof rawSubj === 'object' && rawSubj !== null
              ? (Array.isArray(rawSubj.CN) ? rawSubj.CN.join(', ') : (rawSubj.CN || ''))
              : '';
            const issuer = typeof rawIssuer === 'object' && rawIssuer !== null
              ? (Array.isArray(rawIssuer.O) ? rawIssuer.O.join(', ') : (rawIssuer.O || ''))
              : '';

            const res = {
              timeMs: Date.now() - tlsStart,
              authorized: tlsSocket.authorized === true,
              version: protocol || 'TLS',
              cipher: cipher ? `${cipher.name} (${cipher.version})` : undefined,
              subject,
              issuer,
              validTo: cert.valid_to,
              error: tlsSocket.authorizationError ? String(tlsSocket.authorizationError) : undefined
            };

            try {
              tlsSocket.destroy();
            } catch {}
            resolve(res);
          });

          tlsSocket.on('error', (tlsErr) => {
            try {
              tlsSocket.destroy();
            } catch {}
            resolve({
              timeMs: Date.now() - tlsStart,
              authorized: false,
              error: tlsErr.message
            });
          });
        });
      });

      if (tlsHandshakeResult) {
        entry.tlsHandshakeMs = tlsHandshakeResult.timeMs;
        entry.tlsVersion = tlsHandshakeResult.version;
        entry.cipherSuite = tlsHandshakeResult.cipher;
        entry.certSubject = tlsHandshakeResult.subject;
        entry.certIssuer = tlsHandshakeResult.issuer;
        entry.certValidTo = tlsHandshakeResult.validTo;
        entry.certAuthorized = tlsHandshakeResult.authorized;
        entry.certChainTrusted = tlsHandshakeResult.authorized;

        if (tlsHandshakeResult.error) {
          entry.failureReason = tlsHandshakeResult.error;
        }
      }
    }

    // Measure fastest open TCP connect time
    const openPorts = testedPortsResults.filter(p => p.isOpen);
    entry.tcpConnectMs = openPorts.length > 0 ? Math.min(...openPorts.map(p => p.timeMs)) : 0;
    entry.totalLatencyMs = entry.dnsResolveMs + entry.tcpConnectMs + entry.tlsHandshakeMs;

    // 4. Classification
    const hasOpenPorts = openPorts.length > 0;
    const hasReset = testedPortsResults.some(p => p.status === 'RESET');

    if (hasReset) {
      entry.status = 'BLOQUEIO POSSÍVEL';
      entry.failureReason = 'Reset TCP (RST) detectado durante o handshake na operadora.';
      entry.details = `Conexão terminada abruptamente por RST. Provável inspeção ou bloqueio de firewall na rede.`;
    } else if (entry.certAuthorized) {
      entry.status = 'COMPATÍVEL';
      entry.details = `Certificado X.509 verificado pela cadeia de autoridade confiável. Portas ativas: ${openPorts.map(p => p.port).join(', ')}.`;
    } else if (tlsHandshakeResult && !tlsHandshakeResult.authorized && tlsHandshakeResult.version) {
      entry.status = 'PARCIAL';
      entry.details = `Handshake TLS bem-sucedido, porém certificado com advertência (${tlsHandshakeResult.error || 'Autoassinado / Mismatch'}).`;
    } else if (hasOpenPorts) {
      entry.status = 'PARCIAL';
      entry.details = `Conexão TCP estabelecida em portas HTTP/Proxy (${openPorts.map(p => p.port).join(', ')}), porém sem TLS HTTPS válido.`;
    } else {
      entry.status = 'FALHOU';
      entry.failureReason = 'Nenhuma das portas testadas (80, 443, 8080, 8443) respondeu a conexões TCP.';
      entry.details = `Timeout ou recusa em todas as portas de teste. Servidor indisponível ou filtrado.`;
    }

    return entry;
  }

  /**
   * Return database contents as an array
   */
  public getDiscoveredList(operator?: string, status?: string): DiscoveredDomain[] {
    const list = Array.from(this.database.values());
    return list.filter(item => {
      if (operator && operator !== 'AMBAS' && item.operator !== 'AMBAS' && item.operator !== operator) {
        return false;
      }
      if (status && status !== 'all' && item.status !== status) {
        return false;
      }
      return true;
    });
  }

  /**
   * Return comprehensive engine metrics
   */
  public getStats(): DiscoveryEngineStats {
    const list = Array.from(this.database.values());
    const compatible = list.filter(d => d.status === 'COMPATÍVEL').length;
    const partial = list.filter(d => d.status === 'PARCIAL').length;
    const blocked = list.filter(d => d.status === 'BLOQUEIO POSSÍVEL').length;
    const failed = list.filter(d => d.status === 'FALHOU' || d.status === 'TLS COM FALHA' || d.status === 'DNS COM FALHA').length;
    const tested = list.filter(d => d.status !== 'DESCOBERTO').length;

    return {
      totalDiscovered: list.length,
      newlyDiscoveredSession: this.newlyDiscoveredInSession,
      testedCount: tested,
      compatibleCount: compatible,
      partialCount: partial,
      blockedCount: blocked,
      failedCount: failed,
      activeSources: [
        'Certificate Transparency (crt.sh)',
        'Web Crawler (Link Extractor)',
        'DNS Wordlist Resolver',
        'Public Directory (HackerTarget)'
      ],
      lastDiscoveryRun: this.lastRunTimestamp,
      continuousModeEnabled: this.continuousEnabled
    };
  }

  /**
   * Toggle continuous background discovery and re-testing
   */
  public toggleContinuousMode(enable: boolean, intervalMinutes: number = 10): boolean {
    this.continuousEnabled = enable;
    if (this.continuousTimer) {
      clearInterval(this.continuousTimer);
      this.continuousTimer = null;
    }

    if (enable) {
      this.continuousIntervalMs = Math.max(5, intervalMinutes) * 60 * 1000;
      this.continuousTimer = setInterval(async () => {
        try {
          console.log('[Continuous Discovery] Executando ciclo de atualização automática...');
          await this.runDiscovery('AMBAS');
        } catch (e) {
          console.warn('[Continuous Discovery] Erro no ciclo periódico:', e);
        }
      }, this.continuousIntervalMs);
    }

    return this.continuousEnabled;
  }
}
