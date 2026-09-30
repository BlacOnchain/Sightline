import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut } from '../lib/firebase';
import {
  saveUserProfile,
  getUserWorkspaces,
  createWorkspace,
  getWorkspaceMembers,
} from '../lib/db';
import type { UserProfile, Workspace, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeRole: UserRole | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  setActiveWorkspaceId: (wid: string) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspaceAndSelect: (name: string) => Promise<Workspace>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async (uid: string) => {
    try {
      let token: string | null = null;
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
      const list = await getUserWorkspaces(uid, token);
      setWorkspaces(list);

      // Check saved active workspace
      const savedWid = localStorage.getItem('sightline-active-workspace');
      const found = list.find((w) => w.id === savedWid);
      const selected = found || list[0] || null;
      setActiveWorkspace(selected);
      if (selected) {
        localStorage.setItem('sightline-active-workspace', selected.id);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    }
  }, []);

  // Update member role whenever activeWorkspace changes
  useEffect(() => {
    if (!activeWorkspace || !user) {
      setActiveRole(null);
      return;
    }
    if (activeWorkspace.ownerId === user.uid) {
      setActiveRole('owner');
      return;
    }
    getWorkspaceMembers(activeWorkspace.id)
      .then((members) => {
        const myMem = members.find((m) => m.uid === user.uid);
        setActiveRole(myMem ? myMem.role : 'viewer');
      })
      .catch(() => {
        setActiveRole('viewer');
      });
  }, [activeWorkspace, user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await saveUserProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email || '',
            photoURL: currentUser.photoURL,
          });
          setUserProfile(profile);
          
          // Accept any pending workspace invites for this user's verified email
          try {
            const token = await currentUser.getIdToken();
            const acceptRes = await fetch('/api/invites/accept', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (acceptRes.ok) {
              const acceptData = await acceptRes.json();
              if (acceptData.joinedWorkspaces && acceptData.joinedWorkspaces.length > 0) {
                console.log('Joined workspaces from pending invites:', acceptData.joinedWorkspaces);
              }
            }
          } catch (invErr) {
            console.error('Failed to accept pending invites:', invErr);
          }

          await fetchWorkspaces(currentUser.uid);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setUserProfile(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        setActiveRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchWorkspaces]);

  const signIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await logOut();
      localStorage.removeItem('sightline-active-workspace');
    } finally {
      setLoading(false);
    }
  };

  const setActiveWorkspaceId = (wid: string) => {
    const ws = workspaces.find((w) => w.id === wid);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem('sightline-active-workspace', wid);
    }
  };

  const refreshWorkspaces = async () => {
    if (user) {
      await fetchWorkspaces(user.uid);
    }
  };

  const createWorkspaceAndSelect = async (name: string): Promise<Workspace> => {
    if (!user) throw new Error('Must be signed in to create a workspace');
    const newWs = await createWorkspace(name, user.uid);
    const updated = [...workspaces, newWs];
    setWorkspaces(updated);
    setActiveWorkspace(newWs);
    setActiveRole('owner');
    localStorage.setItem('sightline-active-workspace', newWs.id);
    return newWs;
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        workspaces,
        activeWorkspace,
        activeRole,
        loading,
        signIn,
        signOut,
        setActiveWorkspaceId,
        refreshWorkspaces,
        createWorkspaceAndSelect,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
