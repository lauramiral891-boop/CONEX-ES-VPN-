import React, { useState } from 'react';
import { VpnServer, OperatorType } from '../types/vpn';
import { 
  Server, 
  Search, 
  RefreshCw, 
  Star, 
  Check, 
  Zap, 
  Signal,
  Rocket,
  Plus
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface ServersViewProps {
  servers: VpnServer[];
  currentServerId: string;
  onSelectServer: (server: VpnServer) => void;
  operator: OperatorType;
  onUpdateServers: (updated: VpnServer[]) => void;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  currentServerId,
  onSelectServer,
  operator,
  onUpdateServers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState<'Todos' | 'Angola' | 'Europa' | 'Américas'>('Todos');
  const [isPinging, setIsPinging] = useState(false);

  // Region filtering
  const filteredServers = servers.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterRegion === 'Angola') return s.countryCode === 'AO';
    if (filterRegion === 'Europa') return s.countryCode === 'PT' || s.countryCode === 'DE' || s.countryCode === 'UK';
    if (filterRegion === 'Américas') return s.countryCode === 'BR' || s.countryCode === 'US';
    return true;
  });

  // Teste de Ping em Massa
  const handleMassPingTest = async () => {
    sounds.playClick();
    setIsPinging(true);

    try {
      const pingPromises = servers.map(async (server) => {
        try {
          const res = await fetch('/api/vpn/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ host: server.ip })
          });
          const data = await res.json();
          return {
            ...server,
            ping: data.ping > 0 ? data.ping : server.ping
          };
        } catch {
          return server;
        }
      });

      const updated = await Promise.all(pingPromises);
      // Sort by ping lowest first
      updated.sort((a, b) => a.ping - b.ping);
      onUpdateServers(updated);
      sounds.playSuccess();
    } catch {
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* Header matching Screen 2 */}
      <div className="flex items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-white tracking-wide">
            Servidores Globais
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Adicionar Servidor Personalizado"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            type="button"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Region Filter Pills matching Screen 2 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['Todos', 'Angola', 'Europa', 'Américas'] as const).map((region) => (
          <button
            key={region}
            onClick={() => { sounds.playClick(); setFilterRegion(region); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
              filterRegion === region
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/50'
                : 'bg-[#071329]/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {region === 'Angola' ? '🇦🇴 Angola' : region}
          </button>
        ))}
      </div>

      {/* Server Cards List matching Screen 2 */}
      <div className="space-y-2.5">
        {filteredServers.map((server) => {
          const isSelected = server.id === currentServerId;

          return (
            <div
              key={server.id}
              onClick={() => {
                sounds.playClick();
                onSelectServer(server);
              }}
              className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 backdrop-blur-md active:scale-98 ${
                isSelected
                  ? 'bg-[#081b38] border-cyan-400 shadow-[0_0_25px_rgba(0,229,255,0.25)]'
                  : 'bg-[#061226]/80 hover:bg-[#071833] border-blue-500/20 hover:border-blue-500/40'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Flag / Avatar Circle */}
                <div className="w-10 h-10 rounded-full bg-[#0a1835] border border-blue-500/30 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  <span>{server.flag}</span>
                </div>

                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                    <span>{server.name}</span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_#00ff88]" />
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {server.country} • {server.city}
                  </div>
                </div>
              </div>

              {/* Latency and Signal Bars */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-mono font-bold flex items-center gap-1 ${
                  server.ping < 30 ? 'text-[#00ff88]' : server.ping < 80 ? 'text-cyan-300' : 'text-slate-300'
                }`}>
                  <span>{server.ping} ms</span>
                  {server.isRecommended ? (
                    <span className="text-amber-400 text-sm">⭐</span>
                  ) : (
                    <span className="text-emerald-400 text-xs">📶</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Teste de Ping em Massa Action Button matching Screen 2 */}
      <div className="pt-2">
        <button
          onClick={handleMassPingTest}
          disabled={isPinging}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Rocket className={`w-4 h-4 ${isPinging ? 'animate-bounce text-cyan-200' : ''}`} />
          <span>{isPinging ? 'Medindo Latência de Todos...' : '🚀 Teste de Ping em Massa'}</span>
        </button>
      </div>
    </div>
  );
};
