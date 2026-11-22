import type { XTimelineKind } from '../adapters/x/graphql';
import type { ContentItem, ContentType, DeleteResult, JobState, PlatformId, ProgressEntry } from './types';

export interface DeleteOptions {
  redditOverwritePasses?: number;
  redditOverwriteText?: string;
  redditEditOnly?: boolean;
}

export type ExtensionMessage =
  | { type: 'GET_STATE' }
  | { type: 'PING' }
  | { type: 'GET_CURRENT_USER'; platform?: PlatformId; tabId?: number }
  | {
      /** Sent from UI to background: auto-navigates platform tab to the target page and scans. */
      type: 'START_SCAN';
      platform: PlatformId;
      contentTypes: ContentType[];
      /** 0 = no limit (scroll until the end). */
      maxItems: number;
    }
  | {
      /** Sent from background to a platform content script for a single page scan. */
      type: 'SCAN_TIMELINE';
      platform?: PlatformId;
      kind?: XTimelineKind;
      contentTypes: ContentType[];
      /** 0 = scroll to the end */
      maxItems: number;
      expectedHandle?: string;
    }
  | { type: 'STOP_SCAN' }
  | {
      type: 'DELETE_SINGLE_ITEM';
      item: ContentItem;
      options?: DeleteOptions;
    }
  | {
      type: 'START_DELETE';
      tabId?: number;
      platform: PlatformId;
      items: ContentItem[];
      resume?: boolean;
    }
  | { type: 'PAUSE_JOB' }
  | { type: 'RESUME_JOB' }
  | { type: 'STOP_JOB' }
  | { type: 'CLEAR_JOB' };

export interface BackgroundStatePayload {
  activeJob: JobState | null;
  checkpointIds: string[];
  lastLog: ProgressEntry[];
  itemsCount: number;
  deletedToday: number;
}

export type MessageResponse =
  | {
      ok: true;
      user?: { id: string; handle: string };
      items?: ContentItem[];
      result?: DeleteResult;
      state?: BackgroundStatePayload;
    }
  | { ok: false; error: string };
