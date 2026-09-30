export interface BrandForDetection {
  id: string;
  name: string;
  aliases: string[];
  kind: 'own' | 'competitor';
}

export interface BrandMentionResult {
  brandId: string;
  brandName: string;
  position: number;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Creates a boundary-aware regular expression for matching brand names & aliases.
 * - Treats hyphens inside names as part of the word ([\w-]).
 * - Handles punctuation in aliases such as "C++", "A&B".
 * - Handles multi-word names like "Bright Steps".
 */
export function createTermRegex(term: string): RegExp {
  const trimmed = term.trim();
  const escaped = escapeRegex(trimmed);
  const firstChar = trimmed[0];
  const lastChar = trimmed[trimmed.length - 1];

  let prefix = '(?<=^|[^\\w-])';
  if (/^[^\w-]/.test(firstChar)) {
    prefix = '(?<=^|\\s)';
  }

  let suffix = '(?=$|[^\\w-])';
  if (/[^\w-]/.test(lastChar)) {
    const escapedLast = escapeRegex(lastChar);
    suffix = `(?=$|[^\\w-${escapedLast}])`;
  }

  return new RegExp(`${prefix}${escaped}${suffix}`, 'gi');
}

/**
 * Deterministically detects brand mentions using case-insensitive whole-word matching.
 * Position is the 1-indexed rank of each brand sorted by earliest match index.
 */
export function detectBrandMentions(
  answerText: string,
  brands: BrandForDetection[]
): BrandMentionResult[] {
  if (!answerText || brands.length === 0) return [];

  const matchedBrands: { brandId: string; brandName: string; earliestIndex: number }[] = [];

  for (const brand of brands) {
    const terms = [brand.name, ...(brand.aliases || [])].filter((t) => t && t.trim().length > 0);

    let minIndex = Infinity;

    for (const term of terms) {
      const regex = createTermRegex(term);

      let match: RegExpExecArray | null;
      while ((match = regex.exec(answerText)) !== null) {
        if (match.index < minIndex) {
          minIndex = match.index;
        }
      }
    }

    if (minIndex !== Infinity) {
      matchedBrands.push({
        brandId: brand.id,
        brandName: brand.name,
        earliestIndex: minIndex,
      });
    }
  }

  // Sort by earliest appearance in the text
  matchedBrands.sort((a, b) => a.earliestIndex - b.earliestIndex);

  // Assign 1-indexed rank position
  return matchedBrands.map((item, index) => ({
    brandId: item.brandId,
    brandName: item.brandName,
    position: index + 1,
  }));
}
