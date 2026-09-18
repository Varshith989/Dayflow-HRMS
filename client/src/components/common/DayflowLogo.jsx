import React from 'react';

export const DayflowIcon = ({ size = 28, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="dayflowIconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#dayflowIconGrad)" />
      {/* Modern crisp Dayflow "D/Flow" monogram */}
      <path
        d="M9 8h7a7 7 0 0 1 7 7 7 7 0 0 1-7 7H9V8zm4 3.5v7h3a3.5 3.5 0 0 0 3.5-3.5A3.5 3.5 0 0 0 16 11.5h-3z"
        fill="#ffffff"
      />
      <circle cx="21" cy="11" r="2" fill="#a5b4fc" />
    </svg>
  );
};

export const DayflowLogo = ({
  iconSize = 28,
  showBadge = true,
  showTagline = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <DayflowIcon size={iconSize} />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Day<span className="text-brand-600 dark:text-brand-400">flow</span>
          </span>
          {showBadge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80 uppercase tracking-wider">
              HRMS
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
            Modern Workforce Platform
          </span>
        )}
      </div>
    </div>
  );
};

export default DayflowLogo;
