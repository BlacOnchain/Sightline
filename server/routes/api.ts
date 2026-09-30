import { Router, Request, Response } from 'express';
import { requireAuth, requireWorkspaceRole, AuthenticatedRequest } from '../middleware/auth';
import {
  singleRunRateLimiter,
  bulkRunRateLimiter,
  reportRateLimiter,
  demoDataRateLimiter,
  cronRateLimiter,
  invitesRateLimiter,
} from '../middleware/rate-limit';
import {
  runQueryForWorkspace,
  runAllQueriesForWorkspace,
  runDueQueriesAcrossWorkspaces,
} from '../services/query-runner';
import { generateReportForWorkspace } from '../services/report-generator';
import { seedDemoData, clearDemoData } from '../services/demo-data';
import { processUserInvites, PendingInviteRecord } from '../services/invites-service';
import { adminDb } from '../firebase-admin';
import {
  validateId,
  validateDateRange,
  timingSafeCompare,
} from '../utils/validation';
import { CRON_SECRET, isCronSecretConfigured } from '../config';

export const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'sightline-api' });
});

/**
 * GET /api/workspaces
 * Returns all workspaces where the user is an owner or a member via targeted index queries.
 */
apiRouter.get(
  '/workspaces',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const workspacesMap = new Map<string, any>();

      // 1. Owned workspaces
      try {
        const ownedSnap = await adminDb
          .collection('workspaces')
          .where('ownerId', '==', user.uid)
          .get();
        ownedSnap.forEach((doc) => {
          workspacesMap.set(doc.id, { ...doc.data(), id: doc.id });
        });
      } catch {
        // Safe fallback if server Admin SDK lacks direct IAM query permissions
      }

      // 2. Member workspaces via collectionGroup members
      try {
        const memberSnap = await adminDb
          .collectionGroup('members')
          .where('uid', '==', user.uid)
          .get();
        for (const mDoc of memberSnap.docs) {
          const wid = mDoc.ref.parent.parent?.id;
          if (wid && !workspacesMap.has(wid)) {
            const wsDoc = await adminDb.doc(`workspaces/${wid}`).get();
            if (wsDoc.exists) {
              workspacesMap.set(wid, { ...wsDoc.data(), id: wid });
            }
          }
        }
      } catch {
        // Safe fallback if server Admin SDK lacks direct IAM query permissions
      }

      res.json({ workspaces: Array.from(workspacesMap.values()) });
    } catch (err) {
      console.error('Error fetching user workspaces:', err);
      res.status(500).json({ error: 'Failed to fetch user workspaces' });
    }
  }
);

/**
 * POST /api/workspaces/:wid/queries/:qid/run
 * Runs one query now (analyst or owner)
 */
apiRouter.post(
  '/workspaces/:wid/queries/:qid/run',
  requireAuth,
  requireWorkspaceRole(['owner', 'analyst']),
  singleRunRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const wid = validateId(req.params.wid, 'Workspace ID');
      const qid = validateId(req.params.qid, 'Query ID');

      const result = await runQueryForWorkspace(wid, qid);
      res.json(result);
    } catch (err: unknown) {
      console.error(`Error running query in workspace:`, err);
      const isValidationError =
        err instanceof Error &&
        (err.message.includes('required') || err.message.includes('invalid characters'));
      res.status(isValidationError ? 400 : 500).json({
        error: err instanceof Error ? err.message : 'Internal query execution failure',
      });
    }
  }
);

/**
 * POST /api/workspaces/:wid/run-all
 * Runs all active queries for a workspace with a concurrency limit of 3
 */
apiRouter.post(
  '/workspaces/:wid/run-all',
  requireAuth,
  requireWorkspaceRole(['owner', 'analyst']),
  bulkRunRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const wid = validateId(req.params.wid, 'Workspace ID');
      const results = await runAllQueriesForWorkspace(wid);
      res.json({
        workspaceId: wid,
        totalTriggered: results.length,
        completedCount: results.filter((r) => r.status === 'completed').length,
        failedCount: results.filter((r) => r.status === 'failed').length,
        runs: results,
      });
    } catch (err: unknown) {
      console.error(`Error running all queries in workspace:`, err);
      const isValidationError =
        err instanceof Error &&
        (err.message.includes('required') || err.message.includes('invalid characters'));
      res.status(isValidationError ? 400 : 500).json({
        error: err instanceof Error ? err.message : 'Failed to execute all queries',
      });
    }
  }
);

/**
 * POST /api/cron/run-due
 * Requires header x-cron-secret equal to the CRON_SECRET secret.
 * Evaluates constant-time comparison to prevent timing attacks.
 * If CRON_SECRET is unconfigured (< 24 chars), returns 503.
 * Runs every query whose nextRunAt has passed, across all workspaces, then updates nextRunAt.
 */
