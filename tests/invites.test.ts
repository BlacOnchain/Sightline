import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  processUserInvites,
  UserInviteContext,
  PendingInviteRecord,
} from '../server/services/invites-service.ts';

describe('Pending Invites Processing Logic', () => {
  it('rejects an unverified email user', () => {
    const user: UserInviteContext = {
      uid: 'user_123',
      email: 'manager@example.com',
      email_verified: false,
    };
    const invites: PendingInviteRecord[] = [
      {
        id: 'manager@example.com',
        workspaceId: 'ws_alpha',
        email: 'manager@example.com',
        role: 'analyst',
      },
    ];

    const result = processUserInvites(user, invites);
    assert.strictEqual(result.membersToCreate.length, 0);
    assert.strictEqual(result.joinedWorkspaceIds.length, 0);
    assert.strictEqual(result.rejectedReason, 'Email not verified');
  });

  it('matches pending invites by lowercase email for verified users', () => {
    const user: UserInviteContext = {
      uid: 'user_456',
      email: 'Manager@Agency.com',
      email_verified: true,
    };
    const invites: PendingInviteRecord[] = [
      {
        id: 'manager@agency.com',
        workspaceId: 'ws_coffee',
        email: 'manager@agency.com',
        role: 'analyst',
      },
    ];

    const result = processUserInvites(user, invites);
    assert.strictEqual(result.membersToCreate.length, 1);
    assert.strictEqual(result.membersToCreate[0].workspaceId, 'ws_coffee');
    assert.strictEqual(result.membersToCreate[0].member.uid, 'user_456');
    assert.strictEqual(result.membersToCreate[0].member.role, 'analyst');
    assert.deepStrictEqual(result.joinedWorkspaceIds, ['ws_coffee']);
  });

  it('handles no email match gracefully', () => {
    const user: UserInviteContext = {
      uid: 'user_789',
      email: 'other@example.com',
      email_verified: true,
    };
    const invites: PendingInviteRecord[] = [
      {
        id: 'someoneelse@example.com',
        workspaceId: 'ws_beta',
        email: 'someoneelse@example.com',
        role: 'viewer',
      },
    ];

    const result = processUserInvites(user, invites);
    assert.strictEqual(result.membersToCreate.length, 0);
    assert.strictEqual(result.joinedWorkspaceIds.length, 0);
  });

  it('correctly maps analyst and viewer roles across multiple workspaces', () => {
    const user: UserInviteContext = {
      uid: 'user_multi',
      email: 'colleague@agency.com',
      email_verified: true,
    };
    const invites: PendingInviteRecord[] = [
      {
        id: 'colleague@agency.com',
        workspaceId: 'ws_client1',
        email: 'colleague@agency.com',
        role: 'analyst',
      },
      {
        id: 'colleague@agency.com',
        workspaceId: 'ws_client2',
        email: 'colleague@agency.com',
        role: 'viewer',
      },
    ];

    const result = processUserInvites(user, invites);
    assert.strictEqual(result.membersToCreate.length, 2);
    assert.strictEqual(result.membersToCreate[0].member.role, 'analyst');
    assert.strictEqual(result.membersToCreate[1].member.role, 'viewer');
    assert.deepStrictEqual(result.joinedWorkspaceIds, ['ws_client1', 'ws_client2']);
  });
});
