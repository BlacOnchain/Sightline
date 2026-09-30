import React from 'react';

interface IllustrationProps {
  className?: string;
  size?: number;
}

// Consistent styling: 1.5px stroke, currentColor, rounded caps, muted accent fill where needed
const strokeProps = {
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SignInIllustration({ className = '', size = 260 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Background grid dots */}
      <circle cx="30" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="70" cy="40" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="30" cy="60" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="50" cy="60" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="70" cy="60" r="1.5" fill="currentColor" opacity="0.3" />

      {/* Main viewport canvas */}
      <rect x="25" y="30" width="150" height="135" rx="8" {...strokeProps} />
      <line x1="25" y1="56" x2="175" y2="56" {...strokeProps} />

      {/* Viewport header dots */}
      <circle cx="40" cy="43" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="50" cy="43" r="2.5" fill="currentColor" opacity="0.4" />
      <circle cx="60" cy="43" r="2.5" fill="currentColor" opacity="0.4" />

      {/* Line of sight diagram */}
      <line x1="45" y1="135" x2="155" y2="135" {...strokeProps} />
      <line x1="45" y1="135" x2="120" y2="85" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="123" cy="83" r="5" fill="var(--color-accent)" opacity="0.85" />

      {/* Tracked data vectors */}
      <line x1="45" y1="75" x2="85" y2="75" {...strokeProps} />
      <line x1="45" y1="88" x2="105" y2="88" {...strokeProps} />
      <line x1="45" y1="101" x2="70" y2="101" {...strokeProps} />

      {/* Target focus ring */}
      <circle cx="123" cy="83" r="12" stroke="var(--color-accent)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

export function EmptyWorkspaceIllustration({ className = '', size = 180 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Workspace box architecture */}
      <rect x="24" y="32" width="112" height="96" rx="8" {...strokeProps} />
      <line x1="24" y1="60" x2="136" y2="60" {...strokeProps} />
      <line x1="56" y1="32" x2="56" y2="128" {...strokeProps} />

      {/* Structure lines */}
      <line x1="70" y1="76" x2="118" y2="76" {...strokeProps} />
      <line x1="70" y1="90" x2="102" y2="90" {...strokeProps} />
      <line x1="70" y1="104" x2="112" y2="104" {...strokeProps} />

      {/* Sightline accent node */}
      <circle cx="40" cy="46" r="3.5" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="40" cy="76" r="2.5" fill="currentColor" opacity="0.3" />
      <circle cx="40" cy="94" r="2.5" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function NoQueriesIllustration({ className = '', size = 180 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Search query box */}
      <rect x="26" y="44" width="108" height="34" rx="6" {...strokeProps} />
      <line x1="42" y1="61" x2="88" y2="61" {...strokeProps} />
      <circle cx="116" cy="61" r="3" fill="var(--color-accent)" opacity="0.8" />

      {/* Sub-results rows */}
      <rect x="26" y="90" width="108" height="16" rx="4" {...strokeProps} opacity="0.6" />
      <line x1="36" y1="98" x2="68" y2="98" {...strokeProps} opacity="0.6" />

      <rect x="26" y="112" width="108" height="16" rx="4" {...strokeProps} opacity="0.4" />
      <line x1="36" y1="120" x2="54" y2="120" {...strokeProps} opacity="0.4" />
    </svg>
  );
}

export function NoRunsIllustration({ className = '', size = 180 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Timeline axis */}
      <line x1="30" y1="120" x2="130" y2="120" {...strokeProps} />
      <line x1="30" y1="120" x2="30" y2="40" {...strokeProps} />

      {/* Stepped trajectory line */}
      <path
        d="M30 100 L 60 100 L 90 70 L 120 70"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data points */}
      <circle cx="60" cy="100" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="90" cy="70" r="3" fill="currentColor" opacity="0.4" />
      <circle cx="120" cy="70" r="4" fill="var(--color-accent)" />

      {/* Clock indicator */}
      <circle cx="115" cy="42" r="12" {...strokeProps} />
      <line x1="115" y1="36" x2="115" y2="42" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="115" y1="42" x2="120" y2="42" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NotFoundIllustration({ className = '', size = 200 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Outer framing */}
      <rect x="30" y="35" width="100" height="90" rx="8" {...strokeProps} />
      <line x1="30" y1="58" x2="130" y2="58" {...strokeProps} />

      {/* 404 text in geometric lines */}
      <path d="M 52 76 L 52 88 L 60 88 M 60 76 L 60 94" {...strokeProps} />
      <rect x="72" y="76" width="16" height="18" rx="2" {...strokeProps} />
      <path d="M 100 76 L 100 88 L 108 88 M 108 76 L 108 94" {...strokeProps} />

      {/* Line of sight broken vector */}
      <line x1="45" y1="110" x2="85" y2="110" {...strokeProps} opacity="0.5" />
      <circle cx="115" cy="110" r="3.5" fill="var(--color-accent)" opacity="0.8" />
    </svg>
  );
}

export function DefineQueriesIllustration({ className = '', size = 120 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      <rect x="18" y="20" width="84" height="80" rx="8" {...strokeProps} />
      <line x1="18" y1="42" x2="102" y2="42" {...strokeProps} opacity="0.4" />
      <circle cx="30" cy="31" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="38" cy="31" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="46" cy="31" r="2" fill="currentColor" opacity="0.5" />

      {/* Query prompt box */}
      <rect x="28" y="52" width="64" height="20" rx="4" stroke="var(--color-accent)" strokeWidth="1.5" fill="var(--color-accent)" fillOpacity="0.08" />
      <circle cx="38" cy="62" r="3.5" stroke="var(--color-accent)" strokeWidth="1.5" />
      <line x1="41" y1="65" x2="45" y2="69" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="50" y1="62" x2="82" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

      {/* Additional query lines */}
      <line x1="28" y1="82" x2="65" y2="82" {...strokeProps} opacity="0.6" />
      <line x1="28" y1="90" x2="50" y2="90" {...strokeProps} opacity="0.4" />
    </svg>
  );
}

export function ScheduleRunsIllustration({ className = '', size = 120 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Clock / schedule ring */}
      <circle cx="60" cy="60" r="38" {...strokeProps} />
      <circle cx="60" cy="60" r="3" fill="var(--color-accent)" />
      <line x1="60" y1="60" x2="60" y2="38" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="60" y1="60" x2="76" y2="60" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Cadence nodes */}
      <circle cx="60" cy="22" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="98" cy="60" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="60" cy="98" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="22" cy="60" r="2" fill="currentColor" opacity="0.6" />

      {/* Sparkle execution telemetry */}
      <path d="M85 35L88 41L94 44L88 47L85 53L82 47L76 44L82 41Z" fill="var(--color-accent)" opacity="0.85" />
    </svg>
  );
}

export function ReadReportIllustration({ className = '', size = 120 }: IllustrationProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-muted ${className}`}
      aria-hidden="true"
    >
      {/* Report canvas */}
      <rect x="24" y="18" width="72" height="84" rx="6" {...strokeProps} />
      <line x1="36" y1="32" x2="65" y2="32" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="42" x2="84" y2="42" {...strokeProps} opacity="0.4" />

      {/* Bar graph representation */}
      <rect x="36" y="66" width="9" height="24" rx="2" fill="var(--color-accent)" opacity="0.9" />
      <rect x="50" y="74" width="9" height="16" rx="2" fill="currentColor" opacity="0.4" />
      <rect x="64" y="79" width="9" height="11" rx="2" fill="currentColor" opacity="0.3" />
      <line x1="32" y1="90" x2="88" y2="90" {...strokeProps} />

      {/* Check badge */}
      <circle cx="82" cy="30" r="7" fill="var(--color-accent)" fillOpacity="0.2" stroke="var(--color-accent)" strokeWidth="1.2" />
      <path d="M79 30L81.5 32.5L85.5 28" stroke="var(--color-accent)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
