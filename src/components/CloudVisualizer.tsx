import React from 'react';
import { ConnectionStatus } from '../types/vpn';
import { Cloud, CloudLightning, CloudOff, RefreshCw, Zap } from 'lucide-react';

interface CloudVisualizerProps {
  status: ConnectionStatus;
  speedDown: number;
  speedUp: number;
}

export const CloudVisualizer: React.FC<CloudVisualizerProps> = ({
  status,
  speedDown,
  speedUp
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';
  const isError = status === 'error';

  // Format speed for display
  const formatSpeed = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB/s`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB/s`;
    return `${bytes} B/s`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center my-4 py-2 select-none">
      {/* Ambient background glow */}
      <div 
        className={`absolute w-64 h-32 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
          isConnected
            ? 'bg-cyan-500/20 scale-125'
            : isConnecting
            ? 'bg-blue-500/20 scale-100 animate-pulse'
            : isError
            ? 'bg-rose-500/20 scale-100'
            : 'bg-transparent scale-75 opacity-0'
        }`}
      />

      {/* Cloud Container */}
      <div className="relative flex items-center justify-center">
        {/* Animated radar rings when connecting */}
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-28 h-28 rounded-full border border-cyan-400/40 animate-ping" />
            <div className="w-36 h-36 rounded-full border border-blue-500/20 animate-pulse" />
          </div>
        )}

        {/* Orbiting data particles when connected */}
        {isConnected && (
          <div className="absolute -inset-6 pointer-events-none overflow-visible">
            {/* Particle 1 */}
            <div className="absolute top-2 left-6 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff] animate-bounce" style={{ animationDuration: '2.4s' }} />
            {/* Particle 2 */}
            <div className="absolute bottom-4 right-8 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#2979ff] animate-ping" style={{ animationDuration: '3s' }} />
            {/* Particle 3 */}
            <div className="absolute top-8 right-4 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_8px_#10b981] animate-pulse" style={{ animationDuration: '1.8s' }} />
          </div>
        )}

        {/* Main Cloud Body */}
        <div 
          className={`relative z-10 p-5 rounded-3xl transition-all duration-700 backdrop-blur-md ${
            isConnected
              ? 'bg-gradient-to-b from-cyan-950/70 via-slate-900/80 to-[#0b1020]/90 border border-cyan-400/50 glow-cyan animate-float shadow-2xl'
              : isConnecting
              ? 'bg-slate-900/70 border border-blue-500/40 shadow-lg scale-95'
              : isError
              ? 'bg-rose-950/40 border border-rose-500/30'
              : 'bg-slate-900/30 border border-slate-800/40 opacity-40 scale-90'
          }`}
        >
          {isConnected ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Glowing Active Cloud ☁️ */}
                <svg className="w-20 h-20 text-cyan-400 filter drop-shadow-[0_0_16px_rgba(0,229,255,0.7)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" className="fill-cyan-500/20" />
                  {/* Internal data stream lines inside cloud */}
                  <path d="M10 13h4" stroke="#ffffff" strokeWidth="2" strokeDasharray="2 2" className="animate-pulse" />
                  <path d="M9 16h6" stroke="#00e5ff" strokeWidth="1.5" />
                </svg>

                {/* Secure Shield Badge on the cloud */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full p-1 shadow-md shadow-cyan-500/50">
                  <Zap className="w-3.5 h-3.5 text-black fill-black" />
                </div>
              </div>

              {/* Real-time throughput indicators under cloud */}
              <div className="mt-2 flex items-center gap-3 font-mono text-[11px]">
                <span className="flex items-center gap-1 text-cyan-300 font-semibold bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  <span className="text-cyan-400">↓</span> {formatSpeed(speedDown)}
                </span>
                <span className="flex items-center gap-1 text-blue-300 font-semibold bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-500/30">
                  <span className="text-blue-400">↑</span> {formatSpeed(speedUp)}
                </span>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="flex flex-col items-center py-1 px-4">
              <div className="relative mb-2">
                <Cloud className="w-16 h-16 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-cyan-300 animate-spin" />
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-300 tracking-wide font-medium">
                Sincronizando túnel seguro...
              </span>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-1 px-4">
              <CloudOff className="w-16 h-16 text-rose-400" />
              <span className="text-xs font-mono text-rose-300 mt-1">
                Falha na rota do túnel
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center py-1 px-4">
              {/* Dormant / Inactive Cloud */}
              <Cloud className="w-14 h-14 text-slate-600 stroke-[1.25]" />
              <span className="text-[11px] font-mono text-slate-500 mt-1">
                Nuvem Conexões VPN inativa
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
