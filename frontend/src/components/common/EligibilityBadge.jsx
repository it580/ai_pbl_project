import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function EligibilityBadge({ status, size = 'md' }) {
  const normStatus = (status || '').toLowerCase();

  let config = {
    label: 'Eligible',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  };

  if (normStatus.includes('potentially') || normStatus.includes('missing')) {
    config = {
      label: 'Potentially Eligible',
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
    };
  } else if (normStatus.includes('not') || normStatus.includes('ineligible') || normStatus.includes('failed')) {
    config = {
      label: 'Not Eligible',
      classes: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    };
  }

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5 font-semibold';

  return (
    <span className={`inline-flex items-center rounded-lg border shadow-sm ${config.classes} ${sizeClasses}`}>
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
}
