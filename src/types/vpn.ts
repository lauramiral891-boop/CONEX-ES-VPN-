export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

export type OperatorType = 'UNITEL' | 'AFRICELL';

export interface VpnServer {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  flag: string;
  ip: string;
  port: number;
  protocol: 'WireGuard' | 'V2Ray' | 'Shadowsocks';
  ping: number;
  load: number; // 0 - 100%
  isRecommended?: boolean;
  operatorOptimized?: OperatorType;
  isFavorite?: boolean;
}

export interface WireguardInterface {
  privateKey: string;
  address: string;
  dns: string;
  mtu: number;
}

export interface WireguardPeer {
  publicKey: string;
  presharedKey?: string;
  endpoint: string;
  allowedIPs: string;
  persistentKeepalive: number;
}

export interface VpnProfile {
  id: string;
  name: string;
  protocol: 'WireGuard' | 'V2Ray' | 'Shadowsocks';
  carrierPreset?: OperatorType | 'UNIVERSAL';
  interfaceConfig: WireguardInterface;
  peerConfig: WireguardPeer;
  rawConfig?: string;
  createdAt: string;
  lastUsed?: string;
  isCustom?: boolean;
}

export interface SniScanResult {
  id: string;
  host: string;
  port: number;
  operator: OperatorType;
  timestamp: string;
  status: 'COMPATÍVEL' | 'PARCIAL' | 'FALHOU' | 'BLOQUEIO POSSÍVEL' | 'DNS COM FALHA' | 'TLS COM FALHA';
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number;
  totalTimeMs: number;
  resolvedIps: string[];
  tlsVersion?: string;
  cipher?: string;
  certSubject?: string;
  certIssuer?: string;
  certValidTo?: string;
  certAuthorized?: boolean;
  certError?: string;
  certChainTrusted?: boolean;
  failureReason?: string;
  details: string;
  technicalLog?: string[];
  origin?: 'Dispositivo Móvel (Nativo / SIM)' | 'Servidor Gateway (Nuvem / Edge)';
  networkInterface?: 'WIFI' | 'CELLULAR';
  category?: string;
}

export type DiscoverySourceType = 
  | 'Certificate Transparency (crt.sh)'
  | 'Web Crawler (Link Extractor)'
  | 'DNS Wordlist Resolver'
  | 'Public Directory (HackerTarget)'
  | 'Manual / Preset';

export interface TestedPortResult {
  port: number;
  protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'TLS-ALT';
  isOpen: boolean;
  timeMs: number;
  status: 'ABERTO' | 'FECHADO' | 'TIMEOUT' | 'RESET' | 'ERRO';
}

export interface DiscoveredDomain {
  id: string;
  host: string;
  operator: OperatorType | 'AMBAS';
  source: DiscoverySourceType;
  firstDiscoveredAt: string;
  lastCheckedAt: string;
  status: 'COMPATÍVEL' | 'PARCIAL' | 'BLOQUEIO POSSÍVEL' | 'TLS COM FALHA' | 'DNS COM FALHA' | 'FALHOU' | 'DESCOBERTO';
  dnsIpv4: string[];
  dnsIpv6: string[];
  testedPorts: TestedPortResult[];
  preferredPort: number;
  dnsResolveMs: number;
  tcpConnectMs: number;
  tlsHandshakeMs: number;
  totalLatencyMs: number;
  tlsVersion?: string;
  cipherSuite?: string;
  certSubject?: string;
  certIssuer?: string;
  certValidTo?: string;
  certAuthorized?: boolean;
  certChainTrusted?: boolean;
  failureReason?: string;
  details: string;
  origin: 'Dispositivo Móvel (Nativo / SIM)' | 'Servidor Gateway (Nuvem / Edge)';
  networkInterface?: 'WIFI' | 'CELLULAR';
  category?: string;
}

export interface DiscoveryEngineStats {
  totalDiscovered: number;
  newlyDiscoveredSession: number;
  testedCount: number;
  compatibleCount: number;
  partialCount: number;
  blockedCount: number;
  failedCount: number;
  activeSources: string[];
  lastDiscoveryRun: string;
  continuousModeEnabled: boolean;
}

export interface SniSearchSession {
  id: string;
  timestamp: string;
  operator: OperatorType | 'AMBAS';
  origin: 'Dispositivo Móvel (Nativo / SIM)' | 'Servidor Gateway (Nuvem / Edge)';
  totalScanned: number;
  compatibleCount: number;
  partialCount: number;
  blockedCount: number;
  failedCount: number;
  results: SniScanResult[];
  discoveredList?: DiscoveredDomain[];
}

