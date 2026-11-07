import React from 'react';
import { 
  ConnectionStatus, 
  OperatorType, 
  VpnServer, 
  VpnProfile 
} from '../types/vpn';
import { EarthGlobeVisualizer } from '../components/EarthGlobeVisualizer';
import { PowerButton } from '../components/PowerButton';
import { OperatorSelector } from '../components/OperatorSelector';
import { MetricsBar } from '../components/MetricsBar';
import { 
  Server, 
  Layers, 
  ChevronRight, 
  Radar, 
  Stethoscope, 
  Zap,
  Globe2
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface HomeViewProps {
  status: ConnectionStatus;
  operator: OperatorType;
  onSelectOperator: (op: OperatorType) => void;
  onToggleVpn: () => void;
  currentServer: VpnServer;
  currentProfile: VpnProfile;
  speedDown: number;
  speedUp: number;
  bytesIn: number;
  bytesOut: number;
  durationSec: number;
  clientIp: string;
  isp: string;
  onNavigateTab: (tab: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  status,
  operator,
  onSelectOperator,
  onToggleVpn,
  currentServer,
  currentProfile,
  speedDown,
  speedUp,
  bytesIn,
  bytesOut,
  durationSec,
  clientIp,
  isp,
  onNavigateTab
}) => {
  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* 1. Holographic 3D Earth Globe with Central Circular Power Button */}
      <EarthGlobeVisualizer status={status}>
        <PowerButton
          status={status}
          onToggle={onToggleVpn}
        />
      </EarthGlobeVisualizer>

      {/* 2. Speeds Card with ECG Waveform & Status Chips Row */}
      <MetricsBar
        status={status}
        speedDown={speedDown}
        speedUp={speedUp}
        bytesIn={bytesIn}
        bytesOut={bytesOut}
        durationSec={durationSec}
        ip={clientIp}
        isp={isp}
        serverPing={currentServer.ping}
      />

      {/* 3. Operator Switch Bar (UNITEL & AFRICELL) */}
      <OperatorSelector
        currentOperator={operator}
        onSelectOperator={onSelectOperator}
        disabled={status === 'connecting'}
      />

      {/* 4. Active Server & Profile Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Active Server Card */}
        <div 
          onClick={() => {
            sounds.playClick();
            onNavigateTab('servidores');
          }}
          className="bg-[#071329]/70 hover:bg-[#091a38] border border-blue-500/25 hover:border-cyan-400/50 p-3 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md active:scale-98 group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl filter drop-shadow">{currentServer.flag}</span>
            <div className="min-w-0">
              <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 font-bold">
                <Server className="w-3 h-3" />
                <span>SERVIDOR SELECIONADO</span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate">
                {currentServer.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentServer.city} • <span className="text-emerald-400 font-semibold">{currentServer.ping} ms</span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </div>

        {/* Active Profile Card */}
        <div 
          onClick={() => {
            sounds.playClick();
            onNavigateTab('perfis');
          }}
          className="bg-[#071329]/70 hover:bg-[#091a38] border border-blue-500/25 hover:border-blue-400/50 p-3 rounded-2xl cursor-pointer transition-all duration-300 backdrop-blur-md active:scale-98 group flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] text-blue-400 font-mono flex items-center gap-1 font-bold">
                <Layers className="w-3 h-3" />
                <span>PERFIL WIREGUARD</span>
              </div>
              <div className="font-bold text-xs sm:text-sm text-white truncate">
                {currentProfile.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                MTU {currentProfile.interfaceConfig.mtu} • Keepalive {currentProfile.peerConfig.persistentKeepalive}s
              </div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
        </div>
      </div>
    </div>
  );
};
