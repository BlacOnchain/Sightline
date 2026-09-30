import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
  'aria-label'?: string;
}

const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// 1. Notebook line illustration
export function NotebookIllustration({ className = '', size = 48, 'aria-label': ariaLabel = 'Notebook illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <rect x="10" y="8" width="28" height="32" rx="2" fill="var(--color-surface)" {...strokeProps} />
      <line x1="8" y1="14" x2="12" y2="14" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="20" x2="12" y2="20" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="26" x2="12" y2="26" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="32" x2="12" y2="32" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="16" x2="32" y2="16" {...strokeProps} opacity="0.4" />
      <line x1="16" y1="22" x2="30" y2="22" {...strokeProps} opacity="0.4" />
      <line x1="16" y1="28" x2="28" y2="28" {...strokeProps} opacity="0.4" />
      <line x1="16" y1="34" x2="24" y2="34" {...strokeProps} opacity="0.4" />
    </svg>
  );
}

// 2. Calendar with Flag illustration
export function CalendarFlagIllustration({ className = '', size = 48, 'aria-label': ariaLabel = 'Calendar illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <rect x="8" y="10" width="32" height="28" rx="2" fill="var(--color-surface)" {...strokeProps} />
      <line x1="8" y1="18" x2="40" y2="18" {...strokeProps} opacity="0.6" />
      <line x1="16" y1="6" x2="16" y2="11" {...strokeProps} />
      <line x1="32" y1="6" x2="32" y2="11" {...strokeProps} />
      <circle cx="16" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="32" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="16" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
      <path d="M24 30 L24 22 L31 25 L24 28" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="32" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

// 3. Printed Page illustration
export function PrintedPageIllustration({ className = '', size = 48, 'aria-label': ariaLabel = 'Printed page illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M10 8 H28 L38 18 V38 H10 Z" fill="var(--color-surface)" {...strokeProps} />
      <path d="M28 8 V18 H38" {...strokeProps} opacity="0.7" />
      <line x1="16" y1="16" x2="24" y2="16" stroke="var(--color-accent)" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="16" y1="23" x2="32" y2="23" {...strokeProps} opacity="0.5" />
      <line x1="16" y1="28" x2="32" y2="28" {...strokeProps} opacity="0.5" />
      <line x1="16" y1="33" x2="26" y2="33" {...strokeProps} opacity="0.5" />
    </svg>
  );
}

// 4. Horizon Flags Illustration with 2px strokes and CSS bounce keyframes
export function HorizonFlagsIllustration({ className = '', size = 210, 'aria-label': ariaLabel = 'Horizon flags illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size * 0.8}
      viewBox="0 0 220 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <style>{`
        @keyframes drawHorizon {
          from { stroke-dashoffset: 220; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes flagBounce {
          0% { transform: translateY(60px); opacity: 0; }
          60% { transform: translateY(-8px); opacity: 1; }
          80% { transform: translateY(4px); }
          100% { transform: translateY(0); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .horizon-line, .flag-group-1, .flag-group-2, .flag-group-3 {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
        .horizon-line {
          stroke-dasharray: 220;
          animation: drawHorizon 700ms ease-out forwards;
        }
        .flag-group-1 {
          animation: flagBounce 600ms ease-out forwards;
        }
        .flag-group-2 {
          animation: flagBounce 700ms ease-out 150ms forwards;
        }
        .flag-group-3 {
          animation: flagBounce 800ms ease-out 300ms forwards;
        }
      `}</style>

      {/* Multiple rolling terrain ridges with 2px strokes */}
      <path
        d="M15 120 C 60 105, 110 130, 205 112"
        className="horizon-line"
        {...strokeProps}
        strokeWidth="2"
      />
      <path
        d="M25 135 C 75 125, 135 142, 195 128"
        {...strokeProps}
        strokeWidth="2"
        opacity="0.35"
      />
      <path
        d="M40 148 C 90 140, 150 152, 185 142"
        {...strokeProps}
        strokeWidth="2"
        opacity="0.2"
      />

      {/* Flag 1: Muted competitor (Position 3) */}
      <g className="flag-group-1" transform="translate(65, 0)">
        <line x1="0" y1="116" x2="0" y2="72" {...strokeProps} strokeWidth="2" />
        <path d="M0 72 L18 78 L0 84 Z" fill="var(--color-muted)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="70" r="2.5" fill="currentColor" />
        <text x="-4" y="105" fontSize="10" fill="var(--color-muted)" fontFamily="sans-serif" opacity="0.7">3</text>
      </g>

      {/* Flag 2: Accent green brand flag in center (Position 1 - Tallest) */}
      <g className="flag-group-2" transform="translate(115, 0)">
        <line x1="0" y1="121" x2="0" y2="48" {...strokeProps} strokeWidth="2" />
        <path d="M0 48 L24 56 L0 64 Z" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="45" r="3.5" fill="var(--color-accent)" />
        <text x="-4" y="95" fontSize="11" fill="var(--color-accent)" fontWeight="bold" fontFamily="sans-serif">1</text>
      </g>

      {/* Flag 3: Muted competitor (Position 2) */}
      <g className="flag-group-3" transform="translate(165, 0)">
        <line x1="0" y1="114" x2="0" y2="62" {...strokeProps} strokeWidth="2" />
        <path d="M0 62 L20 69 L0 76 Z" fill="var(--color-muted)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="60" r="2.5" fill="currentColor" />
        <text x="-4" y="100" fontSize="10" fill="var(--color-muted)" fontFamily="sans-serif" opacity="0.7">2</text>
      </g>
    </svg>
  );
}

// 5. Desk Nameplate Illustration (Onboarding Step 1)
export function DeskNameplateIllustration({ className = '', size = 120, 'aria-label': ariaLabel = 'Desk nameplate illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M20 90 H140 L150 105 H10 Z" fill="var(--color-surface)" {...strokeProps} />
      <line x1="10" y1="90" x2="150" y2="90" {...strokeProps} strokeWidth="2" />
      <path d="M60 70 H100 L105 90 H55 Z" fill="var(--color-raised)" {...strokeProps} />
      <line x1="68" y1="80" x2="92" y2="80" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 6. Flags Planted Illustration (Onboarding Step 2)
export function FlagsPlantedIllustration({ className = '', size = 120, 'aria-label': ariaLabel = 'Flags planted illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M20 85 Q 80 75 140 85" {...strokeProps} strokeWidth="2" />
      <line x1="60" y1="80" x2="60" y2="45" {...strokeProps} />
      <path d="M60 45 L74 51 L60 57 Z" fill="var(--color-muted)" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <line x1="100" y1="82" x2="100" y2="35" {...strokeProps} />
      <path d="M100 35 L118 42 L100 49 Z" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// 7. Signpost Illustration (for NotFoundPage)
export function SignpostIllustration({ className = '', size = 120, 'aria-label': ariaLabel = 'Signpost illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <line x1="60" y1="20" x2="60" y2="110" {...strokeProps} strokeWidth="2" />
      <path d="M30 40 H80 L90 50 L80 60 H30 Z" fill="var(--color-surface)" {...strokeProps} />
      <path d="M90 70 H40 L30 80 L40 90 H90 Z" fill="var(--color-surface)" {...strokeProps} />
    </svg>
  );
}

// 8. Flag On Ridge Illustration
export function FlagOnRidgeIllustration({ className = '', size = 120, 'aria-label': ariaLabel = 'Flag on ridge illustration' }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-text ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <path d="M10 95 C 35 90, 50 78, 70 70 C 88 63, 100 68, 110 74" {...strokeProps} strokeWidth="2" />
      <line x1="70" y1="70" x2="70" y2="35" {...strokeProps} />
      <path d="M70 35 L86 41 L70 47 Z" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
