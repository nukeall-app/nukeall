import { isSafeRegexPattern } from './filters';
import {
  DEFAULT_FILTERS,
  DEFAULT_PROTECT,
  type ContentType,
  type FilterOptions,
  type ProtectRules,
} from './types';

const VALID_CONTENT_TYPES = new Set<ContentType>([
  'post',
  'reply',
  'repost',
  'quote',
  'like',
  'bookmark',
  'comment',
  'message',
  'story_reply',
  'tag',
]);

export interface Preset {
  id: string;
  nameEn: string;
  nameTr: string;
  descEn: string;
  descTr: string;
  filters: FilterOptions;
  protect: ProtectRules;
}

export const BUILTIN_PRESETS: Preset[] = [
  {
    id: 'job_hunt',
    nameEn: 'Before a Job Search',
    nameTr: 'İş Başvurusu Öncesi',
    descEn: 'Targets posts containing profanity while keeping pinned and popular posts.',
    descTr: 'Küfür içeren gönderileri hedefler; sabitlenen ve popüler gönderileri korur.',
    filters: {
      ...DEFAULT_FILTERS,
      types: ['post', 'reply', 'quote', 'comment'],
      onlyRisky: true,
    },
    protect: {
      ...DEFAULT_PROTECT,
      keepPinned: true,
      minLikes: 20,
    },
  },
  {
    id: 'older_1y',
    nameEn: 'Older than 1 Year',
    nameTr: '1 Yıldan Eskiler',
    descEn: 'Deletes posts, replies and reposts older than 365 days; keeps pinned posts.',
    descTr: '365 günden eski gönderi, yanıt ve repostları siler; sabitlenenleri korur.',
    filters: {
      ...DEFAULT_FILTERS,
      types: ['post', 'reply', 'repost', 'quote'],
      olderThanDays: 365,
    },
    protect: {
      ...DEFAULT_PROTECT,
      keepPinned: true,
    },
  },
  {
    id: 'only_likes',
    nameEn: 'Unlike Everything',
    nameTr: 'Sadece Beğeniler',
    descEn: 'Removes all your likes without touching your own posts.',
    descTr: 'Kendi gönderilerine dokunmadan tüm beğenilerini kaldırır.',
    filters: {
      ...DEFAULT_FILTERS,
      types: ['like'],
    },
    protect: {
      ...DEFAULT_PROTECT,
      keepPinned: false,
    },
  },
  {
    id: 'full_nuke',
    nameEn: 'Full Reset',
    nameTr: 'Tam Sıfırlama',
    descEn: 'Targets posts, replies, reposts, quotes, likes and bookmarks (except manual keeps).',
    descTr: 'Elle korunanlar dışında gönderi, yanıt, repost, alıntı, beğeni ve yer imlerini hedefler.',
    filters: {
      ...DEFAULT_FILTERS,
      types: ['post', 'reply', 'repost', 'quote', 'like', 'bookmark'],
    },
    protect: {
      ...DEFAULT_PROTECT,
      keepPinned: false,
      minLikes: 0,
      minReposts: 0,
    },
  },
];

export interface ExportedPreset {
  schema: 'nukeall-preset-v1';
  name: string;
  filters: FilterOptions;
  protect: ProtectRules;
}

export function exportPresetJson(name: string, filters: FilterOptions, protect: ProtectRules): string {
  const payload: ExportedPreset = {
    schema: 'nukeall-preset-v1',
    name: name.trim() || 'Custom Preset',
    filters,
    protect: { ...protect, protectedIds: [] },
  };
  return JSON.stringify(payload, null, 2);
}

export function importPresetJson(raw: string): ExportedPreset {
  const parsed = JSON.parse(raw) as Partial<ExportedPreset>;
  if (!parsed || typeof parsed !== 'object' || parsed.schema !== 'nukeall-preset-v1') {
    throw new Error('Invalid NukeAll preset format');
  }
  if (!parsed.filters || !Array.isArray(parsed.filters.types) || !parsed.protect) {
    throw new Error('Missing filters or protection rules');
  }

  const rawFilters = parsed.filters as unknown as Record<string, unknown>;
  const rawProtect = parsed.protect as unknown as Record<string, unknown>;

  const rawRegex = typeof rawFilters.regex === 'string' ? rawFilters.regex.trim() : '';
  if (rawRegex && !isSafeRegexPattern(rawRegex)) {
    throw new Error('Unsafe or overly long regex pattern in preset');
  }

  const types = (rawFilters.types as unknown[]).filter(
    (t): t is ContentType => typeof t === 'string' && VALID_CONTENT_TYPES.has(t as ContentType),
  );

  const stringArray = (val: unknown): string[] =>
    Array.isArray(val) ? val.filter((v): v is string => typeof v === 'string') : [];

  const nonNegInt = (val: unknown, fallback = 0): number =>
    typeof val === 'number' && Number.isFinite(val) && val >= 0 ? Math.floor(val) : fallback;

  const media =
    rawFilters.media === 'with' || rawFilters.media === 'without' || rawFilters.media === 'any'
      ? rawFilters.media
      : DEFAULT_FILTERS.media;

  return {
    schema: 'nukeall-preset-v1',
    name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim().slice(0, 80) : 'Imported Preset',
    filters: {
      types,
      from: typeof rawFilters.from === 'string' && rawFilters.from ? rawFilters.from : undefined,
      to: typeof rawFilters.to === 'string' && rawFilters.to ? rawFilters.to : undefined,
      olderThanDays:
        typeof rawFilters.olderThanDays === 'number' &&
        Number.isFinite(rawFilters.olderThanDays) &&
        rawFilters.olderThanDays > 0
          ? Math.floor(rawFilters.olderThanDays)
          : undefined,
      includeKeywords: stringArray(rawFilters.includeKeywords),
      excludeKeywords: stringArray(rawFilters.excludeKeywords),
      regex: rawRegex || undefined,
      media,
      onlyRisky: Boolean(rawFilters.onlyRisky),
    },
    protect: {
      keepPinned: typeof rawProtect.keepPinned === 'boolean' ? rawProtect.keepPinned : DEFAULT_PROTECT.keepPinned,
      minLikes: nonNegInt(rawProtect.minLikes, DEFAULT_PROTECT.minLikes),
      minReposts: nonNegInt(rawProtect.minReposts, DEFAULT_PROTECT.minReposts),
      keepTag: typeof rawProtect.keepTag === 'string' ? rawProtect.keepTag.slice(0, 80) : DEFAULT_PROTECT.keepTag,
      protectedIds: stringArray(rawProtect.protectedIds),
    },
  };
}
