import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${rounded} ${className}`}
      {...props}
    />
  );
};

export const SkeletonCard = () => (
  <div className="p-5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 space-y-3 shadow-subtle">
    <div className="flex justify-between items-center">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
    <Skeleton className="h-7 w-32" />
    <Skeleton className="h-3 w-40" />
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800/90 overflow-hidden bg-white dark:bg-slate-900 p-4 space-y-3">
    <div className="flex gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-4 py-2.5 items-center">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export default { Skeleton, SkeletonCard, SkeletonTable };
