import React from 'react';
import { Link } from 'react-router-dom';
import { SignpostIllustration } from '../components/marketing/MarketingIllustrations';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="hover:opacity-85 transition-opacity">
          <Logo size={22} showWordmark={true} />
        </Link>
      </header>

      {/* Main 404 Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
        <div className="mb-2">
          <SignpostIllustration size={120} />
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold font-display text-text">
          Page not found
        </h1>

        <p className="text-xs sm:text-sm text-muted max-w-sm">
          That page isn't here. Try the front page.
        </p>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
              Go home
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-muted max-w-4xl mx-auto w-full">
        <span>Sightline</span>
      </footer>
    </div>
  );
}
