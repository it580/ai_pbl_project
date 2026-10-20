import React from 'react';
import { Sparkles } from 'lucide-react';

export default function ScoreBadge({ score, category, showLabel = true, size = 'md' }) {
  const numScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (numScore >= 80) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/20';
    dotColor = 'bg-emerald-500';
  } else if (numScore >= 65) {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200/80 ring-teal-500/20';
    dotColor = 'bg-teal-500';
  } else if (numScore >= 45) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/20';
    dotColor = 'bg-amber-500';
  } else {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/20';
    dotColor = 'bg-rose-500';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-bold',
  }[size] || 'text-sm px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ring-1 ${colorClasses} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span>{numScore}%</span>
      {showLabel && category && (
        <span className="opacity-80 font-normal">({category})</span>
      )}
    </span>
  );
}
