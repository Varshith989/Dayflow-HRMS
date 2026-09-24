import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className="w-full overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-subtle dark:shadow-card">
    <table className={`w-full text-left text-xs ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-slate-50/80 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/90 dark:border-slate-800/90 uppercase tracking-wider text-[11px] sticky top-0 z-10 ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-800 dark:text-slate-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', isClickable = false, onClick }) => (
  <tr
    onClick={onClick}
    className={`transition-colors duration-100 ${
      isClickable ? 'cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-850/50' : 'hover:bg-slate-50/60 dark:hover:bg-slate-850/30'
    } ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '', sortable = false, onSort, sortDirection }) => (
  <th
    onClick={sortable ? onSort : undefined}
    className={`px-4 py-3 font-semibold select-none ${sortable ? 'cursor-pointer hover:text-slate-900 dark:hover:text-white' : ''} ${className}`}
  >
    <div className="flex items-center gap-1.5">
      <span>{children}</span>
      {sortable && sortDirection && (
        <span className="text-brand-500 text-[10px]">
          {sortDirection === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </div>
  </th>
);

export const TableCell = ({ children, className = '', density = 'comfortable' }) => {
  const padding = density === 'compact' ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-xs';
  return (
    <td className={`${padding} ${className}`}>
      {children}
    </td>
  );
};

export default { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
