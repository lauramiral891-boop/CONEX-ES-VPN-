import React, { useEffect, useRef } from 'react';
import { ConnectionStatus } from '../types/vpn';

interface EarthGlobeVisualizerProps {
  status: ConnectionStatus;
  children?: React.ReactNode;
}

export const EarthGlobeVisualizer: React.FC<EarthGlobeVisualizerProps> = ({
  status,
  children
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting' || status === 'reconnecting';

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square mx-auto flex items-center justify-center select-none my-2">
      {/* Outer Glow Halo */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-opacity duration-1000 pointer-events-none ${
          isConnected 
            ? 'bg-emerald-500/15 opacity-100' 
            : isConnecting 
            ? 'bg-cyan-500/25 opacity-100' 
            : 'bg-blue-600/15 opacity-70'
        }`} 
      />

      {/* Holographic 3D Earth Globe SVG Background */}
      <div className="absolute inset-2 sm:inset-4 rounded-full overflow-hidden pointer-events-none shadow-[inset_0_0_50px_rgba(0,140,255,0.4)] border border-cyan-500/20 bg-gradient-to-b from-[#061838] via-[#040e24] to-[#020614]">
        {/* Atmosphere rim light */}
        <div className="absolute inset-0 rounded-full bg-radial from-transparent via-cyan-500/5 to-cyan-400/20" />

        {/* Animated Latitude / Longitude Curvature Lines */}
        <svg className="w-full h-full opacity-60 animate-spin-slow" viewBox="0 0 400 400" style={{ animationDuration: '60s' }}>
          <defs>
            <linearGradient id="globeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2979ff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0052cc" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Latitude concentric curved ellipses */}
          <ellipse cx="200" cy="200" rx="190" ry="60" fill="none" stroke="url(#globeGrad)" strokeWidth="0.8" strokeDasharray="3 4" />
          <ellipse cx="200" cy="200" rx="190" ry="120" fill="none" stroke="url(#globeGrad)" strokeWidth="0.8" strokeDasharray="4 6" />
          <ellipse cx="200" cy="200" rx="190" ry="170" fill="none" stroke="url(#globeGrad)" strokeWidth="1" strokeDasharray="6 6" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />

          {/* Longitude vertical curved meridians */}
          <ellipse cx="200" cy="200" rx="60" ry="190" fill="none" stroke="url(#globeGrad)" strokeWidth="0.8" strokeDasharray="4 4" />
          <ellipse cx="200" cy="200" rx="120" ry="190" fill="none" stroke="url(#globeGrad)" strokeWidth="0.8" strokeDasharray="4 6" />
          <line x1="200" y1="10" x2="200" y2="390" stroke="#00e5ff" strokeWidth="1" strokeOpacity="0.5" strokeDasharray="4 4" />

          {/* Glowing continent contour dots representing Africa/Angola/World */}
          <g fill="#00e5ff" opacity="0.75" filter="url(#glow)">
            {/* Africa & Angola approximate geographic coordinates */}
            <circle cx="210" cy="215" r="3.5" fill="#00ff88" className="animate-ping" style={{ animationDuration: '2s' }} /> {/* Luanda node */}
            <circle cx="210" cy="215" r="2.5" fill="#fff" />
            <circle cx="205" cy="230" r="1.5" />
            <circle cx="218" cy="245" r="1.5" />
            <circle cx="212" cy="190" r="1.8" />
            <circle cx="195" cy="180" r="1.5" />
            <circle cx="230" cy="195" r="1.5" />
            <circle cx="225" cy="210" r="1.8" />
            <circle cx="215" cy="260" r="1.5" />
            <circle cx="200" cy="160" r="1.5" />
            <circle cx="210" cy="145" r="1.5" />
            {/* Europe / North */}
            <circle cx="195" cy="125" r="1.8" />
            <circle cx="210" cy="115" r="1.8" />
            <circle cx="225" cy="120" r="1.5" />
            {/* Americas / West */}
            <circle cx="140" cy="195" r="1.8" />
            <circle cx="130" cy="225" r="1.5" />
            <circle cx="115" cy="155" r="1.8" />
            <circle cx="125" cy="140" r="1.5" />
          </g>
        </svg>

        {/* Digital Grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#00e5ff_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
      </div>

      {/* Orbital Digital Rings framing the Globe */}
      <div 
        className="absolute inset-0 rounded-full border border-cyan-400/20 pointer-events-none animate-spin"
        style={{ animationDuration: '40s' }}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#00e5ff]" />
        <div className="absolute bottom-6 right-8 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#2979ff]" />
      </div>

      <div 
        className="absolute -inset-3 rounded-full border border-dashed border-blue-500/20 pointer-events-none -rotate-12 animate-spin-slow"
        style={{ animationDuration: '50s', animationDirection: 'reverse' }}
      >
        <div className="absolute bottom-0 left-1/3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#00ff88]" />
      </div>

      {/* Center Slot for Power Button */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
