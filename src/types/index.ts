export type UserRole = 'owner' | 'analyst' | 'viewer';
export type BrandKind = 'own' | 'competitor';
export type QueryFrequency = 'daily' | 'weekly' | 'manual';
export type RunStatus = 'completed' | 'failed';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string;
  photoURL: string | null;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  uid: string;
  role: UserRole;
  addedAt: string;
  email?: string;
  displayName?: string;
}

export interface PendingInvite {
  email: string;
  role: UserRole;
  invitedBy: string;
  invitedAt: string;
  createdAt?: string;
}

export interface Brand {
  id: string;
  name: string;
  aliases: string[];
  website?: string;
  kind: BrandKind;
  createdAt: string;
  isSample?: boolean;
}

export interface TrackedQuery {
  id: string;
  text: string;
  category: string;
  frequency: QueryFrequency;
  active: boolean;
  lastRunAt?: string | null;
  nextRunAt?: string | null;
  createdAt: string;
  isSample?: boolean;
}

export interface BrandMention {
  brandId: string;
  brandName?: string;
  position: number;
}

export interface GroundedSource {
  title: string;
  url: string;
  domain: string;
}

export interface RunRecord {
  id: string;
  queryId: string;
  queryText: string;
  model: string;
  status: RunStatus;
  startedAt: string;
  answerText?: string;
  mentions: BrandMention[];
  sources: GroundedSource[];
  error?: string;
  isSample?: boolean;
}

export interface ShareOfVoiceEntry {
  brandId: string;
  brandName: string;
  kind: BrandKind;
  mentionCount: number;
  sharePercentage: number;
  avgPosition: number;
}

export interface TopSourceEntry {
  domain: string;
  url?: string;
  title?: string;
  citationCount: number;
}

export interface ReportRecord {
  id: string;
  periodStart: string;
  periodEnd: string;
  visibilityScore: number;
  avgPosition: number;
  shareOfVoice: ShareOfVoiceEntry[];
  topSources: TopSourceEntry[];
  runCount: number;
  generatedAt: string;
  isSample?: boolean;
}
