import {
  DEFAULT_FILTERS,
  DEFAULT_PROTECT,
  DEFAULT_SETTINGS,
  type FilterOptions,
  type JobState,
  type ProgressEntry,
  type ProtectRules,
  type Settings,
} from './types';

export interface StoredState {
  settings: Settings;
  filters: FilterOptions;
  protect: ProtectRules;
  activeJob: JobState | null;
  checkpointIds: string[];
  lastLog: ProgressEntry[];
}

const memoryFallback = new Map<string, unknown>();

interface StorageAreaLike {
  get(keys: string[]): Promise<Record<string, unknown>>;
  set(items: Record<string, unknown>): Promise<void>;
}

function getStorageArea(): StorageAreaLike {
  const g = globalThis as unknown as {
    browser?: { storage?: { local?: StorageAreaLike } };
    chrome?: { storage?: { local?: StorageAreaLike } };
  };
  const area = g.browser?.storage?.local ?? g.chrome?.storage?.local;
  if (area) return area;

  return {
    async get(keys) {
      const out: Record<string, unknown> = {};
      for (const k of keys) {
        if (memoryFallback.has(k)) out[k] = memoryFallback.get(k);
      }
      return out;
    },
    async set(items) {
      for (const [k, v] of Object.entries(items)) {
        memoryFallback.set(k, v);
      }
    },
  };
}

export async function loadSettings(): Promise<Settings> {
  const data = await getStorageArea().get(['settings']);
  return { ...DEFAULT_SETTINGS, ...(data.settings as Partial<Settings> | undefined) };
}

export async function saveSettings(settings: Settings): Promise<void> {
  await getStorageArea().set({ settings });
}

export async function loadFilters(): Promise<FilterOptions> {
  const data = await getStorageArea().get(['filters']);
  return { ...DEFAULT_FILTERS, ...(data.filters as Partial<FilterOptions> | undefined) };
}

export async function saveFilters(filters: FilterOptions): Promise<void> {
  await getStorageArea().set({ filters });
}

export async function loadProtect(): Promise<ProtectRules> {
  const data = await getStorageArea().get(['protect']);
  return { ...DEFAULT_PROTECT, ...(data.protect as Partial<ProtectRules> | undefined) };
}

export async function saveProtect(protect: ProtectRules): Promise<void> {
  await getStorageArea().set({ protect });
}

export async function loadJobCheckpoint(): Promise<{
  activeJob: JobState | null;
  checkpointIds: string[];
  lastLog: ProgressEntry[];
}> {
  const data = await getStorageArea().get(['activeJob', 'checkpointIds', 'lastLog']);
  return {
    activeJob: (data.activeJob as JobState | null) ?? null,
    checkpointIds: Array.isArray(data.checkpointIds) ? (data.checkpointIds as string[]) : [],
    lastLog: Array.isArray(data.lastLog) ? (data.lastLog as ProgressEntry[]) : [],
  };
}

export async function saveJobCheckpoint(
  activeJob: JobState | null,
  checkpointIds: string[],
  lastLog: ProgressEntry[],
): Promise<void> {
  await getStorageArea().set({
    activeJob,
    checkpointIds,
    // Keep last 2000 log entries in storage.local to prevent quota bloat.
    lastLog: lastLog.slice(-2000),
  });
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function loadDeletedToday(): Promise<number> {
  const data = await getStorageArea().get(['dailyCount']);
  const rec = data.dailyCount as { date?: string; count?: number } | undefined;
  if (rec?.date === todayKey() && typeof rec.count === 'number') {
    return rec.count;
  }
  return 0;
}

export async function incrementDeletedToday(delta = 1): Promise<number> {
  const current = await loadDeletedToday();
  const next = current + delta;
  await getStorageArea().set({ dailyCount: { date: todayKey(), count: next } });
  return next;
}
