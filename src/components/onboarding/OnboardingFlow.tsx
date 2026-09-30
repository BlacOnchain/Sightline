import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Logo } from '../ui/Logo';
import { useToast } from '../ui/Toast';
import { createBrand, createQuery } from '../../lib/db';
import { Plus, X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import {
  DeskNameplateIllustration,
  FlagsPlantedIllustration,
  NotebookIllustration,
} from '../marketing/MarketingIllustrations';

const SUGGESTED_QUERIES = [
  'What is the best payment gateway in Nigeria for developers?',
  'Which payment platform supports automated recurring billing in Lagos?',
  'What are the top-rated business banking apps for small merchants in Nigeria?',
  'Is Paystack reliable for collecting card payments?',
  'Which fintech offers the most reliable POS terminal in Nigeria?',
  'How to collect online payments on a Shopify store in Nigeria?',
  'What are the best platforms to get business loans for small businesses in Nigeria?',
  'Which payment solution has the lowest transaction fees in Lagos?',
];

interface CompetitorEntry {
  name: string;
  aliases: string[];
  website?: string;
}

export function OnboardingFlow() {
  const { createWorkspaceAndSelect } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Step 1: Workspace
  const [workspaceName, setWorkspaceName] = useState('');

  // Step 2: Own Brand & Competitors
  const [ownBrandName, setOwnBrandName] = useState('');
  const [ownBrandAliases, setOwnBrandAliases] = useState<string[]>([]);
  const [ownAliasInput, setOwnAliasInput] = useState('');
  const [ownBrandWebsite, setOwnBrandWebsite] = useState('');

  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([]);
  const [compNameInput, setCompNameInput] = useState('');
  const [compAliasesInput, setCompAliasesInput] = useState('');
  const [compWebsiteInput, setCompWebsiteInput] = useState('');

  // Step 3: Starter Queries
  const [queries, setQueries] = useState<string[]>([
    'What is the best payment gateway in Nigeria for developers?',
    'Which payment platform supports automated recurring billing in Lagos?',
    'What are the top-rated business banking apps for small merchants in Nigeria?',
    'Is Paystack reliable for collecting card payments?',
  ]);
  const [customQueryInput, setCustomQueryInput] = useState('');

  // Add own alias tag
  const handleAddOwnAlias = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = ownAliasInput.trim().replace(/^,+|,+$/g, '');
    if (clean && !ownBrandAliases.includes(clean)) {
      setOwnBrandAliases([...ownBrandAliases, clean]);
      setOwnAliasInput('');
    }
  };

  const handleRemoveOwnAlias = (alias: string) => {
    setOwnBrandAliases(ownBrandAliases.filter((a) => a !== alias));
  };

  // Add competitor
  const handleAddCompetitor = () => {
    if (!compNameInput.trim()) return;
    if (competitors.length >= 5) {
      addToast({ type: 'warning', message: 'Maximum 5 competitors allowed in initial setup' });
      return;
    }
    const aliases = compAliasesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setCompetitors([
      ...competitors,
      {
        name: compNameInput.trim(),
        aliases,
        website: compWebsiteInput.trim() || undefined,
      },
    ]);
    setCompNameInput('');
    setCompAliasesInput('');
    setCompWebsiteInput('');
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
  };

  const handleToggleSuggestedQuery = (sug: string) => {
    if (queries.includes(sug)) {
      if (queries.length <= 1) {
        addToast({ type: 'warning', message: 'Keep at least one query' });
        return;
      }
      setQueries(queries.filter((q) => q !== sug));
    } else {
      if (queries.length >= 10) {
        addToast({ type: 'warning', message: 'Maximum 10 starter queries allowed' });
        return;
      }
      setQueries([...queries, sug]);
    }
  };

  const handleAddCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customQueryInput.trim();
    if (!clean) return;
    if (queries.includes(clean)) return;
    if (queries.length >= 10) {
      addToast({ type: 'warning', message: 'Maximum 10 starter queries allowed' });
      return;
    }
    setQueries([...queries, clean]);
    setCustomQueryInput('');
  };

  const handleRemoveQuery = (index: number) => {
    if (queries.length <= 1) {
      addToast({ type: 'warning', message: 'Keep at least one query' });
      return;
    }
    setQueries(queries.filter((_, i) => i !== index));
  };

  const handleCreateWorkspaceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    setStep(2);
  };

  const handleFinish = async () => {
    if (!workspaceName.trim() || !ownBrandName.trim() || queries.length === 0) return;
    setSubmitting(true);
    try {
      const ws = await createWorkspaceAndSelect(workspaceName.trim());
      const wsId = ws.id;

      // Create own brand
      await createBrand(wsId, {
        name: ownBrandName.trim(),
        aliases: ownBrandAliases,
        website: ownBrandWebsite.trim() || undefined,
        kind: 'own',
      });

      // Create competitor brands
      for (const comp of competitors) {
        await createBrand(wsId, {
          name: comp.name,
          aliases: comp.aliases,
          website: comp.website,
          kind: 'competitor',
        });
      }

      // Create queries
      for (const qText of queries) {
        await createQuery(wsId, {
          text: qText,
          category: 'General',
          frequency: 'weekly',
          active: true,
        });
      }

      addToast({ type: 'success', message: 'Workspace set up successfully' });
      window.location.href = '/overview';
    } catch (err) {
      console.error('Failed onboarding completion:', err);
      addToast({ type: 'danger', message: 'Failed to create workspace', description: String(err) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoadSampleWorkspace = async () => {
    setLoadingDemo(true);
    try {
      const ws = await createWorkspaceAndSelect('Paystack (Sample)');
      const wsId = ws.id;

      await createBrand(wsId, {
        name: 'Paystack',
        aliases: ['Paystack', 'Paystack Nigeria', '@paystack', 'paystack.com'],
        website: 'paystack.com',
        kind: 'own',
        isSample: true,
      });

      await createBrand(wsId, {
        name: 'Flutterwave',
        aliases: ['Flutterwave', 'Flutter wave', '@flutterwave'],
        website: 'flutterwave.com',
        kind: 'competitor',
        isSample: true,
      });

      await createBrand(wsId, {
        name: 'Moniepoint',
        aliases: ['Moniepoint', 'Monie point', '@moniepoint'],
        website: 'moniepoint.com',
        kind: 'competitor',
        isSample: true,
      });

      await createQuery(wsId, {
        text: 'What is the best payment gateway in Nigeria for developers?',
        category: 'Payments',
        frequency: 'weekly',
        active: true,
        isSample: true,
      });

      addToast({ type: 'success', message: 'Sample workspace loaded' });
      window.location.href = '/overview';
    } catch (err) {
      console.error('Failed to load sample workspace:', err);
      addToast({ type: 'danger', message: 'Failed to load sample workspace' });
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text py-12 px-4 sm:px-6 flex flex-col items-center justify-between selection:bg-accent/22">
      {/* Top Header */}
      <div className="max-w-2xl w-full flex items-center justify-between pb-6 border-b border-border">
        <Logo size={22} showWordmark={true} />
        <button
          type="button"
          onClick={handleLoadSampleWorkspace}
          disabled={loadingDemo}
          className="text-xs text-accent hover:underline flex items-center gap-1.5 cursor-pointer font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load sample workspace</span>
        </button>
      </div>

      {/* Main Content Form */}
      <div className="max-w-2xl w-full my-auto py-8 space-y-8">
        {/* Step Indicator & Illustration Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/70 pb-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs text-muted font-medium">Setup wizard: Step {step} of 3</span>
            <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text">
              {step === 1 && 'Name your workspace'}
              {step === 2 && 'Add your brand or account'}
              {step === 3 && 'Add search questions'}
            </h1>
          </div>

          <div className="shrink-0 flex items-center justify-center p-2 rounded-md bg-surface border border-border/80">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="illust-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <DeskNameplateIllustration size={64} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div
                  key="illust-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <FlagsPlantedIllustration size={64} />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div
                  key="illust-3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <NotebookIllustration size={56} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STEP 1: Workspace Name */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleCreateWorkspaceSubmit}
            className="space-y-6"
          >
            <p className="text-muted text-sm leading-[1.6]">
              Name your project container to organize your brand tracking, search queries, and team members.
            </p>

            <Input
              label="Workspace name"
              placeholder="e.g. Paystack"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              helperText="Use your client's name if you manage several."
              required
              autoFocus
            />

            <div className="pt-4 flex justify-end">
              <Button
                variant="primary"
                size="md"
                type="submit"
                disabled={!workspaceName.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to brands
              </Button>
            </div>
          </motion.form>
        )}

        {/* STEP 2: Own Brand & Competitors */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <p className="text-muted text-sm leading-[1.6]">
              Add your main brand or handle and any competitors you want to compare against in search answers.
            </p>

            {/* Own Brand Form */}
            <div className="space-y-4 p-5 rounded-md bg-surface border border-border">
              <span className="text-xs font-semibold text-text block">The brand you manage</span>
              <Input
                label="The brand you manage"
                placeholder="e.g., Paystack or @paystack"
                value={ownBrandName}
                onChange={(e) => setOwnBrandName(e.target.value)}
                required
              />
              <Input
                label="Other names and handles"
                placeholder="Type name and press enter"
                value={ownAliasInput}
                onChange={(e) => setOwnAliasInput(e.target.value)}
                onKeyDown={handleAddOwnAlias}
                helperText="Add spellings and handles people use, like @brandname."
              />
              {ownBrandAliases.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ownBrandAliases.map((alias) => (
                    <span
                      key={alias}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-raised border border-border text-xs text-text"
                    >
                      {alias}
                      <button
                        type="button"
                        onClick={() => handleRemoveOwnAlias(alias)}
                        className="text-muted hover:text-text"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <Input
                label="Website domain"
                placeholder="paystack.com"
                value={ownBrandWebsite}
                onChange={(e) => setOwnBrandWebsite(e.target.value)}
              />
            </div>

            {/* Competitors List */}
            <div className="space-y-3 p-5 rounded-md bg-surface border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Competitors (Optional)</span>
                <span className="text-xs text-muted">{competitors.length}/5 added</span>
              </div>

              {competitors.length > 0 && (
                <div className="space-y-2">
                  {competitors.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-raised border border-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-text">{c.name}</span>
                        {c.aliases.length > 0 && (
                          <span className="text-muted ml-2">({c.aliases.join(', ')})</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetitor(idx)}
                        className="text-muted hover:text-danger"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {competitors.length < 5 && (
                <div className="space-y-3 pt-2 border-t border-border/70">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Competitor or similar account"
                      placeholder="e.g., Flutterwave or @flutterwave"
                      value={compNameInput}
                      onChange={(e) => setCompNameInput(e.target.value)}
                    />
                    <Input
                      label="Aliases"
                      placeholder="e.g., @flutterwave, Flutterwave"
                      value={compAliasesInput}
                      onChange={(e) => setCompAliasesInput(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleAddCompetitor}
                      disabled={!compNameInput.trim()}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add competitor
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(1)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep(3)}
                disabled={!ownBrandName.trim()}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to queries
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Starter Queries */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <p className="text-muted text-sm leading-[1.6]">
              Add search queries that potential followers or customers submit to conversational search tools.
            </p>

            {/* Suggestions chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-text block">
                Click to add suggested queries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map((sug) => {
                  const isSelected = queries.includes(sug);
                  return (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleToggleSuggestedQuery(sug)}
                      className={`text-xs px-2.5 py-1.5 rounded-md border text-left transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        isSelected
                          ? 'border-accent bg-accent-subtle text-accent font-medium'
                          : 'border-border bg-surface text-muted hover:text-text hover:bg-raised'
                      }`}
                    >
                      {isSelected ? (
                        <Check className="w-3 h-3 text-accent shrink-0" />
                      ) : (
                        <Plus className="w-3 h-3 text-muted shrink-0" />
                      )}
                      <span className="line-clamp-1">{sug}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Query */}
            <form onSubmit={handleAddCustomQuery} className="flex gap-2">
              <Input
                placeholder="e.g., What is the best coffee subscription for beginners?"
                value={customQueryInput}
                onChange={(e) => setCustomQueryInput(e.target.value)}
              />
              <Button variant="secondary" size="sm" type="submit" disabled={!customQueryInput.trim()}>
                Add
              </Button>
            </form>

            {/* Selected Queries List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-text">
                <span>Selected Queries ({queries.length}/10)</span>
                <span className="text-muted">Minimum 1 required</span>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {queries.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-surface border border-border rounded-md flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="text-muted shrink-0 tabular-nums">#{idx + 1}</span>
                      <span className="text-text truncate">{q}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuery(idx)}
                      className="text-muted hover:text-danger p-0.5 rounded shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep(2)}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleFinish}
                loading={submitting}
                disabled={queries.length < 1}
                icon={<Check className="w-4 h-4" />}
              >
                Finish & View Brief
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl w-full pt-6 border-t border-border text-center text-xs text-muted">
        <span>Sightline workspace setup</span>
      </div>
    </div>
  );
}
