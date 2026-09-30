import React from 'react';
import { TopBar } from './TopBar';
import { useAuth } from '../../contexts/AuthContext';
import { OnboardingFlow } from '../onboarding/OnboardingFlow';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from '../ui/KeyboardShortcutsModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { workspaces, activeWorkspace } = useAuth();
  const { shortcutsModalOpen, setShortcutsModalOpen } = useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors">
      <TopBar onOpenShortcuts={() => setShortcutsModalOpen(true)} />

      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {workspaces.length === 0 || !activeWorkspace ? (
          <OnboardingFlow />
        ) : (
          children
        )}
      </main>

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}
