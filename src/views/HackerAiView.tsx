import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Search, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Server,
  Globe,
  Layers,
  Flame,
  Check
} from 'lucide-react';
import { 
  OperatorType, 
  FullConnectivityReport, 
  HackerAiAnalysisResult, 
  CyberLogEntry, 
  ZeroRatingDomain,
  HackerAiStatus,
  VpnProfile
} from '../types/vpn';
import { CyberRadar } from '../components/CyberRadar';
import { CyberConsole } from '../components/CyberConsole';
import { sounds } from '../utils/audio';

interface HackerAiViewProps {
  currentOperator: OperatorType;
  onSelectOperator: (op: OperatorType) => void;
  onApplyProfileConfig?: (config: string, serverName: string) => void;
}

export const HackerAiView: React.FC<HackerAiViewProps> = ({
  currentOperator,
  onSelectOperator,
  onApplyProfileConfig
}) => {
  const [operator, setOperator] = useState<OperatorType>(currentOperator);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [inputHost, setInputHost] = useState<string>('portal.unitel.ao');
  const [currentReport, setCurrentReport] = useState<FullConnectivityReport | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<HackerAiAnalysisResult | null>(null);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [zeroRatingDomains, setZeroRatingDomains] = useState<ZeroRatingDomain[]>([]);
  const [copiedConfig, setCopiedConfig] = useState<boolean>(false);
  const [injectedSuccess, setInjectedSuccess] = useState<boolean>(false);

  // Live Cyber Logs
  const [logs, setLogs] = useState<CyberLogEntry[]>([
    {
      id: 'log-0',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: 'Motor Hacker AI inicializado. Núcleo neural e probers prontos.'
    },
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'INFO',
      message: `Rede ativa selecionada: ${currentOperator} (Angola). Módulo Zero-Rating carregado.`
    }
  ]);

  const addLog = (level: CyberLogEntry['level'], message: string, host?: string) => {
    setLogs(prev => [
      ...prev.slice(-150), // keep last 150 entries
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        host
      }
    ]);
  };

  // Sync operator prop
  useEffect(() => {
    setOperator(currentOperator);
    setInputHost(currentOperator === 'UNITEL' ? 'portal.unitel.ao' : 'africell.ao');
  }, [currentOperator]);

  // Load zero-rating catalog for operator
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch(`/api/zero-rating/catalog?operator=${operator}`);
        const data = await res.json();
        setZeroRatingDomains(data.domains || []);
      } catch (err) {
        console.error('Erro ao carregar catálogo zero-rating:', err);
      }
    };
    fetchCatalog();
  }, [operator]);

  // Radar Targets synthesized from zero-rating catalog + discovered domains
  const radarTargets = zeroRatingDomains.map((d, index) => {
    const angle = (index * 42) % 360;
    const distance = 0.35 + ((index * 0.12) % 0.55);
    return {
      id: d.id,
      host: d.host,
      operator: d.operator,
      angle,
      distance,
      status: d.officialZeroRated ? ('COMPATÍVEL' as const) : ('PARCIAL' as const),
      latencyMs: 18 + ((index * 7) % 35)
    };
  });

  // Run full connectivity probe
  const handleRunFullProbe = async (targetHost: string) => {
    const clean = targetHost.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    if (!clean) return;

    sounds.playClick();
    setIsScanning(true);
    setCurrentReport(null);
    setAiAnalysis(null);
    setInjectedSuccess(false);

    addLog('DISCOVERY', `Iniciando bateria completa de conectividade para ${clean} (Rede: ${operator})`, clean);

    try {
      addLog('DISCOVERY', `Consultando registros DNS IPv4 e IPv6...`, clean);
      const res = await fetch('/api/hacker-ai/connectivity-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ host: clean, operator })
      });
      const report: FullConnectivityReport = await res.json();
      setCurrentReport(report);

      // Log results
      if (report.dns.status === 'OK') {
        addLog('INFO', `DNS OK em ${report.dns.timeMs}ms: [${report.dns.ipv4.join(', ')}]`, clean);
      } else {
        addLog('WARN', `DNS Falhou para ${clean}`, clean);
      }

      report.tcpPorts.forEach(p => {
        addLog('INFO', `Porta ${p.port} (${p.protocol}): ${p.status} (${p.timeMs}ms)`, clean);
      });

      if (report.tls.tested) {
        addLog(
          report.tls.authorized ? 'TLS_PROBE' : 'WARN',
          `TLS Handshake: ${report.tls.version || 'TLS'} (${report.tls.cipher || 'Cifra negociada'}) - Autorizado: ${report.tls.authorized ? 'SIM' : 'NÃO'}`,
          clean
        );
      }

      if (report.ssh.isOpen) {
        addLog('INFO', `SSH Detectado na porta 22: ${report.ssh.banner || 'OK'}`, clean);
      }

      if (report.zeroRating?.isZeroRated) {
        addLog('ZERO_RATING', `Acesso Patrocinado Confirmado para ${clean} na operadora ${operator}!`, clean);
      }

      addLog('INFO', `Status Geral: ${report.overallStatus} (Latência total: ${report.totalLatencyMs}ms)`, clean);
      sounds.playSuccess();

      // Trigger automatic AI analysis
      triggerAiAnalysis(report);
    } catch (err: any) {
      addLog('ERROR', `Erro durante o teste de conectividade: ${err.message}`, clean);
      sounds.playDisconnect();
    } finally {
      setIsScanning(false);
    }
  };

  // Trigger Gemini 3.8 Flash Neural Analysis
  const triggerAiAnalysis = async (report: FullConnectivityReport) => {
    setIsAiAnalyzing(true);
    addLog('AI_ANALYSIS', `Invocando motor de inteligência neural (Gemini 3.8 Flash)...`, report.host);

    try {
      const res = await fetch('/api/hacker-ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report, operator })
      });
      const analysis: HackerAiAnalysisResult = await res.json();
      setAiAnalysis(analysis);
      addLog('AI_ANALYSIS', `Avaliação Neural: ${analysis.overallAssessment}. MTU recomendado: ${analysis.suggestedMtu}`, report.host);
    } catch (err: any) {
      addLog('ERROR', `Falha na análise neural da IA: ${err.message}`, report.host);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Handle command from console
  const handleExecuteCommand = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts[1];

    if (command === 'clear') {
      setLogs([]);
    } else if (command === 'probe' && arg) {
      setInputHost(arg);
      handleRunFullProbe(arg);
    } else if (command === 'scan') {
      handleRunFullProbe(inputHost);
    } else if (command === 'zerorating') {
      addLog('ZERO_RATING', `Catálogo ativo: ${zeroRatingDomains.length} domínios patrocinados para ${operator}.`);
    } else if (command === 'ai' && currentReport) {
      triggerAiAnalysis(currentReport);
    } else {
      addLog('WARN', `Comando desconhecido: "${cmd}". Tente: probe <host>, scan, ai, zerorating, clear`);
    }
  };

  // Quick Inject into active WireGuard Profile
  const handleInjectCandidate = () => {
    if (!currentReport || !aiAnalysis) return;
    sounds.playSuccess();

    const config = aiAnalysis.recommendedProfileConfig || `[Interface]
PrivateKey = aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=
Address = 10.8.0.2/24
DNS = 1.1.1.1
MTU = ${aiAnalysis.suggestedMtu}

[Peer]
PublicKey = bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=
Endpoint = ${currentReport.host}:${aiAnalysis.suggestedPort}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = ${aiAnalysis.suggestedKeepalive}`;

    onApplyProfileConfig?.(config, `Hacker AI — ${currentReport.host} (${operator})`);
    setInjectedSuccess(true);
    addLog('INFO', `Configuração otimizada com ${currentReport.host} injetada no perfil WireGuard ativo!`);
    setTimeout(() => setInjectedSuccess(false), 3000);
  };

  const getStatusBadgeClass = (status: HackerAiStatus) => {
    switch (status) {
      case 'ACESSO PATROCINADO CONFIRMADO':
      case 'SERVIDOR COMPATÍVEL':
      case 'CONEXÃO VPN FUNCIONAL':
        return 'bg-emerald-500/20 text-[#00ff88] border-emerald-500/40 shadow-[0_0_12px_rgba(0,255,136,0.3)]';
      case 'TLS FUNCIONAL':
      case 'PORTA DISPONÍVEL':
      case 'SNI ENCONTRADO':
      case 'DNS FUNCIONAL':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'ACESSO NORMAL':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header Banner with Cyberpunk Aesthetic */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-r from-[#030d22] via-[#041635] to-[#020b1c] border border-cyan-500/40 shadow-2xl overflow-hidden">
        {/* Decorative Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #00e5ff 1px, transparent 1px), linear-gradient(to bottom, #00e5ff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono font-bold tracking-widest uppercase">
                MOTOR HACKER AI v3.0
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-[#00ff88]">
                <Radio className="w-3 h-3 animate-pulse" />
                GEMINI 3.8 FLASH ATIVO
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Inteligência Neural de Redes & SNI</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans">
              Descoberta automática contínua de domínios públicos, testes profundos de conectividade e identificação de Zero-Rating para UNITEL e AFRICELL.
            </p>
          </div>

          {/* Strict Operator Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#020712]/90 border border-blue-500/30">
            <button
              onClick={() => {
                sounds.playClick();
                setOperator('UNITEL');
                onSelectOperator('UNITEL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                operator === 'UNITEL'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🟠 UNITEL</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setOperator('AFRICELL');
                onSelectOperator('AFRICELL');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                operator === 'AFRICELL'
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🟣 AFRICELL</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Split: Radar on the Left, Probe Launcher on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Cyber Radar & Target Matrix (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#030919] border border-blue-500/25 p-5 shadow-xl flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                RADAR TELECOM // {operator}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#00ff88]">
              {zeroRatingDomains.length} nós indexados
            </span>
          </div>

          {/* Interactive Holographic Radar */}
          <CyberRadar
            targets={radarTargets}
            isScanning={isScanning}
            selectedOperator={operator}
            onSelectTarget={(t) => {
              setInputHost(t.host);
              handleRunFullProbe(t.host);
            }}
          />

          {/* Radar Legend */}
          <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-around text-[10px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <span>Unitel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Africell</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CDN / Core</span>
            </div>
          </div>
        </div>

        {/* Right: Prober Form & Quick Metrics (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#030919] border border-blue-500/25 p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00ff88]" />
                DISPARO DE DIAGNÓSTICO PROFUNDO
              </span>
              <span className="text-[11px] font-mono text-cyan-300">
                DNS · TCP 80/443/8080/8443 · TLS · SSH · HTTP CONNECT
              </span>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#020612] border border-blue-500/40">
              <Globe className="w-5 h-5 text-cyan-400 ml-2 shrink-0" />
              <input
                type="text"
                value={inputHost}
                onChange={(e) => setInputHost(e.target.value)}
                placeholder="Ex: portal.unitel.ao ou bancobai.ao"
                className="flex-1 bg-transparent px-2 py-2 text-sm text-white placeholder-slate-500 font-mono focus:outline-none"
              />
              <button
                onClick={() => handleRunFullProbe(inputHost)}
                disabled={isScanning}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wide transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                  isScanning
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isScanning ? (
                  <>
                    <Radio className="w-3.5 h-3.5 animate-spin" />
                    <span>VARRENDO...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TESTAR AGORA</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Selector for Operator */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400">
              ALVOS OFICIAIS RECOMENDADOS ({operator}):
            </span>
            <div className="flex flex-wrap gap-2">
              {zeroRatingDomains.slice(0, 5).map(domain => (
                <button
                  key={domain.id}
                  onClick={() => {
                    setInputHost(domain.host);
                    handleRunFullProbe(domain.host);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                    inputHost === domain.host
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {domain.host}
                </button>
              ))}
            </div>
          </div>

          {/* Four Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-[#020612] border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">INDEXADOS</div>
              <div className="text-lg font-mono font-black text-white mt-0.5">{zeroRatingDomains.length}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#020612] border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">ZERO-RATING</div>
              <div className="text-lg font-mono font-black text-[#00ff88] mt-0.5">
                {zeroRatingDomains.filter(d => d.officialZeroRated).length}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#020612] border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">PORTAS ALVO</div>
              <div className="text-lg font-mono font-black text-cyan-300 mt-0.5">80 · 443 · 8443</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#020612] border border-slate-800 text-center">
              <div className="text-[10px] font-mono text-slate-400">IA MODEL</div>
              <div className="text-lg font-mono font-black text-purple-300 mt-0.5">GEMINI 3.8</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Real-Time Telemetry Diagnostic Report Card */}
      {currentReport && (
        <div className="rounded-3xl bg-[#030d22] border border-blue-500/40 p-6 shadow-2xl space-y-5 animate-fade-in">
          {/* Header row with Status Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs font-mono text-slate-400">RELATÓRIO TÉCNICO DE CONECTIVIDADE</div>
              <div className="text-xl font-mono font-black text-white mt-0.5">{currentReport.host}</div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-xl border text-xs font-mono font-bold tracking-wide ${getStatusBadgeClass(currentReport.overallStatus)}`}>
                {currentReport.overallStatus}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {currentReport.totalLatencyMs}ms total
              </span>
            </div>
          </div>

          {/* Sub-Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
            {/* DNS Card */}
            <div className="p-3.5 rounded-2xl bg-[#020713] border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>DNS IPv4/IPv6</span>
                <span className={currentReport.dns.status === 'OK' ? 'text-[#00ff88]' : 'text-rose-400'}>
                  {currentReport.dns.status}
                </span>
              </div>
              <div className="text-white font-bold truncate">
                {currentReport.dns.ipv4[0] || 'Sem IPv4'}
              </div>
              <div className="text-[10px] text-slate-500">
                Resolução em {currentReport.dns.timeMs}ms
              </div>
            </div>

            {/* TCP Ports Card */}
            <div className="p-3.5 rounded-2xl bg-[#020713] border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>PORTAS TCP</span>
                <span className="text-cyan-300">
                  {currentReport.tcpPorts.filter(p => p.isOpen).length} Abertas
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {currentReport.tcpPorts.map(p => (
                  <span
                    key={p.port}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      p.isOpen ? 'bg-emerald-500/20 text-[#00ff88]' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    :{p.port}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                80, 443, 8080, 8443 testadas
              </div>
            </div>

            {/* TLS Handshake Card */}
            <div className="p-3.5 rounded-2xl bg-[#020713] border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>TLS & SNI</span>
                <span className={currentReport.tls.authorized ? 'text-[#00ff88]' : 'text-amber-400'}>
                  {currentReport.tls.authorized ? 'X.509 VÁLIDO' : (currentReport.tls.version ? 'PARCIAL' : 'FECHADO')}
                </span>
              </div>
              <div className="text-white font-bold truncate">
                {currentReport.tls.version || 'Sem TLS'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentReport.tls.cipher || 'Handshake efetuado'}
              </div>
            </div>

            {/* Zero-Rating Status Card */}
            <div className="p-3.5 rounded-2xl bg-[#020713] border border-slate-800 space-y-1">
              <div className="text-slate-400 flex items-center justify-between">
                <span>ZERO-RATING</span>
                <span className={currentReport.zeroRating?.isZeroRated ? 'text-[#00ff88] font-bold' : 'text-slate-400'}>
                  {currentReport.zeroRating?.isZeroRated ? 'CONFIRMADO' : 'NORMAL'}
                </span>
              </div>
              <div className="text-white font-bold truncate">
                {operator}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {currentReport.zeroRating?.details || 'Navegação padrão'}
              </div>
            </div>
          </div>

          {/* AI Neural Analysis & Recommendations Box */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-[#020712] border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  PARECER NEURAL GEMINI 3.8 FLASH
                </span>
              </div>
              {isAiAnalyzing && (
                <span className="text-[11px] font-mono text-purple-300 animate-pulse">
                  Processando telemetria...
                </span>
              )}
            </div>

            {aiAnalysis ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="text-slate-200 leading-relaxed font-sans text-sm">
                  {aiAnalysis.explanation}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">AVALIAÇÃO GERAL</span>
                    <span className="text-[#00ff88] font-bold text-xs">{aiAnalysis.overallAssessment}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">MTU SUGERIDO</span>
                    <span className="text-cyan-300 font-bold text-xs">{aiAnalysis.suggestedMtu} bytes</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">PORTA DE TÚNEL</span>
                    <span className="text-purple-300 font-bold text-xs">Porta {aiAnalysis.suggestedPort}</span>
                  </div>
                </div>

                {/* Firewall & DPI observation */}
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-amber-400 font-bold">Observação de DPI: </span>
                  {aiAnalysis.firewallObservation}
                </div>

                {/* Action Buttons: Inject into WireGuard Profile */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleInjectCandidate}
                    className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      injectedSuccess
                        ? 'bg-[#00ff88] text-slate-950'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/30 active:scale-95'
                    }`}
                  >
                    {injectedSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>CONFIGURAÇÃO INJETADA!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>INJETAR NO PERFIL WIREGUARD ATIVO</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      if (aiAnalysis.recommendedProfileConfig) {
                        navigator.clipboard.writeText(aiAnalysis.recommendedProfileConfig);
                        setCopiedConfig(true);
                        setTimeout(() => setCopiedConfig(false), 2000);
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-mono cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedConfig ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : null}
                    <span>{copiedConfig ? 'Copiado!' : 'Copiar Config WireGuard'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 text-xs font-mono">
                Aguardando conclusão do diagnóstico neural...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Live Cyber Terminal Console */}
      <CyberConsole
        logs={logs}
        onExecuteCommand={handleExecuteCommand}
        onClearLogs={() => setLogs([])}
      />

      {/* 5. Zero-Rating Operator Catalog Inspector */}
      <div className="rounded-3xl bg-[#030919] border border-blue-500/25 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-mono font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00ff88]" />
              CATÁLOGO OFICIAL DE SERVIÇOS PATROCINADOS ({operator})
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Filtro rigoroso de serviços elegíveis a tráfego gratuito ou prioritário na rede angolana selecionada.
            </p>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-cyan-300">
            {zeroRatingDomains.length} domínios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {zeroRatingDomains.map(domain => (
            <div
              key={domain.id}
              className="p-3.5 rounded-2xl bg-[#020612] border border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-white truncate">
                    {domain.host}
                  </span>
                  {domain.officialZeroRated && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-[#00ff88] border border-emerald-500/30">
                      OFICIAL
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1 font-sans">
                  {domain.description}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-2">
                  <span>{domain.category}</span>
                  <span>·</span>
                  <span>Portas: {domain.expectedPorts.join(', ')}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setInputHost(domain.host);
                  handleRunFullProbe(domain.host);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-300 border border-slate-800 group-hover:border-cyan-400/40 transition-all text-[11px] font-mono cursor-pointer shrink-0"
              >
                Testar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
