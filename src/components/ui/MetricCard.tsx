import React, { useEffect, useState } from 'react';

export interface MetricCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  prefix?: string;
  eyebrow?: string;
  delta?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
    label?: string;
  };
  secondaryText?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  suffix = '',
  prefix = '',
  delta,
  secondaryText,
  className = '',
}: MetricCardProps) {
  const isNumber = typeof value === 'number';
  const [displayValue, setDisplayValue] = useState<number | string>(isNumber ? 0 : value);

  useEffect(() => {
    if (!isNumber) {
      setDisplayValue(value);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const duration = 280;
    const start = performance.now();
    const target = value as number;

    const step = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * easeOut * 10) / 10;
      setDisplayValue(Number.isInteger(target) ? Math.round(current) : current.toFixed(1));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  }, [value, isNumber]);

  return (
    <div className={`flex flex-col justify-between py-2 ${className}`}>
      <div>
        <span className="text-xs text-muted font-normal block mb-1">
          {label}
        </span>
        <div className="flex items-baseline gap-1 mt-0.5">
          {prefix && <span className="text-xl font-display text-muted">{prefix}</span>}
          <span className="text-3xl sm:text-4xl font-normal font-display text-text tabular-nums tracking-tight">
            {displayValue}
          </span>
          {suffix && <span className="text-base font-normal font-display text-muted">{suffix}</span>}
        </div>
      </div>

      {(delta || secondaryText) && (
        <div className="mt-2 text-xs text-muted">
          {delta && (
            <span className="inline-flex items-center gap-1">
              <span
                className={
                  delta.type === 'positive'
                    ? 'text-success font-medium'
                    : delta.type === 'negative'
                    ? 'text-danger font-medium'
                    : 'text-muted'
                }
              >
                {delta.type === 'positive' ? '↑ ' : delta.type === 'negative' ? '↓ ' : ''}
                {delta.value}
              </span>
              {delta.label && <span>{delta.label}</span>}
            </span>
          )}
          {secondaryText && <span className="ml-auto block">{secondaryText}</span>}
        </div>
      )}
    </div>
  );
}
