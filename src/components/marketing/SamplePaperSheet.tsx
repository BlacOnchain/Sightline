import React, { useState, useEffect } from 'react';

export function SamplePaperSheet() {
  const [highlightActive, setHighlightActive] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHighlightActive(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none pt-4 pb-6">
      {/* Signature Paper Sheet in Warm Sand */}
      <div
        className="relative border border-border rounded-sm p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(24,39,31,0.06)] transform rotate-1 transition-transform duration-500 hover:rotate-0"
        style={{
          backgroundColor: 'var(--color-sheet)',
          backgroundImage:
            'radial-gradient(var(--color-border) 0.5px, transparent 0.5px), radial-gradient(var(--color-border) 0.5px, var(--color-sheet) 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px',
        }}
      >
        {/* Paper Header */}
        <div className="border-b border-border/70 pb-3 mb-4 flex items-center justify-between text-xs text-muted">
          <span className="font-medium text-text text-xs">Evaluated prompt</span>
          <span className="tabular-nums">Weekly run</span>
        </div>

        {/* Prompt Question */}
        <div className="mb-4">
          <p className="font-display text-base sm:text-lg text-text italic">
            "What is the best coffee subscription for beginners?"
          </p>
        </div>

        {/* Answer Box - snippet with highlighted brands and margin notes */}
        <div className="text-xs sm:text-sm text-text leading-relaxed font-normal space-y-3 pt-1">
          <p className="relative flex flex-wrap items-center gap-1.5">
            <span>For developer-focused payments, start with</span>
            <span
              className="inline-block px-1 py-0.5 rounded-xs transition-all duration-500 ease-out font-medium"
              style={{
                backgroundColor: highlightActive ? 'var(--color-highlight)' : 'transparent',
                color: highlightActive ? 'var(--color-highlight-text)' : 'inherit',
                transitionDelay: '100ms',
              }}
            >
              Paystack
              <sup className="ml-0.5 text-[10px] font-bold font-display opacity-80 select-none">
                1
              </sup>
            </span>
            <span className="text-[11px] font-display text-muted italic">named first</span>
            <span>. They offer flexible settlements and approachable SDK integration notes.</span>
          </p>

          <p className="relative flex flex-wrap items-center gap-1.5">
            <span>Other recommended options include</span>
            <span
              className="inline-block px-1 py-0.5 rounded-xs transition-all duration-500 ease-out font-medium"
              style={{
                backgroundColor: highlightActive ? 'var(--color-highlight)' : 'transparent',
                color: highlightActive ? 'var(--color-highlight-text)' : 'inherit',
                transitionDelay: '300ms',
              }}
            >
              Flutterwave
              <sup className="ml-0.5 text-[10px] font-bold font-display opacity-80 select-none">
                2
              </sup>
            </span>
            <span className="text-[11px] font-display text-muted italic">named second</span>
            <span>. Moniepoint was</span>
            <span className="text-[11px] font-display text-muted italic">not named</span>
            <span>in this answer.</span>
          </p>
        </div>

        {/* Margin / Rank Annotations */}
        <div className="mt-5 pt-4 border-t border-border/70 grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <span className="block text-[11px] text-accent font-semibold">Position 1</span>
            <span className="text-text font-medium text-xs">Paystack</span>
            <span className="block text-[10px] text-muted font-normal italic">named first</span>
          </div>
          <div>
            <span className="block text-[11px] text-clay font-semibold">Position 2</span>
            <span className="text-text font-medium text-xs">Flutterwave</span>
            <span className="block text-[10px] text-muted font-normal italic">named second</span>
          </div>
          <div>
            <span className="block text-[11px] text-muted font-semibold">Competitor</span>
            <span className="text-text font-medium text-xs">Moniepoint</span>
            <span className="block text-[10px] text-muted font-normal italic">not named</span>
          </div>
        </div>

        {/* Small bottom note */}
        <div className="mt-4 text-center">
          <span className="text-[11px] text-muted">Sample data. Fictional brands.</span>
        </div>
      </div>
    </div>
  );
}
