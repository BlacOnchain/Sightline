import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { NoQueriesIllustration } from '../components/illustrations/Illustrations';
import { Plus, Play, Trash2, Edit2, Search as SearchIcon, ExternalLink, Filter } from 'lucide-react';
import { getWorkspaceQueries, createQuery, updateQuery, deleteQuery } from '../lib/db';
import type { TrackedQuery, QueryFrequency } from '../types';
import { useToast } from '../components/ui/Toast';

export function QueriesPage() {
  const { activeWorkspace, activeRole, getIdToken } = useAuth();
  const { addToast } = useToast();

  const [queries, setQueries] = useState<TrackedQuery[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form State
  const [editingQuery, setEditingQuery] = useState<TrackedQuery | null>(null);
  const [deletingQuery, setDeletingQuery] = useState<TrackedQuery | null>(null);

  const [textInput, setTextInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('General');
  const [frequencyInput, setFrequencyInput] = useState<QueryFrequency>('daily');
  const [activeInput, setActiveInput] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Run Now state
  const [runningId, setRunningId] = useState<string | null>(null);

  const canEdit = activeRole === 'owner' || activeRole === 'analyst';

  const loadQueries = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const list = await getWorkspaceQueries(activeWorkspace.id);
      setQueries(list);
    } catch (err) {
      console.error('Failed to load queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, [activeWorkspace?.id]);

  // Derived categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    queries.forEach((q) => {
      if (q.category) set.add(q.category);
    });
    return Array.from(set);
  }, [queries]);

  // Filtered list
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const matchSearch =
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || q.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [queries, searchTerm, selectedCategory]);

  const handleOpenAddModal = () => {
    setTextInput('');
    setCategoryInput('General');
    setFrequencyInput('daily');
    setActiveInput(true);
    setAddModalOpen(true);
  };

  const handleOpenEditModal = (q: TrackedQuery) => {
    setEditingQuery(q);
    setTextInput(q.text);
    setCategoryInput(q.category);
    setFrequencyInput(q.frequency);
    setActiveInput(q.active);
    setEditModalOpen(true);
  };

  const handleCreateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !textInput.trim()) return;
    setSubmitting(true);
    try {
      await createQuery(activeWorkspace.id, {
        text: textInput.trim(),
        category: categoryInput.trim() || 'General',
        frequency: frequencyInput,
        active: activeInput,
      });
      addToast({
        type: 'success',
        message: 'Query added',
        description: 'Scheduled for search-grounded evaluation.',
      });
      setAddModalOpen(false);
      await loadQueries();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to add query',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !editingQuery || !textInput.trim()) return;
    setSubmitting(true);
    try {
      await updateQuery(activeWorkspace.id, editingQuery.id, {
        text: textInput.trim(),
        category: categoryInput.trim() || 'General',
        frequency: frequencyInput,
        active: activeInput,
      });
      addToast({
        type: 'success',
        message: 'Query updated',
        description: 'Changes saved to workspace.',
      });
      setEditModalOpen(false);
      await loadQueries();
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

  const handleToggleActive = async (q: TrackedQuery) => {
    if (!activeWorkspace || !canEdit) return;
    try {
      const nextActive = !q.active;
      await updateQuery(activeWorkspace.id, q.id, { active: nextActive });
      setQueries((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, active: nextActive } : item))
      );
      addToast({
        type: 'info',
        message: nextActive ? 'Query activated' : 'Query paused',
      });
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to toggle status',
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!activeWorkspace || !deletingQuery) return;
    setSubmitting(true);
    try {
      await deleteQuery(activeWorkspace.id, deletingQuery.id);
      setQueries((prev) => prev.filter((item) => item.id !== deletingQuery.id));
      addToast({
        type: 'info',
        message: 'Query removed',
        description: 'Deleted from tracked query schedule.',
      });
      setDeleteConfirmOpen(false);
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

  const handleRunQuery = async (qid: string) => {
    if (!activeWorkspace) return;
    setRunningId(qid);
    try {
      const token = await getIdToken();
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/queries/${qid}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Execution failed');
      addToast({
        type: 'success',
        message: 'Query run finished',
        description: `Identified ${data.mentions?.length || 0} brand mentions.`,
      });
      await loadQueries();
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Run error',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text tracking-tight">
            Queries
          </h1>
          <p className="text-xs text-muted mt-1">
            Prompt queries evaluated against conversational search with live grounding.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddModal}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add query
          </Button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search queries or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-xs"
          />
          <SearchIcon className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All categories ({queries.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-2 py-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredQueries.length === 0 ? (
          <EmptyState
            title="No queries found"
            description={searchTerm || selectedCategory !== 'all' ? 'Try adjusting your search or category filter.' : 'Add starter queries to begin tracking your brand in AI search results.'}
            illustration={<NoQueriesIllustration />}
            action={
              canEdit && !searchTerm && selectedCategory === 'all' ? (
                <Button variant="primary" size="sm" onClick={handleOpenAddModal} icon={<Plus className="w-3.5 h-3.5" />} className="mt-2">
                  Add first query
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Query prompt</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Frequency</TableHeaderCell>
                <TableHeaderCell>Active</TableHeaderCell>
                <TableHeaderCell>Last run</TableHeaderCell>
                <TableHeaderCell align="right">Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueries.map((q) => {
                const isRunning = runningId === q.id;
                const lastRunStr = q.lastRunAt
                  ? new Date(q.lastRunAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never';

                return (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium text-text max-w-[280px]">
                      <Link
                        to={`/queries/${q.id}`}
                        className="hover:underline flex items-center gap-1.5 group"
                      >
                        <span className="truncate">{q.text}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 text-muted shrink-0 transition-opacity" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral" size="sm">
                        {q.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-muted text-xs">
                      {q.frequency}
                    </TableCell>
                    <TableCell>
                      {canEdit ? (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(q)}
                          className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            q.active ? 'bg-accent' : 'bg-raised border-border'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-surface shadow-xs ring-0 transition duration-200 ease-in-out ${
                              q.active ? 'translate-x-3 bg-surface' : 'translate-x-0 bg-muted'
                            }`}
                          />
                        </button>
                      ) : (
                        <span className="text-xs text-muted">{q.active ? 'Active' : 'Paused'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted text-xs whitespace-nowrap">
                      {lastRunStr}
                    </TableCell>
                    <TableCell align="right">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRunQuery(q.id)}
                            loading={isRunning}
                            disabled={!q.active}
                            title="Run query now"
                            icon={<Play className="w-3 h-3 fill-current" />}
                          >
                            Run
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(q)}
                            title="Edit query"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDeletingQuery(q);
                              setDeleteConfirmOpen(true);
                            }}
                            title="Delete query"
                            className="text-danger hover:text-danger"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add tracked query"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateQuery} loading={submitting} disabled={!textInput.trim()}>
              Add query
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateQuery} className="space-y-4">
          <Input
            label="Search prompt / question"
            placeholder="e.g. best coffee subscription for beginners"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            helperText="Write natural customer search queries as users would type into Google AI."
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="e.g. General, Competitor comparison"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            />

            <Select
              label="Run frequency"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'manual', label: 'Manual only' },
              ]}
              value={frequencyInput}
              onChange={(e) => setFrequencyInput(e.target.value as QueryFrequency)}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit query"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleUpdateQuery} loading={submitting} disabled={!textInput.trim()}>
              Save changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleUpdateQuery} className="space-y-4">
          <Input
            label="Search prompt / question"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            />

            <Select
              label="Run frequency"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'manual', label: 'Manual only' },
              ]}
              value={frequencyInput}
              onChange={(e) => setFrequencyInput(e.target.value as QueryFrequency)}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete query"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmDelete} loading={submitting}>
              Delete query
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs sm:text-sm">
          <p className="text-text">
            Are you sure you want to remove this query from the workspace?
          </p>
          <div className="p-3 rounded-md bg-raised/50 border border-border/70 font-display text-text italic">
            "{deletingQuery?.text}"
          </div>
          <p className="text-xs text-muted">
            Existing historical run records will remain preserved in historical reports.
          </p>
        </div>
      </Modal>
    </div>
  );
}
