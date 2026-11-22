import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { parseInstagramArchiveJson } from '../adapters/instagram/archive';
import { parseLinkedInCsvArchive } from '../adapters/linkedin/archive';
import { parseRedditCsvArchive } from '../adapters/reddit/archive';
import { parseXArchiveText } from '../adapters/x/archive';
import { clearItems, getAllItems, putItems } from '../core/archive-db';
import {
  toCsvBackup,
  toDeletionReportHtml,
  toDeletionReportJson,
  toJsonBackup,
  toOfflineHtmlArchive,
} from '../core/exporter';
import { matchesFilter } from '../core/filters';
import { BUILTIN_PRESETS, exportPresetJson, importPresetJson } from '../core/presets';
import { isProtected } from '../core/protect';
import { scanItemRisks } from '../core/risk';
import {
  loadFilters,
  loadJobCheckpoint,
  loadProtect,
  loadSettings,
  saveFilters,
  saveProtect,
  saveSettings,
} from '../core/storage';
import {
  DEFAULT_FILTERS,
  DEFAULT_PROTECT,
  DEFAULT_SETTINGS,
  type ContentItem,
  type ContentType,
  type FilterOptions,
  type JobState,
  type PlatformId,
  type ProgressEntry,
  type ProtectRules,
  type RiskHit,
  type Settings,
} from '../core/types';
import type { ExtensionMessage, MessageResponse } from '../core/messages';
import { getUiDict, resolveUiLang } from '../i18n';

type TabKey = 'scan' | 'archive' | 'review' | 'viewer' | 'settings';

const PLATFORM_TYPES: Record<PlatformId, ContentType[]> = {
  x: ['reply', 'post', 'repost', 'quote', 'like', 'bookmark'],
  instagram: ['comment', 'like', 'post', 'message'],
  reddit: ['comment', 'post'],
  linkedin: ['post', 'comment', 'like'],
};

function daysAgoIsoDate(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
}

function selectMatchedUnprotectedIds(
  all: ContentItem[],
  activeFilters: FilterOptions,
  activeProtect: ProtectRules,
): Set<string> {
  const risks = new Map<string, RiskHit[]>();
  for (const it of all) {
    const hits = scanItemRisks(it);
    if (hits.length > 0) risks.set(it.id, hits);
  }
  return new Set(
    all
      .filter((it) => matchesFilter(it, activeFilters, risks) && !isProtected(it, activeProtect).protected)
      .map((it) => it.id),
  );
}

