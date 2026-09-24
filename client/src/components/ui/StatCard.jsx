import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  badge,
  badgeVariant = 'neutral',
  iconClassName = '',
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 shadow-subtle dark:shadow-card transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-card' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-slate-800/60 ${iconClassName || 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {(subtitle || trendValue || badge) && (
        <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 min-w-0 text-slate-500 dark:text-slate-400 truncate">
            {trendValue && (
              <span className={`inline-flex items-center gap-0.5 font-semibold shrink-0 ${
                trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trend === 'down'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}>
                {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                {trend === 'neutral' && <Minus className="w-3 h-3" />}
                {trendValue}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>

          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
