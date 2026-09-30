import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Menu, X } from 'lucide-react';

export function MethodPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'how-run', label: 'How a question is run' },
    { id: 'how-brands', label: 'How brands are found' },
    { id: 'how-position', label: 'How position is counted' },
    { id: 'visibility', label: 'How visibility score works' },
    { id: 'share-of-voice', label: 'How share of voice works' },
    { id: 'worked-example', label: 'A worked example' },
    { id: 'limits', label: 'What this can not tell you' },
  ];

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/22 flex flex-col justify-between text-[16px] sm:text-[17px] leading-[1.6]">
      {/* Masthead */}
      <header className="h-16 border-b border-border bg-surface/90 sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Logo size={22} showWordmark={true} />
          </Link>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex items-center gap-5 text-xs text-muted">
              <Link to="/" className="hover:text-text transition-colors">
                Front page
              </Link>
              <Link to="/method" className="text-text font-semibold border-b border-text pb-0.5">
                Method
              </Link>
              <Link to="/privacy" className="hover:text-text transition-colors">
                Privacy
              </Link>
            </nav>

            <Link to="/sign-in">
              <Button variant="primary" size="sm">
                Open Sightline
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-muted hover:text-text rounded-md border border-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-muted hover:text-text rounded-md hover:bg-raised"
            >
              Front page
            </Link>
            <Link
              to="/method"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-text font-semibold bg-raised rounded-md"
            >
              Method
            </Link>
            <Link
              to="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-muted hover:text-text rounded-md hover:bg-raised"
            >
              Privacy
            </Link>
          </div>
        )}
      </header>

      {/* Main Layout with Sticky TOC Rail */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Table of Contents rail on large screens */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-4 pr-6 border-r border-border/80">
              <span className="text-xs text-muted block">Measurement guide</span>
              <h3 className="text-base font-semibold font-display text-text">Contents</h3>
              <nav className="space-y-2 text-xs">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-muted hover:text-text transition-colors"
                  >
                    {sec.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Narrow Reading Column (max 680px) */}
          <article className="lg:col-span-8 max-w-[680px] space-y-16">
            <div className="border-b border-border pb-6 space-y-2">
              <span className="text-xs text-muted">Calculation rules</span>
              <h1 className="text-3xl sm:text-4xl font-semibold font-display text-text tracking-tight">
                How Sightline measures visibility
              </h1>
              <p className="text-muted leading-[1.6]">
                Every metric is calculated with deterministic server code. Here is how your data is
                collected and scored for social media managers, agencies and in house brand teams.
              </p>
            </div>

            {/* Mobile TOC list for smaller screens */}
            <div className="lg:hidden p-4 bg-surface border border-border rounded-md space-y-2 text-xs">
              <span className="font-semibold text-text block mb-1">Contents</span>
              <ul className="space-y-1.5 text-muted">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a href={`#${sec.id}`} className="hover:text-text underline">
                      {sec.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <section id="how-run" className="space-y-3 scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                How a question is run
              </h2>
              <p className="text-muted leading-[1.6]">
                Sightline sends the question to the search model with search grounding enabled. It saves the
                full answer text and the web sources the model cited. If the request fails or takes
                longer than 45 seconds, the run is saved as failed with a clear message, and it is
                not counted.
              </p>
            </section>

            <section id="how-brands" className="space-y-3 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                How brands are found
              </h2>
              <p className="text-muted leading-[1.6]">
                Sightline looks for each brand name, handle, and any other names you added. It matches whole
                words or handles and ignores capital letters. It does not use AI to decide this, so the
                same answer always gives the same result.
              </p>
            </section>

            <section id="how-position" className="space-y-3 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                How position is counted
              </h2>
              <p className="text-muted leading-[1.6]">
                Brands and accounts are ranked by where they first appear in the answer. The first tracked account
                named is position 1, the next is position 2, and so on. An account that is not named has
                no position.
              </p>
            </section>

            <section id="visibility" className="space-y-3 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                How visibility score works
              </h2>
              <p className="text-muted leading-[1.6]">
                It is the share of completed runs where your own brand or account was named, rounded to a whole
                percent. Runs that failed are left out.
              </p>
            </section>

            <section id="share-of-voice" className="space-y-3 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                How share of voice works
              </h2>
              <p className="text-muted leading-[1.6]">
                Add up every mention of every tracked account in the period. Each account share is its
                mentions divided by that total, rounded to a whole percent. Average position is the
                mean of an account positions, over the runs where it was named, rounded to one decimal.
              </p>
            </section>

            <section id="worked-example" className="space-y-4 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                A worked example
              </h2>
              <p className="text-muted leading-[1.6]">
                Here is a brief with 12 completed runs, your brand named in 9 of them (visibility score
                75 percent), and positions adding up to 14 (average position 1.6).
              </p>

              {/* Table without box/card container */}
              <div className="w-full overflow-x-auto pt-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted">
                      <th className="py-2.5 font-medium">Brand</th>
                      <th className="py-2.5 font-medium">Mentions</th>
                      <th className="py-2.5 font-medium">Share</th>
                      <th className="py-2.5 font-medium text-right">Avg pos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70 text-text">
                    <tr>
                      <td className="py-3 font-semibold">Paystack</td>
                      <td className="py-3">9</td>
                      <td className="py-3">50 percent</td>
                      <td className="py-3 text-right">1.6</td>
                    </tr>
                    <tr>
                      <td className="py-3">Flutterwave</td>
                      <td className="py-3">6</td>
                      <td className="py-3">33 percent</td>
                      <td className="py-3 text-right">2.1</td>
                    </tr>
                    <tr>
                      <td className="py-3">Moniepoint</td>
                      <td className="py-3">3</td>
                      <td className="py-3">17 percent</td>
                      <td className="py-3 text-right">2.8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section id="limits" className="space-y-3 pt-8 border-t border-border scroll-mt-24">
              <h2 className="text-2xl font-semibold font-display text-text">
                What this can not tell you
              </h2>
              <p className="text-muted leading-[1.6]">
                Results come from conversational search with live search grounding, so they can differ from other search
                tools. Treat the numbers as a reliable signal for trends, not as a guarantee of what
                every search engine says. Answers can vary a little between runs, which is why Sightline records
                many.
              </p>
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-8 text-xs text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-text font-medium hover:underline">
              Sightline
            </Link>
            <span>.</span>
            <Link to="/method" className="text-text font-semibold">
              Method
            </Link>
            <span>.</span>
            <Link to="/privacy" className="hover:text-text">
              Privacy
            </Link>
            <span>.</span>
            <Link to="/terms" className="hover:text-text">
              Terms
            </Link>
          </div>

          <div>
            <span>Internal benchmark tool for social media managers and brand teams.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
