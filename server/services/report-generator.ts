import { adminDb } from '../firebase-admin';
import {
  calculateVisibilityScore,
  calculateAveragePosition,
  calculateShareOfVoice,
  BrandStatsInput,
} from './metrics';

export interface GeneratedReport {
  id: string;
  periodStart: string;
  periodEnd: string;
  visibilityScore: number;
  avgPosition: number;
  shareOfVoice: {
    brandId: string;
    brandName: string;
    kind: 'own' | 'competitor';
    mentionCount: number;
    sharePercentage: number;
    avgPosition: number;
  }[];
  topSources: {
    domain: string;
    citationCount: number;
  }[];
  runCount: number;
  generatedAt: string;
}

export async function generateReportForWorkspace(
  wid: string,
  periodStart: string,
  periodEnd: string
): Promise<GeneratedReport> {
  const repRef = adminDb.collection(`workspaces/${wid}/reports`).doc();
  const repId = repRef.id;

  // Fetch brands in workspace
  const brandsSnap = await adminDb.collection(`workspaces/${wid}/brands`).get();
  const brands: { id: string; name: string; kind: 'own' | 'competitor' }[] = [];
  brandsSnap.forEach((doc) => {
    const data = doc.data();
    brands.push({
      id: doc.id,
      name: data.name,
      kind: data.kind || 'competitor',
    });
  });

  // Fetch runs within period
  const runsSnap = await adminDb
    .collection(`workspaces/${wid}/runs`)
    .where('startedAt', '>=', periodStart)
    .where('startedAt', '<=', periodEnd)
    .get();

  const completedRuns: {
    mentions: { brandId: string; position: number }[];
    sources: { domain: string }[];
  }[] = [];

  runsSnap.forEach((doc) => {
    const data = doc.data();
    if (data.status === 'completed') {
      completedRuns.push({
        mentions: data.mentions || [],
        sources: data.sources || [],
      });
    }
  });

  const runCount = completedRuns.length;

  // Track brand metrics
  const brandStats: Record<
    string,
    { mentionCount: number; totalPosition: number }
  > = {};

  for (const b of brands) {
    brandStats[b.id] = { mentionCount: 0, totalPosition: 0 };
  }

  let totalBrandMentionsAll = 0;
  const sourceCitationCounts: Record<string, number> = {};

  for (const r of completedRuns) {
    for (const m of r.mentions) {
      if (brandStats[m.brandId]) {
        brandStats[m.brandId].mentionCount++;
        brandStats[m.brandId].totalPosition += m.position;
        totalBrandMentionsAll++;
      }
    }

    for (const s of r.sources) {
      if (s.domain) {
        sourceCitationCounts[s.domain] = (sourceCitationCounts[s.domain] || 0) + 1;
      }
    }
  }

  // Calculate share of voice using pure metric calculator
  const brandInputs: BrandStatsInput[] = brands.map((b) => ({
    brandId: b.id,
    brandName: b.name,
    kind: b.kind,
    mentionCount: brandStats[b.id]?.mentionCount || 0,
    totalPosition: brandStats[b.id]?.totalPosition || 0,
  }));

  const shareOfVoice = calculateShareOfVoice(brandInputs);

  // Own brand metrics
  const ownBrand = brands.find((b) => b.kind === 'own');
  const ownStats = ownBrand ? brandStats[ownBrand.id] : null;
  const ownMentions = ownStats ? ownStats.mentionCount : 0;
  const ownPosTotal = ownStats ? ownStats.totalPosition : 0;

  const visibilityScore = calculateVisibilityScore(ownMentions, runCount);
  const avgPosition = calculateAveragePosition(ownPosTotal, ownMentions);

  // Sort top citing domains
  const topSources = Object.entries(sourceCitationCounts)
    .map(([domain, citationCount]) => ({ domain, citationCount }))
    .sort((a, b) => b.citationCount - a.citationCount)
    .slice(0, 10);

  const report: GeneratedReport = {
    id: repId,
    periodStart,
    periodEnd,
    visibilityScore,
    avgPosition,
    shareOfVoice,
    topSources,
    runCount,
    generatedAt: new Date().toISOString(),
  };

  // Write report via Admin SDK
  await repRef.set(report);
  return report;
}
