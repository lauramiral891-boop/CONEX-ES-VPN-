import React, { useState, useEffect } from 'react';
import { 
  ConnectionStatus, 
  OperatorType, 
  VpnServer, 
  VpnProfile, 
  SniScanResult, 
  ConnectionEvent, 
  AppSettings 
} from './types/vpn';
import { INITIAL_SERVERS } from './data/servers';
import { INITIAL_PROFILES } from './data/profiles';
import { Header } from './components/Header';
import { Navigation, TabId } from './components/Navigation';
import { HomeView } from './views/HomeView';
import { ServersView } from './views/ServersView';
import { ProfilesView } from './views/ProfilesView';
import { SniScannerView } from './views/SniScannerView';
import { HackerAiView } from './views/HackerAiView';
import { DiagnosticsView } from './views/DiagnosticsView';
import { StatisticsView } from './views/StatisticsView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';
import { AboutView } from './views/AboutView';
import { SuccessModal } from './components/SuccessModal';
import { sounds } from './utils/audio';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('inicio');
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // VPN State
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [operator, setOperator] = useState<OperatorType>('UNITEL');
  const [networkType, setNetworkType] = useState<'WIFI' | 'CELLULAR'>('CELLULAR');

  // Servers & Profiles
  const [servers, setServers] = useState<VpnServer[]>(INITIAL_SERVERS);
  const [currentServer, setCurrentServer] = useState<VpnServer>(INITIAL_SERVERS[0]);
  const [profiles, setProfiles] = useState<VpnProfile[]>(INITIAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<VpnProfile>(INITIAL_PROFILES[0]);

  // Live Metrics
  const [speedDown, setSpeedDown] = useState<number>(0);
  const [speedUp, setSpeedUp] = useState<number>(0);
  const [bytesIn, setBytesIn] = useState<number>(142500000); // 142 MB initial session base
  const [bytesOut, setBytesOut] = useState<number>(38200000);  // 38 MB initial session base
  const [durationSec, setDurationSec] = useState<number>(0);
  const [clientIp, setClientIp] = useState<string>('102.165.34.88');
  const [isp, setIsp] = useState<string>('Unitel S.A.');

  // Scanner & History
  const [scanHistory, setScanHistory] = useState<SniScanResult[]>([]);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionEvent[]>([
    {
      id: 'evt-1',
      type: 'CONNECT',
      server: 'Luanda — Unitel Direct Edge',
      operator: 'UNITEL',
      timestamp: 'Hoje, 09:30',
      durationSec: 1845,
      bytesIn: 84500000,
      bytesOut: 19400000,
      ipAssigned: '197.149.201.12'
    },
    {
      id: 'evt-2',
      type: 'HANDOVER',
      server: 'Luanda — Africell Turbo Node',
      operator: 'AFRICELL',
      timestamp: 'Ontem, 21:15',
      durationSec: 3620,
      bytesIn: 184500000,
      bytesOut: 45200000,
      ipAssigned: '196.11.238.45',
      reason: 'Alternância automática de Wi-Fi para 4G LTE'
    }
  ]);

  // App Settings
  const [settings, setSettings] = useState<AppSettings>({
    killSwitch: false,
    splitTunneling: false,
    autoReconnect: true,
    maxReconnectRetries: 5,
    dnsProvider: 'cloudflare',
    customDnsPrimary: '1.1.1.1',
    customDnsSecondary: '1.0.0.1',
    mtu: 1360,
    persistentNotification: true,
    batteryOptimization: true,
    soundFeedback: true,
    hapticFeedback: true,
    preferWireGuardUDP: true
  });

  // Fetch client IP info from backend on mount and on operator change
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch('/api/ip-info');
        const data = await res.json();
        setClientIp(data.ip || '102.165.34.88');
        setIsp(data.isp || (operator === 'UNITEL' ? 'Unitel S.A.' : 'Africell Angola'));
      } catch {
        // Fallback
      }
    };
    fetchIp();
  }, [operator, status]);

  // Handle operator switch
  const handleSelectOperator = (newOp: OperatorType) => {
    setOperator(newOp);
    // Find optimized server for new operator if available
    const optimized = servers.find(s => s.operatorOptimized === newOp);
    if (optimized) {
      setCurrentServer(optimized);
    }
    // Find matching profile
    const profileMatch = profiles.find(p => p.carrierPreset === newOp);
    if (profileMatch) {
      setCurrentProfile(profileMatch);
    }
  };

  // Live session timer & bandwidth ticker
  useEffect(() => {
    let interval: any = null;
    if (status === 'connected') {
      interval = setInterval(() => {
        setDurationSec(prev => prev + 1);

        // Natural random jitter for realistic speed
        const currentDown = Math.floor(Math.random() * 2800000) + 1400000; // 1.4 MB/s - 4.2 MB/s
        const currentUp = Math.floor(Math.random() * 850000) + 250000;   // 250 KB/s - 1.1 MB/s

        setSpeedDown(currentDown);
        setSpeedUp(currentUp);
        setBytesIn(prev => prev + currentDown);
        setBytesOut(prev => prev + currentUp);
      }, 1000);
    } else {
      setSpeedDown(0);
      setSpeedUp(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  // Hook up native Android VpnService Bridge listener
  useEffect(() => {
    (window as any).onNativeVpnEvent = (
      state: string,
      serverIp: string,
      speedDownBytes: number,
      speedUpBytes: number,
      totalBytesIn: number,
      totalBytesOut: number,
      duration: number,
      errorMessage?: string
    ) => {
      if (state === 'CONNECTED') {
        setStatus('connected');
        setShowSuccessModal(true);
        setSpeedDown(speedDownBytes);
        setSpeedUp(speedUpBytes);
        setBytesIn(totalBytesIn);
        setBytesOut(totalBytesOut);
        setDurationSec(duration);
        sounds.playSuccess();
      } else if (state === 'DISCONNECTED') {
        setStatus('disconnected');
        setSpeedDown(0);
        setSpeedUp(0);
        sounds.playDisconnect();
      } else if (state === 'RECONNECTING') {
        setStatus('reconnecting');
      } else if (state === 'ERROR') {
        setStatus('error');
        sounds.playDisconnect();
        console.error('Erro WireGuard nativo:', errorMessage);
      }
    };
  }, []);

  // Main Toggle VPN Action (Connect / Disconnect)
  const handleToggleVpn = async () => {
    if (status === 'connecting' || status === 'reconnecting') return;

    // 1. If running inside native Android WebView, invoke native VpnService via bridge!
    if ((window as any).AndroidVpnBridge) {
      if (status === 'connected') {
        (window as any).AndroidVpnBridge.stopVpn?.();
        setStatus('disconnected');
        setDurationSec(0);
      } else {
        setStatus('connecting');
        const configToSend = currentProfile.rawConfig || `[Interface]
PrivateKey = ${currentProfile.interfaceConfig.privateKey}
Address = ${currentProfile.interfaceConfig.address}
DNS = ${currentProfile.interfaceConfig.dns}
MTU = ${currentProfile.interfaceConfig.mtu}

[Peer]
PublicKey = ${currentProfile.peerConfig.publicKey}
Endpoint = ${currentProfile.peerConfig.endpoint}
AllowedIPs = ${currentProfile.peerConfig.allowedIPs}
PersistentKeepalive = ${currentProfile.peerConfig.persistentKeepalive}`;

        (window as any).AndroidVpnBridge.startVpn?.(
          currentServer.name,
          currentServer.ip,
          operator,
          configToSend
        );
      }
      return;
    }

    // 2. Standalone web / backend mode
    if (status === 'connected') {
      // Disconnect
      try {
        await fetch('/api/vpn/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'disconnect' })
        });
      } catch {}

      // Add to connection history
      const newEvent: ConnectionEvent = {
        id: `evt-${Date.now()}`,
        type: 'DISCONNECT',
        server: currentServer.name,
        operator,
        timestamp: 'Agora',
        durationSec,
        bytesIn,
        bytesOut,
        ipAssigned: currentServer.ip
      };
      setConnectionHistory(prev => [newEvent, ...prev]);

      setStatus('disconnected');
      setDurationSec(0);
    } else {
      // Start Connection (A Conectar...)
      setStatus('connecting');

      try {
        await fetch('/api/vpn/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'connect',
            server: currentServer.id,
            operator
          })
        });
      } catch {}

      // Realistic connection negotiation delay (1.4 seconds)
      setTimeout(() => {
        setStatus('connected');
        setShowSuccessModal(true);
        sounds.playSuccess();
      }, 1400);
    }
  };

  // Toggle Network Type (Simulate Wi-Fi <-> Cellular Handover)
  const handleToggleNetworkType = () => {
    const nextType = networkType === 'WIFI' ? 'CELLULAR' : 'WIFI';
    setNetworkType(nextType);

    if (status === 'connected') {
      // Trigger smooth WireGuard reconnection handover
      setStatus('reconnecting');
      sounds.playClick();

      setTimeout(() => {
        setStatus('connected');
        sounds.playSuccess();

        // Add handover record to history
        setConnectionHistory(prev => [
          {
            id: `evt-handover-${Date.now()}`,
            type: 'HANDOVER',
            server: currentServer.name,
            operator,
            timestamp: 'Agora',
            durationSec,
            bytesIn,
            bytesOut,
            ipAssigned: currentServer.ip,
            reason: `Handover concluído para interface ${nextType === 'WIFI' ? 'wlan0' : 'rmnet0'}`
          },
          ...prev
        ]);
      }, 1200);
    }
  };

  // Profile additions & deletions
  const handleAddProfile = (newProfile: VpnProfile) => {
    setProfiles(prev => [newProfile, ...prev]);
    setCurrentProfile(newProfile);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (currentProfile.id === id && profiles.length > 1) {
      setCurrentProfile(profiles.filter(p => p.id !== id)[0]);
    }
  };

  const handleApplyProfileConfig = (rawConfig: string, profileName: string) => {
    const newProfile: VpnProfile = {
      id: `prof-ai-${Date.now()}`,
      name: profileName,
      protocol: 'WireGuard',
      carrierPreset: operator,
      createdAt: new Date().toLocaleDateString('pt-AO'),
      isCustom: true,
      rawConfig,
      interfaceConfig: {
        privateKey: 'aAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
        address: '10.8.0.2/24',
        dns: '1.1.1.1',
        mtu: 1360
      },
      peerConfig: {
        publicKey: 'bBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=',
        endpoint: `${operator.toLowerCase()}-node.conexoesvpn.ao:51820`,
        allowedIPs: '0.0.0.0/0',
        persistentKeepalive: 25
      }
    };
    setProfiles(prev => [newProfile, ...prev]);
    setCurrentProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Header with Logo Conexões VPN */}
      <Header
        status={status}
        operator={operator}
        networkType={networkType}
        onToggleNetworkType={handleToggleNetworkType}
        onNavigateTab={(tab) => setActiveTab(tab as TabId)}
      />

      {/* 2. Top Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* 3. Main Views Area */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'inicio' && (
          <HomeView
            status={status}
            operator={operator}
            onSelectOperator={handleSelectOperator}
            onToggleVpn={handleToggleVpn}
            currentServer={currentServer}
            currentProfile={currentProfile}
            speedDown={speedDown}
            speedUp={speedUp}
            bytesIn={bytesIn}
            bytesOut={bytesOut}
            durationSec={durationSec}
            clientIp={clientIp}
            isp={isp}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'servidores' && (
          <ServersView
            servers={servers}
            currentServerId={currentServer.id}
            onSelectServer={(s) => {
              setCurrentServer(s);
              setActiveTab('inicio');
            }}
            operator={operator}
            onUpdateServers={setServers}
          />
        )}

        {activeTab === 'perfis' && (
          <ProfilesView
            profiles={profiles}
            currentProfileId={currentProfile.id}
            onSelectProfile={(p) => {
              setCurrentProfile(p);
              setActiveTab('inicio');
            }}
            onAddProfile={handleAddProfile}
            onDeleteProfile={handleDeleteProfile}
            operator={operator}
          />
        )}

        {activeTab === 'scanner-sni' && (
          <SniScannerView
            currentOperator={operator}
            scanHistory={scanHistory}
            onAddScanResult={(res) => setScanHistory(prev => [res, ...prev])}
            onClearHistory={() => setScanHistory([])}
          />
        )}

        {activeTab === 'hacker-ai' && (
          <HackerAiView
            currentOperator={operator}
            onSelectOperator={handleSelectOperator}
            onApplyProfileConfig={(cfg, name) => {
              handleApplyProfileConfig(cfg, name);
              setActiveTab('inicio');
            }}
          />
        )}

        {activeTab === 'diagnostico' && (
          <DiagnosticsView
            status={status}
            operator={operator}
            clientIp={clientIp}
          />
        )}

        {activeTab === 'estatisticas' && (
          <StatisticsView
            status={status}
            operator={operator}
            currentServer={currentServer}
            speedDown={speedDown}
            speedUp={speedUp}
            bytesIn={bytesIn}
            bytesOut={bytesOut}
            durationSec={durationSec}
          />
        )}

        {activeTab === 'historico' && (
          <HistoryView
            events={connectionHistory}
            onClearHistory={() => setConnectionHistory([])}
          />
        )}

        {activeTab === 'configuracoes' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {activeTab === 'sobre' && (
          <AboutView />
        )}
      </main>

      {/* Success Modal ("Tudo Certo!") shown on connection */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
