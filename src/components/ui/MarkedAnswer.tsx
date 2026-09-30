import React, { useEffect, useRef, useState } from 'react';
import type { Brand } from '../../types';

export interface MarkedAnswerProps {
  answerText?: string;
  mentions?: { brandId: string; brandName?: string; position: number }[];
  brands?: Brand[] | { id: string; name: string; aliases?: string[]; kind: 'own' | 'competitor' }[];
  className?: string;
}

interface MatchOccurrence {
  start: number;
  end: number;
  matchedText: string;
  brandId: string;
  brandName: string;
  isOwn: boolean;
  position?: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function MarkedAnswer({
  answerText = '',
  mentions = [],
  brands = [],
  className = '',
}: MarkedAnswerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!answerText) {
    return <p className="text-muted italic text-sm">No response text recorded for this run.</p>;
  }

  // Create a map of brandId to position from mentions
  const positionMap = new Map<string, number>();
  for (const m of mentions) {
    positionMap.set(m.brandId, m.position);
  }

  // Collect all occurrences
  const occurrences: MatchOccurrence[] = [];

  for (const brand of brands) {
    const terms = [brand.name, ...(brand.aliases || [])].filter((t) => t && t.trim().length > 0);
    const isOwn = brand.kind === 'own';
    const position = positionMap.get(brand.id);

    for (const term of terms) {
      const trimmed = term.trim();
      const escaped = escapeRegex(trimmed);
      const firstChar = trimmed[0];
      const lastChar = trimmed[trimmed.length - 1];

      let prefix = '(?<=^|[^\\w-])';
      if (/^[^\w-]/.test(firstChar)) prefix = '(?<=^|\\s)';

      let suffix = '(?=$|[^\\w-])';
      if (/[^\w-]/.test(lastChar)) {
        const escapedLast = escapeRegex(lastChar);
        suffix = `(?=$|[^\\w-${escapedLast}])`;
      }

      const regex = new RegExp(`${prefix}${escaped}${suffix}`, 'gi');
      let match: RegExpExecArray | null;

      while ((match = regex.exec(answerText)) !== null) {
        occurrences.push({
          start: match.index,
          end: match.index + match[0].length,
          matchedText: match[0],
          brandId: brand.id,
          brandName: brand.name,
          isOwn,
          position,
        });
      }
    }
  }

  // Sort and remove overlapping matches
  occurrences.sort((a, b) => a.start - b.start || b.end - a.end);
  const nonOverlapping: MatchOccurrence[] = [];
  let lastEnd = 0;

  for (const occ of occurrences) {
    if (occ.start >= lastEnd) {
      nonOverlapping.push(occ);
      lastEnd = occ.end;
    }
  }

  // Build segments
  const segments: React.ReactNode[] = [];
  let cursor = 0;

  nonOverlapping.forEach((occ, idx) => {
    if (occ.start > cursor) {
      segments.push(answerText.slice(cursor, occ.start));
    }

    const delayMs = idx * 80;

    segments.push(
      <span
        key={`match-${occ.start}-${idx}`}
        style={{
          backgroundSize: isVisible ? '100% 90%' : '0% 90%',
          transitionDelay: `${delayMs}ms`,
        }}
        className={`inline-block font-medium marker-highlight px-1 py-0.5 rounded-xs mx-0.5 ${
          occ.isOwn
            ? 'border-b-2 border-accent text-foreground'
            : 'text-foreground'
        }`}
        title={`${occ.brandName} (${occ.isOwn ? 'Primary Brand' : 'Competitor'}${
          occ.position ? ` · Rank ${occ.position}` : ''
        })`}
      >
        <span>{occ.matchedText}</span>
        {occ.position !== undefined && (
          <sup className="ml-0.5 text-[10px] font-bold font-display opacity-80 select-none">
            {occ.position}
          </sup>
        )}
      </span>
    );

    cursor = occ.end;
  });

  if (cursor < answerText.length) {
    segments.push(answerText.slice(cursor));
  }

  return (
    <div
      ref={containerRef}
      className={`leading-relaxed text-sm md:text-base text-foreground font-normal whitespace-pre-line ${className}`}
    >
      {segments}
    </div>
  );
}
