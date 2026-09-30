import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}

interface ClientRecord {
  timestamps: number[];
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Rate limit exceeded. Please slow down and try again shortly.',
    keyPrefix = 'rl',
  } = config;

  const storage = new Map<string, ClientRecord>();

  // Periodically clean up stale client records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of storage.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
      if (record.timestamps.length === 0) {
        storage.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref(); // unref prevents timer from hanging process exit or test runs

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const now = Date.now();
    // Prefer authenticated user id or workspace param, fallback to client IP
    const clientId = req.user?.uid || req.params?.wid || req.ip || 'anonymous';
    const key = `${keyPrefix}:${clientId}`;

    let record = storage.get(key);
    if (!record) {
      record = { timestamps: [] };
      storage.set(key, record);
    }

    // Filter out timestamps outside current sliding window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    const currentCount = record.timestamps.length;
    const remaining = Math.max(0, maxRequests - currentCount - 1);
    const resetTime =
      record.timestamps.length > 0
        ? Math.ceil((record.timestamps[0] + windowMs - now) / 1000)
        : Math.ceil(windowMs / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetTime.toString());

    if (currentCount >= maxRequests) {
      res.setHeader('Retry-After', resetTime.toString());
      res.status(429).json({
        error: message,
        retryAfterSeconds: resetTime,
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

/**
 * Rate limiter for single query execution runs.
 * Limit: 30 runs per minute per user/workspace.
 */
export const singleRunRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Single query execution rate limit reached (max 30 runs/min). Please try again in a few moments.',
  keyPrefix: 'query_run',
});

/**
 * Rate limiter for bulk query execution runs.
 * Limit: 5 bulk runs per 2 minutes per user/workspace.
 */
export const bulkRunRateLimiter = createRateLimiter({
  windowMs: 2 * 60 * 1000,
  maxRequests: 5,
  message: 'Bulk query execution rate limit reached (max 5 runs per 2 min). Please wait before running all queries again.',
  keyPrefix: 'bulk_run',
});

/**
 * Rate limiter for report generation.
 * Limit: 10 report generations per minute per user/workspace.
 */
export const reportRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Report generation rate limit reached (max 10/min). Please wait before generating another report.',
  keyPrefix: 'report_gen',
});

/**
 * Rate limiter for demo-data seeding and clearing.
 * Limit: 5 operations per minute per user/workspace.
 */
export const demoDataRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: 'Demo data operation rate limit reached (max 5/min). Please wait before seeding or clearing again.',
  keyPrefix: 'demo_data',
});

/**
 * Rate limiter for cron automated runner endpoint.
 * Limit: 12 requests per minute (e.g. once every 5 seconds).
 */
export const cronRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 12,
  message: 'Cron execution rate limit reached (max 12 calls/min).',
  keyPrefix: 'cron_run',
});

/**
 * Rate limiter for accepting workspace invites.
 * Limit: 20 requests per minute per user.
 */
export const invitesRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'Invites accept rate limit reached. Please try again in a moment.',
  keyPrefix: 'invites_accept',
});
