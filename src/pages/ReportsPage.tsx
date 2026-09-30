import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Download, Printer } from 'lucide-react';
import { getWorkspaceReports } from '../lib/db';
import type { ReportRecord } from '../types';
import { useToast } from '../components/ui/Toast';

export function ReportsPage() {
  const { activeWorkspace, activeRole, getIdToken } = useAuth();
  const { addToast } = useToast();

  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportRecord | null>(null);
  const [generating, setGenerating] = useState(false);
  const [periodDays, setPeriodDays] = useState<7 | 14 | 30>(7);

  const canEdit = activeRole === 'owner' || activeRole === 'analyst';

  const loadReports = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const list = await getWorkspaceReports(activeWorkspace.id);
      setReports(list);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeWorkspace?.id]);

  const handleGenerateReport = async () => {
    if (!activeWorkspace) return;
    setGenerating(true);
    try {
      const now = new Date();
      const past = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const token = await getIdToken();

      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          periodStart: past.toISOString(),
          periodEnd: now.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate report');

      addToast({
        type: 'success',
        message: 'Report generated',
        description: `Evaluated ${data.runCount || 0} query runs.`,
      });

      setModalOpen(false);
      await loadReports();
      setSelectedReport(data);
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Generation failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setGenerating(false);
    }
  };

  // Download CSV
  const handleDownloadCSV = (report: ReportRecord) => {
    const rows = [
      ['Sightline AI Answer Visibility Report'],
      ['Workspace', `"${(activeWorkspace?.name || 'Workspace').replace(/"/g, '""')}"`],
      ['Period Start', new Date(report.periodStart).toISOString()],
      ['Period End', new Date(report.periodEnd).toISOString()],
      ['Generated At', new Date(report.generatedAt).toISOString()],
      ['Runs Analyzed', report.runCount.toString()],
      ['Visibility Score (%)', report.visibilityScore.toString()],
      ['Average Position', report.avgPosition.toString()],
      [],
      ['--- SHARE OF VOICE BY BRAND ---'],
      ['Brand Name', 'Classification', 'Mentions', 'Share of Voice (%)', 'Average Position'],
      ...report.shareOfVoice.map((b) => [
        `"${b.brandName.replace(/"/g, '""')}"`,
        b.kind,
        b.mentionCount.toString(),
        b.sharePercentage.toString(),
        b.avgPosition.toString(),
      ]),
      [],
      ['--- TOP GROUNDED SOURCES ---'],
      ['Domain', 'Citation Count'],
      ...report.topSources.map((s) => [`"${s.domain.replace(/"/g, '""')}"`, s.citationCount.toString()]),
      [],
      ['Note: Results come from conversational search with live grounding and may differ from other search engine products.'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map((e) => e.join(',')).join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute(
      'download',
      `sightline_report_${new Date(report.periodStart).toISOString().slice(0, 10)}_to_${new Date(report.periodEnd).toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      message: 'CSV exported successfully',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 px-4 sm:px-6 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            Reports
          </h1>
          <p className="text-xs text-muted mt-1">
            Download or print a report to share with your client.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownloadCSV(reports[0])}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export as CSV
            </Button>
          )}

          {canEdit && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalOpen(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Generate report
            </Button>
          )}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            title="No reports generated yet"
            description="Generate a periodic report to compute Share of Voice, average ranking positions, and top citing domains."
            action={
              canEdit ? (
                <Button variant="primary" size="sm" onClick={() => setModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />} className="mt-2">
                  Generate first report
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Evaluation period</TableHeaderCell>
                <TableHeaderCell>Runs analyzed</TableHeaderCell>
                <TableHeaderCell>Visibility</TableHeaderCell>
                <TableHeaderCell align="right">Avg position</TableHeaderCell>
                <TableHeaderCell>Generated</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.map((rep) => (
                <TableRow key={rep.id}>
                  <TableCell className="font-medium text-text">
                    {new Date(rep.periodStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} to{' '}
                    {new Date(rep.periodEnd).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    {rep.isSample && (
                      <span className="ml-2 text-[10px] text-muted border border-border px-1 py-0.2 rounded">
                        Sample
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted tabular-nums">
                    {rep.runCount} runs
                  </TableCell>
                  <TableCell>
                    <Badge variant="own" size="sm">
                      {rep.visibilityScore}%
                    </Badge>
                  </TableCell>
                  <TableCell align="right">
                    {rep.avgPosition > 0 ? (
                      <span className="font-display font-medium text-text tabular-nums">
                        #{rep.avgPosition.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted">None yet</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted text-xs whitespace-nowrap">
                    {new Date(rep.generatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="secondary" size="sm" onClick={() => setSelectedReport(rep)}>
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadCSV(rep)}
                        icon={<Download className="w-3.5 h-3.5" />}
                      >
                        Export as CSV
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate periodic report"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={generating}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerateReport} loading={generating}>
              Generate
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-muted leading-relaxed">
            Sightline will analyze completed runs in this workspace, calculate Share of Voice across tracked brands, rank positions, and extract top domain citations.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-normal text-muted">
              Select evaluation period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setPeriodDays(d as 7 | 14 | 30)}
                  className={`p-3 rounded-md border text-center transition-colors cursor-pointer ${
                    periodDays === d
                      ? 'border-text bg-raised text-text font-semibold'
                      : 'border-border bg-surface text-muted hover:text-text'
                  }`}
                >
                  <div className="font-display text-lg">{d} days</div>
                  <div className="text-[11px] text-muted font-normal mt-0.5">
                    Past {d === 7 ? 'week' : d === 14 ? '2 weeks' : 'month'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-md bg-raised/40 border border-border/60 text-xs text-muted leading-relaxed">
            Note: Results come from conversational search with live grounding and may differ from other search engine products.
          </div>
        </div>
      </Modal>

      {/* Report View Modal with Print Stylesheet */}
      <Modal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Periodic report view"
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectedReport && handleDownloadCSV(selectedReport)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Export as CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Print / PDF
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setSelectedReport(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedReport && (
          <div className="space-y-8 print:p-0 print:space-y-6 text-xs sm:text-sm">
            {/* Report Header */}
            <div className="border-b border-border/70 pb-4 space-y-1">
              <span className="text-xs text-muted block">
                {activeWorkspace?.name}
              </span>
              <span className="text-xs font-semibold text-text block">
                Executive summary
              </span>
              <h2 className="text-xl sm:text-2xl font-semibold font-display text-text">
                {new Date(selectedReport.periodStart).toLocaleDateString([], { month: 'long', day: 'numeric' })} to{' '}
                {new Date(selectedReport.periodEnd).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex items-center gap-3 text-xs text-muted pt-1">
                <span>Runs analyzed: <strong className="text-text font-normal">{selectedReport.runCount}</strong></span>
                <span>•</span>
                <span>Generated: <strong className="text-text font-normal">{new Date(selectedReport.generatedAt).toLocaleDateString()}</strong></span>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-md border border-border/80 bg-surface">
              <div>
                <span className="text-xs text-muted block mb-0.5">Visibility score</span>
                <span className="text-2xl font-display font-medium text-text tabular-nums">
                  {selectedReport.visibilityScore}%
                </span>
              </div>
              <div>
                <span className="text-xs text-muted block mb-0.5">Average position</span>
                <span className="text-2xl font-display font-medium text-text tabular-nums">
                  {selectedReport.avgPosition > 0 ? `#${selectedReport.avgPosition.toFixed(1)}` : 'None yet'}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted block mb-0.5">Runs in period</span>
                <span className="text-2xl font-display font-medium text-text tabular-nums">
                  {selectedReport.runCount}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted block mb-0.5">Top sources</span>
                <span className="text-2xl font-display font-medium text-text tabular-nums">
                  {selectedReport.topSources.length}
                </span>
              </div>
            </div>

            {/* Share of Voice Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold font-display text-text">
                Share of voice by brand
              </h3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Brand name</TableHeaderCell>
                    <TableHeaderCell>Kind</TableHeaderCell>
                    <TableHeaderCell align="right">Mentions</TableHeaderCell>
                    <TableHeaderCell align="right">Share of voice</TableHeaderCell>
                    <TableHeaderCell align="right">Avg position</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedReport.shareOfVoice.map((b) => (
                    <TableRow key={b.brandId}>
                      <TableCell className="font-medium text-text">{b.brandName}</TableCell>
                      <TableCell>
                        <Badge variant={b.kind === 'own' ? 'own' : 'competitor'} size="sm">
                          {b.kind === 'own' ? 'Primary brand' : 'Competitor'}
                        </Badge>
                      </TableCell>
                      <TableCell align="right">{b.mentionCount}</TableCell>
                      <TableCell align="right" className="font-medium">
                        {b.sharePercentage}%
                      </TableCell>
                      <TableCell align="right">
                        {b.avgPosition > 0 ? `#${b.avgPosition.toFixed(1)}` : 'None yet'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Top Grounded Sources */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold font-display text-text">
                Top cited web domains
              </h3>
              <div className="border border-border/80 rounded-md bg-surface divide-y divide-border/60">
                {selectedReport.topSources.length === 0 ? (
                  <p className="p-3 text-xs text-muted italic">No citations recorded in this period.</p>
                ) : (
                  selectedReport.topSources.map((s, idx) => (
                    <div key={s.domain} className="p-2.5 sm:p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-muted text-xs">{idx + 1}.</span>
                        <span className="font-medium text-text">{s.domain}</span>
                      </div>
                      <span className="text-muted tabular-nums">{s.citationCount} citations</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Transparency Note */}
            <div className="p-3 rounded-md bg-raised/30 border border-border/60 text-xs text-muted leading-relaxed">
              <strong>Transparency Note:</strong> Results stem from conversational search with live grounding. Synthesized rankings reflect deterministic keyword matching against grounded responses and may vary across other search engines.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
