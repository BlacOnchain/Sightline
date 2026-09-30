import crypto from 'crypto';

/**
 * Constant-time string comparison to prevent timing attack side-channels.
 * Both strings are hashed with SHA-256 to ensure identical fixed buffer lengths
 * before applying crypto.timingSafeEqual.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Validates identifier formats (workspace ID, query ID, brand ID, user ID).
 * Only allows alphanumeric characters, underscores, and hyphens (2 to 64 chars).
 */
export function validateId(id: unknown, fieldName = 'ID'): string {
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
  const trimmed = id.trim();
  const validPattern = /^[a-zA-Z0-9_-]{2,64}$/;
  if (!validPattern.test(trimmed)) {
    throw new Error(
      `${fieldName} contains invalid characters. Allowed: alphanumeric, underscores, hyphens (2-64 chars)`
    );
  }
  return trimmed;
}

/**
 * Validates and sanitizes date range ISO strings for reports and analytics.
 */
export function validateDateRange(
  periodStart: unknown,
  periodEnd: unknown
): { start: string; end: string } {
  if (typeof periodStart !== 'string' || !periodStart.trim()) {
    throw new Error('periodStart is required as an ISO 8601 string');
  }
  if (typeof periodEnd !== 'string' || !periodEnd.trim()) {
    throw new Error('periodEnd is required as an ISO 8601 string');
  }

  const startDate = new Date(periodStart.trim());
  const endDate = new Date(periodEnd.trim());

  if (isNaN(startDate.getTime())) {
    throw new Error('periodStart must be a valid ISO 8601 timestamp');
  }
  if (isNaN(endDate.getTime())) {
    throw new Error('periodEnd must be a valid ISO 8601 timestamp');
  }

  if (startDate.getTime() > endDate.getTime()) {
    throw new Error('periodStart must precede or equal periodEnd');
  }

  // Cap span to at most 366 days
  const maxSpanMs = 366 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > maxSpanMs) {
    throw new Error('Requested period cannot exceed 366 days');
  }

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

/**
 * Sanitizes generic input strings by stripping null bytes, dangerous ASCII control characters,
 * trimming leading/trailing whitespace, and enforcing maximum length.
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and non-printable control characters (except newline \n and carriage return \r)
  const sanitized = input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();

  return sanitized.slice(0, maxLength);
}
