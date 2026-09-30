import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqProps {
  items: FaqItem[];
  defaultOpenIndex?: number;
}

export function Faq({ items, defaultOpenIndex = 0 }: FaqProps) {
  return (
    <div className="border-t border-border divide-y divide-border text-[16px] sm:text-[17px]">
      {items.map((item, index) => {
        const isDefaultOpen = defaultOpenIndex === index;
        return (
          <FaqAccordionItem
            key={index}
            question={item.question}
            answer={item.answer}
            defaultOpen={isDefaultOpen}
          />
        );
      })}
    </div>
  );
}

function FaqAccordionItem({
  question,
  answer,
  defaultOpen,
}: {
  question: string;
  answer: string;
  defaultOpen: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    if (defaultOpen && detailsRef.current) {
      detailsRef.current.open = true;
    }
  }, [defaultOpen]);

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const details = detailsRef.current;
    const content = contentRef.current;
    if (!details || !content) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    e.preventDefault();

    if (animationRef.current) {
      animationRef.current.cancel();
    }

    const startHeight = details.open ? content.offsetHeight : 0;
    const endHeight = details.open ? 0 : content.offsetHeight;

    if (!details.open) {
      details.open = true;
    }

    animationRef.current = content.animate(
      [
        { height: `${startHeight}px`, opacity: startHeight === 0 ? 0 : 1 },
        { height: `${endHeight}px`, opacity: endHeight === 0 ? 0 : 1 },
      ],
      {
        duration: 250,
        easing: 'ease-out',
      }
    );

    animationRef.current.onfinish = () => {
      if (endHeight === 0) {
        details.open = false;
      }
      animationRef.current = null;
    };
  };

  return (
    <details
      ref={detailsRef}
      className="group py-5 cursor-pointer transition-all"
      onClick={(e) => {
        // Only intercept if we want custom animation and motion is enabled
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReducedMotion) {
          e.preventDefault();
          const details = detailsRef.current;
          if (!details) return;
          if (details.open) {
            // Close with animation
            handleToggle(e);
          } else {
            // Open with animation
            handleToggle(e);
          }
        }
      }}
    >
      <summary className="flex items-center justify-between font-medium text-text list-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm">
        <span>{question}</span>
        <ChevronDown className="w-4 h-4 text-muted transition-transform duration-200 group-open:rotate-180 shrink-0 ml-4" />
      </summary>
      <div ref={contentRef} className="overflow-hidden">
        <p className="mt-3 text-muted leading-[1.6] pr-6 font-normal">
          {answer}
        </p>
      </div>
    </details>
  );
}
