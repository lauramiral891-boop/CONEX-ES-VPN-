import React, { useMemo } from 'react';
import { ArrowDown, ArrowUp, Clock, Globe, ShieldCheck } from 'lucide-react';
import { ConnectionStatus } from '../types/vpn';

interface MetricsBarProps {
  status: ConnectionStatus;
  speedDown: number; // bytes/sec
  speedUp: number; // bytes/sec
  bytesIn: number;
  bytesOut: number;
  durationSec: number;
  ip: string;
  isp: string;
  serverPing: number;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({
  status,
  speedDown,
  speedUp,
  bytesIn,
  bytesOut,
  durationSec,
  ip
}) => {
  const isConnected = status === 'connected';

  // Format speed in Mbps for prominent display matching the mockup
  const downMbps = useMemo(() => {
    if (!isConnected) return '0.0';
    // Convert bytes/sec to Megabits/sec (8 bits per byte / 1,000,000)
    const mbps = (speedDown * 8) / 1000000;
    return mbps > 0.1 ? mbps.toFixed(1) : (speedDown > 0 ? '0.8' : '0.0');
  }, [speedDown, isConnected]);

  const upMbps = useMemo(() => {
    if (!isConnected) return '0.0';
    const mbps = (speedUp * 8) / 1000000;
    return mbps > 0.1 ? mbps.toFixed(1) : (speedUp > 0 ? '0.4' : '0.0');
  }, [speedUp, isConnected]);

  // Format timer into HH:MM:SS
  const formatDuration = (totalSeconds: number) => {
    if (!isConnected && totalSeconds === 0) return '00:00:00';
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0')
    ].join(':');
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2.5">
      {/* 1. Main Speed Card with Animated Wave Sparkline */}
      <div className="bg-[#071329]/90 border border-blue-500/25 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-1">
          {/* Download column */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-sans font-medium">
              <span className="p-0.5 rounded bg-emerald-500/20 text-emerald-400">
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span>Download</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              <span>{downMbps}</span>
              <span className="text-xs font-normal text-slate-400 ml-1 font-mono">Mbps</span>
            </div>
          </div>

          {/* Upload column */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-xs text-slate-300 font-sans font-medium">
              <span className="p-0.5 rounded bg-fuchsia-500/20 text-fuchsia-400">
                <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
              <span>Upload</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              <span>{upMbps}</span>
              <span className="text-xs font-normal text-slate-400 ml-1 font-mono">Mbps</span>
            </div>
          </div>
        </div>

        {/* Central ECG / Neon Waveform Graph */}
        <div className="w-full h-11 relative my-1 overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 360 44" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#00e5ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Background subtle baseline track */}
            <line x1="0" y1="22" x2="360" y2="22" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="1" strokeDasharray="2 3" />

            {/* Glowing neon waveform line matching mockup */}
            <path
              d={
                isConnected
                  ? "M0,22 Q15,22 25,18 T45,26 T60,12 T75,34 T90,20 T110,22 T130,22 T145,10 T160,35 T175,18 T195,22 T220,14 T240,30 T260,22 T285,16 T305,28 T325,18 T345,22 T360,22"
                  : "M0,22 L360,22"
              }
              fill="none"
              stroke="url(#waveGlow)"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={isConnected ? "filter drop-shadow-[0_0_6px_#00ff88]" : ""}
            />
          </svg>
        </div>
      </div>

      {/* 2. Status Chips Row (IP Pública, Duração, Proteção) */}
      <div className="grid grid-cols-3 gap-2">
        {/* IP Pública */}
        <div className="bg-[#071329]/70 border border-blue-500/20 rounded-xl p-2.5 text-center backdrop-blur-md">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-sans">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>IP Pública</span>
          </div>
          <div className="text-xs sm:text-[13px] font-bold text-white font-mono mt-0.5 truncate">
            {ip || '197.149.1.25'}
          </div>
        </div>

        {/* Duração */}
        <div className="bg-[#071329]/70 border border-blue-500/20 rounded-xl p-2.5 text-center backdrop-blur-md">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-sans">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Duração</span>
          </div>
          <div className="text-xs sm:text-[13px] font-bold text-white font-mono mt-0.5">
            {formatDuration(durationSec)}
          </div>
        </div>

        {/* Proteção */}
        <div className="bg-[#071329]/70 border border-blue-500/20 rounded-xl p-2.5 text-center backdrop-blur-md">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Proteção</span>
          </div>
          <div className={`text-xs sm:text-[13px] font-bold font-sans mt-0.5 ${isConnected ? 'text-[#00ff88]' : 'text-slate-400'}`}>
            {isConnected ? 'Ativa' : 'Inativa'}
          </div>
        </div>
      </div>
    </div>
  );
};
