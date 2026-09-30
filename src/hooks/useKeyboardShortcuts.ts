import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const lastKeyRef = useRef<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently inside an input, textarea, or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for '?' key to toggle shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Check for '/' key to focus search
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[data-search-input], input[placeholder*="Search"], input[type="search"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Handle sequence: 'g' then 'o', 'g' then 'q'
      if (e.key === 'g') {
        lastKeyRef.current = 'g';
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          lastKeyRef.current = null;
        }, 1000);
        return;
      }

      if (lastKeyRef.current === 'g') {
        if (e.key === 'o') {
          e.preventDefault();
          lastKeyRef.current = null;
          navigate('/overview');
          return;
        }
        if (e.key === 'q') {
          e.preventDefault();
          lastKeyRef.current = null;
          navigate('/queries');
          return;
        }
      }

      lastKeyRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate]);

  return {
    shortcutsModalOpen,
    setShortcutsModalOpen,
  };
}
