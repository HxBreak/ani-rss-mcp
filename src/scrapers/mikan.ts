/**
 * Mikan scraper - directly fetches data from mikanime.tv without relying on ani-rss backend
 */

import * as cheerio from 'cheerio';
import type {
  MikanAnimeInfo,
  MikanBangumiDetail,
  MikanBangumiDetailBasic,
  MikanSubgroup,
  MikanSubgroupBasic,
  MikanSeason,
  MikanWeekdayItem,
  MikanSearchResult,
  MikanTorrentInfo,
  MikanRegexItem,
  MikanDetailOptions,
} from './types.js';

const DEFAULT_MIKAN_HOST = 'https://mikanime.tv';

/**
 * Regex patterns for extracting tags from torrent names
 * Same patterns as used in ani-rss backend (MikanGroupAction.java)
 */
const TAG_REGEX_PATTERNS = [
  '1920[Xx]1080', '3840[Xx]2160', '1080[Pp]', '4[Kk]', '720[Pp]',
  '繁', '简', '日',
  'cht|Cht|CHT', 'chs|Chs|CHS', 'hevc|Hevc|HEVC',
  '10bit|10Bit|10BIT', 'h265|H265', 'h264|H264',
  '内嵌', '内封', '外挂',
  'mp4|MP4', 'mkv|MKV',
];

/**
 * Extract tags from torrent name using regex patterns
 */
function extractTagsFromName(name: string): { tags: string[], regexItems: MikanRegexItem[] } {
  const tags: string[] = [];
  const regexItems: MikanRegexItem[] = [];

  for (const pattern of TAG_REGEX_PATTERNS) {
    const regex = new RegExp(pattern);
    const match = name.match(regex);
    if (match) {
      const label = match[0].toUpperCase();
      if (!tags.includes(label)) {
        tags.push(label);
      }
      regexItems.push({ label, regex: pattern });
    }
  }

  return { tags, regexItems };
}

/**
 * Parse torrent table for a subgroup
 */
function parseTorrentTable(
  $: cheerio.CheerioAPI,
  $anchorTarget: cheerio.Cheerio<any>,
  mikanHost: string
): { items: MikanTorrentInfo[], regexList: MikanRegexItem[][], tags: string[] } {
  const items: MikanTorrentInfo[] = [];
  const regexList: MikanRegexItem[][] = [];
  const allTags: Set<string> = new Set();

  // The table is inside the next sibling div with class "episode-table"
  const $episodeTable = $anchorTarget.next('.episode-table');
  if (!$episodeTable.length) {
    return { items: [], regexList: [], tags: [] };
  }

  const $table = $episodeTable.find('table');
  if (!$table.length) {
    return { items: [], regexList: [], tags: [] };
  }

  const $tbody = $table.find('tbody');
  if (!$tbody.length) {
    return { items: [], regexList: [], tags: [] };
  }

  $tbody.find('tr').each((_, tr) => {
    const $tr = $(tr);
    const $anchors = $tr.find('a');

    if ($anchors.length < 3) return;

    // First anchor: torrent name (use text() to get full name)
    const name = $anchors.eq(0).text().trim();

    // Second anchor: magnet link (data-clipboard-text attribute)
    const magnet = $anchors.eq(1).attr('data-clipboard-text') || '';

    // Third anchor: torrent download link
    const torrentHref = $anchors.eq(2).attr('href') || '';
    const torrent = torrentHref.startsWith('http') ? torrentHref : mikanHost + torrentHref;

    // Table cells: size (index 2) and date (index 3)
    const $cells = $tr.find('td');
    const sizeStr = $cells.eq(2).text().trim();
    const dateStr = $cells.eq(3).text().trim();

    const torrentInfo: MikanTorrentInfo = {
      name,
      magnet,
      sizeStr,
      dateStr,
      torrent,
    };
    items.push(torrentInfo);

    // Extract tags from torrent name
    const { tags, regexItems } = extractTagsFromName(name);
    tags.forEach(tag => allTags.add(tag));
    regexList.push(regexItems);
  });

  return {
    items,
    regexList,
    tags: Array.from(allTags),
  };
}

/**
 * Parse basic subgroup info (without torrent details)
 */
