import React from 'react';
import { Badge } from '../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../ui/Table';

const sampleRuns = [
  {
    query: 'What is the best payment gateway in Nigeria for developers?',
    date: 'Sep 28',
    mentioned: true,
    position: 1,
  },
  {
    query: 'Which payment platform supports automated recurring billing in Lagos?',
    date: 'Sep 27',
    mentioned: true,
    position: 1,
  },
  {
    query: 'What are the top-rated business banking apps for small merchants?',
    date: 'Sep 25',
    mentioned: true,
    position: 2,
  },
  {
    query: 'Is Paystack reliable for collecting card payments?',
    date: 'Sep 23',
    mentioned: false,
    position: null,
  },
];

const sampleSources = [
  { domain: 'techcabal.com', count: 8 },
  { domain: 'techpoint.africa', count: 6 },
  { domain: 'benjamindada.com', count: 5 },
  { domain: 'punchng.com', count: 3 },
];

export function SampleBriefPreview() {
  return (
    <div className="w-full space-y-3">
      {/* Simple window frame */}
      <div className="border border-border rounded-md bg-surface overflow-hidden">
        {/* Frame window topbar */}
        <div className="px-4 py-3 border-b border-border bg-raised/40 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-border" />
            <span className="w-2 h-2 rounded-full bg-border" />
            <span className="w-2 h-2 rounded-full bg-border" />
            <span className="ml-2 font-medium text-text text-xs">Weekly Brief: Paystack</span>
          </div>
          <span className="text-xs text-muted tabular-nums">Past 30 days</span>
        </div>

        {/* Inner Brief Content */}
        <div className="p-5 sm:p-7 space-y-8">
          {/* Editorial Sentence */}
          <div className="text-sm sm:text-base text-text font-normal leading-relaxed max-w-2xl">
            Paystack appeared in 10 of 12 answers this period, up from 8 the period before.
            Flutterwave appeared most often among competitors with 7 mentions.
          </div>

          {/* Four Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-y-0 sm:divide-x divide-border border-y border-border py-4">
            <div className="px-2 sm:px-4 first:pl-0">
              <span className="text-xs text-muted block mb-1">Visibility score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-normal text-text tabular-nums">
                  83
                </span>
                <span className="text-sm font-display text-muted">%</span>
              </div>
              <p className="text-[11px] text-accent mt-1 font-medium">up 17% vs prev period</p>
            </div>

            <div className="px-2 sm:px-4">
              <span className="text-xs text-muted block mb-1">Average position</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-normal text-text tabular-nums">
                  1.2
                </span>
              </div>
              <p className="text-[11px] text-accent mt-1 font-medium">up 0.4 vs prev period</p>
            </div>

            <div className="px-2 sm:px-4">
              <span className="text-xs text-muted block mb-1">Share of voice</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-normal text-text tabular-nums">
                  48
                </span>
                <span className="text-sm font-display text-muted">%</span>
              </div>
              <p className="text-[11px] text-accent mt-1 font-medium">up 6% vs prev period</p>
            </div>

            <div className="px-2 sm:px-4 last:pr-0">
              <span className="text-xs text-muted block mb-1">Runs this period</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-display font-normal text-text tabular-nums">
                  12
                </span>
              </div>
              <p className="text-[11px] text-muted mt-1">up 4 vs prev period</p>
            </div>
          </div>

          {/* Share of Voice Ruler Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-display font-semibold text-text text-sm">Share of voice</span>
              <span className="text-muted">Relative mention distribution</span>
            </div>

            <div className="h-3.5 w-full rounded-xs overflow-hidden flex bg-raised border border-border">
              <div
                style={{ width: '48%' }}
                className="bg-accent h-full"
                title="Paystack: 48%"
              />
              <div
                style={{ width: '34%' }}
                className="bg-clay h-full"
                title="Flutterwave: 34%"
              />
              <div
                style={{ width: '18%' }}
                className="bg-muted/40 h-full"
                title="Moniepoint: 18%"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-accent" />
                <span className="font-medium text-text">Paystack</span>
                <span className="text-muted tabular-nums">(48%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-clay" />
                <span className="text-muted">Flutterwave</span>
                <span className="text-muted tabular-nums">(34%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-muted/40" />
                <span className="text-muted">Moniepoint</span>
                <span className="text-muted tabular-nums">(18%)</span>
              </div>
            </div>
          </div>

          {/* Grid: Recent Runs and Cited Sources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-border">
            {/* Recent Runs Table */}
            <div className="md:col-span-2 space-y-3">
              <span className="font-display font-semibold text-text text-sm block">Recent runs</span>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Query</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Named</TableHeaderCell>
                    <TableHeaderCell align="right">Rank</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sampleRuns.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-text max-w-[220px] truncate">
                        {r.query}
                      </TableCell>
                      <TableCell className="text-muted whitespace-nowrap text-xs">
                        {r.date}
                      </TableCell>
                      <TableCell>
                        {r.mentioned ? (
                          <Badge variant="own" size="sm">
                            Yes
                          </Badge>
                        ) : (
                          <span className="text-muted text-xs">No</span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {r.position ? (
                          <span className="font-display font-medium text-text tabular-nums">
                            #{r.position}
                          </span>
                        ) : (
                          <span className="text-muted">none</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cited Sources */}
            <div className="space-y-3">
              <span className="font-display font-semibold text-text text-sm block">Top cited sources</span>
              <div className="border border-border rounded-md bg-surface divide-y divide-border text-xs">
                {sampleSources.map((s, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <span className="text-text truncate pr-2">{s.domain}</span>
                    <span className="text-muted tabular-nums shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption underneath */}
      <p className="text-center text-xs text-muted">
        Sample data. Fictional brands.
      </p>
    </div>
  );
}
