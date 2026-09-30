import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { NoRunsIllustration } from '../components/illustrations/Illustrations';
import { MarkedAnswer } from '../components/ui/MarkedAnswer';
import { ExternalLink, Eye, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { getWorkspaceRuns, getWorkspaceBrands } from '../lib/db';
import type { RunRecord, Brand } from '../types';

export function RunsPage() {
  const { activeWorkspace } = useAuth();
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedRun, setSelectedRun] = useState<RunRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const [rList, bList] = await Promise.all([
        getWorkspaceRuns(activeWorkspace.id, 50),
        getWorkspaceBrands(activeWorkspace.id),
      ]);
      setRuns(rList);
      setBrands(bList);
    } catch (err) {
      console.error('Failed to load runs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace?.id]);

  const ownBrand = brands.find((b) => b.kind === 'own');

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            Runs
          </h1>
          <p className="text-xs text-muted mt-1">
            Search-grounded answer evaluations and brand ranking history.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          loading={loading}
          icon={<RefreshCw className="w-3.5 h-3.5 text-muted" />}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-muted">Loading execution runs...</div>
      ) : runs.length === 0 ? (
        <EmptyState
          title="No execution runs recorded"
          description="Runs will appear here when you evaluate queries on demand or on a schedule."
          illustration={<NoRunsIllustration />}
        />
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Query</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Own brand</TableHeaderCell>
                <TableHeaderCell align="right">Rank</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {runs.map((run) => {
                const ownMention = run.mentions?.find((m) => m.brandId === ownBrand?.id);
                const dateStr = new Date(run.startedAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <TableRow
                    key={run.id}
                    onClick={() => setSelectedRun(run)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium text-text max-w-[280px] truncate">
                      {run.queryText}
                    </TableCell>
                    <TableCell className="text-muted text-xs whitespace-nowrap">
                      {dateStr}
                    </TableCell>
                    <TableCell>
                      {run.status === 'completed' ? (
                        <Badge variant="success" size="sm">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="danger" size="sm">
                          Failed
                        </Badge>
                      )}
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
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRun(run);
                        }}
                        icon={<Eye className="w-3.5 h-3.5 text-muted" />}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Run Detail Modal */}
      <Modal
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
        title="Run details"
        maxWidth="lg"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setSelectedRun(null)}>
            Close
          </Button>
        }
      >
        {selectedRun && (
          <div className="space-y-6 text-xs sm:text-sm">
            {/* Header info */}
            <div className="space-y-1 border-b border-border/70 pb-4">
              <span className="text-xs text-muted">Evaluated query:</span>
              <p className="text-base font-semibold font-display text-text">
                "{selectedRun.queryText}"
              </p>
              <div className="flex items-center gap-3 pt-2 text-xs text-muted flex-wrap">
                <span>
                  Date:{' '}
                  <strong className="text-text font-normal">
                    {new Date(selectedRun.startedAt).toLocaleString()}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Engine:{' '}
                  <strong className="text-text font-normal">{selectedRun.model || 'Search-Grounded Model'}</strong>
                </span>
                {selectedRun.isSample && (
                  <>
                    <span>•</span>
                    <Badge variant="neutral" size="sm">
                      Sample data
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Answer text with pen marker highlights */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">
                Synthesized grounded answer
              </h4>
              <div className="p-4 rounded-md border border-border/80 bg-surface">
                {selectedRun.status === 'completed' && selectedRun.answerText ? (
                  <MarkedAnswer
                    answerText={selectedRun.answerText}
                    mentions={selectedRun.mentions || []}
                    brands={brands}
                  />
                ) : (
                  <p className="text-danger italic text-xs">
                    {selectedRun.error || 'Run failed during search grounding evaluation.'}
                  </p>
                )}
              </div>
            </div>

            {/* Detected brand mentions & positions */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">
                Detected brand mentions & rank order
              </h4>
              {!selectedRun.mentions || selectedRun.mentions.length === 0 ? (
                <p className="text-xs text-muted italic">No tracked brands appeared in this answer.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedRun.mentions.map((m) => {
                    const brand = brands.find((b) => b.id === m.brandId);
                    const isOwn = brand?.kind === 'own';
                    return (
                      <div
                        key={m.brandId}
                        className={`p-2.5 rounded-md border text-xs flex items-center justify-between ${
                          isOwn
                            ? 'border-accent/40 bg-accent/5'
                            : 'border-border/70 bg-surface'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-display font-medium text-sm text-text tabular-nums">
                            #{m.position}
                          </span>
                          <span className="font-medium text-text">{m.brandName || brand?.name}</span>
                        </div>
                        <Badge variant={isOwn ? 'own' : 'competitor'} size="sm">
                          {isOwn ? 'Own brand' : 'Competitor'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cited Web Sources */}
            {selectedRun.sources && selectedRun.sources.length > 0 && (
              <div className="space-y-2 border-t border-border/70 pt-4">
                <h4 className="text-xs font-medium text-muted">
                  Cited web sources ({selectedRun.sources.length})
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedRun.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md border border-border/60 bg-surface hover:bg-raised/50 transition-colors flex items-center justify-between text-xs text-muted hover:text-text group"
                    >
                      <span className="truncate pr-2">{s.title || s.url}</span>
                      <div className="flex items-center gap-1 shrink-0 text-muted">
                        <span className="text-[11px]">{s.domain}</span>
                        <ExternalLink className="w-3 h-3 group-hover:text-text" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
