// Shared domain types for NukeAll.

export type PlatformId = 'x' | 'instagram' | 'reddit' | 'linkedin';

export type ContentType =
  | 'post'
  | 'reply'
  | 'repost'
  | 'quote'
  | 'like'
  | 'bookmark'
  | 'comment'
  | 'message'
  | 'story_reply'
  | 'tag';

export interface ContentMetrics {
  likes?: number;
  reposts?: number;
  replies?: number;
  score?: number;
}

export interface ContentItem {
  /** Platform-unique id of the item to act on (e.g. tweet id). */
  id: string;
  platform: PlatformId;
  type: ContentType;
  text: string;
  /** ISO 8601 timestamp. Kept as string so items are JSON/message serializable. */
  createdAt: string;
  url: string;
  metrics?: ContentMetrics;
  media?: boolean;
  pinned?: boolean;
  lang?: string;
  /** Source client (X "source" field), subreddit, etc. */
  source?: string;
  /** For reposts: id of the original content. */
  targetId?: string;
  /** Free-form platform-specific data. */
  meta?: Record<string, unknown>;
}

export type RiskKind = 'profanity' | 'custom';

export interface RiskHit {
  kind: RiskKind;
  match: string;
}

export interface FilterOptions {
  types: ContentType[];
  /** ISO date (inclusive). */
  from?: string;
  /** ISO date (inclusive). */
  to?: string;
  olderThanDays?: number;
  /** Item matches if text contains ANY of these (case-insensitive). Empty = no constraint. */
  includeKeywords: string[];
  /** Item is skipped if text contains ANY of these. */
  excludeKeywords: string[];
  /** Optional JS regex source applied to the text. */
  regex?: string;
  media?: 'any' | 'with' | 'without';
  /** Only items flagged by the risk scanner. */
  onlyRisky?: boolean;
}

export interface ProtectRules {
  keepPinned: boolean;
  /** Keep items whose likes >= this value. 0/undefined disables. */
  minLikes?: number;
  minReposts?: number;
  /** Keep items whose text contains this tag (e.g. "#keep"). */
  keepTag?: string;
  /** Manually protected ids. */
  protectedIds: string[];
}

export type SpeedMode = 'safe' | 'normal' | 'fast';

export interface Settings {
  speed: SpeedMode;
  /** Max deletions per 24h (0 = unlimited). */
  dailyLimit: number;
  /** Reddit: how many times to overwrite text before deleting (0–3). */
  redditOverwritePasses: number;
  /** Reddit: optional custom replacement text (blank = random gibberish each pass). */
  redditOverwriteText: string;
  /** Reddit: only overwrite without deleting (let scrapers re-index first). */
  redditEditOnly: boolean;
  locale: 'auto' | 'en' | 'tr';
  theme: 'auto' | 'dark' | 'light';
  supportPromptShown: boolean;
  acceptedWarning: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  speed: 'safe',
  dailyLimit: 1500,
  redditOverwritePasses: 2,
  redditOverwriteText: '',
  redditEditOnly: false,
  locale: 'auto',
  theme: 'auto',
  supportPromptShown: false,
  acceptedWarning: false,
};

export const DEFAULT_FILTERS: FilterOptions = {
  types: ['reply'],
  includeKeywords: [],
  excludeKeywords: [],
  media: 'any',
};

export const DEFAULT_PROTECT: ProtectRules = {
  keepPinned: true,
  minLikes: 0,
  minReposts: 0,
  keepTag: '#keep',
  protectedIds: [],
};

export interface DeleteResult {
  ok: boolean;
  /** Item no longer exists: treat as success. */
  gone?: boolean;
  /** Platform asked us to back off. */
  retryAfterMs?: number;
  error?: string;
}

export interface ProgressEntry {
  id: string;
  ok: boolean;
  at: string;
  error?: string;
}

export type JobStatus = 'idle' | 'running' | 'paused' | 'waiting' | 'done' | 'stopped' | 'error';

export interface JobState {
  jobId: string;
  platform: PlatformId;
  status: JobStatus;
  total: number;
  done: number;
  failed: number;
  startedAt: string;
  finishedAt?: string;
  /** If waiting for rate limit / daily limit: when we resume (ISO). */
  resumeAt?: string;
  lastError?: string;
}
