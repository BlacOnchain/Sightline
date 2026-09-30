import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { NoRunsIllustration } from '../components/illustrations/Illustrations';
import { Play, ExternalLink, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { getWorkspaceQueries, getWorkspaceBrands, getWorkspaceRuns } from '../lib/db';
import type { TrackedQuery, Brand, RunRecord } from '../types';
import { useToast } from '../components/ui/Toast';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export function OverviewPage() {
  const { activeWorkspace, activeRole, getIdToken } = useAuth();
  const { addToast } = useToast();

  const [periodDays, setPeriodDays] = useState<7 | 30 | 90>(30);
  const [queries, setQueries] = useState<TrackedQuery[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningAll, setRunningAll] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [clearingDemo, setClearingDemo] = useState(false);

  const loadData = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const [qList, bList, rList] = await Promise.all([
        getWorkspaceQueries(activeWorkspace.id),
        getWorkspaceBrands(activeWorkspace.id),
        getWorkspaceRuns(activeWorkspace.id, 100),
      ]);
      setQueries(qList);
      setBrands(bList);
      setRuns(rList);
    } catch (err) {
      console.error('Failed to load brief data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const ownBrand = useMemo(() => brands.find((b) => b.kind === 'own'), [brands]);
  const hasSampleData = useMemo(() => runs.some((r) => r.isSample) || brands.some((b) => b.isSample), [runs, brands]);

  // Filter runs by current period and previous period
  const {
    currentPeriodRuns,
    prevPeriodRuns,
    visibilityScore,
    prevVisibilityScore,
    avgPosition,
    prevAvgPosition,
    shareOfVoice,
    prevShareOfVoice,
    timelineData,
    shareOfVoiceBars,
    topSources,
    editorialSentence,
  } = useMemo(() => {
    const now = Date.now();
    const periodMs = periodDays * 24 * 60 * 60 * 1000;
    const currentStart = now - periodMs;
    const prevStart = currentStart - periodMs;

    const currentRuns = runs.filter((r) => {
      const t = new Date(r.startedAt).getTime();
      return t >= currentStart && t <= now && r.status === 'completed';
    });

    const prevRuns = runs.filter((r) => {
      const t = new Date(r.startedAt).getTime();
      return t >= prevStart && t < currentStart && r.status === 'completed';
    });

    // 1. Visibility Score (percentage of runs mentioning own brand)
    const ownCurrentMentions = currentRuns.filter((r) =>
      r.mentions?.some((m) => m.brandId === ownBrand?.id)
    );
    const ownPrevMentions = prevRuns.filter((r) =>
      r.mentions?.some((m) => m.brandId === ownBrand?.id)
    );

    const vis = currentRuns.length > 0 ? Math.round((ownCurrentMentions.length / currentRuns.length) * 100) : 0;
    const prevVis = prevRuns.length > 0 ? Math.round((ownPrevMentions.length / prevRuns.length) * 100) : 0;

    // 2. Average Position
    let totalPos = 0;
    for (const r of ownCurrentMentions) {
      const m = r.mentions.find((item) => item.brandId === ownBrand?.id);
      if (m) totalPos += m.position;
    }
    const avgPos = ownCurrentMentions.length > 0 ? Math.round((totalPos / ownCurrentMentions.length) * 10) / 10 : 0;

    let prevTotalPos = 0;
    for (const r of ownPrevMentions) {
      const m = r.mentions.find((item) => item.brandId === ownBrand?.id);
      if (m) prevTotalPos += m.position;
    }
    const prevAvgPos = ownPrevMentions.length > 0 ? Math.round((prevTotalPos / ownPrevMentions.length) * 10) / 10 : 0;

    // 3. Share of Voice
    let allMentionsCount = 0;
    let ownMentionsCount = 0;
    const brandCounts: Record<string, number> = {};
    for (const b of brands) brandCounts[b.id] = 0;

    for (const r of currentRuns) {
      for (const m of r.mentions || []) {
        if (brandCounts[m.brandId] !== undefined) {
          brandCounts[m.brandId]++;
          allMentionsCount++;
          if (m.brandId === ownBrand?.id) {
            ownMentionsCount++;
          }
        }
      }
    }

    const sov = allMentionsCount > 0 ? Math.round((ownMentionsCount / allMentionsCount) * 100) : 0;

    let prevAllMentions = 0;
    let prevOwnMentions = 0;
    for (const r of prevRuns) {
      for (const m of r.mentions || []) {
        if (m.brandId === ownBrand?.id) prevOwnMentions++;
        if (brands.some((b) => b.id === m.brandId)) prevAllMentions++;
      }
    }
    const prevSov = prevAllMentions > 0 ? Math.round((prevOwnMentions / prevAllMentions) * 100) : 0;

    // 4. Timeline data for Line Chart
    const bucketInterval = periodDays <= 7 ? 1 : periodDays <= 30 ? 3 : 7;
    const buckets: Record<string, { total: number; ownMentioned: number }> = {};

    for (let d = periodDays; d >= 0; d -= bucketInterval) {
      const dateKey = new Date(now - d * 24 * 60 * 60 * 1000).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      buckets[dateKey] = { total: 0, ownMentioned: 0 };
    }

    for (const r of currentRuns) {
      const dateKey = new Date(r.startedAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
      });
      if (buckets[dateKey]) {
        buckets[dateKey].total++;
        if (r.mentions?.some((m) => m.brandId === ownBrand?.id)) {
          buckets[dateKey].ownMentioned++;
        }
      } else {
        const keys = Object.keys(buckets);
        if (keys.length > 0) {
          const fallback = keys[keys.length - 1];
          buckets[fallback].total++;
          if (r.mentions?.some((m) => m.brandId === ownBrand?.id)) {
            buckets[fallback].ownMentioned++;
          }
        }
      }
    }

    const timeline = Object.entries(buckets).map(([date, val]) => ({
      date,
      score: val.total > 0 ? Math.round((val.ownMentioned / val.total) * 100) : vis,
    }));

    // 5. Horizontal Bar Chart data: Share of voice by brand
    const sovBars = brands.map((b) => {
      const count = brandCounts[b.id] || 0;
      const pct = allMentionsCount > 0 ? Math.round((count / allMentionsCount) * 100) : 0;
      return {
        id: b.id,
        name: b.name,
        percentage: pct,
        isOwn: b.kind === 'own',
        mentions: count,
      };
    }).sort((a, b) => b.percentage - a.percentage);

    // 6. Top Sources grouped by domain
    const domainCounts: Record<string, number> = {};
    for (const r of currentRuns) {
      for (const s of r.sources || []) {
        if (s.domain) {
          domainCounts[s.domain] = (domainCounts[s.domain] || 0) + 1;
        }
      }
    }

    const sources = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 7. Editorial plain sentence
    const ownName = ownBrand ? ownBrand.name : 'Your brand';
    const n = ownCurrentMentions.length;
    const total = currentRuns.length;
    const prevN = ownPrevMentions.length;

    let trendStr = 'the same as';
    if (n > prevN) {
      trendStr = `up from ${prevN}`;
    } else if (n < prevN) {
      trendStr = `down from ${prevN}`;
    }

    let sentence = total > 0
      ? `${ownName} appeared in ${n} of ${total} answers this period, ${trendStr} the period before.`
      : `${ownName} has no recorded query runs for this ${periodDays}-day period.`;

    const topCompetitor = sovBars.find((b) => !b.isOwn && b.mentions > n);
    if (topCompetitor && topCompetitor.mentions > 0) {
      sentence += ` ${topCompetitor.name} appeared most often with ${topCompetitor.mentions} mentions.`;
    }

    return {
      currentPeriodRuns: currentRuns,
      prevPeriodRuns: prevRuns,
      visibilityScore: vis,
      prevVisibilityScore: prevVis,
      avgPosition: avgPos,
      prevAvgPosition: prevAvgPos,
      shareOfVoice: sov,
      prevShareOfVoice: prevSov,
      timelineData: timeline,
      shareOfVoiceBars: sovBars,
      topSources: sources,
      editorialSentence: sentence,
    };
  }, [runs, ownBrand, brands, periodDays]);

  // Delta helpers
  const visDelta = visibilityScore - prevVisibilityScore;
  const avgPosDelta = avgPosition > 0 && prevAvgPosition > 0 ? -(avgPosition - prevAvgPosition) : 0;
  const sovDelta = shareOfVoice - prevShareOfVoice;
  const runsDelta = currentPeriodRuns.length - prevPeriodRuns.length;

  const handleRunAll = async () => {
    if (!activeWorkspace) return;
    setRunningAll(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/run-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger run-all');
      addToast({
        type: 'success',
        message: 'Query execution started',
        description: `Executed ${data.completedCount || 0} queries.`,
      });
      await loadData();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Run all failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRunningAll(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!activeWorkspace) return;
    setSeedingDemo(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/demo-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load sample data');
      addToast({
        type: 'success',
        message: 'Sample data loaded',
        description: 'Seeded Paystack with 8 weeks of runs.',
      });
      await loadData();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to seed demo data',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleClearDemo = async () => {
    if (!activeWorkspace) return;
    setClearingDemo(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/demo-data`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clear sample data');
      addToast({
        type: 'info',
        message: 'Sample data cleared',
        description: 'Cleaned all sample records from workspace.',
      });
      await loadData();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to clear demo data',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setClearingDemo(false);
    }
  };

  const isAnalystOrOwner = activeRole === 'owner' || activeRole === 'analyst';

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            Brief
          </h1>
          <p className="text-xs text-muted mt-1">
            Search-grounded brand visibility report for {activeWorkspace?.name}.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Period selector */}
          <div className="inline-flex items-center border border-border rounded-md bg-surface p-0.5 text-xs">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setPeriodDays(d as 7 | 30 | 90)}
                className={`px-2.5 py-1 rounded-xs transition-colors font-medium ${
                  periodDays === d
                    ? 'bg-raised text-text font-semibold'
                    : 'text-muted hover:text-text'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>

          {hasSampleData && isAnalystOrOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDemo}
              loading={clearingDemo}
              icon={<Trash2 className="w-3.5 h-3.5 text-muted" />}
            >
              Clear sample data
            </Button>
          )}

          {isAnalystOrOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleRunAll}
              loading={runningAll}
              disabled={queries.length === 0}
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
            >
              Run all queries
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-6 w-3/4 max-w-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-border">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : runs.length === 0 ? (
        <div className="py-8">
          <EmptyState
            title="No query evaluations recorded yet"
            description="Run your tracked queries against the grounded search engine to track brand mentions, rank positions, and live citations."
            illustration={<NoRunsIllustration />}
            action={
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {isAnalystOrOwner && (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleRunAll}
                      loading={runningAll}
                      disabled={queries.length === 0}
                      icon={<Play className="w-4 h-4 fill-current" />}
                    >
                      Run tracked queries now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSeedDemo}
                      loading={seedingDemo}
                      icon={<Sparkles className="w-4 h-4 text-accent" />}
                    >
                      Load sample data
                    </Button>
                  </>
                )}
              </div>
            }
          />
        </div>
      ) : (
        <div className="space-y-12">
          {/* Plain Editorial Sentence */}
          <div className="text-base sm:text-lg text-text font-normal leading-relaxed max-w-3xl">
            {editorialSentence}
          </div>

          {/* Four Metrics in one row separated by thin vertical rules */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-0 md:divide-x divide-border/80 border-y border-border/80 py-6">
            <div className="px-2 md:px-5 first:pl-0">
              <span className="text-xs text-muted font-normal block mb-1">Visibility score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {visibilityScore}
                </span>
                <span className="text-lg font-display text-muted">%</span>
              </div>
              <p className="text-xs text-muted mt-2">
                {visDelta > 0 ? `up ${visDelta}%` : visDelta < 0 ? `down ${Math.abs(visDelta)}%` : 'same'} vs prev period
              </p>
            </div>

            <div className="px-2 md:px-5">
              <span className="text-xs text-muted font-normal block mb-1">Average position</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {avgPosition > 0 ? avgPosition.toFixed(1) : 'None yet'}
                </span>
              </div>
              <p className="text-xs text-muted mt-2">
                {avgPosDelta > 0 ? `up ${avgPosDelta.toFixed(1)}` : avgPosDelta < 0 ? `down ${Math.abs(avgPosDelta).toFixed(1)}` : 'same'} vs prev period
              </p>
            </div>

            <div className="px-2 md:px-5">
              <span className="text-xs text-muted font-normal block mb-1">Share of voice</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {shareOfVoice}
                </span>
                <span className="text-lg font-display text-muted">%</span>
              </div>
              <p className="text-xs text-muted mt-2">
                {sovDelta > 0 ? `up ${sovDelta}%` : sovDelta < 0 ? `down ${Math.abs(sovDelta)}%` : 'same'} vs prev period
              </p>
            </div>

            <div className="px-2 md:px-5 last:pr-0">
              <span className="text-xs text-muted font-normal block mb-1">Runs this period</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {currentPeriodRuns.length}
                </span>
              </div>
              <p className="text-xs text-muted mt-2">
                {runsDelta > 0 ? `up ${runsDelta}` : runsDelta < 0 ? `down ${Math.abs(runsDelta)}` : 'same'} vs prev period
              </p>
            </div>
          </div>

          {/* Section: Visibility Trend Over Time */}
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold font-display text-text">
                Visibility over time
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Daily proportion of queries where {ownBrand?.name || 'primary brand'} appeared in answers.
              </p>
            </div>

            <div className="h-56 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} opacity={0.6} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--color-border)' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    stroke="var(--color-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--color-text)',
                    }}
                    formatter={(value: any) => [`${value}% visibility`, ownBrand?.name || 'Brand']}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-accent)"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: 'var(--color-accent)' }}
                    activeDot={{ r: 4, stroke: 'var(--color-surface)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section: Share of Voice Ruler Bar */}
          <div className="space-y-4 pt-4 border-t border-border/80">
            <div>
              <h2 className="text-base font-semibold font-display text-text">
                Share of voice
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Relative distribution of brand mentions across all tracked answers.
              </p>
            </div>

            {/* Horizontal Ruler Bar */}
            <div className="space-y-3">
              <div className="h-4 w-full rounded-sm overflow-hidden flex bg-raised border border-border/80">
                {shareOfVoiceBars.map((bar, idx) => {
                  if (bar.percentage <= 0) return null;
                  const isClosestCompetitor = !bar.isOwn && idx === 1;
                  const bgColor = bar.isOwn
                    ? 'bg-accent'
                    : isClosestCompetitor
                    ? 'bg-clay'
                    : idx === 2
                    ? 'bg-muted/60'
                    : 'bg-muted/30';

                  return (
                    <div
                      key={bar.id}
                      style={{ width: `${bar.percentage}%` }}
                      className={`${bgColor} h-full transition-all`}
                      title={`${bar.name}: ${bar.percentage}% (${bar.mentions} mentions)`}
                    />
                  );
                })}
              </div>

              {/* Legend Row */}
              <div className="flex items-center gap-4 flex-wrap text-xs">
                {shareOfVoiceBars.map((bar, idx) => {
                  const isClosestCompetitor = !bar.isOwn && idx === 1;
                  const dotColor = bar.isOwn
                    ? 'bg-accent'
                    : isClosestCompetitor
                    ? 'bg-clay'
                    : idx === 2
                    ? 'bg-muted/60'
                    : 'bg-muted/30';

                  return (
                    <div key={bar.id} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-xs ${dotColor}`} />
                      <span className={bar.isOwn ? 'font-medium text-text' : 'text-muted'}>
                        {bar.name}
                      </span>
                      <span className="text-muted tabular-nums">({bar.percentage}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section: Recent Runs & Top Cited Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-border/80">
            {/* Recent Runs Table (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-base font-semibold font-display text-text">
                  Recent runs
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Latest search-grounded queries evaluated in this workspace.
                </p>
              </div>

              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Query</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Own brand</TableHeaderCell>
                    <TableHeaderCell align="right">Position</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentPeriodRuns.slice(0, 6).map((run) => {
                    const ownMention = run.mentions?.find((m) => m.brandId === ownBrand?.id);
                    const dateStr = new Date(run.startedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium text-text max-w-[260px] truncate">
                          {run.queryText}
                        </TableCell>
                        <TableCell className="text-muted whitespace-nowrap">
                          {dateStr}
                        </TableCell>
                        <TableCell>
                          {ownMention ? (
                            <Badge variant="own" size="sm">
                              Mentioned
                            </Badge>
                          ) : (
                            <span className="text-muted text-xs">No</span>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {ownMention ? (
                            <span className="font-display font-medium text-text tabular-nums">
                              #{ownMention.position}
                            </span>
                          ) : (
                            <span className="text-muted">None yet</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Top Cited Sources (1 col) */}
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold font-display text-text">
                  Top cited sources
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Domains most frequently referenced in grounded answers.
                </p>
              </div>

              <div className="border border-border/80 rounded-md bg-surface divide-y divide-border/60">
                {topSources.length === 0 ? (
                  <p className="p-4 text-xs text-muted italic">No citations recorded yet.</p>
                ) : (
                  topSources.map((s, idx) => (
                    <div key={s.domain} className="p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-muted font-display text-xs w-4">
                          {idx + 1}.
                        </span>
                        <span className="text-text font-normal truncate">
                          {s.domain}
                        </span>
                      </div>
                      <span className="text-muted tabular-nums shrink-0 ml-2">
                        {s.count} {s.count === 1 ? 'citation' : 'citations'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
