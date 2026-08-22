import React from 'react';

export const WorkZenIcon = ({ size = 38, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="wzCompGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
        <linearGradient id="wzCompPulse" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#06b6d4" />
          <stop offset="100%" stop-color="#8b5cf6" />
        </linearGradient>
        <filter id="wzCompGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#6366f1" flood-opacity="0.35" />
        </filter>
      </defs>

      <rect x="4" y="4" width="92" height="92" rx="26" fill="url(#wzCompGrad)" filter="url(#wzCompGlow)" />
      <rect x="4" y="4" width="92" height="92" rx="26" fill="#0f172a" fill-opacity="0.1" />

      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M26 34 L38 68 L50 44 L62 68 L74 34" stroke="#ffffff" stroke-width="7.5" />
        <path d="M38 68 C44 76, 56 76, 62 68" stroke="url(#wzCompPulse)" stroke-width="5" />
      </g>

      <circle cx="26" cy="30" r="4.5" fill="#38bdf8" />
      <circle cx="50" cy="40" r="4.5" fill="#c084fc" />
      <circle cx="74" cy="30" r="4.5" fill="#38bdf8" />
    </svg>
  );
};

export const WorkZenLogo = ({
  iconSize = 38,
  showBadge = true,
  showTagline = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <WorkZenIcon size={iconSize} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-display">
            Work<span className="text-brand-600 dark:text-brand-400">Zen</span>
          </span>
          {showBadge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-500/30 uppercase tracking-wider">
              HRMS
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Work smarter. Stay in sync.
          </span>
        )}
      </div>
    </div>
  );
};

export default WorkZenLogo;
