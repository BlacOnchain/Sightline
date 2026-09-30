import { adminDb } from '../firebase-admin';
import { executeGeminiGrounding } from './gemini';
import { detectBrandMentions, BrandForDetection } from './brand-detector';
import { calculateNextRunAt } from './scheduling';
import { sanitizeString } from '../utils/validation';
import { GEMINI_MODEL } from '../config';

export interface RunResult {
  id: string;
  queryId: string;
  queryText: string;
  model: string;
  status: 'completed' | 'failed';
  startedAt: string;
  answerText?: string;
  mentions: { brandId: string; brandName?: string; position: number }[];
  sources: { title: string; url: string; domain: string }[];
  error?: string;
}

export async function runQueryForWorkspace(
  wid: string,
  qid: string
): Promise<RunResult> {
  const startedAt = new Date().toISOString();
  const runRef = adminDb.collection(`workspaces/${wid}/runs`).doc();
  const rid = runRef.id;

  // Fetch query
  const querySnap = await adminDb.doc(`workspaces/${wid}/queries/${qid}`).get();
  if (!querySnap.exists) {
    throw new Error(`Query ${qid} not found in workspace ${wid}`);
  }
  const queryData = querySnap.data() || {};
  const queryText = sanitizeString(queryData.text || '', 500);
  const frequency = queryData.frequency || 'manual';

  // Fetch all brands in workspace for deterministic detection
  const brandsSnap = await adminDb.collection(`workspaces/${wid}/brands`).get();
  const brands: BrandForDetection[] = [];
  brandsSnap.forEach((doc) => {
    const data = doc.data();
    brands.push({
      id: doc.id,
      name: data.name,
      aliases: data.aliases || [],
      kind: data.kind || 'competitor',
    });
  });

  let runRecord: RunResult;

  try {
    // Execute Gemini call with Search grounding
    const { answerText, sources, model } = await executeGeminiGrounding(queryText);

    // Deterministically detect brand mentions
    const mentions = detectBrandMentions(answerText, brands);

    runRecord = {
      id: rid,
      queryId: qid,
      queryText,
      model,
      status: 'completed',
      startedAt,
      answerText,
      mentions,
      sources,
    };

    // Save run record to Firestore using Admin SDK
    await runRef.set(runRecord);

    // Update query's lastRunAt and nextRunAt
    const nextRunAt = calculateNextRunAt(frequency);
    await adminDb.doc(`workspaces/${wid}/queries/${qid}`).update({
      lastRunAt: startedAt,
      ...(nextRunAt ? { nextRunAt } : {}),
    });

    return runRecord;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Run failed for query ${qid}:`, errorMsg);

    runRecord = {
      id: rid,
      queryId: qid,
      queryText,
      model: GEMINI_MODEL,
      status: 'failed',
      startedAt,
      mentions: [],
      sources: [],
      error: errorMsg,
    };

    await runRef.set(runRecord);
    return runRecord;
  }
}

/**
 * Concurrency limiter to run tasks with a maximum concurrent pool
 */
async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item)).then((res) => {
      results.push(res);
    });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
      // Clean up finished promises
      for (let i = executing.length - 1; i >= 0; i--) {
        // Check if settled
        const promise = executing[i];
        let isDone = false;
        promise.then(() => { isDone = true; }).catch(() => { isDone = true; });
        // small tick
        await new Promise((r) => setTimeout(r, 0));
        if (isDone) {
          executing.splice(i, 1);
        }
      }
    }
  }

  await Promise.all(executing);
  return results;
}

export async function runAllQueriesForWorkspace(wid: string): Promise<RunResult[]> {
  const queriesSnap = await adminDb
    .collection(`workspaces/${wid}/queries`)
    .where('active', '==', true)
    .get();

  const queryIds: string[] = [];
  queriesSnap.forEach((doc) => {
    queryIds.push(doc.id);
  });

  if (queryIds.length === 0) {
    return [];
  }

  // Concurrency limit of 3
  const results = await runWithConcurrencyLimit(queryIds, 3, async (qid) => {
    return await runQueryForWorkspace(wid, qid);
  });

  return results;
}

export async function runDueQueriesAcrossWorkspaces(): Promise<{
  totalEvaluated: number;
  completed: number;
  failed: number;
}> {
  const now = new Date().toISOString();

  // Query across all workspaces using collectionGroup('queries')
  const dueQueriesSnap = await adminDb
    .collectionGroup('queries')
    .where('active', '==', true)
    .where('nextRunAt', '<=', now)
    .get();

  const dueItems: { wid: string; qid: string }[] = [];

  dueQueriesSnap.forEach((docSnap) => {
    // Doc path is workspaces/{wid}/queries/{qid}
    const pathParts = docSnap.ref.path.split('/');
    if (pathParts.length >= 4 && pathParts[0] === 'workspaces') {
      const wid = pathParts[1];
      const qid = docSnap.id;
      dueItems.push({ wid, qid });
    }
  });

  if (dueItems.length === 0) {
    return { totalEvaluated: 0, completed: 0, failed: 0 };
  }

  // Run with concurrency limit of 3
  const results = await runWithConcurrencyLimit(dueItems, 3, async (item) => {
    return await runQueryForWorkspace(item.wid, item.qid);
  });

  const completed = results.filter((r) => r.status === 'completed').length;
  const failed = results.filter((r) => r.status === 'failed').length;

  return {
    totalEvaluated: dueItems.length,
    completed,
    failed,
  };
}
