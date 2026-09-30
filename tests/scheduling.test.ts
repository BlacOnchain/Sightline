import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateNextRunAt } from '../server/services/scheduling';

describe('Pure Scheduling Logic (calculateNextRunAt)', () => {
  const baseTime = new Date('2026-06-01T12:00:00.000Z');

  it('schedules daily query exactly 24 hours ahead', () => {
    const nextRun = calculateNextRunAt('daily', baseTime);
    assert.ok(nextRun !== null);

    const nextDate = new Date(nextRun);
    const diffMs = nextDate.getTime() - baseTime.getTime();
    const expectedDiffMs = 24 * 60 * 60 * 1000;

    assert.strictEqual(diffMs, expectedDiffMs);
    assert.strictEqual(nextRun, '2026-06-02T12:00:00.000Z');
  });

  it('schedules weekly query exactly 7 days ahead', () => {
    const nextRun = calculateNextRunAt('weekly', baseTime);
    assert.ok(nextRun !== null);

    const nextDate = new Date(nextRun);
    const diffMs = nextDate.getTime() - baseTime.getTime();
    const expectedDiffMs = 7 * 24 * 60 * 60 * 1000;

    assert.strictEqual(diffMs, expectedDiffMs);
    assert.strictEqual(nextRun, '2026-06-08T12:00:00.000Z');
  });

  it('returns null for manual frequency', () => {
    const nextRun = calculateNextRunAt('manual', baseTime);
    assert.strictEqual(nextRun, null);
  });

  it('returns null for unrecognized frequency', () => {
    const nextRun = calculateNextRunAt('monthly', baseTime);
    assert.strictEqual(nextRun, null);

    assert.strictEqual(calculateNextRunAt('', baseTime), null);
  });
});
