import { Request, Response, NextFunction } from 'express';
import { adminAuth, adminDb } from '../firebase-admin';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  };
  workspaceRole?: 'owner' | 'analyst' | 'viewer';
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      email_verified: !!decoded.email_verified,
    };
    next();
  } catch (err: unknown) {
    console.error('Authentication verification failed:', err);
    res.status(401).json({ error: 'Invalid authentication token' });
  }
}

export function requireWorkspaceRole(allowedRoles: ('owner' | 'analyst' | 'viewer')[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const wid = req.params.wid;
    if (!wid) {
      res.status(400).json({ error: 'Workspace ID parameter is required' });
      return;
    }

    if (!req.user?.uid) {
      res.status(401).json({ error: 'User is not authenticated' });
      return;
    }

    try {
      // Check workspace doc to see if owner
      const wsDoc = await adminDb.doc(`workspaces/${wid}`).get();
      if (!wsDoc.exists) {
        res.status(404).json({ error: 'Workspace not found' });
        return;
      }

      const wsData = wsDoc.data();
      if (wsData?.ownerId === req.user.uid) {
        req.workspaceRole = 'owner';
        next();
        return;
      }

      // Check workspace members subcollection
      const memberDoc = await adminDb.doc(`workspaces/${wid}/members/${req.user.uid}`).get();
      if (!memberDoc.exists) {
        res.status(403).json({ error: 'You are not a member of this workspace' });
        return;
      }

      const memberData = memberDoc.data();
      const role = memberData?.role as 'owner' | 'analyst' | 'viewer';
      if (!allowedRoles.includes(role)) {
        res.status(403).json({
          error: `Insufficient permissions. Requires: ${allowedRoles.join(', ')}`,
        });
        return;
      }

      req.workspaceRole = role;
      next();
    } catch (err: unknown) {
      console.error('Workspace membership check failed:', err);
      res.status(500).json({ error: 'Internal error checking workspace membership' });
    }
  };
}
