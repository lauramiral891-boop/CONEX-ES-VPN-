import React from 'react';
import { OperatorType } from '../types/vpn';
import { sounds } from '../utils/audio';
import { Signal, Plus } from 'lucide-react';

interface OperatorSelectorProps {
  currentOperator: OperatorType;
  onSelectOperator: (operator: OperatorType) => void;
  disabled?: boolean;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  currentOperator,
  onSelectOperator,
  disabled = false
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-3 flex flex-col items-center">
      <div className="w-full text-left text-xs font-semibold text-slate-300 mb-1.5 px-1 font-sans">
        Operadora
      </div>

      <div className="w-full flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-[#061022]/90 border border-blue-500/30 backdrop-blur-md">
        {/* Signal indicator */}
        <div className="pl-2 pr-1 text-cyan-400 flex items-center">
          <Signal className="w-4 h-4 text-cyan-400 stroke-[2.5]" />
        </div>

        {/* UNITEL Orange Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (currentOperator !== 'UNITEL') {
              sounds.playClick();
              onSelectOperator('UNITEL');
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs font-sans tracking-wide transition-all duration-300 cursor-pointer active:scale-95 ${
            currentOperator === 'UNITEL'
              ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-amber-300/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_4px_#fff]" />
          <span>UNITEL</span>
        </button>

        {/* Plus separator */}
        <div className="text-slate-500 text-xs font-bold px-0.5">
          <Plus className="w-3.5 h-3.5 text-slate-500" />
        </div>

        {/* AFRICELL Purple Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (currentOperator !== 'AFRICELL') {
              sounds.playClick();
              onSelectOperator('AFRICELL');
            }
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs font-sans tracking-wide transition-all duration-300 cursor-pointer active:scale-95 ${
            currentOperator === 'AFRICELL'
              ? 'bg-gradient-to-r from-purple-700 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] border border-fuchsia-300/40'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white/90 shadow-[0_0_4px_#fff]" />
          <span>AFRICELL</span>
        </button>
      </div>
    </div>
  );
};
