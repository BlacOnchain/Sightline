import React, { useState, useEffect } from 'react';
import { Button } from './Button';

export function CookieConsent() {
  const [accepted, setAccepted] = useState(true); // default to true to avoid flash on mount

  useEffect(() => {
    const hasConsent = localStorage.getItem('sightline-cookie-consent');
    if (!hasConsent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('sightline-cookie-consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-surface border-t border-border shadow-[0_-4px_20px_rgba(24,39,31,0.04)] animate-slide-up">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs sm:text-sm">
        <div className="text-muted leading-relaxed max-w-2xl">
          We use essential cookies to keep you securely signed in and preserve your workspace choices. By continuing to use Sightline, you agree to our{' '}
          <a href="/privacy" className="text-text underline hover:text-accent font-medium">
            Privacy Policy
          </a>
          .
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={handleAccept}>
            Accept cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
