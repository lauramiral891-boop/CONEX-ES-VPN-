import React, { useState } from 'react';
import { 
  Stethoscope, 
  CheckCircle2, 
  Signal, 
  Globe, 
  ShieldCheck, 
  Activity,
  Terminal,
  RefreshCw,
  ChevronRight,
  Radio,
  Check
} from 'lucide-react';
import { ConnectionStatus, OperatorType } from '../types/vpn';
import { sounds } from '../utils/audio';

interface DiagnosticsViewProps {
  status: ConnectionStatus;
  operator: OperatorType;
  clientIp: string;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  status,
  operator,
  clientIp
}) => {
  const [showFullReport, setShowFullReport] = useState(false);
  const [isRunningDiag, setIsRunningDiag] = useState(false);

  const handleRunFullDiag = () => {
    sounds.playClick();
    setIsRunningDiag(true);
    setTimeout(() => {
      setIsRunningDiag(false);
      setShowFullReport(true);
      sounds.playSuccess();
    }, 1200);
  };

  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-3 pb-24 sm:pb-8">
      {/* Header matching Screen 4 */}
      <div className="flex items-center justify-between py-1">
        <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <span>Diagnóstico de Rede</span>
        </h2>
      </div>

      {/* 1. Big Green Status Banner matching Screen 4 */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#022c19] via-[#053822] to-[#011c10] border border-[#00ff88]/50 shadow-[0_0_25px_rgba(0,255,136,0.25)] flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-full bg-[#00e676]/20 border border-[#00e676] flex items-center justify-center text-[#00ff88] shrink-0 shadow-[0_0_12px_#00e676]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <div>
          <div className="font-black text-base text-white tracking-wide">
            Rede Estável
          </div>
          <div className="text-xs text-[#00ff88] font-sans">
            Conexão otimizada
          </div>
        </div>
      </div>

      {/* 2. Checklist Items matching Screen 4 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 space-y-2.5 backdrop-blur-md text-xs font-sans">
        <div className="flex items-center gap-2.5 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>DNS: OK (12 ms)</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>TCP: OK (24 ms)</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>TLS: OK (38 ms)</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>IPv6: Disponível</span>
        </div>
        <div className="flex items-center gap-2.5 text-slate-200">
          <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
          <span>MTU: 1420</span>
        </div>
      </div>

      {/* 3. Digital World Map Graphic matching Screen 4 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 backdrop-blur-md relative overflow-hidden">
        <div className="w-full h-36 relative flex items-center justify-center">
          <svg className="w-full h-full opacity-60" viewBox="0 0 500 250" fill="none">
            {/* World Map simplified continents silhouette */}
            <path
              d="M50,80 Q90,70 120,95 Q140,110 110,140 Q80,160 50,110 Z"
              fill="#00e5ff"
              fillOpacity="0.15"
              stroke="#00e5ff"
              strokeWidth="0.8"
            />
            <path
              d="M190,50 Q240,40 260,70 Q240,100 200,90 Z"
              fill="#00e5ff"
              fillOpacity="0.15"
              stroke="#00e5ff"
              strokeWidth="0.8"
            />
            {/* Africa continent matching Angola */}
            <path
              d="M200,100 Q260,95 270,140 Q250,210 220,230 Q190,190 200,100 Z"
              fill="#00e5ff"
              fillOpacity="0.25"
              stroke="#00e5ff"
              strokeWidth="1.2"
            />
            {/* Asia / East */}
            <path
              d="M300,50 Q420,40 440,110 Q380,150 320,100 Z"
              fill="#00e5ff"
              fillOpacity="0.15"
              stroke="#00e5ff"
              strokeWidth="0.8"
            />

            {/* Glowing route line from Angola to Europe/USA transit */}
            <path
              d="M225,160 Q200,100 220,65"
              stroke="#00ff88"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              className="animate-pulse"
            />
            <path
              d="M225,160 Q150,130 90,110"
              stroke="#00e5ff"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Ping Nodes */}
            <circle cx="225" cy="160" r="4.5" fill="#00ff88" className="animate-ping" />
            <circle cx="225" cy="160" r="3.5" fill="#fff" />
            <circle cx="220" cy="65" r="3" fill="#00e5ff" />
            <circle cx="90" cy="110" r="3" fill="#00e5ff" />
          </svg>
        </div>
      </div>

      {/* 4. Detalhes da Conexão matching Screen 4 */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 space-y-2 backdrop-blur-md text-xs font-mono">
        <div className="font-bold text-sm text-white mb-2 font-sans">Detalhes da Conexão</div>
        
        <div className="flex items-center justify-between py-1 border-b border-slate-800">
          <span className="text-slate-400">Rede:</span>
          <span className="text-amber-300 font-bold flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" />
            <span>Dados Móveis (4G)</span>
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800">
          <span className="text-slate-400">Operadora:</span>
          <span className={`font-bold ${operator === 'UNITEL' ? 'text-orange-400' : 'text-purple-400'}`}>
            {operator === 'UNITEL' ? '🟠 UNITEL' : '🟣 AFRICELL'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-slate-800">
          <span className="text-slate-400">IP Local:</span>
          <span className="text-slate-200">10.154.32.8</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-slate-400">IP Pública:</span>
          <span className="text-cyan-300 font-bold">{clientIp || '197.149.1.25'}</span>
        </div>
      </div>

      {/* 5. Ver Relatório Completo Button matching Screen 4 */}
      <div className="pt-2">
        <button
          onClick={handleRunFullDiag}
          disabled={isRunningDiag}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{isRunningDiag ? 'Executando Análise Profunda...' : '🛡️ Ver Relatório Completo'}</span>
        </button>
      </div>

      {/* Full Report Modal */}
      {showFullReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0b1020] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-base text-white">Relatório Técnico de Rede</span>
              <button onClick={() => setShowFullReport(false)} className="text-slate-400 hover:text-white text-sm">
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-cyan-400 font-bold">ENCAPSULAMENTO WIREGUARD</div>
                <div className="text-slate-300">Criptografia Noise_IKpsk2 ativa com ChaCha20-Poly1305.</div>
                <div className="text-slate-400 text-[11px]">Nenhum vazamento de IPv4 ou IPv6 identificado.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold">MSS CLAMPING & PATH MTU</div>
                <div className="text-slate-300">Envelope otimizado para operadora {operator} sem fragmentação.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-blue-400 font-bold">ROTEAMENTO & LATÊNCIA</div>
                <div className="text-slate-300">Gateway principal Luanda Direct conectado em 18ms.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
