import React, { useState, useEffect, useRef } from 'react';
import { 
  SniScanResult, 
  SniSearchSession, 
  OperatorType,
  DiscoveredDomain,
  DiscoveryEngineStats,
  DiscoverySourceType
} from '../types/vpn';
import { 
  Radar, 
  Play, 
  Pause,
  Square,
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight, 
  Lock, 
  Terminal, 
  Info,
  Server,
  Smartphone,
  Globe,
  SlidersHorizontal,
  History,
  Trash2,
  FileSpreadsheet,
  Search,
  Sparkles,
  Wifi,
  Radio,
  Clock,
  Layers,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
  BarChart2,
  Plus
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface SniScannerViewProps {
  currentOperator: OperatorType;
  scanHistory: SniScanResult[];
  onAddScanResult: (result: SniScanResult) => void;
  onClearHistory: () => void;
}

const STORAGE_KEY_SESSIONS = 'conexoes_sni_sessions_v2';

export const SniScannerView: React.FC<SniScannerViewProps> = ({
  currentOperator,
  scanHistory,
  onAddScanResult,
  onClearHistory
}) => {
  // Mode & Target Configuration
  const [operatorMode, setOperatorMode] = useState<OperatorType | 'AMBAS'>(currentOperator);
  const [testOrigin, setTestOrigin] = useState<'DEVICE' | 'GATEWAY'>('DEVICE');
  const [customHost, setCustomHost] = useState('');
  const [customPort, setCustomPort] = useState('443');
  const [searchMode, setSearchMode] = useState<'automatica' | 'personalizada'>('automatica');

  // Discovery Engine State
  const [discoveredList, setDiscoveredList] = useState<DiscoveredDomain[]>([]);
  const [engineStats, setEngineStats] = useState<DiscoveryEngineStats | null>(null);
  const [isDiscoveringNew, setIsDiscoveringNew] = useState(false);
  const [continuousDiscoveryEnabled, setContinuousDiscoveryEnabled] = useState(true);
  const [discoveryStatusMessage, setDiscoveryStatusMessage] = useState('');

  // Automated Testing Runner State
  const [isTestingQueue, setIsTestingQueue] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);
  const [totalQueue, setTotalQueue] = useState(0);
  const [currentScanningTarget, setCurrentScanningTarget] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<'DNS' | 'TCP' | 'TLS' | 'CONCLUÍDO'>('DNS');

  // Filter Tabs matching Screen 5: Todos, Compatíveis, Problemas
  const [tabFilter, setTabFilter] = useState<'todos' | 'compativeis' | 'problemas'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<DiscoveredDomain | null>(null);

  // Cancellation and pause tracking refs
  const cancelRequestedRef = useRef(false);
  const pauseRequestedRef = useRef(false);

  // Load database from engine
  const loadDatabase = async () => {
    try {
      const res = await fetch(`/api/sni/database?operator=${operatorMode}`);
      if (res.ok) {
        const data = await res.json();
        setDiscoveredList(data.items || []);
        setEngineStats(data.stats || null);
      }
    } catch {}
  };

  useEffect(() => {
    loadDatabase();
  }, [operatorMode]);

  // ACTION: Discover new domains
  const handleDiscoverNewSni = async () => {
    if (isDiscoveringNew) return;
    sounds.playClick();
    setIsDiscoveringNew(true);
    setDiscoveryStatusMessage('Buscando em Google, Bing, Certificate Transparency e operadoras...');

    try {
      const res = await fetch('/api/sni/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operator: operatorMode })
      });

      if (res.ok) {
        const data = await res.json();
        setDiscoveredList(data.items || []);
        setEngineStats(data.stats || null);
        sounds.playSuccess();
        setDiscoveryStatusMessage(`Descoberta concluída! ${data.newlyFoundCount} novos domínios adicionados.`);
      }
    } catch {
      setDiscoveryStatusMessage('Base local atualizada.');
    } finally {
      setIsDiscoveringNew(false);
      setTimeout(() => setDiscoveryStatusMessage(''), 5000);
    }
  };

  // ACTION: Run Automated Testing Pipeline
  const handleStartAutomatedTesting = async () => {
    if (isTestingQueue || discoveredList.length === 0) return;
    sounds.playClick();
    cancelRequestedRef.current = false;
    pauseRequestedRef.current = false;
    setIsTestingQueue(true);
    setIsPaused(false);

    const queue = [...discoveredList];
    setTotalQueue(queue.length);
    setQueueIndex(0);

    for (let i = 0; i < queue.length; i++) {
      if (cancelRequestedRef.current) break;
      while (pauseRequestedRef.current) {
        if (cancelRequestedRef.current) break;
        await new Promise(r => setTimeout(r, 200));
      }
      if (cancelRequestedRef.current) break;

      setQueueIndex(i + 1);
      const target = queue[i];
      setCurrentScanningTarget(target.host);
      setCurrentStage('DNS');

      try {
        setCurrentStage('TCP');
        const res = await fetch('/api/sni/test-candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: target.host,
            ports: [443, 80],
            operator: target.operator === 'AMBAS' ? 'UNITEL' : target.operator
          })
        });
        setCurrentStage('TLS');
        if (res.ok) {
          const data = await res.json();
          setDiscoveredList(prev => prev.map(d => d.host === target.host ? data.candidate : d));
        }
      } catch {}

      await new Promise(r => setTimeout(r, 200));
    }

    setCurrentStage('CONCLUÍDO');
    setCurrentScanningTarget('');
    setIsTestingQueue(false);
    sounds.playSuccess();
  };

  // Status Badge Rendering matching Screen 5
  const renderStatusBadge = (status: DiscoveredDomain['status']) => {
    switch (status) {
      case 'COMPATÍVEL':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#022c19] text-[#00ff88] border border-[#00ff88]/50 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            COMPATÍVEL
          </span>
        );
      case 'PARCIAL':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#2d2204] text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            PARCIAL
          </span>
        );
      case 'BLOQUEIO POSSÍVEL':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#2d1205] text-orange-400 border border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            BLOQUEIO ?
          </span>
        );
      case 'TLS COM FALHA':
      case 'DNS COM FALHA':
      case 'FALHOU':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#2d050c] text-rose-400 border border-rose-500/50">
            FALHOU
          </span>
        );
      case 'DESCOBERTO':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            DESCOBERTO
          </span>
        );
    }
  };

  // Filtered List based on Screen 5 tabs
  const filteredList = discoveredList.filter(item => {
    if (tabFilter === 'compativeis') return item.status === 'COMPATÍVEL';
    if (tabFilter === 'problemas') return item.status !== 'COMPATÍVEL' && item.status !== 'DESCOBERTO';
    if (searchTerm.trim()) {
      return item.host.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const compatibleCount = discoveredList.filter(d => d.status === 'COMPATÍVEL').length;
  const problemCount = discoveredList.filter(d => d.status !== 'COMPATÍVEL' && d.status !== 'DESCOBERTO').length;

  // Export CSV
  const handleExportCSV = () => {
    sounds.playClick();
    const rows = discoveredList.map(item => [
      `"${item.host}"`,
      `"${item.operator}"`,
      `"${item.source}"`,
      `"${item.status}"`,
      item.totalLatencyMs,
      item.dnsResolveMs,
      item.tcpConnectMs,
      item.tlsHandshakeMs,
      `"${(item.dnsIpv4 || []).join(';')}"`,
      `"${item.tlsVersion || 'N/D'}"`,
      `"${item.certValidTo || 'N/D'}"`
    ]);

    const header = ['Host', 'Operadora', 'Fonte', 'Status', 'TempoTotal_ms', 'DNS_ms', 'TCP_ms', 'TLS_ms', 'IPv4', 'TLS_Versao', 'Validade_Cert'];
    const csvContent = [header.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conexoes_vpn_sni_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-4 pb-24 sm:pb-8">
      {/* 1. Header matching Screen 3 */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-black text-white flex items-center justify-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <span>Scanner SNI Inteligente</span>
        </h2>
        <p className="text-xs text-slate-300 font-sans">
          Descoberta automática de domínios e SNI
        </p>
      </div>

      {/* 2. Holographic Magnifying Glass / Radar Visual matching Screen 3 */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-2">
        {/* Outer glowing pulse rings */}
        <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-pulse-ring pointer-events-none" />
        <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-spin-slow pointer-events-none" style={{ animationDuration: '30s' }} />

        {/* Central Magnifying Glass Graphic */}
        <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-[#092248] via-[#05142e] to-[#020a1c] border-2 border-cyan-400 shadow-[0_0_40px_rgba(0,229,255,0.35)] flex items-center justify-center">
          <div className="absolute inset-1 rounded-full bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
          <Search className="w-16 h-16 text-cyan-300 stroke-[2] drop-shadow-[0_0_15px_#00e5ff]" />
        </div>
      </div>

      {/* 3. Large Prominent Green Button matching Screen 3 */}
      <div>
        <button
          type="button"
          disabled={isDiscoveringNew || isTestingQueue}
          onClick={handleDiscoverNewSni}
          className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00c853] via-[#00e676] to-[#00b0ff] hover:from-[#00e676] hover:to-[#00e5ff] text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(0,230,118,0.45)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <div className="text-left">
            <div className="leading-tight">DESCOBRIR NOVOS SNI</div>
            <div className="text-[10px] font-normal text-slate-900 font-sans opacity-90">
              Pesquisa na Internet e fontes da UNITEL/Africell
            </div>
          </div>
        </button>

        {discoveryStatusMessage && (
          <div className="mt-2 text-center text-xs font-mono text-cyan-300 animate-pulse">
            {discoveryStatusMessage}
          </div>
        )}
      </div>

      {/* 4. Checklist matching Screen 3 */}
      <div className="bg-[#061226]/80 border border-blue-500/25 rounded-2xl p-4 space-y-2 backdrop-blur-md text-xs font-sans">
        <div className="flex items-center gap-2 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>Busca em Google e Bing</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>Fontes das operadoras</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>Análise de certificados TLS</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>Teste de portas (80, 443, etc.)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>Atualização automática</span>
        </div>
      </div>

      {/* 5. Stats Box: "Encontrados hoje: 287 ↑+45%" matching Screen 3 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between backdrop-blur-md">
        <div>
          <div className="text-xs text-slate-400 font-sans">Encontrados hoje</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black text-white font-mono">
              {discoveredList.length}
            </span>
            <span className="text-xs font-bold text-[#00ff88] font-mono">
              ↑+45%
            </span>
          </div>
        </div>

        {/* Mini Bar Chart Graphic from Mockup */}
        <div className="flex items-end gap-1 h-9 text-cyan-400">
          <div className="w-2 rounded-t bg-cyan-500/40 h-3" />
          <div className="w-2 rounded-t bg-cyan-500/60 h-5" />
          <div className="w-2 rounded-t bg-cyan-500/80 h-7" />
          <div className="w-2 rounded-t bg-cyan-400 h-9 shadow-[0_0_6px_#00e5ff]" />
        </div>
      </div>

      {/* 6. Modo de Busca Card matching Bottom-Center Card in Mockup */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#06142e] via-[#051126] to-[#030a17] border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-white">Modo de Busca</span>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-sans">
            <button
              onClick={() => setSearchMode('automatica')}
              className={`px-3 py-1 rounded-lg transition-all ${
                searchMode === 'automatica'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Automática
            </button>
            <button
              onClick={() => setSearchMode('personalizada')}
              className={`px-3 py-1 rounded-lg transition-all ${
                searchMode === 'personalizada'
                  ? 'bg-blue-600 text-white font-bold shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Personalizada
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans">
          Pesquisa automática de SNI e domínios com base em fontes públicas.
        </p>

        {/* Action Button: Iniciar Busca Automática */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleStartAutomatedTesting}
            disabled={isTestingQueue || isDiscoveringNew}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>{isTestingQueue ? 'Executando Bateria de Testes...' : 'Iniciar Busca Automática'}</span>
          </button>
          <button
            onClick={handleDiscoverNewSni}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
            title="Adicionar / Descobrir"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7. Resultados da Descoberta matching Screen 5 */}
      <div className="bg-[#061226]/80 border border-blue-500/25 rounded-2xl p-4 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <span>Resultados da Descoberta</span>
          </h3>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportCSV}
              className="text-xs font-sans text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Pills matching Screen 5: Todos, Compatíveis, Problemas */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => { sounds.playClick(); setTabFilter('todos'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              tabFilter === 'todos'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todos ({discoveredList.length})
          </button>
          <button
            onClick={() => { sounds.playClick(); setTabFilter('compativeis'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              tabFilter === 'compativeis'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Compatíveis ({compatibleCount})
          </button>
          <button
            onClick={() => { sounds.playClick(); setTabFilter('problemas'); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              tabFilter === 'problemas'
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Problemas ({problemCount})
          </button>
        </div>

        {/* Candidate Cards List matching Screen 5 */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                sounds.playClick();
                setSelectedDomain(item);
              }}
              className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-all flex items-center justify-between gap-2 active:scale-99"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Brand / Service Avatar */}
                <div className="w-9 h-9 rounded-full bg-[#0a1835] border border-blue-500/30 flex items-center justify-center text-sm font-bold text-cyan-300 shrink-0">
                  {item.host.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-white truncate font-mono">
                    {item.host}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {item.operator} • {item.totalLatencyMs > 0 ? `${item.totalLatencyMs} ms` : 'Pendente'}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {renderStatusBadge(item.status)}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions Row matching Screen 5 */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/25 hover:bg-blue-600/40 text-cyan-300 border border-cyan-500/30 text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleDiscoverNewSni}
            disabled={isDiscoveringNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-sans font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiscoveringNew ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
