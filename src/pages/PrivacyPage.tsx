import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between selection:bg-accent/20">
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
          <span className="text-xs text-muted">Plain terms</span>
          <h1 className="text-3xl sm:text-4xl font-semibold font-display text-text tracking-tight">
            Privacy policy
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Last updated September 29, 2026.
          </p>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-muted leading-relaxed">
          {/* Summary Box */}
          <div className="p-4 bg-surface border border-border rounded-md text-text">
            <strong className="text-text block mb-1 font-semibold">The short version:</strong>
            Sightline stores only the workspace data you type in and the search answers returned by
            the evaluation model. We do not sell your information or build advertising profiles.
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              1. What is stored
            </h2>
            <p>
              When you use Sightline, we save the information you give us to run your workspace:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-muted">
              <li>Your email address and name from your Google account to log you in.</li>
              <li>The brand names, alternate names, and websites you add.</li>
              <li>The questions you ask Sightline to check.</li>
              <li>
                The answers returned by the evaluation engine with live grounding, including detected
                names and cited websites.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              2. Your API keys stay on the server
            </h2>
            <p>
              The API key stays securely on the server. Client code in your browser never has access
              to secrets. Every evaluation request is authenticated through verified tokens.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              3. Who can see your workspace
            </h2>
            <p>
              Only people invited to your workspace can view its brands, questions, and briefs.
              Database security rules ensure that accounts cannot access workspaces they do not
              belong to.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold font-display text-text">
              4. How to delete your data
            </h2>
            <p>
              You are in full control of what you store:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-1 text-muted">
              <li>You can delete individual questions or brands at any time.</li>
              <li>
                Workspace owners can permanently delete an entire workspace and its run history in
                the Settings page.
              </li>
            </ul>
          </section>

          <div className="pt-6 border-t border-border text-xs text-muted">
            If you have questions about this policy, contact the team at{' '}
            <a
              href="https://blac-portfolio.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-text font-medium underline hover:text-accent"
            >
              blac-portfolio.vercel.app
            </a>
            .
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-8 text-xs text-muted">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-text font-medium hover:underline">
              Sightline
            </Link>
            <span>·</span>
            <Link to="/method" className="hover:text-text">
              Method
            </Link>
            <span>·</span>
            <Link to="/privacy" className="text-text font-medium">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-text">
              Terms
            </Link>
          </div>

          <div>
            <span>Built by </span>
            <a
              href="https://blac-portfolio.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-text font-medium hover:underline"
            >
              Blac
            </a>
            <span>.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