export interface NetworkDiagnostic {
  id: string;
  title: string;
  category: 'dns' | 'tunnel' | 'latency' | 'handover' | 'leak' | 'route';
  status: 'pending' | 'running' | 'pass' | 'warn' | 'fail';
  summary: string;
  details: string;
  metric?: string;
}

export interface ConnectionEvent {
  id: string;
  type: 'CONNECT' | 'DISCONNECT' | 'RECONNECT' | 'HANDOVER' | 'ERROR';
  server: string;
  operator: OperatorType;
  timestamp: string;
  durationSec: number;
  bytesIn: number;
  bytesOut: number;
  ipAssigned: string;
  reason?: string;
}

export interface AppSettings {
  killSwitch: boolean;
  splitTunneling: boolean;
  autoReconnect: boolean;
  maxReconnectRetries: number;
  dnsProvider: 'cloudflare' | 'google' | 'adguard' | 'quad9' | 'custom';
  customDnsPrimary: string;
  customDnsSecondary: string;
  mtu: number;
  persistentNotification: boolean;
  batteryOptimization: boolean;
  soundFeedback: boolean;
  hapticFeedback: boolean;
  preferWireGuardUDP: boolean;
}

// ================= HACKER AI & ZERO-RATING TYPES =================

export type HackerAiStatus =
  | 'SNI ENCONTRADO'
  | 'DNS FUNCIONAL'
  | 'TLS FUNCIONAL'
  | 'PORTA DISPONÍVEL'
  | 'SERVIDOR COMPATÍVEL'
  | 'CONEXÃO VPN FUNCIONAL'
  | 'ACESSO PATROCINADO CONFIRMADO'
  | 'ACESSO NORMAL'
  | 'FALHA NA CONEXÃO';

export interface SshProbeResult {
  port: number;
  isOpen: boolean;
  banner?: string;
  timeMs: number;
  protocolVersion?: string;
  status: 'SSH_ONLINE' | 'SSH_CLOSED' | 'SSH_TIMEOUT';
}

export interface HttpProxyProbeResult {
  port: number;
  isOpen: boolean;
  allowsConnect: boolean;
  statusCode?: number;
  timeMs: number;
  status: 'PROXY_ALLOW' | 'PROXY_DENIED' | 'NOT_A_PROXY' | 'TIMEOUT';
}

export interface ZeroRatingDomain {
  id: string;
  host: string;
  name: string;
  operator: OperatorType | 'AMBAS';
  category: 'Banca & Finanças' | 'Governo & Institucional' | 'Educação' | 'Operadora Self-Care' | 'Utilidade Pública';
  officialZeroRated: boolean;
  tariffExemptionVerified: boolean;
  expectedPorts: number[];
  testedStatus?: HackerAiStatus;
  httpStatus?: number;
  headersDetected?: string[];
  lastTestedAt?: string;
  description: string;
}

export interface FullConnectivityReport {
  id: string;
  host: string;
  operator: OperatorType;
  timestamp: string;
  overallStatus: HackerAiStatus;
  dns: {
    ipv4: string[];
    ipv6: string[];
    timeMs: number;
    status: 'OK' | 'FAIL';
  };
  tcpPorts: TestedPortResult[];
  tls: {
    tested: boolean;
    timeMs: number;
    authorized: boolean;
    version?: string;
    cipher?: string;
    certSubject?: string;
    certIssuer?: string;
    validTo?: string;
    error?: string;
  };
  ssh: SshProbeResult;
  httpProxy: HttpProxyProbeResult;
  zeroRating?: {
    isZeroRated: boolean;
    status: 'ACESSO PATROCINADO CONFIRMADO' | 'ACESSO NORMAL' | 'DESCONHECIDO';
    details: string;
  };
  totalLatencyMs: number;
  technicalSummary: string;
  aiRecommendation?: string;
}

export interface HackerAiAnalysisResult {
  timestamp: string;
  targetHost: string;
  operator: OperatorType;
  overallAssessment: 'EXCELENTE_PARA_TUNEL' | 'COMPATIVEL_COM_RESSALVAS' | 'BLOQUEIO_OPERADORA' | 'INVIAVEL';
  suggestedMtu: number;
  suggestedPort: number;
  suggestedKeepalive: number;
  firewallObservation: string;
  explanation: string;
  recommendedProfileConfig?: string;
}

export interface CyberLogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DISCOVERY' | 'TLS_PROBE' | 'ZERO_RATING' | 'AI_ANALYSIS' | 'WARN' | 'ERROR';
  message: string;
  host?: string;
  extra?: Record<string, any>;
}
