import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { SamplePaperSheet } from '../components/marketing/SamplePaperSheet';
import { Faq } from '../components/marketing/Faq';
import { NotebookIllustration, CalendarFlagIllustration, PrintedPageIllustration } from '../components/marketing/MarketingIllustrations';
import { ArrowRight, Menu, X, Globe } from 'lucide-react';
import { useLocale, TargetMarket } from '../utils/Locales';

const SampleBriefPreview = lazy(() =>
  import('../components/marketing/SampleBriefPreview').then((m) => ({
    default: m.SampleBriefPreview,
  }))
);

const fadeUpMotion = {
  initial: { opacity: 0, y: 10 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-20px' as any },
  transition: { duration: 0.35, ease: 'easeOut' as const },
};

const FAQ_ITEMS = [
  {
    question: 'Does Sightline work for Nigerian brands?',
    answer: 'Yes. Sightline tracks brand mentions in AI-generated answers globally. You can add your local brand name, common misspellings, and social handles to ensure you capture every mention regardless of the search origin.',
  },
  {
    question: 'How does it know a brand was mentioned?',
    answer: 'Matches your brand name, handles and aliases, ignoring capital letters. It does not use guessing or estimation, so the evaluation is completely deterministic.',
  },
  {
    question: 'How often does it run?',
    answer: 'Each question can run daily, weekly or on demand. You choose the schedule that fits your monitoring needs per question.',
  },
  {
    question: 'Can I track several clients?',
    answer: 'Yes, create one workspace per client and switch between them from the top bar. Each workspace holds its own questions, brands and results.',
  },
  {
    question: 'Can my team and clients see it?',
    answer: 'Yes, invite people by email as analysts or viewers. Viewers can read results but cannot change anything, which suits clients.',
  },
  {
    question: 'Can I try it without real data?',
    answer: 'Yes, load the sample workspace with fictional data, then clear it in one click whenever you are ready.',
  },
];

export function LandingPage() {
  const { user } = useAuth();
  const { market, setMarket, settings } = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const destinationRoute = user ? '/overview' : '/sign-in';
  const exampleQuery = market === 'Nigeria' ? 'the best payment gateway in Nigeria' : 'the best global payment gateway';

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-accent/22 flex flex-col justify-between text-[16px] sm:text-[17px] leading-[1.6]">
      {/* Masthead */}
      <header className="h-16 border-b border-border bg-surface/90 sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <Logo size={22} showWordmark={true} />
          </Link>

          {/* Desktop Links and CTA */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6 text-xs text-muted">
              <a href="#how-it-works" className="hover:text-text transition-colors">
                How it works
              </a>
              <Link to="/method" className="hover:text-text transition-colors">
                Method
              </Link>
              <a href="#faq" className="hover:text-text transition-colors">
                FAQ
              </a>
            </nav>

            <div className="flex items-center gap-2 border-l border-border pl-4">
              <Globe className="w-3.5 h-3.5 text-muted" />
              <select
                value={market}
                onChange={(e) => setMarket(e.target.value as TargetMarket)}
                className="bg-surface hover:bg-raised border border-border rounded px-2 py-1 text-xs text-text font-medium focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors"
                title="Select Target Market"
              >
                <option value="Nigeria">🇳🇬 Nigeria</option>
                <option value="Global">🌐 Global</option>
              </select>
            </div>

            <Link to={destinationRoute}>
              <Button variant="primary" size="sm">
                Open Sightline
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-muted hover:text-text rounded-md border border-border"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 py-3 space-y-2">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-muted hover:text-text rounded-md hover:bg-raised"
            >
              How it works
            </a>
            <Link
              to="/method"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-muted hover:text-text rounded-md hover:bg-raised"
            >
              Method
            </Link>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs text-muted hover:text-text rounded-md hover:bg-raised"
            >
              FAQ
            </a>
            <div className="flex items-center justify-between px-3 py-2 border-t border-border mt-2">
              <span className="text-xs text-muted">Target Market:</span>
              <select
                value={market}
                onChange={(e) => {
                  setMarket(e.target.value as TargetMarket);
                  setMobileMenuOpen(false);
                }}
                className="bg-surface hover:bg-raised border border-border rounded px-2 py-1 text-xs text-text font-medium focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer transition-colors"
              >
                <option value="Nigeria">🇳🇬 Nigeria</option>
                <option value="Global">🌐 Global</option>
              </select>
            </div>
            <div className="pt-2">
              <Link to={destinationRoute} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Open Sightline
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content: Exactly 6 Sections */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 sm:space-y-20">
        
        {/* SECTION 1: MASTHEAD AND HERO */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <motion.div {...fadeUpMotion} className="lg:col-span-6 space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold font-display text-text tracking-tight leading-[1.15]">
              Are you in the AI answer?
            </h1>

            <p className="text-muted leading-[1.6] max-w-lg">
              When customers ask AI what to buy or which brand to trust, only a few names come up. Sightline checks those answers every week, so you can show clients and managers where a brand stands.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link to={destinationRoute}>
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Open Sightline
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button variant="outline" size="lg">
                  How it works
                </Button>
              </a>
            </div>

            <p className="text-xs text-muted pt-1">
              For social media managers, agencies and in house brand teams.
            </p>
          </motion.div>

          <motion.div {...fadeUpMotion} className="lg:col-span-6">
            <SamplePaperSheet />
          </motion.div>
        </section>

        {/* SECTION 2: HOW IT WORKS */}
        <section id="how-it-works" className="space-y-8 scroll-mt-20 pt-4 border-t border-border/80">
          <motion.div {...fadeUpMotion} className="space-y-2 max-w-2xl">
            <span className="text-xs text-muted block">The routine</span>
            <h2 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
              How it works
            </h2>
            <p className="text-muted leading-[1.6]">
              AI answers only have room for a few names. Sightline shows you whether yours is one of
              them.
            </p>
          </motion.div>

          <div className="border-t border-border divide-y divide-border">
            <motion.div {...fadeUpMotion} className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 flex items-center gap-3">
                <NotebookIllustration size={40} />
                <h3 className="text-base font-semibold font-display text-text">Add your questions</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-muted leading-[1.6]">
                  List what customers might ask an AI, like {exampleQuery}. Add the brand you manage and its competitors.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUpMotion} className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 flex items-center gap-3">
                <CalendarFlagIllustration size={40} />
                <h3 className="text-base font-semibold font-display text-text">We check them on schedule</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-muted leading-[1.6]">
                  Sightline runs each question and reads the answer. It records who was named, in what
                  order, and which sources were cited.
                </p>
              </div>
            </motion.div>

            <motion.div {...fadeUpMotion} className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4 flex items-center gap-3">
                <PrintedPageIllustration size={40} />
                <h3 className="text-base font-semibold font-display text-text">Read your brief</h3>
              </div>
              <div className="md:col-span-8">
                <p className="text-muted leading-[1.6]">
                  Open a plain summary with simple charts and the full answers. Download a report for your client or your team.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION 3: WHAT YOU GET */}
        <section className="space-y-8 pt-4 border-t border-border/80">
          <motion.div {...fadeUpMotion} className="space-y-1">
            <span className="text-xs text-muted block">Deliverables</span>
            <h2 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
              What you get
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start pt-2">
            {/* Left Column: 4 items in ruled list */}
            <div className="lg:col-span-6 divide-y divide-border border-t border-border">
              <div className="py-5 space-y-1">
                <h3 className="text-base font-semibold font-display text-text">One workspace per client</h3>
                <p className="text-muted leading-[1.6]">
                  Keep each client's questions, brands and results separate. Switch between clients from the top bar.
                </p>
              </div>

              <div className="py-5 space-y-1">
                <h3 className="text-base font-semibold font-display text-text">Weekly checks</h3>
                <p className="text-muted leading-[1.6]">
                  Each question runs daily, weekly or on demand with grounded search. Every run is saved, so you can show change over time.
                </p>
              </div>

              <div className="py-5 space-y-1">
                <h3 className="text-base font-semibold font-display text-text">Marked up answers</h3>
                <p className="text-muted leading-[1.6]">
                  Read each answer with brands highlighted and numbered in the order they appear. You see where your client was named and who came first.
                </p>
              </div>

              <div className="py-5 space-y-1">
                <h3 className="text-base font-semibold font-display text-text">Reports for clients</h3>
                <p className="text-muted leading-[1.6]">
                  Generate a report for any period, then download it or print it as a PDF. Cited sources are listed, so you can see which pages the answers rely on.
                </p>
              </div>
            </div>

            {/* Right Column: Sample brief window */}
            <div className="lg:col-span-6 space-y-4">
              <Suspense
                fallback={
                  <div className="h-64 border border-border rounded-md bg-surface flex items-center justify-center text-xs text-muted">
                    Loading sample brief...
                  </div>
                }
              >
                <SampleBriefPreview />
              </Suspense>

              <p className="text-xs text-muted text-center italic">
                Sample data. Fictional brands.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-muted">
                <div className="p-2 border border-border/70 rounded bg-surface">
                  <span className="font-semibold text-text block mb-0.5">Visibility score</span>
                  <span>How often you are named</span>
                </div>
                <div className="p-2 border border-border/70 rounded bg-surface">
                  <span className="font-semibold text-text block mb-0.5">Share of voice</span>
                  <span>Your slice of all mentions</span>
                </div>
                <div className="p-2 border border-border/70 rounded bg-surface">
                  <span className="font-semibold text-text block mb-0.5">Average position</span>
                  <span>Where you appear, 1 is first</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: WHAT IT CAN AND CAN'T TELL YOU */}
        <section className="space-y-6 pt-4 border-t border-border/80">
          <motion.div {...fadeUpMotion} className="space-y-1">
            <span className="text-xs text-muted block">Honest boundaries</span>
            <h2 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
              What it can and can't tell you
            </h2>
          </motion.div>

          <motion.div
            {...fadeUpMotion}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:divide-x divide-border pt-2"
          >
            <div className="space-y-3 md:pr-6">
              <h3 className="text-base font-semibold font-display text-text">What Sightline can tell you</h3>
              <ul className="space-y-2 text-muted leading-[1.6]">
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">.</span>
                  <span>Your rank in AI recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">.</span>
                  <span>Which brands get recommended instead</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent font-bold">.</span>
                  <span>Which sources AI uses to build its answer</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3 md:pl-8">
              <h3 className="text-base font-semibold font-display text-text">What no tool can tell you</h3>
              <ul className="space-y-2 text-muted leading-[1.6]">
                <li className="flex items-start gap-2">
                  <span className="text-clay font-bold">.</span>
                  <span>What every AI product says</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clay font-bold">.</span>
                  <span>Exact rankings in Google AI Overviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clay font-bold">.</span>
                  <span>Followers, likes or post stats</span>
                </li>
              </ul>
            </div>
          </motion.div>

          <p className="text-xs text-muted pt-4 border-t border-border/60">
            Results come from conversational search with live search grounding, so they can differ from other search tools.
          </p>
        </section>

        {/* SECTION 5: FAQ */}
        <section id="faq" className="space-y-6 scroll-mt-20 pt-4 border-t border-border/80">
          <motion.div {...fadeUpMotion} className="space-y-1">
            <span className="text-xs text-muted block">Questions</span>
            <h2 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
              Frequently asked questions
            </h2>
          </motion.div>

          <motion.div {...fadeUpMotion}>
            <Faq items={FAQ_ITEMS} defaultOpenIndex={0} />
          </motion.div>
        </section>

        {/* SECTION 6: CLOSE AND FOOTER */}
        <section className="py-8 sm:py-12 text-center space-y-6 border-t border-border/80">
          <motion.div {...fadeUpMotion} className="space-y-4 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold font-display text-text tracking-tight">
              Find out where you stand.
            </h2>
            <p className="text-muted leading-[1.6]">
              Sign in with Google and set up your first workspace in a few minutes.
            </p>
            <div className="pt-2">
              <Link to={destinationRoute}>
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Open Sightline
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer in one row */}
      <footer className="border-t border-border py-6 px-4 sm:px-8 text-xs text-muted">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
            <span>.</span>
            <Link to="/terms" className="hover:text-text">
              Terms
            </Link>
          </div>
          <span className="text-muted">
            Internal benchmark tool for social media managers and brand teams.
          </span>
        </div>
      </footer>
    </div>
  );
}
