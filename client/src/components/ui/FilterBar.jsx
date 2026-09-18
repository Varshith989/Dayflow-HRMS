import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const FilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [], // [{ key, label, value, options: [{ label, value }], onChange }]
  activeFilters = [], // [{ key, label, displayValue, onRemove }]
  onClearAll,
  density,
  onDensityChange,
  actions,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {filters.map((f) => (
            <div key={f.key} className="flex items-center gap-1 text-xs">
              {f.label && <span className="text-slate-400 hidden sm:inline">{f.label}:</span>}
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {density && onDensityChange && (
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => onDensityChange('compact')}
                title="Compact density"
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  density === 'compact'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => onDensityChange('comfortable')}
                title="Comfortable density"
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  density === 'comfortable'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-subtle'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Comfort
              </button>
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active:</span>
          {activeFilters.map((af) => (
            <span
              key={af.key}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 text-[11px]"
            >
              <strong className="font-semibold text-slate-500 dark:text-slate-400">{af.label}:</strong>
              <span>{af.displayValue}</span>
              <button
                onClick={af.onRemove}
                className="hover:text-rose-500 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline font-medium ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
