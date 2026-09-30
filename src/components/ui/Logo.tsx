import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  monochrome?: boolean;
}

export function LogoMark({
  size = 28,
  monochrome = false,
  className = '',
}: {
  size?: number;
  monochrome?: boolean;
  className?: string;
}) {
  const strokeColor = monochrome ? 'currentColor' : 'var(--color-muted)';
  const sightColor = monochrome ? 'currentColor' : 'var(--color-accent)';
  const circleColor = monochrome ? 'currentColor' : 'var(--color-accent)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Horizontal baseline from (4,24) to (28,24) */}
      <line
        x1="4"
        y1="24"
        x2="28"
        y2="24"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Straight line of sight from (4,24) to (21,11) */}
      <line
        x1="4"
        y1="24"
        x2="21"
        y2="11"
        stroke={sightColor}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Filled circle of radius 3.5 at (22,10) */}
      <circle cx="22" cy="10" r="3.5" fill={circleColor} />
    </svg>
  );
}

export function Logo({
  size = 24,
  showWordmark = true,
  monochrome = false,
  className = '',
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={size} monochrome={monochrome} />
      {showWordmark && (
        <span className="font-semibold text-text tracking-tight text-base leading-none">
          Sightline
        </span>
      )}
    </div>
  );
}