apiRouter.post(
  '/cron/run-due',
  cronRateLimiter,
  async (req: Request, res: Response) => {
    if (!isCronSecretConfigured()) {
      res.status(503).json({
        error: 'Cron execution disabled: CRON_SECRET is not configured or insufficient length',
      });
      return;
    }

    const providedSecret = req.headers['x-cron-secret'];
    if (
      typeof providedSecret !== 'string' ||
      !timingSafeCompare(providedSecret, CRON_SECRET)
    ) {
      res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
      return;
    }

    try {
      const summary = await runDueQueriesAcrossWorkspaces();
      res.json(summary);
    } catch (err: unknown) {
      console.error('Cron query run error:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Cron query execution failed',
      });
    }
  }
);

/**
 * POST /api/workspaces/:wid/reports/generate
 * Generates an on-demand report for a date range
 */
apiRouter.post(
  '/workspaces/:wid/reports/generate',
  requireAuth,
  requireWorkspaceRole(['owner', 'analyst']),
  reportRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const wid = validateId(req.params.wid, 'Workspace ID');
      const { periodStart, periodEnd } = req.body || {};

      const { start, end } = validateDateRange(periodStart, periodEnd);

      const report = await generateReportForWorkspace(wid, start, end);
      res.json(report);
    } catch (err: unknown) {
      console.error('Error generating report:', err);
      const isValidationError =
        err instanceof Error &&
        (err.message.includes('required') || err.message.includes('invalid') || err.message.includes('ISO'));
      res.status(isValidationError ? 400 : 500).json({
        error: err instanceof Error ? err.message : 'Failed to generate report',
      });
    }
  }
);

/**
 * POST /api/workspaces/:wid/demo-data/seed
 * Populates sample workspace with brands, queries, 8 weeks of runs, and reports
 */
apiRouter.post(
  '/workspaces/:wid/demo-data/seed',
  requireAuth,
  requireWorkspaceRole(['owner']),
  demoDataRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const wid = validateId(req.params.wid, 'Workspace ID');
      const summary = await seedDemoData(wid);
      res.json(summary);
    } catch (err: unknown) {
      console.error('Error seeding demo data:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to seed demo data',
      });
    }
  }
);

/**
 * DELETE /api/workspaces/:wid/demo-data/clear
 * Deletes all documents with isSample == true in this workspace
 */
apiRouter.delete(
  '/workspaces/:wid/demo-data/clear',
  requireAuth,
  requireWorkspaceRole(['owner']),
  demoDataRateLimiter,
  async (req: Request, res: Response) => {
    try {
      const wid = validateId(req.params.wid, 'Workspace ID');
      const summary = await clearDemoData(wid);
      res.json(summary);
    } catch (err: unknown) {
      console.error('Error clearing demo data:', err);
      res.status(500).json({
        error: err instanceof Error ? err.message : 'Failed to clear sample data',
      });
    }
  }
);

/**
 * POST /api/invites/accept
 * Finds pending invites matching verified user email, creates member docs, deletes invites.
 */
apiRouter.post(
  '/invites/accept',
  requireAuth,
  invitesRateLimiter,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user || !user.email || !user.email_verified) {
        res.status(400).json({
          error: 'Verified email required to accept invites',
          joinedWorkspaces: [],
        });
        return;
      }

      const emailLower = user.email.trim().toLowerCase();
      const pendingInvites: PendingInviteRecord[] = [];

      try {
        const invitesSnap = await adminDb
          .collectionGroup('invites')
          .where('email', '==', emailLower)
          .get();

        invitesSnap.forEach((docSnap) => {
          const wid = docSnap.ref.parent.parent?.id;
          if (wid) {
            pendingInvites.push({
              id: docSnap.id,
              workspaceId: wid,
              email: docSnap.data().email || emailLower,
              role: docSnap.data().role || 'viewer',
            });
          }
        });
      } catch {
        // Safe fallback if server Admin SDK lacks direct collectionGroup query permissions
      }

      const result = processUserInvites(
        { uid: user.uid, email: user.email, email_verified: user.email_verified },
        pendingInvites
      );

      for (const item of result.membersToCreate) {
        await adminDb
          .doc(`workspaces/${item.workspaceId}/members/${item.member.uid}`)
          .set(item.member);
        await adminDb
          .doc(`workspaces/${item.workspaceId}/invites/${item.inviteId}`)
          .delete();
      }

      res.json({ joinedWorkspaces: result.joinedWorkspaceIds });
    } catch (err: unknown) {
      console.error('Error accepting invites:', err);
      res.status(500).json({ error: 'Failed to process pending invites', joinedWorkspaces: [] });
    }
  }
);
