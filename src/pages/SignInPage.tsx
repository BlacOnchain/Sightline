import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/ui/Logo';
import {
  HorizonFlagsIllustration,
  NotebookIllustration,
  CalendarFlagIllustration,
  PrintedPageIllustration,
} from '../components/marketing/MarketingIllustrations';
import { SplitLayout } from '../components/marketing/SplitLayout';
import { useToast } from '../components/ui/Toast';

export function SignInPage() {
  const { user, loading, signIn } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const { addToast } = useToast();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg text-text">
        <div className="flex flex-col items-center gap-3">
          <Logo size={24} showWordmark={false} className="animate-pulse" />
          <span className="text-xs text-muted">Loading Sightline</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/overview" replace />;
  }

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signIn();
    } catch (err: unknown) {
      let desc = 'Please check your connection and try again.';
      if (err instanceof Error) {
        if (err.message.includes('popup-blocked')) {
          desc = 'Your browser blocked the sign in window. Allow popups for this site and try again.';
        } else if (err.message.includes('internal-error')) {
          desc = 'Authentication was interrupted. Please ensure cookies or storage access are enabled for Google accounts, or retry.';
        } else if (err.message.includes('popup-closed-by-user')) {
          desc = 'The sign in window closed before you finished.';
        } else {
          desc = err.message;
        }
      }
      addToast({
        type: 'danger',
        message: 'Sign in failed',
        description: desc,
      });
    } finally {
      setSigningIn(false);
    }
  };

  const asideContent = (
    <div className="flex flex-col justify-between h-full max-w-lg mx-auto w-full space-y-6">
      {/* Top Wordmark */}
      <div>
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity">
          <Logo size={22} showWordmark={true} />
        </Link>
      </div>

      {/* Middle Headline, Paragraph & Larger Illustration */}
      <div className="space-y-6 my-auto py-4">
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            See when AI names your brand.
          </h1>
          <p className="text-muted leading-[1.6]">
            Sightline checks AI answers for your name, handles and brand every week. You see who was named, in what order, and how that changes.
          </p>
        </div>

        <div className="py-3 flex justify-center bg-surface/40 rounded-md border border-border/60">
          <HorizonFlagsIllustration size={200} />
        </div>

        {/* Three short lines with small illustrations */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3.5">
            <NotebookIllustration size={36} />
            <span className="text-sm font-medium text-text">Add your questions</span>
          </div>
          <div className="flex items-center gap-3.5">
            <CalendarFlagIllustration size={36} />
            <span className="text-sm font-medium text-text">We check them weekly</span>
          </div>
          <div className="flex items-center gap-3.5">
            <PrintedPageIllustration size={36} />
            <span className="text-sm font-medium text-text">Read your brief</span>
          </div>
        </div>
      </div>

      {/* Bottom spacing placeholder */}
      <div className="text-xs text-muted">
        <span>Grounded brand visibility</span>
      </div>
    </div>
  );

  return (
    <SplitLayout formSide="right" aside={asideContent}>
      <div className="space-y-6 w-full">
        {/* Top right back link */}
        <div className="flex justify-end mb-2">
          <Link to="/" className="text-xs text-muted hover:text-text transition-colors">
            Back to front page
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold font-display text-text">Sign in to Sightline</h2>
          <p className="text-muted leading-[1.6] text-sm">
            Use your Google account. The first time you sign in, we set up your workspace.
          </p>
        </div>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-surface hover:bg-raised text-text rounded-md border border-border transition-colors font-medium text-sm shadow-xs cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{signingIn ? 'Signing in...' : 'Continue with Google'}</span>
        </button>

        <p className="text-xs text-muted text-center">
          We only store the details you add to your workspace.
        </p>

        <div className="pt-4 border-t border-border space-y-3">
          <p className="text-[11px] text-muted leading-[1.6]">
            Results come from conversational search with live search grounding, so they can differ from other search
            tools.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-muted pt-2">
            <Link to="/" className="hover:text-text transition-colors">
              Front page
            </Link>
            <span>·</span>
            <Link to="/method" className="hover:text-text transition-colors">
              Method
            </Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-text transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-text transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </SplitLayout>
  );
}
