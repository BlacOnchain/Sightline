export interface UserInviteContext {
  uid: string;
  email: string;
  email_verified: boolean;
}

export interface PendingInviteRecord {
  id: string; // doc id or email
  workspaceId: string;
  email: string;
  role: 'analyst' | 'viewer';
}

export interface MemberRecordToCreate {
  workspaceId: string;
  member: {
    uid: string;
    email: string;
    role: 'analyst' | 'viewer';
    addedAt: string;
  };
  inviteId: string;
}

export function processUserInvites(
  user: UserInviteContext,
  invites: PendingInviteRecord[]
): {
  membersToCreate: MemberRecordToCreate[];
  joinedWorkspaceIds: string[];
  rejectedReason?: string;
} {
  if (!user.email || !user.email_verified) {
    return {
      membersToCreate: [],
      joinedWorkspaceIds: [],
      rejectedReason: 'Email not verified',
    };
  }

  const emailLower = user.email.trim().toLowerCase();
  const membersToCreate: MemberRecordToCreate[] = [];
  const joinedWorkspaceIds: string[] = [];

  const now = new Date().toISOString();

  for (const inv of invites) {
    if (inv.email.trim().toLowerCase() === emailLower && inv.workspaceId) {
      membersToCreate.push({
        workspaceId: inv.workspaceId,
        member: {
          uid: user.uid,
          email: user.email,
          role: inv.role === 'analyst' ? 'analyst' : 'viewer',
          addedAt: now,
        },
        inviteId: inv.id,
      });

      if (!joinedWorkspaceIds.includes(inv.workspaceId)) {
        joinedWorkspaceIds.push(inv.workspaceId);
      }
    }
  }

  return {
    membersToCreate,
    joinedWorkspaceIds,
  };
}
