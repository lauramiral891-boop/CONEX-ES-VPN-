import React from 'react';
import { 
  ShieldAlert, 
  RotateCw, 
  Lock, 
  Bell, 
  Moon, 
  Globe, 
  Info, 
  ChevronRight 
} from 'lucide-react';
import { AppSettings } from '../types/vpn';
import { sounds } from '../utils/audio';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onNavigateTab?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigateTab
}) => {
  const toggle = (key: keyof AppSettings) => {
    sounds.playClick();
    const updated = { ...settings, [key]: !settings[key] };
    if (key === 'soundFeedback') {
      sounds.setEnabled(Boolean(updated.soundFeedback));
    }
    onUpdateSettings(updated);
  };

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* Header matching Screen 8 */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-lg font-black text-white tracking-wide">
          Configurações
        </h2>
      </div>

      {/* Settings List matching Screen 8 */}
      <div className="space-y-2.5">
        {/* 1. Kill Switch */}
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Kill Switch</div>
              <div className="text-[11px] text-slate-400 font-sans">Bloqueia o tráfego se a VPN cair</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggle('killSwitch')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.killSwitch ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.killSwitch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 2. Reconexão Automática */}
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Reconexão Automática</div>
              <div className="text-[11px] text-slate-400 font-sans">Reconecta em caso de queda</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggle('autoReconnect')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.autoReconnect ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.autoReconnect ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 3. DNS Criptografado */}
        <div 
          onClick={() => {
            sounds.playClick();
          }}
          className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-cyan-400/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">DNS Criptografado</div>
              <div className="text-[11px] text-slate-400 font-sans">Cloudflare (1.1.1.1)</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {/* 4. Notificações */}
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Notificações</div>
              <div className="text-[11px] text-slate-400 font-sans">Alertas e status da conexão</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => toggle('persistentNotification')}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              settings.persistentNotification ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                settings.persistentNotification ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* 5. Tema */}
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-cyan-400/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Tema</div>
              <div className="text-[11px] text-slate-400 font-sans">Escuro</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {/* 6. Idioma */}
        <div className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-cyan-400/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Idioma</div>
              <div className="text-[11px] text-slate-400 font-sans">Português</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {/* 7. Sobre o App */}
        <div 
          onClick={() => {
            sounds.playClick();
            if (onNavigateTab) onNavigateTab('sobre');
          }}
          className="p-3.5 rounded-2xl bg-[#061226]/80 border border-blue-500/25 flex items-center justify-between gap-3 backdrop-blur-md cursor-pointer hover:border-cyan-400/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white font-sans">Sobre o App</div>
              <div className="text-[11px] text-slate-400 font-sans">Conexões VPN v2.0.0</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>
      </div>
    </div>
  );
};
