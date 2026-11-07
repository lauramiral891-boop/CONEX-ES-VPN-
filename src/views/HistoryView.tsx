import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Plus, 
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { ConnectionEvent } from '../types/vpn';
import { sounds } from '../utils/audio';

interface HistoryViewProps {
  events: ConnectionEvent[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  events,
  onClearHistory
}) => {
  const [filter, setFilter] = useState<'Tudo' | 'VPN' | 'Scanner' | 'Diagnóstico'>('Tudo');

  // Interactive timeline events matching Screen 7
  const timelineItems = [
    {
      id: 'item-1',
      date: 'Hoje • 14:32',
      status: 'Conectado - 12m 34s',
      type: 'connected',
      category: 'VPN'
    },
    {
      id: 'item-2',
      date: 'Hoje • 13:15',
      status: 'Desconectado',
      type: 'disconnected',
      category: 'VPN'
    },
    {
      id: 'item-3',
      date: 'Ontem • 20:17',
      status: 'Conectado - 2h 21m',
      type: 'connected',
      category: 'VPN'
    },
    {
      id: 'item-4',
      date: 'Ontem • 17:09',
      status: 'Erro de Handshake TLS',
      type: 'warning',
      category: 'Scanner'
    },
    {
      id: 'item-5',
      date: '15/05 • 11:22',
      status: 'Conectado - 1h 12m',
      type: 'connected',
      category: 'VPN'
    }
  ];

  const filteredItems = timelineItems.filter(item => {
    if (filter === 'Tudo') return true;
    return item.category === filter;
  });

  const handleExportHistory = () => {
    sounds.playClick();
    const headers = 'Data,Status,Categoria\n';
    const rows = filteredItems.map(i => `"${i.date}","${i.status}","${i.category}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conexoes_vpn_historico_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* Header matching Screen 7 */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-lg font-black text-white tracking-wide">
          Histórico de Conexões
        </h2>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { sounds.playClick(); onClearHistory(); }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
            title="Limpar Histórico"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs matching Screen 7: Tudo, VPN, Scanner, Diagnóstico */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['Tudo', 'VPN', 'Scanner', 'Diagnóstico'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { sounds.playClick(); setFilter(tab); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              filter === tab
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#061226]/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline List matching Screen 7 with vertical line and glowing status dots */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 space-y-4 backdrop-blur-md relative">
        <div className="relative pl-6 space-y-5">
          {/* Vertical connecting line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-[2px] bg-blue-500/30" />

          {filteredItems.map((item) => (
            <div key={item.id} className="relative flex items-center justify-between gap-3">
              {/* Timeline Status Node Dot */}
              <div 
                className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center border ${
                  item.type === 'connected'
                    ? 'bg-[#00e676]/20 border-[#00e676] text-[#00ff88] shadow-[0_0_8px_#00e676]'
                    : item.type === 'disconnected'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-amber-500/20 border-amber-500 text-amber-400'
                }`}
              >
                {item.type === 'connected' ? (
                  <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                ) : item.type === 'disconnected' ? (
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>

              {/* Event Content */}
              <div>
                <div className="text-xs font-mono text-slate-400">
                  {item.date}
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {item.status}
                </div>
              </div>

              {/* Right Status Icon */}
              <div>
                {item.type === 'connected' ? (
                  <div className="w-6 h-6 rounded-full bg-[#00e676]/20 flex items-center justify-center text-[#00ff88]">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : item.type === 'disconnected' ? (
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <X className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Exportar Histórico Action Button matching Screen 7 */}
      <div className="pt-2">
        <button
          onClick={handleExportHistory}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Histórico</span>
        </button>
      </div>
    </div>
  );
};
