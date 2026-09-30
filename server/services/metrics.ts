/**
 * Pure metrics calculation functions for Sightline.
 * Completely deterministic and independent of any database or external APIs.
 */

export interface BrandStatsInput {
  brandId: string;
  brandName: string;
  kind: 'own' | 'competitor';
  mentionCount: number;
  totalPosition: number;
}

export interface ShareOfVoiceResult {
  brandId: string;
  brandName: string;
  kind: 'own' | 'competitor';
  mentionCount: number;
  sharePercentage: number;
  avgPosition: number;
}

/**
 * Calculates Visibility Score:
 * The percentage of completed query runs in which the primary brand was cited/mentioned.
 *
 * @param ownMentionRunsCount Number of completed runs where the primary brand was mentioned
 * @param totalRunsCount Total number of completed query runs in the period
 * @returns Integer percentage from 0 to 100
 */
export function calculateVisibilityScore(
  ownMentionRunsCount: number,
  totalRunsCount: number
): number {
  if (totalRunsCount <= 0 || ownMentionRunsCount <= 0) {
    return 0;
  }
  const score = (ownMentionRunsCount / totalRunsCount) * 100;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * Calculates Average Position:
 * The mean rank (1-indexed order of appearance) of a brand when mentioned in search-grounded answers.
 * Lower is better (1.0 is top/first mentioned).
 *
 * @param totalPositionSum Sum of 1-indexed ranks across runs where the brand was mentioned
 * @param mentionCount Total count of runs where the brand was mentioned
 * @returns Average position rounded to 1 decimal place, or 0 if never mentioned
 */
export function calculateAveragePosition(
  totalPositionSum: number,
  mentionCount: number
): number {
  if (mentionCount <= 0 || totalPositionSum <= 0) {
    return 0;
  }
  const avg = totalPositionSum / mentionCount;
  return Math.round(avg * 10) / 10;
}

/**
 * Calculates Share of Voice (SoV):
 * Distribution of brand mentions among all tracked brands in the workspace.
 *
 * @param brandStats Array of brand stats containing mention counts and position sums
 * @returns Array with calculated sharePercentage and avgPosition for each brand
 */
export function calculateShareOfVoice(
  brandStats: BrandStatsInput[]
): ShareOfVoiceResult[] {
  const totalMentions = brandStats.reduce((sum, b) => sum + Math.max(0, b.mentionCount), 0);

  return brandStats.map((brand) => {
    const mentionCount = Math.max(0, brand.mentionCount);
    const avgPos = calculateAveragePosition(brand.totalPosition, mentionCount);
    const sharePercentage =
      totalMentions > 0 ? Math.round((mentionCount / totalMentions) * 100) : 0;

    return {
      brandId: brand.brandId,
      brandName: brand.brandName,
      kind: brand.kind,
      mentionCount,
      sharePercentage,
      avgPosition: avgPos,
    };
  });
}
