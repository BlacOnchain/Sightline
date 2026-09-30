import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateVisibilityScore,
  calculateAveragePosition,
  calculateShareOfVoice,
  BrandStatsInput,
} from '../server/services/metrics';

describe('Pure Metrics Logic (Visibility, Position, Share of Voice)', () => {
  describe('calculateVisibilityScore', () => {
    it('returns 0 when total runs is 0', () => {
      assert.strictEqual(calculateVisibilityScore(0, 0), 0);
      assert.strictEqual(calculateVisibilityScore(5, 0), 0);
    });

    it('returns 0 when brand was never mentioned', () => {
      assert.strictEqual(calculateVisibilityScore(0, 25), 0);
    });

    it('calculates exact 100% when mentioned in all runs', () => {
      assert.strictEqual(calculateVisibilityScore(20, 20), 100);
    });

    it('calculates 50% when mentioned in half of runs', () => {
      assert.strictEqual(calculateVisibilityScore(15, 30), 50);
    });

    it('rounds correctly to nearest integer percentage', () => {
      // 1 out of 3 runs = 33.333% -> 33%
      assert.strictEqual(calculateVisibilityScore(1, 3), 33);
      // 2 out of 3 runs = 66.666% -> 67%
      assert.strictEqual(calculateVisibilityScore(2, 3), 67);
      // 7 out of 9 runs = 77.777% -> 78%
      assert.strictEqual(calculateVisibilityScore(7, 9), 78);
    });

    it('clamps to range [0, 100]', () => {
      assert.strictEqual(calculateVisibilityScore(-5, 10), 0);
      assert.strictEqual(calculateVisibilityScore(15, 10), 100);
    });
  });

  describe('calculateAveragePosition', () => {
    it('returns 0 when mention count is 0', () => {
      assert.strictEqual(calculateAveragePosition(0, 0), 0);
      assert.strictEqual(calculateAveragePosition(10, 0), 0);
    });

    it('calculates 1.0 when always mentioned first', () => {
      // Mentioned 4 times at position 1: sum = 4
      assert.strictEqual(calculateAveragePosition(4, 4), 1.0);
    });

    it('calculates average across variable positions rounded to 1 decimal', () => {
      // Positions: [1, 2, 3, 2] -> sum = 8, count = 4 -> 2.0
      assert.strictEqual(calculateAveragePosition(8, 4), 2.0);

      // Positions: [1, 2, 2] -> sum = 5, count = 3 -> 1.666... -> 1.7
      assert.strictEqual(calculateAveragePosition(5, 3), 1.7);

      // Positions: [1, 1, 2] -> sum = 4, count = 3 -> 1.333... -> 1.3
      assert.strictEqual(calculateAveragePosition(4, 3), 1.3);
    });
  });

  describe('calculateShareOfVoice', () => {
    it('returns 0% for all brands when total mentions across all brands is 0', () => {
      const stats: BrandStatsInput[] = [
        { brandId: 'b1', brandName: 'Brand A', kind: 'own', mentionCount: 0, totalPosition: 0 },
        { brandId: 'b2', brandName: 'Brand B', kind: 'competitor', mentionCount: 0, totalPosition: 0 },
      ];

      const result = calculateShareOfVoice(stats);
      assert.strictEqual(result[0].sharePercentage, 0);
      assert.strictEqual(result[1].sharePercentage, 0);
      assert.strictEqual(result[0].avgPosition, 0);
      assert.strictEqual(result[1].avgPosition, 0);
    });

    it('assigns 100% when only one brand has mentions', () => {
      const stats: BrandStatsInput[] = [
        { brandId: 'b1', brandName: 'Brand A', kind: 'own', mentionCount: 15, totalPosition: 15 },
        { brandId: 'b2', brandName: 'Brand B', kind: 'competitor', mentionCount: 0, totalPosition: 0 },
      ];

      const result = calculateShareOfVoice(stats);
      assert.strictEqual(result[0].sharePercentage, 100);
      assert.strictEqual(result[0].avgPosition, 1.0);
      assert.strictEqual(result[1].sharePercentage, 0);
    });

    it('computes proportional percentages across multiple brands', () => {
      // Total mentions: 50 + 30 + 20 = 100
      const stats: BrandStatsInput[] = [
        { brandId: 'b1', brandName: 'Marlow Coffee', kind: 'own', mentionCount: 50, totalPosition: 60 },
        { brandId: 'b2', brandName: 'BrightSteps', kind: 'competitor', mentionCount: 30, totalPosition: 54 },
        { brandId: 'b3', brandName: 'PlayStudy', kind: 'competitor', mentionCount: 20, totalPosition: 50 },
      ];

      const result = calculateShareOfVoice(stats);

      assert.strictEqual(result[0].sharePercentage, 50);
      assert.strictEqual(result[0].avgPosition, 1.2); // 60 / 50 = 1.2

      assert.strictEqual(result[1].sharePercentage, 30);
      assert.strictEqual(result[1].avgPosition, 1.8); // 54 / 30 = 1.8

      assert.strictEqual(result[2].sharePercentage, 20);
      assert.strictEqual(result[2].avgPosition, 2.5); // 50 / 20 = 2.5
    });
  });
});
