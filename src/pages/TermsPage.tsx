import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent/20 text-[16px] sm:text-[17px] leading-[1.6]">
      {/* Header */}
      <header className="h-16 border-b border-border bg-surface/90 sticky top-0 z-30 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Logo size={22} showWordmark={true} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
                Front page
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        <div className="border-b border-border pb-6 space-y-2">
          <span className="text-xs text-muted">Agreement rules</span>
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-text tracking-tight">
            Terms of service
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Last updated September 29, 2026.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-muted leading-relaxed">
          {/* Summary Box */}
          <div className="p-4 bg-surface border border-border rounded-md text-text">
            <strong className="text-text block mb-1 font-semibold">The short version:</strong>
            These terms describe your rights and responsibilities when using Sightline to track brands in conversational AI search results.
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              1. Account registration
            </h2>
            <p>
              Sightline is built for social media managers, agencies, and brand teams. To create a workspace and store brand data, you must register and authenticate using your verified Google account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              2. Your workspace and brand data
            </h2>
            <p>
              You own all the custom queries, brand settings, and report configurations you enter. Sightline stores and processes this data solely to retrieve and evaluate search results on your behalf.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              3. Query run schedules
            </h2>
            <p>
              Your queries are run on schedules (daily, weekly, or on demand) using the search evaluation API. We enforce rate limiting and concurrency restrictions to protect our backend systems and ensure stability for all teams.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              4. Complete deletion
            </h2>
            <p>
              You have the right to permanently remove your brand settings, run histories, and entire workspaces. Deleting a workspace from the Settings page completely clears all related documents from our database.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-8 text-xs text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-text font-medium hover:underline">
              Sightline
            </Link>
            <span>.</span>
            <Link to="/method" className="hover:text-text">
              Method
            </Link>
            <span>.</span>
            <Link to="/privacy" className="hover:text-text">
              Privacy
            </Link>
          </div>

          <div>
            <span>Built in compliance with fair data policies.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