function parseSubgroupBasic(
  $: cheerio.CheerioAPI,
  $anchorTarget: cheerio.Cheerio<any>,
  mikanHost: string
): { tags: string[], episodeCount: number, updateDates: string[] } {
  const allTags: Set<string> = new Set();
  const updateDates: string[] = [];

  // The table is inside the next sibling div with class "episode-table"
  const $episodeTable = $anchorTarget.next('.episode-table');
  if (!$episodeTable.length) {
    return { tags: [], episodeCount: 0, updateDates: [] };
  }

  const $table = $episodeTable.find('table');
  if (!$table.length) {
    return { tags: [], episodeCount: 0, updateDates: [] };
  }

  const $tbody = $table.find('tbody');
  if (!$tbody.length) {
    return { tags: [], episodeCount: 0, updateDates: [] };
  }

  $tbody.find('tr').each((_, tr) => {
    const $tr = $(tr);
    const $anchors = $tr.find('a');

    if ($anchors.length < 3) return;

    // First anchor: torrent name (use text() to get full name)
    const name = $anchors.eq(0).text().trim();

    // Table cells: date (index 3)
    const $cells = $tr.find('td');
    const dateStr = $cells.eq(3).text().trim();
    if (dateStr) {
      updateDates.push(dateStr);
    }

    // Extract tags from torrent name
    const { tags } = extractTagsFromName(name);
    tags.forEach(tag => allTags.add(tag));
  });

  return {
    tags: Array.from(allTags),
    episodeCount: updateDates.length,
    updateDates,
  };
}

function getMikanHost(): string {
  return process.env.MIKAN_HOST || DEFAULT_MIKAN_HOST;
}

/**
 * Fetch a Mikan page with proper headers
 */
async function fetchMikanPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Extract bangumiId from URL
 */
function extractBangumiId(url: string): string {
  const match = url.match(/(\d+)\/?$/);
  return match ? match[1] : '';
}

/**
 * Parse anime list from an element (used for both search results and season browse)
 */
function parseAnimeList($: cheerio.CheerioAPI, container: cheerio.Cheerio<any>): MikanAnimeInfo[] {
  const results: MikanAnimeInfo[] = [];
  const mikanHost = getMikanHost();

  container.find('li').each((_, li) => {
    const $li = $(li);
    const $span = $li.find('span').first();
    const cover = mikanHost + ($span.attr('data-src') || '');

    const $anchor = $li.find('a').first();
    if (!$anchor.length) return;

    const href = mikanHost + ($anchor.attr('href') || '');
    const title = $anchor.text().trim();
    const bangumiId = extractBangumiId(href);

    results.push({
      title,
      url: href,
      cover,
      bangumiId,
    });
  });

  return results;
}

/**
 * Search Mikan for anime by keyword
 */
export async function searchMikan(keyword: string): Promise<MikanAnimeInfo[]> {
  const mikanHost = getMikanHost();
  const url = `${mikanHost}/Home/Search?searchstr=${encodeURIComponent(keyword)}`;

  const html = await fetchMikanPage(url);
  const $ = cheerio.load(html);

  const results: MikanAnimeInfo[] = [];
  const $anUl = $('.an-ul');

  if ($anUl.length) {
    return parseAnimeList($, $anUl);
  }

  return results;
}

/**
 * Browse anime by season
 */
export async function browseMikanSeason(year: number, season: string): Promise<MikanSearchResult> {
  const mikanHost = getMikanHost();
  const url = `${mikanHost}/Home/BangumiCoverFlowByDayOfWeek?year=${year}&seasonStr=${encodeURIComponent(season)}`;

  const html = await fetchMikanPage(url);
  const $ = cheerio.load(html);

  const seasons: MikanSeason[] = [];
  const items: MikanWeekdayItem[] = [];

  // Parse seasons dropdown
  const $dateSelect = $('.date-select').first();
  if ($dateSelect.length) {
    const dateText = $dateSelect.find('.date-text').text().trim();
    const $dropdownMenu = $dateSelect.find('.dropdown-menu');

    $dropdownMenu.find('li').each((_, li) => {
      const $li = $(li);
      const $anchor = $li.find('a');
      if (!$anchor.length) return;

      const dataYear = $anchor.attr('data-year');
      const dataSeason = $anchor.attr('data-season');

      if (dataYear && dataSeason) {
        seasons.push({
          year: parseInt(dataYear, 10),
          season: dataSeason,
          select: dateText === `${dataYear} ${$anchor.text().trim()}`,
        });
      }
    });
  }

  // Parse anime by weekday
  const $skBangumis = $('.sk-bangumi');

  if ($skBangumis.length) {
    $skBangumis.each((_, skBangumi) => {
      const $skBangumi = $(skBangumi);
      const label = $skBangumi.children().first().text().trim();
      const animeList = parseAnimeList($, $skBangumi);

      if (animeList.length > 0) {
        items.push({
          label,
          items: animeList,
        });
      }
    });
  }

  const totalItem = items.reduce((sum, item) => sum + item.items.length, 0);

  return {
    seasons,
    items,
    totalItem,
  };
}

