import type { ContentItem, DeleteResult, JobState, JobStatus, PlatformId, ProgressEntry, SpeedMode } from './types';

export const SPEED_DELAYS: Record<SpeedMode, [number, number]> = {
  safe: [3000, 6000],
  normal: [1500, 3000],
  fast: [700, 1500],
};

export const MAX_BACKOFF_MS = 15 * 60 * 1000; // 15 minutes

export interface RunnerOptions {
  jobId: string;
  platform: PlatformId;
  items: ContentItem[];
  speed: SpeedMode;
  dailyLimit: number;
  initialDoneIds?: string[];
  deleteFn: (item: ContentItem) => Promise<DeleteResult>;
  onCheckpoint?: (state: JobState, doneIds: string[], entry?: ProgressEntry) => Promise<void> | void;
  onStatusChange?: (state: JobState) => void;
  sleepFn?: (ms: number) => Promise<void>;
  randomFn?: () => number;
  nowFn?: () => number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class Runner {
  private readonly opts: RunnerOptions;
  private readonly sleepFn: (ms: number) => Promise<void>;
  private readonly randomFn: () => number;
  private readonly nowFn: () => number;

  private doneIds: Set<string>;
  private status: JobStatus = 'idle';
  private paused = false;
  private stopped = false;
  private pauseWaiters: Array<() => void> = [];
  private failedCount = 0;
  private startedAt = '';

  constructor(opts: RunnerOptions) {
    this.opts = opts;
    this.sleepFn = opts.sleepFn ?? defaultSleep;
    this.randomFn = opts.randomFn ?? Math.random;
    this.nowFn = opts.nowFn ?? Date.now;
    this.doneIds = new Set(opts.initialDoneIds ?? []);
  }

  getState(extra?: Partial<JobState>): JobState {
    return {
      jobId: this.opts.jobId,
      platform: this.opts.platform,
      status: this.status,
      total: this.opts.items.length,
      done: this.doneIds.size,
      failed: this.failedCount,
      startedAt: this.startedAt || new Date(this.nowFn()).toISOString(),
      ...extra,
    };
  }

  pause(): void {
    if (this.status === 'running' || this.status === 'waiting') {
      this.paused = true;
      this.setStatus('paused');
    }
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    this.setStatus('running');
    while (this.pauseWaiters.length > 0) {
      const fn = this.pauseWaiters.shift();
      fn?.();
    }
  }

  stop(): void {
    this.stopped = true;
    this.paused = false;
    this.setStatus('stopped');
    while (this.pauseWaiters.length > 0) {
      const fn = this.pauseWaiters.shift();
      fn?.();
    }
  }

  private setStatus(status: JobStatus, extra?: Partial<JobState>): void {
    this.status = status;
    this.opts.onStatusChange?.(this.getState(extra));
  }

  private async waitIfPaused(): Promise<void> {
    if (!this.paused || this.stopped) return;
    await new Promise<void>((resolve) => {
      this.pauseWaiters.push(resolve);
    });
  }

  private nextDelayMs(): number {
    const [min, max] = SPEED_DELAYS[this.opts.speed];
    return Math.round(min + this.randomFn() * (max - min));
  }

  async start(): Promise<JobState> {
    this.startedAt = new Date(this.nowFn()).toISOString();
    this.setStatus('running');

    let deletedInRun = 0;
    const queue = this.opts.items.filter((item) => !this.doneIds.has(item.id));
    let backoffStep = 0;

    for (let i = 0; i < queue.length; i++) {
      await this.waitIfPaused();
      if (this.stopped) {
        const stoppedState = this.getState({ finishedAt: new Date(this.nowFn()).toISOString() });
        await this.opts.onCheckpoint?.(stoppedState, [...this.doneIds]);
        return stoppedState;
      }

      if (this.opts.dailyLimit > 0 && deletedInRun >= this.opts.dailyLimit) {
        const limitState = this.getState({
          status: 'paused',
          lastError: `Daily safety limit (${this.opts.dailyLimit}) reached`,
        });
        this.status = 'paused';
        await this.opts.onCheckpoint?.(limitState, [...this.doneIds]);
        this.opts.onStatusChange?.(limitState);
        return limitState;
      }

      const item = queue[i];
      if (!item) continue;
      let result: DeleteResult;
      try {
        result = await this.opts.deleteFn(item);
      } catch (err) {
        result = {
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }

      if (result.ok || result.gone) {
        backoffStep = 0;
        deletedInRun++;
        this.doneIds.add(item.id);
        const entry: ProgressEntry = {
          id: item.id,
          ok: true,
          at: new Date(this.nowFn()).toISOString(),
        };
        const state = this.getState();
        await this.opts.onCheckpoint?.(state, [...this.doneIds], entry);
        this.opts.onStatusChange?.(state);
      } else if (result.retryAfterMs && result.retryAfterMs > 0) {
        // Exponential backoff capped at MAX_BACKOFF_MS
        const expDelay = Math.min(MAX_BACKOFF_MS, result.retryAfterMs * Math.pow(2, backoffStep));
        backoffStep++;
        const resumeAt = new Date(this.nowFn() + expDelay).toISOString();
        this.setStatus('waiting', { resumeAt, lastError: result.error ?? 'Rate limited' });
        await this.sleepFn(expDelay);
        await this.waitIfPaused();
        if (!this.stopped) {
          this.setStatus('running');
          i--; // Retry same item
          continue;
        }
      } else {
        this.failedCount++;
        const entry: ProgressEntry = {
          id: item.id,
          ok: false,
          at: new Date(this.nowFn()).toISOString(),
          error: result.error ?? 'Delete failed',
        };
        const state = this.getState({ lastError: entry.error });
        await this.opts.onCheckpoint?.(state, [...this.doneIds], entry);
        this.opts.onStatusChange?.(state);
      }

      if (i < queue.length - 1 && !this.stopped) {
        await this.sleepFn(this.nextDelayMs());
      }
    }

    const finished = this.getState({
      status: this.stopped ? 'stopped' : 'done',
      finishedAt: new Date(this.nowFn()).toISOString(),
    });
    this.status = finished.status;
    await this.opts.onCheckpoint?.(finished, [...this.doneIds]);
    this.opts.onStatusChange?.(finished);
    return finished;
  }
}
