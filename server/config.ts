import dotenv from 'dotenv';
dotenv.config();

export const GEMINI_MODEL = 'gemini-2.5-flash';

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export function getGeminiApiKey(customKey?: string): string {
  const key = customKey !== undefined ? customKey : process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_placeholder') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please set a valid GEMINI_API_KEY environment variable to execute search-grounded runs.'
    );
  }
  return key.trim();
}

export const CRON_SECRET = process.env.CRON_SECRET || '';

// Verify CRON_SECRET on startup and log warning if unset or short
if (!process.env.CRON_SECRET || process.env.CRON_SECRET.length < 24) {
  console.warn(
    '[Sightline Config Warning] CRON_SECRET is not configured or is shorter than 24 characters. The /api/cron/run-due endpoint will return 503 until a valid secret is set in the environment.'
  );
}

export function isCronSecretConfigured(customSecret?: string): boolean {
  const secret = customSecret !== undefined ? customSecret : process.env.CRON_SECRET;
  return Boolean(secret && secret.length >= 24);
}

export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
