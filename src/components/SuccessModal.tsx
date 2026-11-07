import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl overflow-hidden border border-blue-500/40 shadow-2xl bg-gradient-to-b from-[#081836] via-[#051126] to-[#020713] text-center p-6 space-y-5">
        {/* City Skyline Background Silhouette & Glow */}
        <div className="absolute top-0 left-0 right-0 h-40 opacity-20 pointer-events-none bg-gradient-to-b from-blue-500/30 to-transparent" />

        {/* Floating Angola Flag badge in the background */}
        <div className="absolute top-3 right-4 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] font-sans text-slate-300">
          <span>🇦🇴 Angola</span>
        </div>

        {/* Central Golden Laurel Wreath + Glowing Shield Emblem */}
        <div className="relative pt-4 flex items-center justify-center">
          {/* Radiant Halo */}
          <div className="absolute w-28 h-28 rounded-full bg-[#00ff88]/20 blur-xl pointer-events-none" />

          {/* Golden Laurel Wreath SVG surrounding the Shield */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Laurel Wreath */}
            <svg className="absolute inset-0 w-full h-full text-amber-400 opacity-90 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" viewBox="0 0 100 100" fill="none">
              <path d="M22 65 C18 45, 30 25, 50 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M78 65 C82 45, 70 25, 50 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              {/* Laurel Leaves left */}
              <circle cx="28" cy="50" r="3.5" fill="currentColor" />
              <circle cx="34" cy="36" r="3.5" fill="currentColor" />
              <circle cx="44" cy="26" r="3.5" fill="currentColor" />
              {/* Laurel Leaves right */}
              <circle cx="72" cy="50" r="3.5" fill="currentColor" />
              <circle cx="66" cy="36" r="3.5" fill="currentColor" />
              <circle cx="56" cy="26" r="3.5" fill="currentColor" />
            </svg>

            {/* Inner Glowing Green Shield */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00b0ff] p-[2.5px] shadow-[0_0_25px_rgba(0,255,136,0.6)] flex items-center justify-center">
              <div className="w-full h-full bg-[#041d14] rounded-full flex items-center justify-center">
                <Check className="w-9 h-9 text-[#00ff88] stroke-[3.5] drop-shadow-[0_0_6px_#00ff88]" />
              </div>
            </div>
          </div>
        </div>

        {/* Text exactly from Screen 10 */}
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-white tracking-wide">
            Tudo Certo!
          </h3>
          <p className="text-sm text-slate-300 font-sans">
            Sua conexão está segura e estável.
          </p>
        </div>

        {/* Quick Diagnostic Pill Summary */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Túnel WireGuard:</span>
            <span className="text-[#00ff88] font-bold">Ativo & Criptografado</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Proteção DNS:</span>
            <span className="text-cyan-300 font-bold">Sem vazamentos</span>
          </div>
        </div>

        {/* Continuar Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all active:scale-95 cursor-pointer"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};
