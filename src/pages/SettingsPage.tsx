import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
import {
  getWorkspaceMembers,
  updateMemberRole,
  removeWorkspaceMember,
  updateWorkspace,
  deleteWorkspaceDoc,
  createPendingInvite,
  getPendingInvites,
  cancelPendingInvite,
} from '../lib/db';
import type { WorkspaceMember, UserRole, PendingInvite } from '../types';
import { UserPlus, Trash2, XCircle } from 'lucide-react';

export function SettingsPage() {
  const { activeWorkspace, activeRole, user, refreshWorkspaces, setActiveWorkspaceId, workspaces } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const isOwner = activeRole === 'owner';

  // Workspace Name
  const [wsName, setWsName] = useState(activeWorkspace?.name || '');
  const [savingName, setSavingName] = useState(false);

  // Members & Pending Invites
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'analyst' | 'viewer'>('analyst');
  const [inviting, setInviting] = useState(false);

  // Delete Workspace
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const loadTeamData = async () => {
    if (!activeWorkspace) return;
    try {
      const [memList, invList] = await Promise.all([
        getWorkspaceMembers(activeWorkspace.id),
        getPendingInvites(activeWorkspace.id),
      ]);
      setMembers(memList);
      setPendingInvites(invList);
    } catch (err) {
      console.error('Failed to load members or invites:', err);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      setWsName(activeWorkspace.name);
      loadTeamData();
    }
  }, [activeWorkspace?.id, activeWorkspace?.name]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !wsName.trim() || !isOwner) return;
    setSavingName(true);
    try {
      await updateWorkspace(activeWorkspace.id, wsName.trim());
      await refreshWorkspaces();
      addToast({
        type: 'success',
        message: 'Workspace name updated',
      });
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to update name',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSavingName(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !inviteEmail.trim() || !user || !isOwner) return;
    setInviting(true);
    try {
      await createPendingInvite(
        activeWorkspace.id,
        inviteEmail.trim(),
        inviteRole,
        user.uid
      );

      addToast({
        type: 'success',
        message: 'Invite sent',
        description: `Pending invite created for ${inviteEmail.trim()}.`,
      });

      setInviteModalOpen(false);
      setInviteEmail('');
      await loadTeamData();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to send invite',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (emailLower: string) => {
    if (!activeWorkspace || !isOwner) return;
    try {
      await cancelPendingInvite(activeWorkspace.id, emailLower);
      setPendingInvites((prev) => prev.filter((i) => i.email !== emailLower));
      addToast({
        type: 'info',
        message: 'Invite cancelled',
      });
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to cancel invite',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleChangeRole = async (targetUid: string, nextRole: UserRole) => {
    if (!activeWorkspace || !isOwner) return;
    try {
      await updateMemberRole(activeWorkspace.id, targetUid, nextRole);
      setMembers((prev) =>
        prev.map((m) => (m.uid === targetUid ? { ...m, role: nextRole } : m))
      );
      addToast({
        type: 'info',
        message: 'Role updated',
      });
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to change role',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleRemoveMember = async (targetUid: string) => {
    if (!activeWorkspace || !isOwner) return;
    try {
      await removeWorkspaceMember(activeWorkspace.id, targetUid);
      setMembers((prev) => prev.filter((m) => m.uid !== targetUid));
      addToast({
        type: 'info',
        message: 'Member removed from workspace',
      });
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to remove member',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace || !isOwner) return;
    if (deleteConfirmText.trim() !== activeWorkspace.name.trim()) {
      addToast({
        type: 'warning',
        message: 'Workspace name confirmation does not match',
      });
      return;
    }

    setDeleting(true);
    try {
      await deleteWorkspaceDoc(activeWorkspace.id);
      addToast({
        type: 'info',
        message: 'Workspace deleted',
      });
      setDeleteModalOpen(false);

      const remaining = workspaces.filter((w) => w.id !== activeWorkspace.id);
      if (remaining.length > 0) {
        setActiveWorkspaceId(remaining[0].id);
        navigate('/');
      } else {
        await refreshWorkspaces();
        navigate('/');
      }
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Delete failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-border/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-muted mt-1">
          Workspace preferences, member permissions, and grounding engine specifications.
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Workspace Identity */}
        <div className="border border-border/80 rounded-md bg-surface p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold font-display text-text">Workspace details</h2>
            <p className="text-xs text-muted mt-0.5">Name and container identification.</p>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4">
            <Input
              label="Workspace name"
              value={wsName}
              onChange={(e) => setWsName(e.target.value)}
              disabled={!isOwner}
              helperText={isOwner ? 'Use your client\'s name if you manage several.' : 'Only workspace owners can rename.'}
            />
            <Input
              label="Workspace identifier"
              value={activeWorkspace?.id || ''}
              disabled
              className="text-xs text-muted"
            />
            {isOwner && (
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  loading={savingName}
                  disabled={wsName.trim() === activeWorkspace?.name}
                >
                  Save workspace name
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Team Members and RBAC */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold font-display text-text">Members and roles</h2>
            <p className="text-xs text-muted mt-0.5">Workspace collaborators and access tiers.</p>
          </div>

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInviteModalOpen(true)}
              icon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Invite member
            </Button>
          )}
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>User / Email</TableHeaderCell>
              <TableHeaderCell>Role / Status</TableHeaderCell>
              <TableHeaderCell>Date added</TableHeaderCell>
              {isOwner && <TableHeaderCell align="right">Actions</TableHeaderCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Active Members */}
            {members.map((m) => {
              const isCurrentUser = m.uid === user?.uid || m.email === user?.email;
              const isWorkspaceOwnerUser = m.uid === activeWorkspace?.ownerId;

              return (
                <TableRow key={m.uid}>
                  <TableCell className="text-xs">
                    <div className="font-medium text-text">
                      {m.email || m.displayName || m.uid}
                    </div>
                    {isCurrentUser && (
                      <span className="text-[11px] text-muted">(You)</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {isOwner && !isWorkspaceOwnerUser ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.uid, e.target.value as UserRole)}
                        className="px-2 py-1 text-xs bg-surface border border-border rounded text-text cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        <option value="owner">Owner</option>
                        <option value="analyst">Analyst</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <Badge variant={m.role === 'owner' ? 'own' : 'neutral'} size="sm">
                        {m.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted whitespace-nowrap">
                    {new Date(m.addedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  {isOwner && (
                    <TableCell align="right">
                      {!isWorkspaceOwnerUser && !isCurrentUser ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(m.uid)}
                          className="text-muted hover:text-danger"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <span className="text-muted text-xs">None</span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}

            {/* Pending Invites */}
            {pendingInvites.map((inv) => (
              <TableRow key={inv.email}>
                <TableCell className="text-xs">
                  <div className="font-medium text-text">{inv.email}</div>
                  <span className="text-[11px] text-muted">Pending invite ({inv.role})</span>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">
                    Pending
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted whitespace-nowrap">
                  {new Date(inv.createdAt || inv.invitedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </TableCell>
                {isOwner && (
                  <TableCell align="right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(inv.email)}
                      className="text-muted hover:text-danger flex items-center gap-1 ml-auto text-xs"
                      title="Cancel invite"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel invite</span>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Engine Grounding Transparency Note */}
      <div className="border border-border/80 rounded-md bg-surface p-4 sm:p-5 space-y-2">
        <h2 className="text-base font-semibold font-display text-text">
          Engine specification & grounding note
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          Results come from conversational search with live search grounding. Sightline passes queries to the evaluation engine equipped with search tools. Responses reflect real-time web citations and deterministic keyword matching against brand names and aliases.
        </p>
      </div>

      {/* Danger Zone */}
      {isOwner && (
        <div className="border border-danger/30 rounded-md bg-danger/5 p-4 sm:p-5 space-y-3">
          <div>
            <h2 className="text-base font-semibold font-display text-danger">
              Delete workspace
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Permanently remove this workspace and all associated brands, queries, and runs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <p className="text-xs text-muted leading-relaxed max-w-lg">
              Once deleted, all historical answer telemetry, Share of Voice records, and configurations are permanently destroyed.
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                setDeleteConfirmText('');
                setDeleteModalOpen(true);
              }}
            >
              Delete workspace
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Invite Member */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite workspace member"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInviteModalOpen(false)} disabled={inviting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleInviteMember} loading={inviting} disabled={!inviteEmail.trim()}>
              Send invite
            </Button>
          </>
        }
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Email address"
            placeholder="colleague@example.com"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            helperText="They get access the next time they sign in with this Google account."
            required
            autoFocus
          />

          <Select
            label="Access permission role"
            options={[
              { value: 'analyst', label: 'Analyst (can manage brands, queries & run executions)' },
              { value: 'viewer', label: 'Viewer (read-only access, ideal for clients)' },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as 'analyst' | 'viewer')}
          />
        </form>
      </Modal>

      {/* Modal: Delete Workspace Confirmation */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete workspace confirmation"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteWorkspace}
              loading={deleting}
              disabled={deleteConfirmText.trim() !== activeWorkspace?.name.trim()}
            >
              Permanently delete
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs sm:text-sm">
          <p className="text-text">
            This action cannot be undone. To confirm deletion, type the exact workspace name:
          </p>
          <div className="p-2.5 rounded bg-raised font-display font-medium text-text text-sm">
            {activeWorkspace?.name}
          </div>
          <Input
            placeholder="Type workspace name to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </div>
  );
}
