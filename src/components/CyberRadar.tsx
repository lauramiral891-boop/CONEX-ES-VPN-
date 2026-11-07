import React, { useEffect, useState } from 'react';
import { Radio, Crosshair } from 'lucide-react';
import { OperatorType } from '../types/vpn';

interface RadarTarget {
  id: string;
  host: string;
  operator: OperatorType | 'AMBAS';
  angle: number;       // degrees 0 - 360
  distance: number;    // 0 - 1 (radius fraction)
  status: 'COMPATÍVEL' | 'PARCIAL' | 'BLOQUEIO POSSÍVEL' | 'FALHOU' | 'DESCOBERTO';
  latencyMs: number;
}

interface CyberRadarProps {
  targets: RadarTarget[];
  isScanning: boolean;
  selectedOperator: OperatorType;
  onSelectTarget?: (target: RadarTarget) => void;
}

export const CyberRadar: React.FC<CyberRadarProps> = ({
  targets,
  isScanning,
  selectedOperator,
  onSelectTarget
}) => {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [hoveredTarget, setHoveredTarget] = useState<RadarTarget | null>(null);

  // Sweep rotation ticker
  useEffect(() => {
    let animFrame: number;
    const rotate = () => {
      setSweepAngle(prev => (prev + 2.2) % 360);
      animFrame = requestAnimationFrame(rotate);
    };
    animFrame = requestAnimationFrame(rotate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const size = 260; // Base SVG size
  const center = size / 2;
  const radius = center - 12;

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      {/* Outer Military Glass Container */}
      <div className="relative w-[280px] h-[280px] rounded-full p-2 bg-gradient-to-b from-[#031525] via-[#020914] to-[#01050a] border-2 border-cyan-500/30 shadow-[0_0_35px_rgba(0,229,255,0.18)] flex items-center justify-center overflow-hidden">
        {/* Background Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #00e5ff 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        />

        <svg className="w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <defs>
            {/* Radar Sweep Gradient */}
            <linearGradient id="radarSweepGrad" gradientTransform={`rotate(${sweepAngle} ${center} ${center})`}>
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.45" />
              <stop offset="30%" stopColor="#00e5ff" stopOpacity="0.2" />
              <stop offset="80%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Concentric Range Rings */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeOpacity="0.3" />
          <circle cx={center} cy={center} r={radius * 0.75} fill="none" stroke="#00e5ff" strokeWidth="0.9" strokeOpacity="0.2" strokeDasharray="3 3" />
          <circle cx={center} cy={center} r={radius * 0.5} fill="none" stroke="#00e5ff" strokeWidth="0.9" strokeOpacity="0.25" />
          <circle cx={center} cy={center} r={radius * 0.25} fill="none" stroke="#00e5ff" strokeWidth="0.7" strokeOpacity="0.2" strokeDasharray="2 2" />

          {/* Axis Crosshairs */}
          <line x1={center} y1={8} x2={center} y2={size - 8} stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.25" />
          <line x1={8} y1={center} x2={size - 8} y2={center} stroke="#00e5ff" strokeWidth="0.8" strokeOpacity="0.25" />

          {/* 45-degree guide markers */}
          <line x1={center - radius * 0.7} y1={center - radius * 0.7} x2={center + radius * 0.7} y2={center + radius * 0.7} stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.12" />
          <line x1={center - radius * 0.7} y1={center + radius * 0.7} x2={center + radius * 0.7} y2={center - radius * 0.7} stroke="#00e5ff" strokeWidth="0.5" strokeOpacity="0.12" />

          {/* Rotating Sweep Arc / Beam */}
          <path
            d={`M ${center} ${center} L ${center + radius * Math.cos((sweepAngle * Math.PI) / 180)} ${center + radius * Math.sin((sweepAngle * Math.PI) / 180)} A ${radius} ${radius} 0 0 0 ${center + radius * Math.cos(((sweepAngle - 55) * Math.PI) / 180)} ${center + radius * Math.sin(((sweepAngle - 55) * Math.PI) / 180)} Z`}
            fill="url(#radarSweepGrad)"
          />

          {/* Center Pulsing Sensor Node */}
          <circle cx={center} cy={center} r={4} fill="#00ff88" filter="url(#radarGlow)" />
          <circle cx={center} cy={center} r={7} fill="none" stroke="#00ff88" strokeWidth="1" strokeOpacity="0.6" className="animate-ping" />

          {/* Target Blips */}
          {targets.map((t) => {
            const rad = (t.angle * Math.PI) / 180;
            const r = t.distance * (radius - 10);
            const x = center + r * Math.cos(rad);
            const y = center + r * Math.sin(rad);

            // Compute distance from sweep angle to determine brightness
            const diffAngle = ((sweepAngle - t.angle + 360) % 360);
            const isLit = diffAngle < 60;

            const isUnitel = t.operator === 'UNITEL';
            const isAfricell = t.operator === 'AFRICELL';
            const color = isUnitel ? '#f97316' : (isAfricell ? '#c084fc' : '#00e5ff');

            return (
              <g
                key={t.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredTarget(t)}
                onMouseLeave={() => setHoveredTarget(null)}
                onClick={() => onSelectTarget?.(t)}
              >
                {/* Blip glow ring when sweep passes */}
                {isLit && (
                  <circle
                    cx={x}
                    cy={y}
                    r={6}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    className="animate-ping"
                  />
                )}
                {/* Core Blip dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={hoveredTarget?.id === t.id ? 4.5 : 3}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  opacity={isLit ? 1 : 0.65}
                />
              </g>
            );
          })}
        </svg>

        {/* Hovered Target Floating Card */}
        {hoveredTarget && (
          <div className="absolute top-2 inset-x-4 bg-slate-950/95 border border-cyan-400/50 rounded-xl px-2.5 py-1.5 text-center shadow-xl backdrop-blur-md pointer-events-none animate-fade-in z-20">
            <div className="text-[11px] font-mono font-bold text-white truncate">
              {hoveredTarget.host}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-slate-300 mt-0.5">
              <span className={hoveredTarget.operator === 'UNITEL' ? 'text-orange-400' : 'text-purple-400'}>
                {hoveredTarget.operator}
              </span>
              <span>·</span>
              <span className="text-[#00ff88]">{hoveredTarget.latencyMs > 0 ? `${hoveredTarget.latencyMs}ms` : '443 OK'}</span>
              <span>·</span>
              <span className="text-cyan-300 font-semibold">{hoveredTarget.status}</span>
            </div>
          </div>
        )}

        {/* Status Indicators in Corners */}
        <div className="absolute top-2 left-3 flex items-center gap-1 text-[10px] font-mono text-cyan-400/80">
          <Radio className={`w-3 h-3 ${isScanning ? 'text-[#00ff88] animate-pulse' : 'text-cyan-400'}`} />
          <span>{isScanning ? 'VARRENDO' : 'RADAR ATIVO'}</span>
        </div>

        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400">
          <span>ALVOS: </span>
          <span className="text-[#00ff88] font-bold">{targets.length}</span>
        </div>

        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-400">
          <span>REDE: </span>
          <span className={`font-bold ${selectedOperator === 'UNITEL' ? 'text-orange-400' : 'text-purple-400'}`}>
            {selectedOperator}
          </span>
        </div>
      </div>

      {/* Military Coordinates / Calibration Bar */}
      <div className="mt-2 flex items-center gap-4 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          <span>AZ: {Math.floor(sweepAngle)}°</span>
        </span>
        <span>POLAR: 360° SWEEP</span>
        <span className="text-cyan-300">MODO: HÍBRIDO</span>
      </div>
    </div>
  );
};