function downloadText(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Dashboard() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [protect, setProtect] = useState<ProtectRules>(DEFAULT_PROTECT);
  const [tab, setTab] = useState<TabKey>('scan');
  const [platform, setPlatform] = useState<PlatformId>('x');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [dbCount, setDbCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [maxScan, setMaxScan] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [archiveHandle, setArchiveHandle] = useState('');
  const [activeJob, setActiveJob] = useState<JobState | null>(null);
  const [checkpointIds, setCheckpointIds] = useState<string[]>([]);
  const [jobLog, setJobLog] = useState<ProgressEntry[]>([]);
  const [deletedToday, setDeletedToday] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [presetId, setPresetId] = useState<string>('custom');
  const [showSupportBanner, setShowSupportBanner] = useState(false);

  const pendingDeleteItems = useRef<ContentItem[]>([]);
  const countdownTimer = useRef<number | null>(null);

  const lang = resolveUiLang(settings.locale);
  const d = getUiDict(lang);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [s, f, p, cached, cp, bgResp] = await Promise.all([
        loadSettings(),
        loadFilters(),
        loadProtect(),
        getAllItems('x'),
        loadJobCheckpoint(),
        browser.runtime
          .sendMessage({ type: 'GET_STATE' } satisfies ExtensionMessage)
          .catch(() => null) as Promise<MessageResponse | null>,
      ]);
      if (!alive) return;
      setSettings(s);
      setFilters(f);
      setProtect(p);
      setItems(cached);
      setDbCount(cached.length);
      setActiveJob(cp.activeJob);
      setCheckpointIds(cp.checkpointIds);
      setJobLog(cp.lastLog);
      if (bgResp && bgResp.ok && bgResp.state) {
        setDeletedToday(bgResp.state.deletedToday);
      }
      if (cp.activeJob?.status === 'done' && !s.supportPromptShown && cp.activeJob.done >= 10) {
        setShowSupportBanner(true);
      }
    })();

    const onRuntimeMessage = (raw: unknown) => {
      const msg = raw as {
        type?: string;
        state?: JobState;
        log?: ProgressEntry[];
        deletedToday?: number;
        stage?: 'navigating' | 'scanning';
        url?: string;
        count?: number;
      };
      if (msg?.type === 'JOB_PROGRESS' && msg.state) {
        setActiveJob(msg.state);
        if (Array.isArray(msg.log)) setJobLog(msg.log);
        if (typeof msg.deletedToday === 'number') setDeletedToday(msg.deletedToday);
        if (msg.state.status === 'done' && msg.state.done >= 10) {
          setShowSupportBanner(true);
        }
      }
      if (msg?.type === 'SCAN_PROGRESS') {
        if (msg.stage === 'navigating' && msg.url) {
          setScanStatus(msg.url);
        } else if (typeof msg.count === 'number') {
          setScanStatus(`#${msg.count}`);
        }
      }
    };
    browser.runtime.onMessage.addListener(onRuntimeMessage);
    return () => {
      alive = false;
      browser.runtime.onMessage.removeListener(onRuntimeMessage);
    };
  }, []);

  useEffect(() => {
    const theme = settings.theme;
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme]);

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  };

  const updateFilters = (patch: Partial<FilterOptions>) => {
    setPresetId('custom');
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      void saveFilters(next);
      return next;
    });
  };

  const updateProtect = (patch: Partial<ProtectRules>) => {
    setPresetId('custom');
    setProtect((prev) => {
      const next = { ...prev, ...patch };
      void saveProtect(next);
      return next;
    });
  };

  const riskMap = useMemo(() => {
    const map = new Map<string, RiskHit[]>();
    for (const item of items) {
      const hits = scanItemRisks(item);
      if (hits.length > 0) map.set(item.id, hits);
    }
    return map;
  }, [items]);

  const evaluated = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.map((item) => {
      const prot = isProtected(item, protect);
      const matched =
        matchesFilter(item, filters, riskMap) && (!q || item.text.toLowerCase().includes(q));
      const risks = riskMap.get(item.id) ?? [];
      return { item, prot, matched, risks };
    });
  }, [items, filters, protect, riskMap, searchQuery]);

  const matchedItems = useMemo(
    () => evaluated.filter((e) => e.matched && !e.prot.protected),
    [evaluated],
  );
  const protectedCount = useMemo(
    () => evaluated.filter((e) => e.matched && e.prot.protected).length,
    [evaluated],
  );

  const itemsById = useMemo(() => {
    const rec: Record<string, ContentItem> = {};
    for (const it of items) rec[it.id] = it;
    return rec;
  }, [items]);

  const switchPlatform = async (nextPlatform: PlatformId) => {
    setPlatform(nextPlatform);
    setStatusMsg('');
    setSelectedIds(new Set());
    const allowed = PLATFORM_TYPES[nextPlatform];
    const defaultType = allowed[0] ?? 'comment';
    if (!filters.types.some((t) => allowed.includes(t))) {
      updateFilters({ types: [defaultType] });
    } else if (filters.types.length !== 1 || !allowed.includes(filters.types[0]!)) {
      const firstValid = filters.types.find((t) => allowed.includes(t)) ?? defaultType;
      updateFilters({ types: [firstValid] });
    }
    const cached = await getAllItems(nextPlatform);
    setItems(cached);
    setDbCount(cached.length);
  };

  const activeScanType: ContentType = useMemo(() => {
    const allowed = PLATFORM_TYPES[platform];
    return filters.types.find((t) => allowed.includes(t)) ?? allowed[0] ?? 'reply';
  }, [platform, filters.types]);

  const handleScanPlatform = async () => {
    setScanning(true);
    setScanStatus('');
    setStatusMsg('');
    const scanType = activeScanType;
    try {
      const resp = (await browser.runtime.sendMessage({
        type: 'START_SCAN',
        platform,
        contentTypes: [scanType],
        maxItems: maxScan,
      } satisfies ExtensionMessage)) as MessageResponse;

      if (!resp || !resp.ok) {
        setStatusMsg(resp?.error === 'IG_OPEN_CHAT_FIRST' ? d.scan.igOpenChatHint : (resp?.error ?? 'Scan failed'));
        return;
      }
      const scanned = resp.items ?? [];
      if (scanned.length === 0) {
        setStatusMsg(d.scan.noItemsFound);
        return;
      }
      await putItems(scanned);
      const all = await getAllItems(platform);
      setItems(all);
      setDbCount(all.length);
      const nextFilters: FilterOptions = { ...filters, types: [scanType] };
      setFilters(nextFilters);
      void saveFilters(nextFilters);

      setSelectedIds(selectMatchedUnprotectedIds(all, nextFilters, protect));
      setTab('review');
    } catch (err) {
      setStatusMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setScanning(false);
      setScanStatus('');
    }
  };

  const handleStopScan = async () => {
    await browser.runtime.sendMessage({ type: 'STOP_SCAN' } satisfies ExtensionMessage).catch(() => {});
  };

  const handleArchiveFile = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    setStatusMsg('');
    try {
      const text = await file.text();
      let parsed: ContentItem[] = [];
      if (platform === 'x') {
        parsed = parseXArchiveText(text, archiveHandle || 'i');
      } else if (platform === 'instagram') {
        parsed = parseInstagramArchiveJson(text);
      } else if (platform === 'linkedin') {
        parsed = parseLinkedInCsvArchive(text, file.name);
      } else {
        const hint = file.name.toLowerCase().includes('post') ? 'post' : undefined;
        parsed = parseRedditCsvArchive(text, hint);
      }
      await putItems(parsed);
      const all = await getAllItems(platform);
      setItems(all);
      setDbCount(all.length);
      const nextFilters: FilterOptions = parsed[0]
        ? { ...filters, types: [parsed[0].type] }
        : filters;
      if (parsed[0]) {
        setFilters(nextFilters);
        void saveFilters(nextFilters);
      }
      setSelectedIds(selectMatchedUnprotectedIds(all, nextFilters, protect));
      setStatusMsg(`${d.archive.importedMsg} ${parsed.length}`);
      setTab('review');
    } catch (err) {
      setStatusMsg(`${d.archive.parseError} ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      input.value = '';
    }
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    if (id === 'custom') return;
    const found = BUILTIN_PRESETS.find((p) => p.id === id);
    if (!found) return;
    setFilters(found.filters);
    setProtect((prev) => ({ ...found.protect, protectedIds: prev.protectedIds }));
    void saveFilters(found.filters);
    void saveProtect({ ...found.protect, protectedIds: protect.protectedIds });
  };

  const matchedIdSet = useMemo(
    () => new Set(matchedItems.map((e) => e.item.id)),
    [matchedItems],
  );

  const selectedList = useMemo(
    () =>
      items.filter(
        (it) =>
          selectedIds.has(it.id) &&
          matchedIdSet.has(it.id) &&
          !isProtected(it, protect).protected,
      ),
    [items, selectedIds, matchedIdSet, protect],
  );

  const startDeleteWithCountdown = () => {
    if (selectedList.length === 0) return;
    pendingDeleteItems.current = selectedList;
    setCountdown(10);
    if (countdownTimer.current !== null) window.clearInterval(countdownTimer.current);
    countdownTimer.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownTimer.current !== null) window.clearInterval(countdownTimer.current);
          countdownTimer.current = null;
          void launchDeleteJob(pendingDeleteItems.current, false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelCountdown = () => {
    if (countdownTimer.current !== null) {
      window.clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    setCountdown(null);
  };

  const launchDeleteJob = async (targetItems: ContentItem[], resume: boolean) => {
    const resp = (await browser.runtime.sendMessage({
      type: 'START_DELETE',
      platform,
      items: targetItems,
      resume,
    } satisfies ExtensionMessage)) as MessageResponse;
    if (resp && resp.ok && resp.state) {
      setActiveJob(resp.state.activeJob);
      setCheckpointIds(resp.state.checkpointIds);
      setJobLog(resp.state.lastLog);
    } else if (resp && !resp.ok) {
      setStatusMsg(resp.error);
    }
  };

  const sendJobControl = async (type: 'PAUSE_JOB' | 'RESUME_JOB' | 'STOP_JOB' | 'CLEAR_JOB') => {
    await browser.runtime.sendMessage({ type } satisfies ExtensionMessage);
    if (type === 'CLEAR_JOB') {
      setActiveJob(null);
      setCheckpointIds([]);
      setJobLog([]);
    } else {
      const resp = (await browser.runtime.sendMessage({ type: 'GET_STATE' } satisfies ExtensionMessage)) as MessageResponse;
      if (resp && resp.ok && resp.state) {
        setActiveJob(resp.state.activeJob);
      }
    }
  };

  const toggleProtectItem = (id: string) => {
    const exists = protect.protectedIds.includes(id);
    const nextIds = exists
      ? protect.protectedIds.filter((x) => x !== id)
      : [...protect.protectedIds, id];
    updateProtect({ protectedIds: nextIds });
    if (!exists) {
      setSelectedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  };

  const handleClosePanel = async () => {
    if (scanning) {
      await browser.runtime.sendMessage({ type: 'STOP_SCAN' } satisfies ExtensionMessage).catch(() => {});
    }
    const g = globalThis as unknown as {
      browser?: { sidebarAction?: { close?: () => Promise<void> } };
    };
    try {
      if (g.browser?.sidebarAction?.close) {
        await g.browser.sidebarAction.close();
      }
    } catch {
      // Ignore if not running inside Firefox sidebar
    }
    try {
      window.close();
    } catch {
      // Ignore
    }
    try {
      const cur = await browser.tabs.getCurrent();
      if (cur?.id != null) {
        await browser.tabs.remove(cur.id);
      }
    } catch {
      // Ignore if running in side panel without a tab id
    }
  };

  const isLight = settings.theme === 'light';
  const surface = isLight ? 'bg-zinc-50 text-zinc-900' : 'bg-zinc-950 text-zinc-100';
  const card = isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800';
  const inputCls = isLight
    ? 'bg-white border-zinc-300 text-zinc-900'
    : 'bg-zinc-950 border-zinc-700 text-zinc-100';
  const muted = isLight ? 'text-zinc-600' : 'text-zinc-400';

  const renderDateQuickChips = (showLabel = false) => (
    <div className="flex items-center flex-wrap gap-1.5">
      {showLabel && <span className={`text-[10px] ${muted}`}>{d.filters.dateRangeLabel}:</span>}
      {[
        { label: d.filters.chip30d, days: 30 },
        { label: d.filters.chip6m, days: 183 },
        { label: d.filters.chip1y, days: 365 },
      ].map((chip) => (
        <button
          key={chip.days}
          type="button"
          onClick={() =>
            updateFilters({
              from: undefined,
              olderThanDays: undefined,
              to: daysAgoIsoDate(chip.days),
            })
          }
          className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${inputCls}`}
        >
          {chip.label}
        </button>
      ))}
      {(filters.from || filters.to || filters.olderThanDays) && (
        <button
          type="button"
          onClick={() =>
            updateFilters({
              from: undefined,
              to: undefined,
              olderThanDays: undefined,
            })
          }
          className={`px-2 py-0.5 rounded border text-[11px] cursor-pointer ${inputCls}`}
        >
          {d.filters.clearDates}
        </button>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen text-xs ${surface} flex flex-col`}>
      {/* Header */}
      <header className={`border-b ${isLight ? 'border-zinc-200 bg-white' : 'border-zinc-800 bg-zinc-900/70'} px-3 py-2.5 flex items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-orange-500 text-zinc-950 font-black text-sm">
            ☢
          </span>
          <div>
            <div className="font-bold text-sm leading-tight flex items-center gap-1.5">
              <span>{d.appName}</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {d.localBadge}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateSettings({ locale: lang === 'tr' ? 'en' : 'tr' })}
            className={`px-2 py-1 rounded border text-[11px] font-medium ${inputCls}`}
            aria-label={d.settings.language}
          >
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
          <button
            type="button"
            onClick={() => updateSettings({ theme: isLight ? 'dark' : 'light' })}
            className={`px-2 py-1 rounded border text-[11px] ${inputCls}`}
            aria-label="Toggle theme"
          >
            {isLight ? '🌙' : '☀️'}
          </button>
          <button
            type="button"
            onClick={() => void handleClosePanel()}
            className="px-2 py-1 rounded border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[11px] font-semibold cursor-pointer"
            title={d.closePanelTitle}
            aria-label={d.closePanelTitle}
          >
            ✕ {d.closePanel}
          </button>
        </div>
      </header>

      {/* First-run safety notice */}
      {!settings.acceptedWarning && (
        <div className="m-3 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 space-y-2">
          <div className="font-semibold text-amber-300">{d.warningTitle}</div>
          <p className="leading-relaxed opacity-90">{d.warningBody}</p>
          <button
            type="button"
            onClick={() => updateSettings({ acceptedWarning: true })}
            className="px-3 py-1.5 rounded-md bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400"
          >
            {d.warningAccept}
          </button>
        </div>
      )}

      {/* Platform pill bar */}
      <div className="px-3 pt-2 flex items-center gap-1.5 flex-wrap">
        {(['x', 'instagram', 'reddit', 'linkedin'] as PlatformId[]).map((pid) => {
          const label =
            pid === 'x'
              ? d.platform.xLive
              : pid === 'instagram'
                ? d.platform.igLive
                : pid === 'linkedin'
                  ? d.platform.linkedinLive
                  : d.platform.redditLive;
          return (
            <button
              key={pid}
              type="button"
              disabled={scanning}
              onClick={() => void switchPlatform(pid)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer disabled:opacity-50 ${
                platform === pid
                  ? 'bg-orange-500 text-zinc-950 border-orange-500'
                  : `${card} ${muted} hover:text-zinc-200`
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Navigation tabs */}
      <nav className={`px-3 pt-2 flex gap-1 border-b ${isLight ? 'border-zinc-200' : 'border-zinc-800'} overflow-x-auto`}>
        {(['scan', 'archive', 'review', 'viewer', 'settings'] as TabKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-2.5 py-1.5 text-[11px] font-semibold border-b-2 whitespace-nowrap ${
              tab === key
                ? 'border-orange-500 text-orange-400'
                : `border-transparent ${muted} hover:text-zinc-200`
            }`}
          >
            {d.tabs[key]}
            {key === 'review' && items.length > 0 ? ` (${matchedItems.length})` : ''}
          </button>
        ))}
      </nav>

      {/* Active / Unfinished Job Status Bar */}
      {activeJob && (
        <div className={`mx-3 mt-2 p-2.5 rounded-lg border ${card} space-y-2`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">
              {d.job[activeJob.status === 'idle' ? 'running' : activeJob.status]} · {activeJob.done}/{activeJob.total}
              {activeJob.failed > 0 ? ` (${activeJob.failed} err)` : ''}
            </span>
            <div className="flex gap-1">
              {activeJob.status === 'running' || activeJob.status === 'waiting' ? (
                <button
                  type="button"
                  onClick={() => void sendJobControl('PAUSE_JOB')}
                  className="px-2 py-0.5 rounded bg-zinc-700 text-white"
                >
                  {d.job.pause}
                </button>
              ) : activeJob.status === 'paused' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (checkpointIds.length < activeJob.total && items.length > 0) {
                      void launchDeleteJob(items.filter((i) => !checkpointIds.includes(i.id)), true);
                    } else {
                      void sendJobControl('RESUME_JOB');
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-emerald-600 text-white"
                >
                  {d.job.resume}
                </button>
              ) : null}
              {(activeJob.status === 'running' || activeJob.status === 'paused' || activeJob.status === 'waiting') && (
                <button
                  type="button"
                  onClick={() => void sendJobControl('STOP_JOB')}
                  className="px-2 py-0.5 rounded bg-red-600 text-white"
                >
                  {d.job.stop}
                </button>
              )}
              {(activeJob.status === 'done' || activeJob.status === 'stopped') && (
                <button
                  type="button"
                  onClick={() => void sendJobControl('CLEAR_JOB')}
                  className="px-2 py-0.5 rounded border border-zinc-700"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="w-full h-1.5 rounded bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all"
              style={{
                width: `${activeJob.total > 0 ? Math.round((activeJob.done / activeJob.total) * 100) : 0}%`,
              }}
            />
          </div>
          {activeJob.lastError && <div className="text-[11px] text-amber-400">{activeJob.lastError}</div>}
          {(activeJob.status === 'done' || activeJob.status === 'stopped') && jobLog.length > 0 && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    `nukeall-report-${activeJob.jobId}.html`,
                    toDeletionReportHtml(activeJob, jobLog, itemsById),
                    'text/html',
                  )
                }
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:border-orange-500"
              >
                {d.job.reportHtml}
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadText(
                    `nukeall-report-${activeJob.jobId}.json`,
                    toDeletionReportJson(activeJob, jobLog, itemsById),
                    'application/json',
                  )
                }
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:border-orange-500"
              >
                {d.job.reportJson}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gentle post-cleanup sponsor prompt (dismissible, plain links only) */}
      {showSupportBanner && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg border border-orange-500/40 bg-orange-500/10 flex items-center justify-between gap-2">
          <div>
            <p className="mb-1">{d.job.supportBanner}</p>
            <a
              href="https://nukeall.app/sponsor/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 font-semibold underline"
            >
              {d.job.supportCta} →
            </a>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowSupportBanner(false);
              updateSettings({ supportPromptShown: true });
            }}
            className="text-[11px] opacity-75 hover:opacity-100 shrink-0"
          >
            {d.job.dismiss}
          </button>
        </div>
      )}

      {statusMsg && (
        <div className="mx-3 mt-2 p-2 rounded border border-zinc-700 bg-zinc-900 text-amber-300">
          {statusMsg}
        </div>
      )}

      {/* Main Tab Body */}
      <main className="p-3 flex-1 space-y-3 overflow-y-auto">
        {tab === 'scan' && (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border ${card} space-y-2.5`}>
              <p className={muted}>
                {platform === 'x'
                  ? d.scan.openHintX
                  : platform === 'instagram'
                    ? d.scan.openHintInstagram
                    : platform === 'linkedin'
                      ? d.scan.openHintLinkedIn
                      : d.scan.openHintReddit}
              </p>
              <div>
                <div className="font-semibold mb-1.5">{d.scan.typesLabel}</div>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_TYPES[platform].map((tp) => {
                    const checked = activeScanType === tp;
                    return (
                      <label
                        key={tp}
                        className={`px-2.5 py-1 rounded border cursor-pointer select-none flex items-center gap-1.5 ${
                          checked ? 'border-orange-500 bg-orange-500/15 text-orange-300 font-semibold' : inputCls
                        }`}
                      >
                        <input
                          type="radio"
                          name="scan-content-type"
                          checked={checked}
                          onChange={() => updateFilters({ types: [tp] })}
                          className="accent-orange-500"
                        />
                        {d.scan.types[tp as keyof typeof d.scan.types]}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <label className="space-y-0.5">
                    <div className="font-medium">{d.scan.maxItems}</div>
                    <div className={`text-[11px] ${muted}`}>{d.scan.maxItemsHelp}</div>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50000}
                    value={maxScan}
                    onInput={(e) => {
                      const val = Number((e.target as HTMLInputElement).value);
                      setMaxScan(Number.isFinite(val) && val >= 0 ? val : 0);
                    }}
                    className={`w-24 px-2 py-1 rounded border ${inputCls}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  {scanning ? (
                    <>
                      <span className="text-orange-300 font-medium truncate">
                        {scanStatus.startsWith('http')
                          ? d.scan.navigating.replace('{url}', scanStatus.replace('https://', ''))
                          : scanStatus.startsWith('#')
                            ? d.scan.scanningCount.replace('{n}', scanStatus.slice(1))
                            : d.scan.scanning}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleStopScan()}
                        className="ml-auto px-3 py-1.5 rounded-md bg-red-600 text-white font-bold hover:bg-red-500 shrink-0"
                      >
                        {d.scan.stopScanBtn}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleScanPlatform()}
                      className="w-full px-3 py-2 rounded-md bg-orange-500 text-zinc-950 font-bold hover:bg-orange-400 disabled:opacity-50"
                    >
                      {platform === 'x'
                        ? d.scan.scanBtnX
                        : platform === 'instagram'
                          ? d.scan.scanBtnInstagram
                          : platform === 'linkedin'
                            ? d.scan.scanBtnLinkedIn
                            : d.scan.scanBtnReddit}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Presets & Filters */}
            <div className={`p-3 rounded-lg border ${card} space-y-2.5`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-2">
                  <span className="font-semibold">{d.filters.presetLabel}</span>
                  <select
                    value={presetId}
                    onChange={(e) => applyPreset((e.target as HTMLSelectElement).value)}
                    className={`px-2 py-1 rounded border ${inputCls}`}
                  >
                    <option value="custom">{d.filters.customPreset}</option>
                    {BUILTIN_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === 'tr' ? p.nameTr : p.nameEn}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      downloadText(
                        'nukeall-preset.json',
                        exportPresetJson(presetId, filters, protect),
                        'application/json',
                      )
                    }
                    className={`px-2 py-1 rounded border ${inputCls}`}
                  >
                    {d.filters.exportPreset}
                  </button>
                  <label className={`px-2 py-1 rounded border cursor-pointer ${inputCls}`}>
                    {d.filters.importPreset}
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={async (e) => {
                        const f = (e.target as HTMLInputElement).files?.[0];
                        if (!f) return;
                        try {
                          const imported = importPresetJson(await f.text());
                          setFilters(imported.filters);
                          setProtect((prev) => ({
                            ...imported.protect,
                            protectedIds: prev.protectedIds,
                          }));
                          setStatusMsg(`Preset "${imported.name}" loaded.`);
                        } catch (err) {
                          setStatusMsg(err instanceof Error ? err.message : String(err));
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className={muted}>{d.filters.olderThanDays}</span>
                  <input
                    type="number"
                    min={0}
                    value={filters.olderThanDays ?? ''}
                    placeholder="0"
                    onInput={(e) => {
                      const v = Number((e.target as HTMLInputElement).value);
                      updateFilters({ olderThanDays: v > 0 ? v : undefined });
                    }}
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={muted}>{d.filters.minLikes}</span>
                  <input
                    type="number"
                    min={0}
                    value={protect.minLikes ?? 0}
                    onInput={(e) =>
                      updateProtect({ minLikes: Number((e.target as HTMLInputElement).value) || 0 })
                    }
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={muted}>{d.filters.fromDate}</span>
                  <input
                    type="date"
                    value={filters.from ?? ''}
                    onInput={(e) =>
                      updateFilters({ from: (e.target as HTMLInputElement).value || undefined })
                    }
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={muted}>{d.filters.toDate}</span>
                  <input
                    type="date"
                    value={filters.to ?? ''}
                    onInput={(e) =>
                      updateFilters({ to: (e.target as HTMLInputElement).value || undefined })
                    }
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
              </div>

              {renderDateQuickChips(false)}

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className={muted}>{d.filters.includeKw}</span>
                  <input
                    type="text"
                    value={filters.includeKeywords.join(', ')}
                    onInput={(e) =>
                      updateFilters({
                        includeKeywords: (e.target as HTMLInputElement).value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
                <label className="space-y-1">
                  <span className={muted}>{d.filters.excludeKw}</span>
                  <input
                    type="text"
                    value={filters.excludeKeywords.join(', ')}
                    onInput={(e) =>
                      updateFilters({
                        excludeKeywords: (e.target as HTMLInputElement).value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className={`w-full px-2 py-1 rounded border ${inputCls}`}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(filters.onlyRisky)}
                    onChange={(e) =>
                      updateFilters({ onlyRisky: (e.target as HTMLInputElement).checked })
                    }
                    className="accent-orange-500"
                  />
                  <span>{d.filters.onlyRisky}</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={protect.keepPinned}
                    onChange={(e) =>
                      updateProtect({ keepPinned: (e.target as HTMLInputElement).checked })
                    }
                    className="accent-orange-500"
                  />
                  <span>{d.filters.keepPinned}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {tab === 'archive' && (
          <div className={`p-3 rounded-lg border ${card} space-y-3`}>
            <div className="font-semibold text-sm">
              {platform === 'x'
                ? d.archive.titleX
                : platform === 'instagram'
                  ? d.archive.titleInstagram
                  : platform === 'linkedin'
                    ? d.archive.titleLinkedIn
                    : d.archive.titleReddit}
            </div>
            <p className={muted}>
              {platform === 'x'
                ? d.archive.descX
                : platform === 'instagram'
                  ? d.archive.descInstagram
                  : platform === 'linkedin'
                    ? d.archive.descLinkedIn
                    : d.archive.descReddit}
            </p>
            {platform === 'x' && (
              <label className="block space-y-1">
                <span className={muted}>{d.archive.handleLabel}</span>
                <input
                  type="text"
                  placeholder="@username"
                  value={archiveHandle}
                  onInput={(e) => setArchiveHandle((e.target as HTMLInputElement).value)}
                  className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
                />
              </label>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-orange-500 text-zinc-950 font-bold cursor-pointer hover:bg-orange-400">
              <span>
                {platform === 'x'
                  ? d.archive.pickFileX
                  : platform === 'instagram'
                    ? d.archive.pickFileInstagram
                    : platform === 'linkedin'
                      ? d.archive.pickFileLinkedIn
                      : d.archive.pickFileReddit}
              </span>
              <input
                type="file"
                accept={
                  platform === 'x'
                    ? '.js,.json,application/javascript,application/json'
                    : platform === 'instagram'
                      ? '.json,application/json'
                      : '.csv,text/csv'
                }
                onChange={(e) => void handleArchiveFile(e)}
                className="hidden"
              />
            </label>
          </div>
        )}

        {tab === 'review' && (
          <div className="space-y-2.5">
            {/* Search & counts */}
            <div className={`p-2.5 rounded-lg border ${card} space-y-2`}>
              <input
                type="search"
                value={searchQuery}
                onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                placeholder={d.review.searchPlaceholder}
                className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
              />
              {/* Review Date Picker & quick age chips */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <label className="space-y-0.5">
                  <span className={`text-[10px] ${muted}`}>{d.filters.fromDate}</span>
                  <input
                    type="date"
                    value={filters.from ?? ''}
                    onInput={(e) =>
                      updateFilters({ from: (e.target as HTMLInputElement).value || undefined })
                    }
                    className={`w-full px-2 py-1 rounded border text-[11px] ${inputCls}`}
                  />
                </label>
                <label className="space-y-0.5">
                  <span className={`text-[10px] ${muted}`}>{d.filters.toDate}</span>
                  <input
                    type="date"
                    value={filters.to ?? ''}
                    onInput={(e) =>
                      updateFilters({ to: (e.target as HTMLInputElement).value || undefined })
                    }
                    className={`w-full px-2 py-1 rounded border text-[11px] ${inputCls}`}
                  />
                </label>
              </div>
              {renderDateQuickChips(true)}
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className={muted}>
                  {d.review.matchedCount}: <strong className="text-zinc-100">{matchedItems.length}</strong> ·{' '}
                  {d.review.protectedCount}: <strong>{protectedCount}</strong> ·{' '}
                  {d.review.selectedCount}: <strong className="text-orange-400">{selectedList.length}</strong>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set(matchedItems.map((m) => m.item.id)))}
                    className={`px-2 py-0.5 rounded border ${inputCls}`}
                  >
                    {d.review.selectAllFiltered}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(new Set())}
                    className={`px-2 py-0.5 rounded border ${inputCls}`}
                  >
                    {d.review.clearSelection}
                  </button>
                </div>
              </div>

              {/* Backup & Delete Bar */}
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-zinc-800">
                <div className="flex items-center gap-1">
                  <span className={muted}>{d.review.backupFirst}</span>
                  <button
                    type="button"
                    disabled={selectedList.length === 0}
                    onClick={() =>
                      downloadText('nukeall-backup.json', toJsonBackup(selectedList), 'application/json')
                    }
                    className={`px-2 py-0.5 rounded border ${inputCls} disabled:opacity-40`}
                  >
                    {d.review.exportJson}
                  </button>
                  <button
                    type="button"
                    disabled={selectedList.length === 0}
                    onClick={() =>
                      downloadText('nukeall-backup.csv', toCsvBackup(selectedList), 'text/csv')
                    }
                    className={`px-2 py-0.5 rounded border ${inputCls} disabled:opacity-40`}
                  >
                    {d.review.exportCsv}
                  </button>
                  <button
                    type="button"
                    disabled={selectedList.length === 0}
                    onClick={() =>
                      downloadText(
                        'nukeall-archive.html',
                        toOfflineHtmlArchive(selectedList, {
                          handle: archiveHandle || undefined,
                          exportedAt: new Date().toISOString(),
                        }),
                        'text/html',
                      )
                    }
                    className={`px-2 py-0.5 rounded border ${inputCls} disabled:opacity-40`}
                  >
                    {d.review.exportHtml}
                  </button>
                </div>

                {countdown !== null ? (
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-semibold">
                      {d.review.countdownMsg.replace('{s}', String(countdown))}
                    </span>
                    <button
                      type="button"
                      onClick={cancelCountdown}
                      className="px-2.5 py-1 rounded bg-zinc-700 text-white font-semibold"
                    >
                      {d.review.cancelCountdown}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={selectedList.length === 0 || activeJob?.status === 'running'}
                    onClick={startDeleteWithCountdown}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-40"
                  >
                    {d.review.deleteBtn.replace('{n}', String(selectedList.length))}
                  </button>
                )}
              </div>
            </div>

            {/* Item list */}
            {matchedItems.length === 0 ? (
              <div className={`p-4 rounded-lg border ${card} text-center ${muted}`}>
                {d.review.empty}
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchedItems.slice(0, 200).map(({ item, risks }) => {
                  const checked = selectedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-lg border ${card} flex items-start gap-2`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedIds((prev) => {
                            const next = new Set(prev);
                            if (checked) next.delete(item.id);
                            else next.add(item.id);
                            return next;
                          });
                        }}
                        className="mt-0.5 accent-orange-500"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase font-semibold">
                            {item.type}
                          </span>
                          <span className={muted}>{item.createdAt.slice(0, 10)}</span>
                          {risks.map((r, idx) => (
                            <span
                              key={`${r.kind}-${idx}`}
                              className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-medium"
                              title={r.match}
                            >
                              ⚠ {d.risk[r.kind]}
                            </span>
                          ))}
                        </div>
                        <p className="whitespace-pre-wrap break-words leading-snug">
                          {item.text || '(no text)'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleProtectItem(item.id)}
                        className={`px-1.5 py-0.5 rounded border text-[10px] shrink-0 ${inputCls}`}
                        title={d.review.protectToggle}
                      >
                        📌 {d.review.protectToggle}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'viewer' && (
          <div className={`p-3 rounded-lg border ${card} space-y-3`}>
            <div className="font-semibold text-sm">{d.viewer.title}</div>
            <div className={muted}>
              {d.viewer.itemsInDb} <strong className="text-orange-400">{dbCount}</strong>
            </div>
            {dbCount === 0 ? (
              <p className={muted}>{d.viewer.empty}</p>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() =>
                    downloadText(
                      `nukeall-offline-archive-${new Date().toISOString().slice(0, 10)}.html`,
                      toOfflineHtmlArchive(items, {
                        handle: archiveHandle || undefined,
                        exportedAt: new Date().toISOString(),
                      }),
                      'text/html',
                    )
                  }
                  className="px-3 py-1.5 rounded-md bg-orange-500 text-zinc-950 font-bold hover:bg-orange-400"
                >
                  {d.viewer.exportOfflineHtml}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await clearItems(platform);
                    setItems([]);
                    setDbCount(0);
                    setSelectedIds(new Set());
                  }}
                  className={`px-3 py-1.5 rounded-md border ${inputCls}`}
                >
                  {d.viewer.clearDb}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className={`p-3 rounded-lg border ${card} space-y-3`}>
            <label className="block space-y-1">
              <span className="font-semibold">{d.settings.speed}</span>
              <select
                value={settings.speed}
                onChange={(e) =>
                  updateSettings({ speed: (e.target as HTMLSelectElement).value as Settings['speed'] })
                }
                className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
              >
                <option value="safe">{d.settings.speedSafe}</option>
                <option value="normal">{d.settings.speedNormal}</option>
                <option value="fast">{d.settings.speedFast}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="font-semibold">{d.settings.dailyLimit}</span>
              <div className={`text-[11px] ${muted}`}>{d.settings.dailyLimitHelp}</div>
              <input
                type="number"
                min={0}
                value={settings.dailyLimit}
                onInput={(e) => {
                  const val = Number((e.target as HTMLInputElement).value);
                  updateSettings({ dailyLimit: Number.isFinite(val) && val >= 0 ? val : 0 });
                }}
                className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
              />
              <div className={`text-[11px] ${muted}`}>
                {d.settings.deletedToday.replace('{n}', String(deletedToday))}
              </div>
            </label>

            <div className="pt-2 border-t border-zinc-800 space-y-2.5">
              <div className="font-semibold text-orange-400">{d.settings.redditSection}</div>
              <label className="block space-y-1">
                <span className="font-medium">{d.settings.redditPasses}</span>
                <div className={`text-[11px] ${muted}`}>{d.settings.redditPassesHelp}</div>
                <input
                  type="number"
                  min={0}
                  max={3}
                  value={settings.redditOverwritePasses}
                  onInput={(e) => {
                    const val = Math.min(3, Math.max(0, Number((e.target as HTMLInputElement).value) || 0));
                    updateSettings({ redditOverwritePasses: val });
                  }}
                  className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium">{d.settings.redditCustomText}</span>
                <input
                  type="text"
                  value={settings.redditOverwriteText}
                  placeholder={d.settings.redditCustomTextPlaceholder}
                  onInput={(e) =>
                    updateSettings({ redditOverwriteText: (e.target as HTMLInputElement).value })
                  }
                  className={`w-full px-2.5 py-1.5 rounded border ${inputCls}`}
                />
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.redditEditOnly}
                  onChange={(e) =>
                    updateSettings({ redditEditOnly: (e.target as HTMLInputElement).checked })
                  }
                  className="accent-orange-500"
                />
                <span>{d.settings.redditEditOnly}</span>
              </label>
            </div>

            <p className={`text-[11px] pt-2 border-t border-zinc-800 ${muted}`}>
              {d.settings.privacyNote}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
