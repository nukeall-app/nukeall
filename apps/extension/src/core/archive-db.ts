import type { ContentItem, JobState, PlatformId } from './types';

const DB_NAME = 'nukeall_db';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_JOBS = 'jobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        const items = db.createObjectStore(STORE_ITEMS, { keyPath: 'storageKey' });
        items.createIndex('platform', 'platform', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_JOBS)) {
        db.createObjectStore(STORE_JOBS, { keyPath: 'jobId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

type StoredItem = ContentItem & { storageKey: string };

export async function putItems(items: ContentItem[]): Promise<void> {
  if (items.length === 0) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ITEMS, 'readwrite');
    const store = tx.objectStore(STORE_ITEMS);
    for (const item of items) {
      store.put({ ...item, storageKey: `${item.platform}:${item.id}` } satisfies StoredItem);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getAllItems(platform?: PlatformId): Promise<ContentItem[]> {
  const db = await openDb();
  return new Promise<ContentItem[]>((resolve, reject) => {
    const tx = db.transaction(STORE_ITEMS, 'readonly');
    const store = tx.objectStore(STORE_ITEMS);
    const req = platform ? store.index('platform').getAll(platform) : store.getAll();
    req.onsuccess = () => {
      db.close();
      const rows = (req.result as StoredItem[]).map(({ storageKey: _k, ...item }) => item);
      resolve(rows);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function removeItems(platform: PlatformId, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_ITEMS, 'readwrite');
    const store = tx.objectStore(STORE_ITEMS);
    for (const id of ids) {
      store.delete(`${platform}:${id}`);
    }
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function clearItems(platform?: PlatformId): Promise<void> {
  if (!platform) {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_ITEMS, 'readwrite');
      tx.objectStore(STORE_ITEMS).clear();
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
    return;
  }
  const existing = await getAllItems(platform);
  await removeItems(
    platform,
    existing.map((it) => it.id),
  );
}

export async function saveJobRecord(job: JobState): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_JOBS, 'readwrite');
    tx.objectStore(STORE_JOBS).put(job);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
