import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Plus, Trash2, Edit2, Globe, Building, X, ExternalLink } from 'lucide-react';
import { getWorkspaceBrands, createBrand, updateBrand, deleteBrand } from '../lib/db';
import type { Brand, BrandKind } from '../types';
import { useToast } from '../components/ui/Toast';

export function BrandsPage() {
  const { activeWorkspace, activeRole } = useAuth();
  const { addToast } = useToast();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Form State
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  const [name, setName] = useState('');
  const [kind, setKind] = useState<BrandKind>('competitor');
  const [website, setWebsite] = useState('');
  const [aliases, setAliases] = useState<string[]>([]);
  const [aliasInput, setAliasInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canEdit = activeRole === 'owner' || activeRole === 'analyst';

  const loadBrands = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const list = await getWorkspaceBrands(activeWorkspace.id);
      setBrands(list);
    } catch (err) {
      console.error('Failed to load brands:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, [activeWorkspace?.id]);

  const handleOpenAddModal = (defaultKind: BrandKind = 'competitor') => {
    setName('');
    setKind(defaultKind);
    setWebsite('');
    setAliases([]);
    setAliasInput('');
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setKind(b.kind);
    setWebsite(b.website || '');
    setAliases([...(b.aliases || [])]);
    setAliasInput('');
    setEditModalOpen(true);
  };

  const handleAddAlias = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    const clean = aliasInput.trim().replace(/^,+|,+$/g, '');
    if (clean && !aliases.includes(clean)) {
      setAliases([...aliases, clean]);
      setAliasInput('');
    }
  };

  const handleRemoveAlias = (tag: string) => {
    setAliases(aliases.filter((a) => a !== tag));
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !name.trim()) return;
    setSubmitting(true);
    try {
      if (kind === 'own' && brands.some((b) => b.kind === 'own')) {
        addToast({
          type: 'warning',
          message: 'Primary brand replaced',
          description: 'Reassigned primary brand status.',
        });
      }

      await createBrand(activeWorkspace.id, {
        name: name.trim(),
        kind,
        website: website.trim() || undefined,
        aliases,
      });

      addToast({
        type: 'success',
        message: 'Brand saved',
        description: `Added "${name.trim()}" to brand tracking.`,
      });

      setAddModalOpen(false);
      await loadBrands();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to create brand',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !editingBrand || !name.trim()) return;
    setSubmitting(true);
    try {
      await updateBrand(activeWorkspace.id, editingBrand.id, {
        name: name.trim(),
        kind,
        website: website.trim() || undefined,
        aliases,
      });

      addToast({
        type: 'success',
        message: 'Brand updated',
        description: 'Changes saved to workspace.',
      });

      setEditModalOpen(false);
      await loadBrands();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Update failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeWorkspace || !deletingBrand) return;
    setSubmitting(true);
    try {
      await deleteBrand(activeWorkspace.id, deletingBrand.id);
      setBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
      addToast({
        type: 'info',
        message: 'Brand deleted',
        description: 'Removed from workspace tracking registry.',
      });
      setDeleteModalOpen(false);
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Delete failed',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ownBrand = brands.find((b) => b.kind === 'own');
  const competitors = brands.filter((b) => b.kind === 'competitor');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            Brands
          </h1>
          <p className="text-xs text-muted mt-1">
            Aliases are alternative names or spellings used for deterministic whole-word mention detection.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {!ownBrand && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAddModal('own')}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Set primary brand
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenAddModal('competitor')}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add competitor
            </Button>
          </div>
        )}
      </div>

      {/* Primary Brand Spotlight */}
      {ownBrand ? (
        <div className="border border-border/80 rounded-md bg-surface p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold font-display text-text">{ownBrand.name}</h2>
                <Badge variant="own" size="sm">Primary brand</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted pt-1.5">
                <span>Aliases ({ownBrand.aliases?.length || 0}):</span>
                {ownBrand.aliases && ownBrand.aliases.length > 0 ? (
                  ownBrand.aliases.map((a, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-sm bg-raised border border-border/60 text-text text-xs"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="italic text-muted">None configured</span>
                )}
              </div>
              {ownBrand.website && (
                <div className="pt-1">
                  <a
                    href={ownBrand.website.startsWith('http') ? ownBrand.website : `https://${ownBrand.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    <span>{ownBrand.website}</span>
                  </a>
                </div>
              )}
            </div>

            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(ownBrand)}>
                Edit primary brand
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-surface border border-warning/30 rounded-md flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-warning block">No primary brand configured</span>
            <span className="text-muted">
              Add your own brand to calculate visibility rates and track mentions.
            </span>
          </div>
          {canEdit && (
            <Button variant="primary" size="sm" onClick={() => handleOpenAddModal('own')}>
              Add primary brand
            </Button>
          )}
        </div>
      )}

      {/* Competitors List */}
      <div className="space-y-4 pt-4 border-t border-border/80">
        <div>
          <h2 className="text-base font-semibold font-display text-text">
            Tracked competitors
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {competitors.length} competitors monitored in this workspace.
          </p>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : competitors.length === 0 ? (
          <EmptyState
            title="No competitors registered yet"
            description="Add competitor brands to calculate comparative Share of Voice across AI answers."
            action={
              canEdit ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenAddModal('competitor')}
                  icon={<Plus className="w-3.5 h-3.5" />}
                  className="mt-2"
                >
                  Add first competitor
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Brand name</TableHeaderCell>
                <TableHeaderCell>Aliases (Matching keywords)</TableHeaderCell>
                <TableHeaderCell>Website</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {competitors.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium text-text">
                    {b.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {b.aliases && b.aliases.length > 0 ? (
                        b.aliases.map((a, i) => (
                          <span
                            key={i}
                            className="text-xs bg-raised px-1.5 py-0.5 rounded-sm border border-border/60 text-muted"
                          >
                            {a}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted text-xs italic">none</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted">
                    {b.website ? (
                      <a
                        href={b.website.startsWith('http') ? b.website : `https://${b.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-text"
                      >
                        {b.website}
                      </a>
                    ) : (
                      'None yet'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEditModal(b)}
                          title="Edit brand"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted" />
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingBrand(b);
                            setDeleteModalOpen(true);
                          }}
                          title="Delete brand"
                          className="text-danger hover:text-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Brand Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title={kind === 'own' ? 'Set primary brand' : 'Add competitor brand'}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateBrand} loading={submitting} disabled={!name.trim()}>
              Save brand
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBrand} className="space-y-4">
          <Input
            label={kind === 'own' ? 'The brand you manage' : 'Competitor name'}
            placeholder={kind === 'own' ? 'e.g. Paystack' : 'e.g. Flutterwave'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Website (optional)"
            placeholder="e.g. paystack.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-normal text-muted">
              Other names and handles
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Paystack, @paystack"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAddAlias}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddAlias}>
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted">
              Add spellings and handles people use, like @brandname.
            </p>

            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {aliases.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-raised border border-border text-xs text-text"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlias(tag)}
                      className="text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit Brand Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit brand"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateBrand} loading={submitting} disabled={!name.trim()}>
              Save changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateBrand} className="space-y-4">
          <Input
            label="Brand name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-normal text-muted">
              Other names and handles
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Type name and press Enter"
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value)}
                onKeyDown={handleAddAlias}
              />
              <Button type="button" variant="secondary" size="sm" onClick={handleAddAlias}>
                Add
              </Button>
            </div>
            <p className="text-[11px] text-muted">
              Add spellings and handles people use, like @brandname.
            </p>

            {aliases.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {aliases.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-raised border border-border text-xs text-text"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAlias(tag)}
                      className="text-muted hover:text-danger"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete brand"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} loading={submitting}>
              Delete brand
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-text">
            Are you sure you want to remove <strong>"{deletingBrand?.name}"</strong> from workspace tracking?
          </p>
          <p className="text-xs text-muted">
            Removing this brand will exclude it from future mention evaluations and Share of Voice calculations.
          </p>
        </div>
      </Modal>
    </div>
  );
}