/**
 * Get detailed bangumi info including subgroups and RSS links
 */
export async function getMikanBangumiDetail(
  bangumiId: string,
  options?: MikanDetailOptions
): Promise<MikanBangumiDetail | MikanBangumiDetailBasic> {
  const mikanHost = getMikanHost();
  const url = `${mikanHost}/Home/Bangumi/${bangumiId}`;
  const includeTorrents = options?.includeTorrents ?? false;
  const subgroupIds = options?.subgroupIds;

  const html = await fetchMikanPage(url);
  const $ = cheerio.load(html);

  // Parse title
  const title = $('.bangumi-title').text().trim();

  // Parse cover
  const $cover = $('.content > img').first();
  const cover = $cover.length ? mikanHost + ($cover.attr('src') || '') : '';

  // Parse BGM URL
  let bgmUrl: string | undefined;
  $('.bangumi-info').each((_, info) => {
    const $info = $(info);
    const text = $info.contents().filter((_, el) => el.type === 'text').text().trim();
    if (text.includes('Bangumi') || text.includes('番组计划')) {
      const $link = $info.find('a');
      if ($link.length) {
        bgmUrl = $link.attr('href');
      }
    }
  });

  // Helper to check if subgroup should be included
  const shouldIncludeSubgroup = (subgroupId: string): boolean => {
    if (!subgroupIds || subgroupIds.length === 0) return true;
    return subgroupIds.includes(subgroupId);
  };

  // Basic mode: return without torrent details
  if (!includeTorrents) {
    const subgroups: MikanSubgroupBasic[] = [];
    const $subgroupItems = $('.leftbar-item');

    $subgroupItems.each((_, item) => {
      const $item = $(item);
      const $subgroupLink = $item.find('a.subgroup-name');
      const label = $subgroupLink.text().trim();
      const dataAnchor = $subgroupLink.attr('data-anchor') || '';

      // Skip if no valid anchor
      if (!dataAnchor) return;

      const subgroupId = dataAnchor.replace('#', '').trim();

      // Skip if not in filter list
      if (!shouldIncludeSubgroup(subgroupId)) return;

      // Find RSS link using the anchor
      const $anchorTarget = $(dataAnchor);
      const $rssLink = $anchorTarget.find('.mikan-rss');
      const rssHref = $rssLink.attr('href') || '';
      const rss = rssHref.startsWith('http') ? rssHref : mikanHost + rssHref;

      // Parse basic info for this subgroup
      const { tags, episodeCount, updateDates } = parseSubgroupBasic($, $anchorTarget, mikanHost);

      subgroups.push({
        subgroupId,
        label,
        rss,
        tags,
        episodeCount,
        updateDates,
      });
    });

    return {
      title,
      url,
      cover,
      bgmUrl,
      bangumiId,
      subgroups,
    };
  }

  // Full mode: return with torrent details
  const subgroups: MikanSubgroup[] = [];
  const $subgroupItems = $('.leftbar-item');

  $subgroupItems.each((_, item) => {
    const $item = $(item);
    const $subgroupLink = $item.find('a.subgroup-name');
    const label = $subgroupLink.text().trim();
    const dataAnchor = $subgroupLink.attr('data-anchor') || '';

    // Skip if no valid anchor
    if (!dataAnchor) return;

    const subgroupId = dataAnchor.replace('#', '').trim();

    // Skip if not in filter list
    if (!shouldIncludeSubgroup(subgroupId)) return;

    const updateDay = $item.find('.date').text().trim();

    // Find RSS link using the anchor
    const $anchorTarget = $(dataAnchor);
    const $rssLink = $anchorTarget.find('.mikan-rss');
    const rssHref = $rssLink.attr('href') || '';
    const rss = rssHref.startsWith('http') ? rssHref : mikanHost + rssHref;

    // Parse torrent table for this subgroup
    const { items, regexList, tags } = parseTorrentTable($, $anchorTarget, mikanHost);

    subgroups.push({
      subgroupId,
      label,
      rss,
      updateDay,
      items,
      regexList,
      tags,
    });
  });

  return {
    title,
    url,
    cover,
    bgmUrl,
    bangumiId,
    subgroups,
  };
}

