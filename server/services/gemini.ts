import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, GEMINI_MODEL } from '../config';

export interface GroundedSourceItem {
  title: string;
  url: string;
  domain: string;
}

export interface GroundingExecutionResult {
  answerText: string;
  sources: GroundedSourceItem[];
  model: string;
}

function extractDomain(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return rawUrl;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout<T>(promise: Promise<T>, timeoutMs = 45000, timeoutMessage = 'Grounding request timed out after 45 seconds'): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }),
    timeoutPromise,
  ]);
}

export async function executeGeminiGrounding(queryText: string): Promise<GroundingExecutionResult> {
  const apiKey = getGeminiApiKey();
  const ai = new GoogleGenAI({ apiKey });

  const executeOnce = async (): Promise<GroundingExecutionResult> => {
    const apiCallPromise = ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: queryText,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const response = await withTimeout(apiCallPromise, 45000);

    const answerText = response.text || '';
    const sources: GroundedSourceItem[] = [];
    const seenUrls = new Set<string>();

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract chunks from search grounding
    if (groundingMetadata && Array.isArray(groundingMetadata.groundingChunks)) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          const uri = chunk.web.uri;
          if (!seenUrls.has(uri)) {
            seenUrls.add(uri);
            sources.push({
              title: chunk.web.title || '',
              url: uri,
              domain: extractDomain(uri),
            });
          }
        }
      }
    }

    return {
      answerText,
      sources,
      model: GEMINI_MODEL,
    };
  };

  // Attempt call with 1 retry on error with backoff (if not timed out)
  try {
    return await executeOnce();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('timed out')) {
      throw new Error(`Execution timed out after 45s: ${errorMsg}`);
    }

    console.warn('Initial grounding call failed, retrying after 1500ms backoff...', err);
    await sleep(1500);
    try {
      return await executeOnce();
    } catch (retryErr: unknown) {
      const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
      throw new Error(`Grounding execution failed: ${msg}`);
    }
  }
}
