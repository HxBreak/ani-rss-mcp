// API Response wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  t: number;
}

// Login credentials
export interface Login {
  username: string;
  password: string;
}

// Ani (Subscription) entity
export interface Ani {
  id?: string;
  url: string;
  title: string;
  jpTitle?: string;
  season: number;
  year?: number;
  month?: number;
  date?: number;
  subgroup?: string;
  match?: string[];
  exclude?: string[];
  globalExclude?: boolean;
  offset?: number;
  enable?: boolean;
  currentEpisodeNumber?: number;
  totalEpisodeNumber?: number;
  score?: number;
  ova?: boolean;
  downloadPath?: string;
  customDownloadPath?: boolean;
  bgmUrl?: string;
  tmdb?: Tmdb;
  customEpisode?: number;
  customEpisodeStr?: string;
  customEpisodeGroupIndex?: number;
  omit?: boolean;
  downloadNew?: boolean;
  notDownload?: number[];
  upload?: boolean;
  procrastinating?: boolean;
  message?: boolean;
  completed?: boolean;
  customTags?: string[];
  image?: string;
  themoviedbName?: string;
  type?: string; // Used in RSS parsing
}

// TMDB info
export interface Tmdb {
  id?: number;
  name?: string;
  season?: number;
  group?: string;
}

// Config entity
export interface Config {
  downloadToolType?: 'qBittorrent' | 'Transmission' | 'Aria2' | '115';
  downloadToolHost?: string;
  downloadToolUsername?: string;
  downloadToolPassword?: string;
  downloadPathTemplate?: string;
  proxy?: boolean;
  proxyHost?: string;
  proxyPort?: number;
  proxyUsername?: string;
  proxyPassword?: string;
  rssSleepMinutes?: number;
  renameSleepSeconds?: number;
  login?: Login;
  mikanHost?: string;
  tmdbApi?: string;
  tmdbApiKey?: string;
  downloadCount?: number;
  delete?: boolean;
  autoDisabled?: boolean;
  skip5?: boolean;
  rename?: boolean;
  renameTemplate?: string;
  notificationConfigList?: NotificationConfig[];
  exclude?: string[];
  ipWhitelist?: string[];
  apiKey?: string;
}

// Notification config
export interface NotificationConfig {
  notificationType?:
    | 'TELEGRAM'
    | 'EMAIL'
    | 'WEBHOOK'
    | 'EMBY'
    | 'OPENLIST_UPLOAD';
  enable?: boolean;
  retry?: number;
  statusList?: string[];
  telegramBotToken?: string;
  telegramChatId?: string;
  mailSMTPHost?: string;
  mailFrom?: string;
  mailPassword?: string;
  webHookUrl?: string;
  webHookBody?: string;
  embyHost?: string;
  embyApiKey?: string;
  openListUploadHost?: string;
  openListUploadApiKey?: string;
}

// RSS Item
export interface Item {
  title: string;
  pubDate?: string;
  torrentUrl?: string;
  episodeNumber?: number;
  infoHash?: string;
  subgroup?: string;
}

// Items preview response
export interface ItemsPreview {
  downloadPath: string;
  items: Item[];
  omitList: number[];
}

// Download path response
export interface DownloadPathResponse {
  change: boolean;
  downloadPath: string;
}

// Torrent info
export interface TorrentsInfo {
  name: string;
  hash: string;
  progress: number;
  state: string;
  downloadSpeed?: number;
  uploadSpeed?: number;
  size?: number;
}

// Log entry
export interface Log {
  filename: string;
  size: number;
  modifiedTime: number;
}

// About info
export interface About {
  version: string;
  latestVersion?: string;
  needUpdate?: boolean;
}

// Bangumi search result
export interface BgmSearchResult {
  id: number;
  name: string;
  name_cn?: string;
  images?: {
    medium?: string;
    large?: string;
  };
  score?: number;
  url: string;
}

// BGM User info
export interface BgmUserInfo {
  id: number;
  nickname: string;
  avatar?: string;
  tokenExpireDays?: number;
}

// Telegram chat info
export interface TelegramChatInfo {
  chatId: string;
  title: string;
}

// Proxy test response
export interface ProxyTestResponse {
  status: number;
  time: number;
}

// Collection info
export interface CollectionInfo {
  torrent: string; // Base64 encoded
  ani: Ani;
}

// Mikan season
export interface MikanSeason {
  year: number;
  season: string;
  select?: boolean;
}

// Mikan anime info (within items)
export interface MikanInfo {
  title: string;
  url: string;
  cover: string;
  score: number;
  exists: boolean;
}

// Mikan item (grouped by weekday)
export interface MikanItem {
  label: string; // Weekday label (周一, 周二, etc.)
  items: MikanInfo[];
}

// Mikan search/season result
export interface MikanResult {
  seasons: MikanSeason[];
  items: MikanItem[];
  totalItem: number;
}

// Mikan search result (legacy, for backward compatibility)
export interface MikanSearchResult {
  title: string;
  url: string;
  subgroup?: string;
  image?: string;
}

// Mikan group info
export interface MikanGroupInfo {
  name: string;
  url?: string;
  tags?: string[];
}

// Play item
export interface PlayItem {
  file: string;
  title?: string;
  duration?: number;
  episodeNumber?: number;
}

// Subtitle info
export interface Subtitles {
  index: number;
  language?: string;
  title?: string;
  codec?: string;
}

// Emby views
export interface EmbyViews {
  id: string;
  name: string;
}

// Import ani data DTO
export interface ImportAniDataDTO {
  aniList: Ani[];
  conflict: 'SKIP' | 'REPLACE';
}

// Episode group
export interface EpisodeGroup {
  id: string;
  name: string;
  episodeCount: number;
  episodes?: { episodeNumber: number; name: string }[];
}
