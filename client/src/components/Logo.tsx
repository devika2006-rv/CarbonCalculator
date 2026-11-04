import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
  light = false
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Original Sustainability Vector Symbol: Interlocking Leaf, Circular Footprint Orbit & Earth Sphere */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]} transition-transform duration-300 hover:scale-105`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Circular Planet Earth Halo */}
          <circle cx="50" cy="50" r="46" fill={light ? '#134E2E' : '#0F3823'} />
          <circle cx="50" cy="50" r="43" stroke="#10B981" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.6" />

          {/* Stylized Sustainability Leaf */}
          <path
            d="M26 68 C 22 42, 44 22, 74 26 C 68 56, 52 70, 26 68 Z"
            fill="url(#emeraldGrad)"
          />

          {/* Leaf Central Vein / Carbon Balance Curve */}
          <path
            d="M26 68 C 42 54, 56 42, 74 26"
            stroke="#ECFDF5"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Circular Footprint Arcs symbolizing our human path */}
          <circle cx="48" cy="46" r="5.5" fill="#38BDF8" />
          <circle cx="60" cy="38" r="4" fill="#6EE7B7" />
          <circle cx="40" cy="56" r="3.5" fill="#FBBF24" />

          <defs>
            <linearGradient id="emeraldGrad" x1="26" y1="26" x2="74" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#10B981" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className={`font-bold tracking-tight font-sans flex items-center leading-tight ${textSizes[size]}`}>
          <span className={light ? 'text-white' : 'text-slate-900'}>Carbon</span>
          <span className="text-emerald-700 font-extrabold">Calculator</span>
        </div>
        {showTagline && (
          <span className={`text-[10px] sm:text-xs font-medium tracking-wide ${light ? 'text-emerald-200' : 'text-slate-500'}`}>
            Understand. Calculate. Reduce.
          </span>
        )}
      </div>
    </div>
  );
};
