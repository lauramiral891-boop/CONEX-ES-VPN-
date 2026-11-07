import React, { useState } from 'react';
import { 
  Home, 
  Server, 
  Layers, 
  Radar, 
  Stethoscope, 
  BarChart3, 
  History, 
  Settings, 
  Info,
  MoreHorizontal,
  X,
  Cpu
} from 'lucide-react';
import { sounds } from '../utils/audio';

export type TabId = 
  | 'inicio'
  | 'servidores'
  | 'perfis'
  | 'scanner-sni'
  | 'hacker-ai'
  | 'diagnostico'
  | 'estatisticas'
  | 'historico'
  | 'configuracoes'
  | 'sobre';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainBottomTabs = [
    { id: 'inicio' as TabId, label: 'Início', icon: Home },
    { id: 'servidores' as TabId, label: 'Servidores', icon: Server },
    { id: 'scanner-sni' as TabId, label: 'Scanner', icon: Radar },
  ];

  const moreTabs = [
    { id: 'hacker-ai' as TabId, label: 'Motor Hacker AI', icon: Cpu, desc: 'Radar neural, telemetria profunda e Zero-Rating' },
    { id: 'diagnostico' as TabId, label: 'Diagnóstico de Rede', icon: Stethoscope, desc: 'Testes de MTU, DNS e conectividade' },
    { id: 'estatisticas' as TabId, label: 'Estatísticas Avançadas', icon: BarChart3, desc: 'Gráficos de tráfego e velocidade' },
    { id: 'historico' as TabId, label: 'Histórico de Conexões', icon: History, desc: 'Registro de conexões e eventos' },
    { id: 'configuracoes' as TabId, label: 'Configurações', icon: Settings, desc: 'Kill Switch, DNS, preferências' },
    { id: 'perfis' as TabId, label: 'Gestão de Perfis', icon: Layers, desc: 'Configurações WireGuard e túnel' },
    { id: 'sobre' as TabId, label: 'Sobre o App', icon: Info, desc: 'Tecnologia Conexões VPN v2.0.0' }
  ];

  const isMoreActive = moreTabs.some(t => t.id === activeTab);

  return (
    <>
      {/* Top Desktop/Tablet Scrollable Tab Bar */}
      <nav className="w-full bg-[#050c1b]/90 border-b border-blue-500/20 backdrop-blur-md sticky top-[61px] z-30 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-1 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'inicio' as TabId, label: 'Início', icon: Home },
              { id: 'servidores' as TabId, label: 'Servidores', icon: Server },
              { id: 'scanner-sni' as TabId, label: 'Scanner SNI', icon: Radar },
              { id: 'hacker-ai' as TabId, label: 'Hacker AI', icon: Cpu },
              { id: 'diagnostico' as TabId, label: 'Diagnóstico', icon: Stethoscope },
              { id: 'estatisticas' as TabId, label: 'Estatísticas', icon: BarChart3 },
              { id: 'historico' as TabId, label: 'Histórico', icon: History },
              { id: 'configuracoes' as TabId, label: 'Configurações', icon: Settings },
              { id: 'perfis' as TabId, label: 'Perfis', icon: Layers },
              { id: 'sobre' as TabId, label: 'Sobre', icon: Info },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (activeTab !== item.id) {
                      sounds.playClick();
                      onSelectTab(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/25 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,229,255,0.25)] font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Fixed Bottom Mobile Navigation Bar matching Screen 1/2/3/4/8 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#040a17]/95 border-t border-blue-500/20 backdrop-blur-xl px-4 py-2 sm:hidden">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {mainBottomTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectTab(item.id);
                }}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-cyan-500/20 text-cyan-300 drop-shadow-[0_0_8px_#00e5ff]' : ''}`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className={`text-[10px] font-sans font-medium mt-0.5 ${isActive ? 'font-bold text-cyan-300' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* "Mais" Menu Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowMoreMenu(true);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
              isMoreActive ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isMoreActive ? 'bg-cyan-500/20 text-cyan-300 drop-shadow-[0_0_8px_#00e5ff]' : ''}`}>
              <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] font-sans font-medium mt-0.5 ${isMoreActive ? 'font-bold text-cyan-300' : ''}`}>
              Mais
            </span>
          </button>
        </div>
      </div>

      {/* "Mais" Drawer Modal on Mobile */}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-sm sm:hidden animate-fade-in">
          <div className="bg-[#071329] border-t-2 border-cyan-500/40 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">Outros Módulos</span>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950 text-cyan-400 border border-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white">{item.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
