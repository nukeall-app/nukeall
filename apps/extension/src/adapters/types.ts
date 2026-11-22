import type { ContentItem, ContentType, DeleteResult, PlatformId } from '../core/types';

export interface ScanOptions {
  types: ContentType[];
  maxItems?: number;
  onItem?: (item: ContentItem) => void;
}

export interface PlatformUser {
  id: string;
  handle: string;
}

export interface PlatformAdapter {
  id: PlatformId;
  supportedTypes: ContentType[];
  getCurrentUser(): Promise<PlatformUser>;
  scan(opts: ScanOptions, signal: AbortSignal): AsyncGenerator<ContentItem>;
  delete(item: ContentItem): Promise<DeleteResult>;
  overwrite?(item: ContentItem, text: string): Promise<{ ok: boolean }>;
  parseArchive?(rawText: string, defaultHandle?: string): ContentItem[];
}