/**
 * Get subgroups from a Mikan bangumi URL
 * Similar to backend's MikanUtil.getGroups(url)
 */
export async function getMikanGroups(mikanUrl: string): Promise<MikanSubgroup[]> {
  const mikanHost = getMikanHost();

  const html = await fetchMikanPage(mikanUrl);
  const $ = cheerio.load(html);

  const subgroups: MikanSubgroup[] = [];
  const $subgroupItems = $('.leftbar-item');

  $subgroupItems.each((_, item) => {
    const $item = $(item);
    const $subgroupLink = $item.find('a.subgroup-name');
    const label = $subgroupLink.text().trim();
    const dataAnchor = $subgroupLink.attr('data-anchor') || '';

    // Skip if no valid anchor
    if (!dataAnchor) return;

    const subgroupId = dataAnchor.replace('#', '').trim();
    const updateDay = $item.find('.date').text().trim();

    // Find RSS link using the anchor
    const $anchorTarget = $(dataAnchor);
    const $rssLink = $anchorTarget.find('.mikan-rss');
    const rssHref = $rssLink.attr('href') || '';
    const rss = rssHref.startsWith('http') ? rssHref : mikanHost + rssHref;

    // Parse torrent table for this subgroup
    const { items, regexList, tags } = parseTorrentTable($, $anchorTarget, mikanHost);

    subgroups.push({
      subgroupId,
      label,
      rss,
      updateDay,
      items,
      regexList,
      tags,
    });
  });

  return subgroups;
}

/**
 * Combined search - supports keyword search or season browse
 */
export async function listMikan(
  text?: string,
  season?: { year: number; season: string }
): Promise<MikanSearchResult> {
  const mikanHost = getMikanHost();
  let url: string;

  if (text && text.trim()) {
    // Check for bangumiId direct lookup
    const bangumiIdMatch = text.match(/^bangumiId:\s*(\d+)$/);
    if (bangumiIdMatch) {
      const bangumiId = bangumiIdMatch[1];
      const detail = await getMikanBangumiDetail(bangumiId);

      return {
        seasons: [],
        items: [
          {
            label: 'Search',
            items: [
              {
                title: detail.title,
                url: detail.url,
                cover: detail.cover,
                bangumiId: detail.bangumiId,
              },
            ],
          },
        ],
        totalItem: 1,
      };
    }

    url = `${mikanHost}/Home/Search?searchstr=${encodeURIComponent(text)}`;
  } else if (season) {
    url = `${mikanHost}/Home/BangumiCoverFlowByDayOfWeek?year=${season.year}&seasonStr=${encodeURIComponent(season.season)}`;
  } else {
    // Default to homepage
    url = mikanHost;
  }

  const html = await fetchMikanPage(url);
  const $ = cheerio.load(html);

  const seasons: MikanSeason[] = [];
  const items: MikanWeekdayItem[] = [];

  // Parse seasons dropdown
  const $dateSelect = $('.date-select').first();
  if ($dateSelect.length) {
    const dateText = $dateSelect.find('.date-text').text().trim();
    const $dropdownMenu = $dateSelect.find('.dropdown-menu');

    $dropdownMenu.find('li').each((_, li) => {
      const $li = $(li);
      const $anchor = $li.find('a');
      if (!$anchor.length) return;

      const dataYear = $anchor.attr('data-year');
      const dataSeason = $anchor.attr('data-season');

      if (dataYear && dataSeason) {
        seasons.push({
          year: parseInt(dataYear, 10),
          season: dataSeason,
          select: dateText === `${dataYear} ${$anchor.text().trim()}`,
        });
      }
    });
  }

  // Parse anime - check for search results or weekday grouped
  const $skBangumis = $('.sk-bangumi');

  if ($skBangumis.length) {
    // Season browse - grouped by weekday
    $skBangumis.each((_, skBangumi) => {
      const $skBangumi = $(skBangumi);
      const label = $skBangumi.children().first().text().trim();
      const animeList = parseAnimeList($, $skBangumi);

      if (animeList.length > 0) {
        items.push({
          label,
          items: animeList,
        });
      }
    });
  } else {
    // Search results - single list
    const $anUl = $('.an-ul');
    if ($anUl.length) {
      const animeList = parseAnimeList($, $anUl);
      if (animeList.length > 0) {
        items.push({
          label: 'Search',
          items: animeList,
        });
      }
    }
  }

  const totalItem = items.reduce((sum, item) => sum + item.items.length, 0);

  return {
    seasons,
    items,
    totalItem,
  };
}
