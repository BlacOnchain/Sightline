import { describe, it } from 'node:test';
import assert from 'node:assert';
import { requireAuth, AuthenticatedRequest } from '../server/middleware/auth';
import { timingSafeCompare } from '../server/utils/validation';
import { isCronSecretConfigured } from '../server/config';

describe('Security & Authentication Tests', () => {
  describe('Forged Unsigned Token Rejection (requireAuth)', () => {
    it('rejects request with missing Authorization header with 401', async () => {
      const req = {
        headers: {},
      } as AuthenticatedRequest;

      let statusCode = 0;
      let jsonPayload: any = null;
      let nextCalled = false;

      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (payload: any) => {
          jsonPayload = payload;
          return res;
        },
      };

      const next = () => {
        nextCalled = true;
      };

      await requireAuth(req, res, next);

      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
      assert.ok(jsonPayload?.error?.includes('Missing or malformed'));
    });

    it('rejects a forged unsigned token with 401 (never falls back to decoding payload)', async () => {
      // Create a forged unsigned JWT token: header.payload.signature
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(
        JSON.stringify({
          user_id: 'fake_attacker_uid',
          sub: 'fake_attacker_uid',
          email: 'attacker@example.com',
        })
      ).toString('base64');
      const fakeToken = `${header}.${payload}.unsigned`;

      const req = {
        headers: {
          authorization: `Bearer ${fakeToken}`,
        },
      } as AuthenticatedRequest;

      let statusCode = 0;
      let jsonPayload: any = null;
      let nextCalled = false;

      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (payload: any) => {
          jsonPayload = payload;
          return res;
        },
      };

      const next = () => {
        nextCalled = true;
      };

      await requireAuth(req, res, next);

      // Must be 401 and must not call next()
      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
      assert.ok(jsonPayload?.error?.includes('Invalid authentication token'));
      assert.strictEqual(req.user, undefined);
    });
  });

  describe('Constant-time Secret Comparison (timingSafeCompare)', () => {
    const validSecret = 'very_long_secure_production_cron_secret_12345';

    it('returns true for matching secrets', () => {
      assert.strictEqual(timingSafeCompare(validSecret, validSecret), true);
    });

    it('returns false for mismatched secrets without throwing or leaking timing', () => {
      assert.strictEqual(timingSafeCompare('wrong_secret', validSecret), false);
      assert.strictEqual(timingSafeCompare('', validSecret), false);
      assert.strictEqual(timingSafeCompare(validSecret, 'short'), false);
    });

    it('safely handles non-string arguments', () => {
      assert.strictEqual(timingSafeCompare(null as any, validSecret), false);
      assert.strictEqual(timingSafeCompare(undefined as any, validSecret), false);
    });
  });

  describe('CRON_SECRET Configuration Check (isCronSecretConfigured)', () => {
    it('returns false when CRON_SECRET is shorter than 24 characters or empty', () => {
      const original = process.env.CRON_SECRET;
      try {
        process.env.CRON_SECRET = '';
        assert.strictEqual(isCronSecretConfigured(), false);

        process.env.CRON_SECRET = 'too_short';
        assert.strictEqual(isCronSecretConfigured(), false);
      } finally {
        process.env.CRON_SECRET = original;
      }
    });

    it('returns true when CRON_SECRET meets minimum 24-character security length', () => {
      const original = process.env.CRON_SECRET;
      try {
        process.env.CRON_SECRET = 'a_very_secure_random_cron_secret_key_2026';
        assert.strictEqual(isCronSecretConfigured(), true);
      } finally {
        process.env.CRON_SECRET = original;
      }
    });
  });

  describe('GEMINI_API_KEY Configuration Check (getGeminiApiKey)', () => {
    it('throws a descriptive error when GEMINI_API_KEY is unset or empty', async () => {
      const { getGeminiApiKey } = await import('../server/config');
      const original = process.env.GEMINI_API_KEY;
      try {
        process.env.GEMINI_API_KEY = '';
        assert.throws(
          () => getGeminiApiKey(),
          /GEMINI_API_KEY is not configured/
        );
      } finally {
        process.env.GEMINI_API_KEY = original;
      }
    });
  });

  describe('Cron Route 503 Guard', () => {
    it('verifies that when CRON_SECRET is unconfigured, cron endpoints return 503', () => {
      const original = process.env.CRON_SECRET;
      try {
        process.env.CRON_SECRET = '';
        const isConfigured = isCronSecretConfigured();
        assert.strictEqual(isConfigured, false);
      } finally {
        process.env.CRON_SECRET = original;
      }
    });
  });
});
