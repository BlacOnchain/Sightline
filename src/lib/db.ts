import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import type {
  UserProfile,
  Workspace,
  WorkspaceMember,
  PendingInvite,
  Brand,
  TrackedQuery,
  RunRecord,
  ReportRecord,
} from '../types';

// ==================== USERS ====================
export async function saveUserProfile(user: {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
}): Promise<UserProfile> {
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      const profile: UserProfile = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      };
      await setDoc(userRef, profile);
      return profile;
    } else {
      const data = existingSnap.data() as UserProfile;
      return data;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

// ==================== WORKSPACES ====================
export async function createWorkspace(name: string, ownerId: string): Promise<Workspace> {
  const wid = 'ws_' + Math.random().toString(36).substring(2, 10);
  const path = `workspaces/${wid}`;
  try {
    const now = new Date().toISOString();
    const ws: Workspace = {
      id: wid,
      name,
      ownerId,
      createdAt: now,
    };
    await setDoc(doc(db, 'workspaces', wid), ws);

    // Add owner to members subcollection
    const member: WorkspaceMember = {
      uid: ownerId,
      role: 'owner',
      addedAt: now,
    };
    await setDoc(doc(db, 'workspaces', wid, 'members', ownerId), member);

    return ws;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function getUserWorkspaces(userId: string, token?: string | null): Promise<Workspace[]> {
  const path = 'workspaces';
  try {
    const workspacesMap = new Map<string, Workspace>();

    // 1. Workspaces owned by user (Client SDK)
    const q = query(collection(db, 'workspaces'), where('ownerId', '==', userId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      workspacesMap.set(d.id, { ...d.data(), id: d.id } as Workspace);
    });

    // 2. Workspaces where user is a member (Client SDK via collectionGroup)
    try {
      const qMembers = query(collectionGroup(db, 'members'), where('uid', '==', userId));
      const snapMembers = await getDocs(qMembers);
      for (const mDoc of snapMembers.docs) {
        const wid = mDoc.ref.parent.parent?.id;
        if (wid && !workspacesMap.has(wid)) {
          const wsSnap = await getDoc(doc(db, 'workspaces', wid));
          if (wsSnap.exists()) {
            workspacesMap.set(wid, { ...wsSnap.data(), id: wid } as Workspace);
          }
        }
      }
    } catch {
      // Ignore if collectionGroup index is building
    }

    // 3. Fetch server API workspaces (includes member workspaces) if token is provided
    if (token) {
      try {
        const res = await fetch('/api/workspaces', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.workspaces)) {
            data.workspaces.forEach((w: Workspace) => {
              workspacesMap.set(w.id, w);
            });
          }
        }
      } catch {
        // Safe fallback
      }
    }

    return Array.from(workspacesMap.values());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getWorkspace(wid: string): Promise<Workspace | null> {
  const path = `workspaces/${wid}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', wid));
    if (!snap.exists()) return null;
    return snap.data() as Workspace;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function updateWorkspace(wid: string, name: string): Promise<void> {
  const path = `workspaces/${wid}`;
  try {
    await updateDoc(doc(db, 'workspaces', wid), { name });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteWorkspaceDoc(wid: string): Promise<void> {
  const path = `workspaces/${wid}`;
  try {
    // Delete subcollections documents first where possible
    const [brands, queries, members] = await Promise.all([
      getDocs(collection(db, 'workspaces', wid, 'brands')),
      getDocs(collection(db, 'workspaces', wid, 'queries')),
      getDocs(collection(db, 'workspaces', wid, 'members')),
    ]);
    const deletePromises: Promise<void>[] = [];
    brands.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    queries.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    members.forEach((d) => deletePromises.push(deleteDoc(d.ref)));
    await Promise.all(deletePromises);

    await deleteDoc(doc(db, 'workspaces', wid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==================== MEMBERS ====================
export async function getWorkspaceMembers(wid: string): Promise<WorkspaceMember[]> {
  const path = `workspaces/${wid}/members`;
  try {
    const snap = await getDocs(collection(db, 'workspaces', wid, 'members'));
    const members: WorkspaceMember[] = [];
    snap.forEach((d) => {
      members.push({ ...d.data(), uid: d.id } as WorkspaceMember);
    });
    return members;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function addWorkspaceMember(
  wid: string,
  member: WorkspaceMember
): Promise<void> {
  const path = `workspaces/${wid}/members/${member.uid}`;
  try {
    await setDoc(doc(db, 'workspaces', wid, 'members', member.uid), member);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateMemberRole(
  wid: string,
  uid: string,
  role: 'owner' | 'analyst' | 'viewer'
): Promise<void> {
  const path = `workspaces/${wid}/members/${uid}`;
  try {
    await updateDoc(doc(db, 'workspaces', wid, 'members', uid), { role });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function removeWorkspaceMember(wid: string, uid: string): Promise<void> {
  const path = `workspaces/${wid}/members/${uid}`;
  try {
    await deleteDoc(doc(db, 'workspaces', wid, 'members', uid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==================== PENDING INVITES ====================
export async function createPendingInvite(
  wid: string,
  email: string,
  role: 'analyst' | 'viewer',
  invitedBy: string
): Promise<PendingInvite> {
  const emailLower = email.toLowerCase().trim();
  const path = `workspaces/${wid}/invites/${emailLower}`;
  try {
    const now = new Date().toISOString();
    const invite: PendingInvite = {
      email: emailLower,
      role,
      invitedBy,
      invitedAt: now,
      createdAt: now,
    };
    await setDoc(doc(db, 'workspaces', wid, 'invites', emailLower), invite);
    return invite;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function getPendingInvites(wid: string): Promise<PendingInvite[]> {
  const path = `workspaces/${wid}/invites`;
  try {
    const snap = await getDocs(collection(db, 'workspaces', wid, 'invites'));
    const invites: PendingInvite[] = [];
    snap.forEach((d) => {
      invites.push(d.data() as PendingInvite);
    });
    return invites;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function cancelPendingInvite(wid: string, emailLower: string): Promise<void> {
  const path = `workspaces/${wid}/invites/${emailLower}`;
  try {
    await deleteDoc(doc(db, 'workspaces', wid, 'invites', emailLower));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==================== BRANDS ====================
export async function getWorkspaceBrands(wid: string): Promise<Brand[]> {
  const path = `workspaces/${wid}/brands`;
  try {
    const snap = await getDocs(collection(db, 'workspaces', wid, 'brands'));
    const brands: Brand[] = [];
    snap.forEach((d) => {
      brands.push({ ...d.data(), id: d.id } as Brand);
    });
    return brands;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function createBrand(
  wid: string,
  brand: Omit<Brand, 'id' | 'createdAt'>
): Promise<Brand> {
  const bid = 'b_' + Math.random().toString(36).substring(2, 10);
  const path = `workspaces/${wid}/brands/${bid}`;
  try {
    const newBrand: Brand = {
      ...brand,
      id: bid,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'workspaces', wid, 'brands', bid), newBrand);
    return newBrand;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateBrand(
  wid: string,
  bid: string,
  updates: Partial<Omit<Brand, 'id' | 'createdAt'>>
): Promise<void> {
  const path = `workspaces/${wid}/brands/${bid}`;
  try {
    await updateDoc(doc(db, 'workspaces', wid, 'brands', bid), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deleteBrand(wid: string, bid: string): Promise<void> {
  const path = `workspaces/${wid}/brands/${bid}`;
  try {
    await deleteDoc(doc(db, 'workspaces', wid, 'brands', bid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==================== QUERIES ====================
export async function getWorkspaceQueries(wid: string): Promise<TrackedQuery[]> {
  const path = `workspaces/${wid}/queries`;
  try {
    const snap = await getDocs(collection(db, 'workspaces', wid, 'queries'));
    const queries: TrackedQuery[] = [];
    snap.forEach((d) => {
      queries.push({ ...d.data(), id: d.id } as TrackedQuery);
    });
    return queries;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function createQuery(
  wid: string,
  queryData: Omit<TrackedQuery, 'id' | 'createdAt' | 'lastRunAt' | 'nextRunAt'>
): Promise<TrackedQuery> {
  const qid = 'q_' + Math.random().toString(36).substring(2, 10);
  const path = `workspaces/${wid}/queries/${qid}`;
  try {
    const now = new Date();
    const nextRun = new Date(now.getTime() + 1000).toISOString();
    const newQuery: TrackedQuery = {
      ...queryData,
      id: qid,
      lastRunAt: null,
      nextRunAt: nextRun,
      createdAt: now.toISOString(),
    };
    await setDoc(doc(db, 'workspaces', wid, 'queries', qid), newQuery);
    return newQuery;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateQuery(
  wid: string,
  qid: string,
  updates: Partial<Omit<TrackedQuery, 'id' | 'createdAt'>>
): Promise<void> {
  const path = `workspaces/${wid}/queries/${qid}`;
  try {
    await updateDoc(doc(db, 'workspaces', wid, 'queries', qid), updates);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getQueryById(wid: string, qid: string): Promise<TrackedQuery | null> {
  const path = `workspaces/${wid}/queries/${qid}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', wid, 'queries', qid));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as TrackedQuery;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function deleteQuery(wid: string, qid: string): Promise<void> {
  const path = `workspaces/${wid}/queries/${qid}`;
  try {
    await deleteDoc(doc(db, 'workspaces', wid, 'queries', qid));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==================== RUNS (CLIENT READ-ONLY) ====================
export async function getWorkspaceRuns(wid: string, count = 50): Promise<RunRecord[]> {
  const path = `workspaces/${wid}/runs`;
  try {
    const q = query(
      collection(db, 'workspaces', wid, 'runs'),
      orderBy('startedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    const runs: RunRecord[] = [];
    snap.forEach((d) => {
      runs.push({ ...d.data(), id: d.id } as RunRecord);
    });
    return runs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getWorkspaceRunsForQuery(wid: string, qid: string, count = 20): Promise<RunRecord[]> {
  const path = `workspaces/${wid}/runs`;
  try {
    const q = query(
      collection(db, 'workspaces', wid, 'runs'),
      where('queryId', '==', qid),
      orderBy('startedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    const runs: RunRecord[] = [];
    snap.forEach((d) => {
      runs.push({ ...d.data(), id: d.id } as RunRecord);
    });
    return runs;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// ==================== REPORTS (CLIENT READ-ONLY) ====================
export async function getWorkspaceReports(wid: string): Promise<ReportRecord[]> {
  const path = `workspaces/${wid}/reports`;
  try {
    const q = query(collection(db, 'workspaces', wid, 'reports'), orderBy('generatedAt', 'desc'));
    const snap = await getDocs(q);
    const reports: ReportRecord[] = [];
    snap.forEach((d) => {
      reports.push({ ...d.data(), id: d.id } as ReportRecord);
    });
    return reports;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getReportById(wid: string, repId: string): Promise<ReportRecord | null> {
  const path = `workspaces/${wid}/reports/${repId}`;
  try {
    const snap = await getDoc(doc(db, 'workspaces', wid, 'reports', repId));
    if (!snap.exists()) return null;
    return { ...snap.data(), id: snap.id } as ReportRecord;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}
