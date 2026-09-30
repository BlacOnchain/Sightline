/**
 * Pure scheduling logic for query execution runs.
 */

/**
 * Calculates nextRunAt ISO timestamp based on frequency.
 * - 'daily': +24 hours
 * - 'weekly': +7 days
 * - 'manual' or other: null
 *
 * @param frequency 'daily' | 'weekly' | 'manual'
 * @param baseTime Base reference Date (defaults to now)
 * @returns ISO string or null
 */
export function calculateNextRunAt(
  frequency: string,
  baseTime: Date = new Date()
): string | null {
  const msInDay = 24 * 60 * 60 * 1000;
  if (frequency === 'daily') {
    return new Date(baseTime.getTime() + msInDay).toISOString();
  }
  if (frequency === 'weekly') {
    return new Date(baseTime.getTime() + 7 * msInDay).toISOString();
  }
  return null;
}
