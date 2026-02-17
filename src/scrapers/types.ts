/**
 * Mikan scraper type definitions
 */

export interface MikanAnimeInfo {
  title: string;
  url: string;
  cover: string;
  bangumiId: string;
}

/**
 * Torrent info from Mikan
 */
export interface MikanTorrentInfo {
  name: string;       // Torrent name
  magnet: string;     // Magnet link
  sizeStr: string;    // File size string (e.g., "1.2GB")
  dateStr: string;    // Publish date string
  torrent: string;    // Torrent download URL
}

/**
 * Regex match item for tag extraction
 */
export interface MikanRegexItem {
  label: string;  // Matched text (e.g., "1080P", "HEVC")
  regex: string;  // Regex pattern used
}

export interface MikanSubgroup {
  subgroupId: string;
  label: string;      // Subgroup name
  rss: string;        // RSS link
  updateDay?: string;
  items?: MikanTorrentInfo[];     // Torrent list
  regexList?: MikanRegexItem[][]; // Regex matches per torrent
  tags?: string[];                // Unique tags extracted from torrent names
}

export interface MikanBangumiDetail {
  title: string;
  url: string;
  cover: string;
  bgmUrl?: string; // BGM link
  bangumiId: string;
  subgroups: MikanSubgroup[];
}

/**
 * Basic subgroup info without torrent details
 */
export interface MikanSubgroupBasic {
  subgroupId: string;
  label: string;
  rss: string;
  tags: string[];
  episodeCount: number;
  updateDates: string[];
}

/**
 * Basic bangumi detail without torrent details
 */
export interface MikanBangumiDetailBasic {
  title: string;
  url: string;
  cover: string;
  bgmUrl?: string;
  bangumiId: string;
  subgroups: MikanSubgroupBasic[];
}

/**
 * Options for getMikanBangumiDetail
 */
export interface MikanDetailOptions {
  includeTorrents?: boolean;   // Whether to include torrent details (default: false)
  subgroupIds?: string[];      // Filter by subgroup IDs
}

export interface MikanSeason {
  year: number;
  season: string;
  select?: boolean;
}

export interface MikanWeekdayItem {
  label: string; // Weekday label (周一, 周二, etc.)
  items: MikanAnimeInfo[];
}

export interface MikanSearchResult {
  seasons: MikanSeason[];
  items: MikanWeekdayItem[];
  totalItem: number;
}
