import type { ContentItem, ProtectRules } from './types';

export type ProtectReason = 'pinned' | 'minLikes' | 'minReposts' | 'keepTag' | 'manual';

export function isProtected(
  item: ContentItem,
  rules: ProtectRules,
): { protected: boolean; reason?: ProtectReason } {
  if (rules.keepPinned && item.pinned) {
    return { protected: true, reason: 'pinned' };
  }
  if (rules.minLikes && rules.minLikes > 0 && (item.metrics?.likes ?? 0) >= rules.minLikes) {
    return { protected: true, reason: 'minLikes' };
  }
  if (rules.minReposts && rules.minReposts > 0 && (item.metrics?.reposts ?? 0) >= rules.minReposts) {
    return { protected: true, reason: 'minReposts' };
  }
  if (rules.keepTag && rules.keepTag.trim()) {
    const tag = rules.keepTag.trim().toLocaleLowerCase();
    if ((item.text || '').toLocaleLowerCase().includes(tag)) {
      return { protected: true, reason: 'keepTag' };
    }
  }
  if (rules.protectedIds.includes(item.id)) {
    return { protected: true, reason: 'manual' };
  }
  return { protected: false };
}
