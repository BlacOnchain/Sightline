import React from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'own'
  | 'competitor'
  | 'clay';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.2',
    md: 'text-xs px-2 py-0.5',
  };

  const variantStyles = {
    neutral: 'bg-raised/60 text-muted border-border',
    accent: 'bg-accent/10 text-accent border-accent/25 font-medium',
    success: 'bg-success/10 text-success border-success/25 font-medium',
    warning: 'bg-warning/10 text-warning border-warning/25',
    danger: 'bg-danger/10 text-danger border-danger/25',
    own: 'bg-accent/10 text-accent border-accent/30 font-medium',
    competitor: 'bg-raised text-muted border-border',
    clay: 'bg-clay/10 text-clay border-clay/30 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center border rounded-sm font-normal select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
