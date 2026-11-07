import React, { useState } from 'react';
import { 
  BarChart3, 
  ArrowDown, 
  ArrowUp, 
  Clock, 
  Zap, 
  Plus,
  ChevronRight
} from 'lucide-react';
import { ConnectionStatus, OperatorType, VpnServer } from '../types/vpn';
import { sounds } from '../utils/audio';

interface StatisticsViewProps {
  status: ConnectionStatus;
  operator: OperatorType;
  currentServer: VpnServer;
  speedDown: number;
  speedUp: number;
  bytesIn: number;
  bytesOut: number;
  durationSec: number;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  status,
  operator,
  bytesIn,
  bytesOut,
  durationSec
}) => {
  const [period, setPeriod] = useState<'Hoje' | '7 Dias' | '30 Dias' | 'Todos'>('Hoje');

  // Apps usage matching Screen 6
  const appUsage = [
    { name: 'YouTube', icon: '▶️', color: 'bg-red-600', bytes: '5.2 GB' },
    { name: 'Chrome', icon: '🌐', color: 'bg-amber-500', bytes: '3.1 GB' },
    { name: 'WhatsApp', icon: '💬', color: 'bg-emerald-500', bytes: '1.8 GB' },
    { name: 'TikTok', icon: '🎵', color: 'bg-slate-900 border border-cyan-400', bytes: '1.4 GB' },
    { name: 'Telegram', icon: '✈️', color: 'bg-sky-500', bytes: '900 MB' },
  ];

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* Header matching Screen 6 */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-lg font-black text-white tracking-wide">
          Estatísticas Avançadas
        </h2>
        <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Period Tabs matching Screen 6 */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {(['Hoje', '7 Dias', '30 Dias', 'Todos'] as const).map((p) => (
          <button
            key={p}
            onClick={() => { sounds.playClick(); setPeriod(p); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer ${
              period === p
                ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.4)]'
                : 'bg-[#061226]/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Two Metric Cards: 12.4 GB Recebidos & 8.7 GB Enviados matching Screen 6 */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Recebidos */}
        <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 backdrop-blur-md space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-sans">
            <ArrowDown className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
            <span className="font-bold">12.4 GB</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Recebidos
          </div>
        </div>

        {/* Enviados */}
        <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 backdrop-blur-md space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-fuchsia-300 font-sans">
            <ArrowUp className="w-4 h-4 text-fuchsia-400 stroke-[2.5]" />
            <span className="font-bold">8.7 GB</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Enviados
          </div>
        </div>
      </div>

      {/* Neon Wave Area Chart matching Screen 6 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 backdrop-blur-md relative overflow-hidden">
        <div className="w-full h-36 relative">
          <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#2979ff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#061226" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00e5ff" />
                <stop offset="50%" stopColor="#2979ff" />
                <stop offset="100%" stopColor="#d946ef" />
              </linearGradient>
            </defs>

            {/* Grid horizontal guidelines */}
            <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Area Fill */}
            <path
              d="M0,80 Q40,40 80,60 T160,30 T240,70 T320,35 T400,60 L400,120 L0,120 Z"
              fill="url(#areaGrad)"
            />

            {/* Vibrant Line with Glow */}
            <path
              d="M0,80 Q40,40 80,60 T160,30 T240,70 T320,35 T400,60"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              className="filter drop-shadow-[0_0_8px_#00e5ff]"
            />
          </svg>
        </div>
      </div>

      {/* Summary Row matching Screen 6: Tempo Total & Velocidade Máx */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center gap-3 backdrop-blur-md">
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-cyan-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Tempo Total</div>
            <div className="text-sm font-bold text-white font-mono">12h 34m</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center gap-3 backdrop-blur-md">
          <div className="p-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-[#00ff88]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-sans">Velocidade Máx.</div>
            <div className="text-sm font-bold text-white font-mono">92 Mbps</div>
          </div>
        </div>
      </div>

      {/* Uso por Aplicativo matching Screen 6 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 space-y-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-white">Uso por Aplicativo</span>
          <span className="text-xs text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5">
            Ver Mais <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {appUsage.map(app => (
            <div key={app.name} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shadow-md ${app.color}`}>
                <span>{app.icon}</span>
              </div>
              <span className="text-[10px] text-slate-300 font-sans font-medium">{app.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
