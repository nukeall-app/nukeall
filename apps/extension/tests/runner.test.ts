import { describe, expect, it } from 'vitest';
import { Runner } from '../src/core/runner';
import type { ContentItem } from '../src/core/types';

function makeItems(count: number): ContentItem[] {
  return Array.from({ length: count }, (_, idx) => ({
    id: `id_${idx + 1}`,
    platform: 'x',
    type: 'post',
    text: `Post #${idx + 1}`,
    createdAt: '2025-01-01T00:00:00.000Z',
    url: `https://x.com/u/status/${idx + 1}`,
  }));
}

describe('Runner', () => {
  it('deletes items using speed delays and records checkpoints', async () => {
    const sleeps: number[] = [];
    const deleted: string[] = [];
    const checkpoints: number[] = [];

    const runner = new Runner({
      jobId: 'j1',
      platform: 'x',
      items: makeItems(3),
      speed: 'safe',
      dailyLimit: 0,
      randomFn: () => 0.5, // safe: [3000, 6000] -> 4500ms
      sleepFn: async (ms) => {
        sleeps.push(ms);
      },
      deleteFn: async (item) => {
        deleted.push(item.id);
        return { ok: true };
      },
      onCheckpoint: (_state, doneIds) => {
        checkpoints.push(doneIds.length);
      },
    });

    const state = await runner.start();
    expect(state.status).toBe('done');
    expect(state.done).toBe(3);
    expect(deleted).toEqual(['id_1', 'id_2', 'id_3']);
    expect(sleeps).toEqual([4500, 4500]);
    expect(checkpoints).toEqual([1, 2, 3, 3]);
  });

  it('skips already-completed checkpoint IDs when resuming', async () => {
    const deleted: string[] = [];
    const runner = new Runner({
      jobId: 'j2',
      platform: 'x',
      items: makeItems(4),
      speed: 'fast',
      dailyLimit: 0,
      initialDoneIds: ['id_1', 'id_2'],
      sleepFn: async () => {},
      deleteFn: async (item) => {
        deleted.push(item.id);
        return { ok: true };
      },
    });

    const state = await runner.start();
    expect(state.done).toBe(4);
    expect(deleted).toEqual(['id_3', 'id_4']);
  });

  it('handles 429 retryAfterMs with exponential backoff and retries the item', async () => {
    let attempts = 0;
    const sleeps: number[] = [];
    const statuses: string[] = [];

    const runner = new Runner({
      jobId: 'j3',
      platform: 'x',
      items: makeItems(1),
      speed: 'fast',
      dailyLimit: 0,
      sleepFn: async (ms) => {
        sleeps.push(ms);
      },
      onStatusChange: (s) => statuses.push(s.status),
      deleteFn: async () => {
        attempts++;
        if (attempts === 1) return { ok: false, retryAfterMs: 1000, error: '429' };
        if (attempts === 2) return { ok: false, retryAfterMs: 1000, error: '429' };
        return { ok: true };
      },
    });

    const state = await runner.start();
    expect(state.status).toBe('done');
    expect(attempts).toBe(3);
    expect(sleeps).toEqual([1000, 2000]);
    expect(statuses).toContain('waiting');
  });

  it('stops cleanly when stop() is called during pause', async () => {
    const deleted: string[] = [];
    let runner!: Runner;

    runner = new Runner({
      jobId: 'j4',
      platform: 'x',
      items: makeItems(5),
      speed: 'fast',
      dailyLimit: 0,
      sleepFn: async () => {},
      deleteFn: async (item) => {
        deleted.push(item.id);
        if (deleted.length === 2) {
          runner.pause();
          setTimeout(() => runner.stop(), 5);
        }
        return { ok: true };
      },
    });

    const state = await runner.start();
    expect(state.status).toBe('stopped');
    expect(deleted).toEqual(['id_1', 'id_2']);
  });

  it('enforces daily safety limit', async () => {
    const deleted: string[] = [];
    const runner = new Runner({
      jobId: 'j5',
      platform: 'x',
      items: makeItems(5),
      speed: 'fast',
      dailyLimit: 2,
      sleepFn: async () => {},
      deleteFn: async (item) => {
        deleted.push(item.id);
        return { ok: true };
      },
    });

    const state = await runner.start();
    expect(state.status).toBe('paused');
    expect(state.done).toBe(2);
    expect(deleted).toEqual(['id_1', 'id_2']);
  });
});
