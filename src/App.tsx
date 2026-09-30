/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './lib/theme';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { Logo } from './components/ui/Logo';
import { CookieConsent } from './components/ui/CookieConsent';
import { LocaleProvider } from './utils/Locales';
import { LocationProvider } from './utils/LocationContext';

// Code-split routes for optimal performance
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const MethodPage = lazy(() => import('./pages/MethodPage').then((m) => ({ default: m.MethodPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const SignInPage = lazy(() => import('./pages/SignInPage').then((m) => ({ default: m.SignInPage })));
const OverviewPage = lazy(() => import('./pages/OverviewPage').then((m) => ({ default: m.OverviewPage })));
const QueriesPage = lazy(() => import('./pages/QueriesPage').then((m) => ({ default: m.QueriesPage })));
const QueryDetailPage = lazy(() => import('./pages/QueryDetailPage').then((m) => ({ default: m.QueryDetailPage })));
const BrandsPage = lazy(() => import('./pages/BrandsPage').then((m) => ({ default: m.BrandsPage })));
const RunsPage = lazy(() => import('./pages/RunsPage').then((m) => ({ default: m.RunsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function RouteLoadingFallback() {
  return (
    <div className="h-full w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-muted">
      <Logo size={24} showWordmark={false} className="animate-pulse mb-3" />
      <span className="text-xs text-muted">
        Loading...
      </span>
    </div>
  );
}

export default function App() {
  const isGitHubPages = window.location.hostname.includes('github.io');
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  return (
    <ThemeProvider>
      <ToastProvider>
        <LocationProvider>
          <LocaleProvider>
            <AuthProvider>
              <Router>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <Routes>
                  {/* Public Website Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/method" element={<MethodPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/sign-in" element={<SignInPage />} />
                  <Route path="/404" element={<NotFoundPage />} />

                  {/* Convenient Aliases */}
                  <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
                  <Route path="/app" element={<Navigate to="/overview" replace />} />

                {/* Protected Workspace Application Routes */}
                <Route
                  path="/overview"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <OverviewPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/queries"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <QueriesPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/queries/:qid"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <QueryDetailPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/brands"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <BrandsPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/runs"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <RunsPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <ReportsPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <AppShell>
                        <SettingsPage />
                      </AppShell>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
            <CookieConsent />
            </Router>
          </AuthProvider>
        </LocaleProvider>
        </LocationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
