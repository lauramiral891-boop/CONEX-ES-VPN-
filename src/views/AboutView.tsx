import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  Lock, 
  KeyRound, 
  Cpu, 
  Layers 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="w-full max-w-md sm:max-w-2xl mx-auto px-4 py-2 sm:py-4 space-y-4 pb-24 sm:pb-8">
      {/* Hero Banner matching Bottom-Left of User Mockup */}
      <div className="relative p-6 rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-[#061530] via-[#051126] to-[#020713] shadow-2xl backdrop-blur-md">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Holographic Glowing Shield with Keyhole matching mockup */}
          <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
            {/* Outer glowing orbital rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
            <div className="absolute -inset-2 rounded-full border border-blue-500/20 pointer-events-none" />

            {/* Glowing Shield Shape */}
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-b from-cyan-500/20 via-blue-600/15 to-[#020713] border-2 border-cyan-400 shadow-[0_0_35px_rgba(0,229,255,0.4)] flex items-center justify-center">
              <svg className="w-14 h-14 text-cyan-400 drop-shadow-[0_0_12px_#00e5ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-cyan-500/15" />
                {/* Keyhole inside shield */}
                <circle cx="12" cy="10" r="2.2" fill="#00e5ff" />
                <path d="M11 11.5 L13 11.5 L13.5 15.5 L10.5 15.5 Z" fill="#00e5ff" />
              </svg>
            </div>
          </div>

          {/* Title and Checklist */}
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Conexões VPN
            </h3>
            <p className="text-xs text-slate-300 font-sans">
              Tecnologia de ponta para sua liberdade digital
            </p>

            <div className="space-y-1.5 pt-1 text-xs font-sans text-slate-200">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span>VPN Real com WireGuard</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span>Scanner SNI Avançado</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span>Diagnóstico Inteligente</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                <span>Proteção Total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cursive Calligraphy text: "Conecte-se com confiança!" matching Mockup */}
        <div className="mt-5 pt-4 border-t border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-cyan-300 italic font-serif text-base sm:text-lg tracking-wide drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]">
            Conecte-se com confiança!
          </div>

          <div className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
            <div>Versão 2.0.0</div>
            <div>© 2025 Conexões VPN</div>
          </div>
        </div>
      </div>

      {/* Technical Architecture Info Card */}
      <div className="p-4 rounded-2xl bg-[#061226]/80 border border-blue-500/25 space-y-2.5 backdrop-blur-md text-xs font-mono text-slate-300">
        <div className="font-bold text-white font-sans text-sm flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>Motor Android VpnService & GoBackend</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Desenvolvido com o backend oficial <code className="text-cyan-300">com.wireguard.android:tunnel</code>. Criptografia ponta a ponta ChaCha20-Poly1305 com handshake Curve25519 e hashing BLAKE2s.
        </p>
      </div>
    </div>
  );
};
