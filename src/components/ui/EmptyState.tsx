import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  eyebrow?: string;
  illustration?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  eyebrow,
  illustration,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-md ${className}`}
    >
      {illustration && <div className="mb-4">{illustration}</div>}
      {eyebrow && (
        <span className="text-xs text-muted mb-1 font-normal">
          {eyebrow}
        </span>
      )}
      <h3 className="text-base font-semibold font-display text-text mb-1">{title}</h3>
      <p className="text-xs text-muted max-w-sm mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
