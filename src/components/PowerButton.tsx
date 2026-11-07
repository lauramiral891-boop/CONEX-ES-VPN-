import React from 'react';
import { ConnectionStatus } from '../types/vpn';
import { Power, Check, RotateCw, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface PowerButtonProps {
  status: ConnectionStatus;
  onToggle: () => void;
  disabled?: boolean;
}

export const PowerButton: React.FC<PowerButtonProps> = ({
  status,
  onToggle,
  disabled = false
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';
  const isError = status === 'error';

  const handleClick = () => {
    if (disabled || isConnecting) return;
    if (isConnected) {
      sounds.playDisconnect();
    } else {
      sounds.playConnect();
    }
    onToggle();
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Outer Glow Halo Ring */}
      <div className="relative flex items-center justify-center">
        {isConnected && (
          <>
            <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-400/40 animate-pulse pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
          </>
        )}

        {isConnecting && (
          <div className="absolute w-44 h-44 rounded-full border-2 border-dashed border-cyan-400/50 animate-spin pointer-events-none" style={{ animationDuration: '4s' }} />
        )}

        {/* Main Circular Power Button */}
        <button
          onClick={handleClick}
          disabled={disabled || isConnecting}
          aria-label={isConnected ? 'Desconectar VPN' : 'Conectar VPN'}
          className={`group relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 transform active:scale-95 focus:outline-none cursor-pointer shadow-2xl ${
            isConnected
              ? 'bg-gradient-to-br from-[#032314] via-[#051a13] to-[#010e08] border-[3px] border-[#00e676] shadow-[0_0_50px_rgba(0,230,118,0.5)]'
              : isConnecting
              ? 'bg-gradient-to-br from-[#061e38] via-[#081729] to-[#030914] border-[3px] border-[#00e5ff] shadow-[0_0_40px_rgba(0,229,255,0.4)]'
              : isError
              ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-[#100305] border-[3px] border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
              : 'bg-gradient-to-br from-[#09152b] via-[#060e1d] to-[#02050d] border-[3px] border-[#2979ff] hover:border-[#00e5ff] shadow-[0_0_35px_rgba(41,121,255,0.35)]'
          }`}
        >
          {/* Subtle Inner Bevel / Reflection Ring */}
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none" />

          {/* Central Power Icon */}
          <div className="relative flex items-center justify-center">
            {isConnecting ? (
              <RotateCw className="w-12 h-12 text-cyan-400 animate-spin drop-shadow-[0_0_12px_#00e5ff]" />
            ) : isError ? (
              <AlertTriangle className="w-12 h-12 text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
            ) : (
              <Power 
                className={`w-14 h-14 sm:w-16 sm:h-16 transition-all duration-500 ${
                  isConnected 
                    ? 'text-[#00e676] stroke-[2.5] drop-shadow-[0_0_20px_#00e676]' 
                    : 'text-[#00e5ff] group-hover:text-white stroke-[2.2] drop-shadow-[0_0_15px_#2979ff]'
                }`} 
              />
            )}
          </div>
        </button>
      </div>

      {/* Status Label underneath the button exactly like in Screen 1 */}
      <div className="mt-4 text-center">
        {isConnected ? (
          <div>
            <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-black tracking-wider text-[#00e676] drop-shadow-[0_0_12px_rgba(0,230,118,0.6)]">
              <span>CONECTADO</span>
              <Check className="w-5 h-5 text-[#00e676] stroke-[3]" />
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5 opacity-90">
              Navegação protegida
            </p>
          </div>
        ) : isConnecting ? (
          <div>
            <div className="text-base sm:text-lg font-black tracking-wider text-cyan-300 drop-shadow-[0_0_12px_rgba(0,229,255,0.6)] animate-pulse">
              CONECTANDO...
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Estabelecendo túnel WireGuard
            </p>
          </div>
        ) : isError ? (
          <div>
            <div className="text-base sm:text-lg font-black tracking-wider text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]">
              ERRO DE CONEXÃO
            </div>
            <p className="text-xs text-rose-300/80 font-sans mt-0.5">
              Toque para tentar novamente
            </p>
          </div>
        ) : (
          <div>
            <div className="text-base sm:text-lg font-black tracking-wider text-slate-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              DESCONECTADO
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Toque para conectar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
