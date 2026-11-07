import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Copy, Trash2, Search, Send, Check } from 'lucide-react';
import { CyberLogEntry } from '../types/vpn';
import { sounds } from '../utils/audio';

interface CyberConsoleProps {
  logs: CyberLogEntry[];
  onExecuteCommand: (command: string) => void;
  onClearLogs: () => void;
}

export const CyberConsole: React.FC<CyberConsoleProps> = ({
  logs,
  onExecuteCommand,
  onClearLogs
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commandInput, setCommandInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        (log.host && log.host.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCopyLogs = () => {
    sounds.playClick();
    const text = logs
      .map(l => `[${l.timestamp}] [${l.level}] ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    sounds.playClick();
    onExecuteCommand(commandInput.trim());
    setCommandInput('');
  };

  const getLevelColor = (level: CyberLogEntry['level']) => {
    switch (level) {
      case 'DISCOVERY':
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
      case 'TLS_PROBE':
        return 'text-[#00ff88] border-[#00ff88]/40 bg-[#00ff88]/10';
      case 'ZERO_RATING':
        return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      case 'AI_ANALYSIS':
        return 'text-purple-300 border-purple-500/40 bg-purple-500/15';
      case 'WARN':
        return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      case 'ERROR':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      default:
        return 'text-slate-400 border-slate-700 bg-slate-800/40';
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#020712] border border-blue-500/30 overflow-hidden shadow-2xl flex flex-col font-mono">
      {/* Console Header Bar */}
      <div className="bg-[#040e22] px-4 py-2.5 border-b border-blue-500/20 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white tracking-wider">
            TERMINAL HACKER AI // TELEMETRIA
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-[#00ff88] border border-emerald-500/40">
            ONLINE
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all cursor-pointer text-xs flex items-center gap-1"
            title="Copiar Logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00ff88]" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          <button
            onClick={onClearLogs}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition-all cursor-pointer text-xs"
            title="Limpar Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-3 py-2 bg-[#030917] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'ALL', label: 'Tudo' },
            { id: 'DISCOVERY', label: 'Descoberta' },
            { id: 'TLS_PROBE', label: 'TLS / SNI' },
            { id: 'ZERO_RATING', label: 'Zero-Rating' },
            { id: 'AI_ANALYSIS', label: 'IA Neural' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => {
                sounds.playClick();
                setFilterLevel(f.id);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterLevel === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[140px] max-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar logs..."
            className="w-full pl-6 pr-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Live Log Stream Area */}
      <div
        ref={logContainerRef}
        className="h-64 sm:h-72 p-3 overflow-y-auto space-y-1.5 text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent bg-[#01050e]"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Nenhum evento registrado no filtro atual.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/40 p-0.5 rounded transition-colors">
              <span className="text-slate-500 shrink-0 select-none">
                {log.timestamp}
              </span>
              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold shrink-0 ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              <span className="text-slate-200 break-all flex-1">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Interactive Command Prompt Line */}
      <form
        onSubmit={handleSubmitCommand}
        className="bg-[#030a1c] px-3 py-2 border-t border-blue-500/20 flex items-center gap-2"
      >
        <span className="text-[#00ff88] font-black text-xs select-none">
          hacker-ai&gt;
        </span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          placeholder="Comandos: probe <host>, scan, ai, zerorating, clear"
          className="flex-1 bg-transparent text-xs text-cyan-200 placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-400/40 cursor-pointer transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
