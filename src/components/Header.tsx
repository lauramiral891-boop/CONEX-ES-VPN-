import React from 'react';
import { ShieldCheck, Wifi, Smartphone, Bell, Sparkles } from 'lucide-react';
import { ConnectionStatus, OperatorType } from '../types/vpn';
import { sounds } from '../utils/audio';

interface HeaderProps {
  status: ConnectionStatus;
  operator: OperatorType;
  onOpenNotifications?: () => void;
  networkType: 'WIFI' | 'CELLULAR';
  onToggleNetworkType: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  operator,
  networkType,
  onToggleNetworkType,
  onNavigateTab
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#040a18]/90 border-b border-blue-500/20 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Logo Conexões VPN with Key & Cloud emblem matching mockup */}
        <div 
          onClick={() => onNavigateTab('inicio')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {/* Cloud + Key Badge */}
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 p-[1.5px] shadow-[0_0_15px_rgba(0,229,255,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#061226] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <svg className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" className="fill-cyan-500/20" />
                <path d="m14 11 3 3" stroke="#fff" strokeWidth="2.2" />
                <path d="M11 14h.01" stroke="#fff" strokeWidth="3" />
                <circle cx="9.5" cy="15.5" r="2.5" stroke="#fff" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                Conexões VPN
              </span>
            </div>
            <p className="text-[11px] text-cyan-300/80 font-sans tracking-wide">
              Livre • Seguro • Sem Limites
            </p>
          </div>
        </div>

        {/* Right Header Status / Country Pill */}
        <div className="flex items-center gap-2">
          {/* Angola Gold Pill Badge from Mockup */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-500/20 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <span className="text-sm">🇦🇴</span>
            <span className="text-xs font-bold text-amber-300 font-sans tracking-wider">AO</span>
          </div>

          {/* Network Interface Switcher */}
          <button
            type="button"
            onClick={onToggleNetworkType}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#08162f] border border-blue-500/30 hover:border-cyan-400/50 text-slate-300 text-xs font-mono transition-all cursor-pointer"
            title="Alternar entre Dados Móveis e Wi-Fi"
          >
            {networkType === 'CELLULAR' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">4G Móvel</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Wi-Fi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
