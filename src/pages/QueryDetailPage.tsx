import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { NoRunsIllustration } from '../components/illustrations/Illustrations';
import { MarkedAnswer } from '../components/ui/MarkedAnswer';
import { ArrowLeft, Play, ExternalLink, RefreshCw } from 'lucide-react';
import { getQueryById, getWorkspaceRunsForQuery, getWorkspaceBrands } from '../lib/db';
import type { TrackedQuery, RunRecord, Brand } from '../types';
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

export function QueryDetailPage() {
  const { qid } = useParams<{ qid: string }>();
  const navigate = useNavigate();
  const { activeWorkspace, activeRole, getIdToken } = useAuth();
  const { addToast } = useToast();

  const [queryObj, setQueryObj] = useState<TrackedQuery | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const canEdit = activeRole === 'owner' || activeRole === 'analyst';

  const loadDetails = async () => {
    if (!activeWorkspace || !qid) return;
    setLoading(true);
    try {
      const [q, rList, bList] = await Promise.all([
        getQueryById(activeWorkspace.id, qid),
        getWorkspaceRunsForQuery(activeWorkspace.id, qid, 30),
        getWorkspaceBrands(activeWorkspace.id),
      ]);
      setQueryObj(q);
      setRuns(rList);
      setBrands(bList);
    } catch (err) {
      console.error('Failed to load query details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [activeWorkspace?.id, qid]);

  const ownBrand = useMemo(() => brands.find((b) => b.kind === 'own'), [brands]);

  // Chart timeline of visibility over time for this specific query
  const chartData = useMemo(() => {
    return runs
      .slice()
      .reverse()
      .map((r) => {
        const isMentioned = r.mentions?.some((m) => m.brandId === ownBrand?.id);
        const ownM = r.mentions?.find((m) => m.brandId === ownBrand?.id);
        return {
          date: new Date(r.startedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          score: isMentioned ? 100 : 0,
          position: ownM ? ownM.position : null,
        };
      });
  }, [runs, ownBrand]);

  const handleRunNow = async () => {
    if (!activeWorkspace || !qid) return;
    setRunning(true);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/queries/${qid}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      addToast({
        type: 'success',
        message: 'Query run completed',
        description: `Mentioned ${data.mentions?.length || 0} tracked brands.`,
      });
      await loadDetails();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Run failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRunning(false);
    }
  };

  if (!loading && !queryObj) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-semibold font-display text-text mb-2">Query not found</h2>
        <p className="text-xs text-muted mb-4">The requested query does not exist in this workspace.</p>
        <Link to="/queries">
          <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Back to Queries
          </Button>
        </Link>
      </div>
    );
  }

  const ownMentionCount = runs.filter((r) =>
    r.mentions?.some((m) => m.brandId === ownBrand?.id)
  ).length;
  const mentionRate = runs.length > 0 ? Math.round((ownMentionCount / runs.length) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-border/80 pb-6">
        <Link
          to="/queries"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Queries</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-normal">Query detail</span>
              {queryObj && (
                <Badge variant="neutral" size="sm">
                  {queryObj.category}
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold font-display text-text tracking-tight">
              "{queryObj?.text}"
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunNow}
                loading={running}
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Run query now
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Metrics in one row separated by thin vertical rules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 sm:gap-y-0 sm:divide-x divide-border/80 border-y border-border/80 py-6">
            <div className="px-2 sm:px-5 first:pl-0">
              <span className="text-xs text-muted font-normal block mb-1">Query visibility rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {mentionRate}
                </span>
                <span className="text-lg font-display text-muted">%</span>
              </div>
              <p className="text-xs text-muted mt-2">
                {ownBrand ? `${ownMentionCount} of ${runs.length} runs` : 'No primary brand'}
              </p>
            </div>

            <div className="px-2 sm:px-5">
              <span className="text-xs text-muted font-normal block mb-1">Total runs evaluated</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-display font-normal text-text tabular-nums">
                  {runs.length}
                </span>
              </div>
              <p className="text-xs text-muted mt-2 capitalize">
                Schedule: {queryObj?.frequency || 'manual'}
              </p>
            </div>

            <div className="px-2 sm:px-5 last:pr-0">
              <span className="text-xs text-muted font-normal block mb-1">Latest evaluation</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-display font-medium text-text">
                  {runs[0] ? (runs[0].status === 'completed' ? 'Completed' : 'Failed') : 'Pending'}
                </span>
              </div>
              <p className="text-xs text-muted mt-2">
                {runs[0] ? new Date(runs[0].startedAt).toLocaleDateString() : 'Never run'}
              </p>
            </div>
          </div>

          {/* Visibility Chart for Query */}
          {chartData.length > 1 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold font-display text-text">
                Query presence timeline
              </h2>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                      ticks={[0, 100]}
                      stroke="var(--color-muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v === 100 ? 'Yes' : 'No')}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--color-text)',
                      }}
                      formatter={(val: any) => [val === 100 ? 'Mentioned' : 'Not mentioned', ownBrand?.name || 'Brand']}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="score"
                      stroke="var(--color-accent)"
                      strokeWidth={1.5}
                      dot={{ r: 3, fill: 'var(--color-accent)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Run History Timeline with Pen Highlights */}
          <div className="space-y-6 pt-4 border-t border-border/80">
            <div>
              <h2 className="text-base font-semibold font-display text-text">
                Run history timeline
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Detailed answer texts with pen marker highlights for detected brand mentions.
              </p>
            </div>

            {runs.length === 0 ? (
              <EmptyState
                title="No runs yet for this query"
                description="Click 'Run query now' above to execute search grounding."
                illustration={<NoRunsIllustration />}
              />
            ) : (
              <div className="space-y-6">
                {runs.map((run, idx) => {
                  const ownMention = run.mentions?.find((m) => m.brandId === ownBrand?.id);
                  const dateStr = new Date(run.startedAt).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={run.id}
                      className="border border-border/80 rounded-md bg-surface p-4 sm:p-5 space-y-4"
                    >
                      {/* Timeline header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted tabular-nums">
                            Run #{runs.length - idx}
                          </span>
                          <span className="text-xs text-text font-medium">{dateStr}</span>
                          {run.status === 'completed' ? (
                            <Badge variant="success" size="sm">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="danger" size="sm">
                              Failed
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {ownMention ? (
                            <Badge variant="own" size="sm">
                              {ownBrand?.name} Mentioned · Rank #{ownMention.position}
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              {ownBrand?.name || 'Own brand'} not in answer
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Answer Text with Pen Highlights */}
                      <div className="space-y-2">
                        {run.status === 'completed' && run.answerText ? (
                          <MarkedAnswer
                            answerText={run.answerText}
                            mentions={run.mentions || []}
                            brands={brands}
                          />
                        ) : (
                          <p className="text-danger italic text-xs">
                            {run.error || 'Execution failed during search grounding evaluation.'}
                          </p>
                        )}
                      </div>

                      {/* Cited Sources */}
                      {run.sources && run.sources.length > 0 && (
                        <div className="border-t border-border/60 pt-3 space-y-1.5">
                          <span className="text-xs text-muted block">Cited web sources:</span>
                          <div className="flex flex-wrap gap-2">
                            {run.sources.map((s, sIdx) => (
                              <a
                                key={sIdx}
                                href={s.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-border/60 bg-raised/30 hover:bg-raised text-xs text-muted hover:text-text transition-colors"
                              >
                                <span className="truncate max-w-[180px]">{s.domain}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
