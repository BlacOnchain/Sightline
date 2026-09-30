import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  detectBrandMentions,
  BrandForDetection,
} from '../server/services/brand-detector';

describe('Deterministic Brand Mention Detection & Position Ranking', () => {
  const brands: BrandForDetection[] = [
    {
      id: 'brand_own',
      name: 'Marlow Coffee',
      aliases: ['Marlow', '@marlowcoffee', 'Marlow-Coffee'],
      kind: 'own',
    },
    {
      id: 'brand_comp1',
      name: 'Tidewater Roasters',
      aliases: ['Tidewater'],
      kind: 'competitor',
    },
    {
      id: 'brand_comp2',
      name: 'Juniper-Beans',
      aliases: ['Juniper Beans'],
      kind: 'competitor',
    },
    {
      id: 'brand_tech',
      name: 'EspressoCraft',
      aliases: ['C++', 'EspressoCraft Pro'],
      kind: 'competitor',
    },
  ];

  it('detects primary brand by exact name (case-insensitive)', () => {
    const text = 'For morning coffee subscriptions, marlow coffee provides great fresh roasts.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].brandId, 'brand_own');
    assert.strictEqual(results[0].position, 1);
  });

  it('detects multi-word names and aliases like "Tidewater"', () => {
    const text = 'We compared several brands including Tidewater for single origin beans.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].brandId, 'brand_comp1');
    assert.strictEqual(results[0].brandName, 'Tidewater Roasters');
    assert.strictEqual(results[0].position, 1);
  });

  it('detects aliases with punctuation such as "C++"', () => {
    const text = 'The roast profile guide compares light roast with C++ and dark roast.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].brandId, 'brand_tech');
    assert.strictEqual(results[0].position, 1);
  });

  it('treats hyphens inside names as part of the word', () => {
    const text = 'Many coffee lovers try Juniper-Beans for dark roast cold brew.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].brandId, 'brand_comp2');
    assert.strictEqual(results[0].position, 1);

    // "Juniper" alone should not match if it's inside Juniper-Beans
    const partialBrand: BrandForDetection[] = [
      { id: 'b_juniper', name: 'Juniper', aliases: [], kind: 'competitor' },
    ];
    const textWithHyphen = 'We tested Juniper-Beans yesterday.';
    const partialResults = detectBrandMentions(textWithHyphen, partialBrand);
    assert.strictEqual(partialResults.length, 0);
  });

  it('ranks positions in order of earliest appearance in the text', () => {
    const text =
      'While Juniper-Beans is popular for dark roasts, Marlow Coffee has flexible subscription options, followed by Tidewater.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 3);

    // Juniper-Beans appears first -> Position 1
    assert.strictEqual(results[0].brandId, 'brand_comp2');
    assert.strictEqual(results[0].position, 1);

    // Marlow Coffee appears second -> Position 2
    assert.strictEqual(results[1].brandId, 'brand_own');
    assert.strictEqual(results[1].position, 2);

    // Tidewater appears third -> Position 3
    assert.strictEqual(results[2].brandId, 'brand_comp1');
    assert.strictEqual(results[2].position, 3);
  });

  it('enforces whole-word boundaries and prevents false substring matches', () => {
    const text = 'We looked into MarlowCoffeeSuperApp and NonJuniperBeans options.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 0);
  });

  it('handles punctuation and boundary symbols seamlessly', () => {
    const text = 'Check out: (Marlow Coffee), "Juniper-Beans", and Tidewater!';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].brandId, 'brand_own');
    assert.strictEqual(results[1].brandId, 'brand_comp2');
    assert.strictEqual(results[2].brandId, 'brand_comp1');
  });

  it('returns empty array when no brands appear in text', () => {
    const text = 'Here is a general guide about brewing coffee at home with French press.';
    const results = detectBrandMentions(text, brands);

    assert.strictEqual(results.length, 0);
  });

  it('handles empty text or empty brands list safely', () => {
    assert.deepStrictEqual(detectBrandMentions('', brands), []);
    assert.deepStrictEqual(detectBrandMentions('Some text here', []), []);
  });
});
