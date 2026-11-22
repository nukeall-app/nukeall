export interface SponsorEntry {
  name: string;
  url?: string;
  tier: 'Supporter' | 'Champion' | 'Guardian';
  logo?: string;
}

// Local static sponsor list — updated via PRs, no third-party embeds or API calls.
export const SPONSORS: SponsorEntry[] = [];
