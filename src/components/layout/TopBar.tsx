import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronDown,
  Plus,
  LogOut,
  Check,
  User as UserIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from '../ui/Logo';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface TopBarProps {
  onOpenShortcuts?: () => void;
}

const navItems = [
  { name: 'Brief', to: '/overview' },
  { name: 'Queries', to: '/queries' },
  { name: 'Brands', to: '/brands' },
  { name: 'Runs', to: '/runs' },
  { name: 'Reports', to: '/reports' },
  { name: 'Settings', to: '/settings' },
];

export function TopBar({ onOpenShortcuts }: TopBarProps) {
  const {
    user,
    workspaces,
    activeWorkspace,
    activeRole,
    setActiveWorkspaceId,
    createWorkspaceAndSelect,
    signOut,
  } = useAuth();
  const { addToast } = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [creatingWs, setCreatingWs] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    setCreatingWs(true);
    try {
      const created = await createWorkspaceAndSelect(newWsName.trim());
      addToast({
        type: 'success',
        message: 'Workspace created',
        description: `Switched to "${created.name}"`,
      });
      setNewWsName('');
      setCreateModalOpen(false);
      setWsDropdownOpen(false);
    } catch (err: unknown) {
      addToast({
        type: 'danger',
        message: 'Failed to create workspace',
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setCreatingWs(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-6">
            <NavLink
              to="/overview"
              className="flex items-center gap-2 hover:opacity-85 transition-opacity"
            >
              <Logo size={20} showWordmark={true} />
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 text-sm">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `py-4 transition-colors relative border-b-2 text-sm ${
                      isActive
                        ? 'border-text text-text font-semibold'
                        : 'border-transparent text-muted hover:text-text'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-2.5">
            {/* Workspace Switcher */}
            {activeWorkspace && (
              <div className="relative" ref={wsRef}>
                <button
                  type="button"
                  onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border bg-raised/50 hover:bg-raised transition-colors text-xs font-medium text-text focus:outline-none focus:ring-1 focus:ring-accent"
                  aria-haspopup="listbox"
                  aria-expanded={wsDropdownOpen}
                >
                  <span className="text-muted text-[11px]">Workspace:</span>
                  <span className="max-w-[120px] sm:max-w-[160px] truncate font-medium">
                    {activeWorkspace.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted" />
                </button>

                {wsDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-64 rounded-md bg-surface border border-border shadow-xs py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border/60 text-muted">
                      Select workspace
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {workspaces.map((ws) => (
                        <button
                          key={ws.id}
                          type="button"
                          onClick={() => {
                            setActiveWorkspaceId(ws.id);
                            setWsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-raised transition-colors ${
                            ws.id === activeWorkspace.id
                              ? 'text-text font-medium bg-raised/50'
                              : 'text-muted'
                          }`}
                        >
                          <span className="truncate">{ws.name}</span>
                          {ws.id === activeWorkspace.id && (
                            <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-border/60 p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setWsDropdownOpen(false);
                          setCreateModalOpen(true);
                        }}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-text hover:bg-raised transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create new workspace</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Keyboard Shortcuts Trigger */}
            {onOpenShortcuts && (
              <button
                type="button"
                onClick={onOpenShortcuts}
                title="Keyboard Shortcuts (?)"
                className="hidden sm:inline-flex p-1.5 text-muted hover:text-text rounded-md hover:bg-raised transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            {/* User Avatar & Menu */}
            {user && (
              <div className="relative" ref={userRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 p-1 rounded-md hover:bg-raised transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-6 h-6 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-raised border border-border flex items-center justify-center text-[10px] font-medium text-text">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 rounded-md bg-surface border border-border shadow-xs py-1 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="font-medium text-text truncate">
                        {user.displayName || 'Account'}
                      </p>
                      <p className="text-[11px] text-muted truncate">{user.email}</p>
                      {activeRole && (
                        <p className="text-[10px] text-muted mt-1 capitalize">
                          Role: <span className="text-text font-medium">{activeRole}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-danger hover:bg-raised transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-muted hover:text-text rounded-md border border-border transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Full-Width Menu Sheet */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-1 pb-3 border-b border-border/60">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? 'bg-raised text-text font-semibold'
                        : 'text-muted hover:text-text hover:bg-raised/50'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </div>

            {onOpenShortcuts && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenShortcuts();
                }}
                className="w-full text-left px-3 py-2 text-xs text-muted hover:text-text flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Keyboard Shortcuts (?)</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Workspace"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              disabled={creatingWs}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateWorkspace}
              loading={creatingWs}
              disabled={!newWsName.trim()}
            >
              Create Workspace
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <Input
            label="Workspace Name"
            placeholder="e.g. Paystack or Client Brand"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            helperText="Use your client's name if you manage several."
            autoFocus
            required
          />
        </form>
      </Modal>
    </>
  );
}
