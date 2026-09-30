import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  eyebrow?: string;
  bordered?: boolean;
  className?: string;
}

export function Card({ children, eyebrow, bordered = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={`${
        bordered
          ? 'bg-surface border border-border rounded-md p-4 sm:p-5'
          : 'bg-transparent py-2'
      } transition-colors ${className}`}
      {...props}
    >
      {eyebrow && (
        <div className="text-xs text-muted font-normal mb-2">
          {eyebrow.replace(/^\/\/\s*\d*\.?\s*/i, '')}
        </div>
      )}
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  eyebrow,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 mb-4 ${className}`}>
      <div>
        {eyebrow && (
          <div className="text-xs text-muted font-normal mb-1">
            {eyebrow.replace(/^\/\/\s*\d*\.?\s*/i, '')}
          </div>
        )}
        <h3 className="text-base font-semibold font-display text-text">{title}</h3>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
