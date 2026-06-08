export interface MovieSource {
  name: string
  url: string
}

export interface MovieTimelineEvent {
  date: string
  event: string
}

export type ImportStatus = "未确认" | "引进传闻" | "确认引进" | "确认不上映"
export type ReleaseStatus = "待定档" | "已定档" | "热映中" | "已下映"

export interface MovieFrontmatter {
  slug: string
  title: string
  originalTitle: string
  country: string[]
  genres: string[]
  importStatus: ImportStatus
  releaseStatus: ReleaseStatus
  releaseDate?: string
  releasePeriod?: string
  distributor?: string
  sources?: MovieSource[]
  timeline?: MovieTimelineEvent[]
}

export interface Movie extends MovieFrontmatter {
  lastUpdated: string
  content: string
}
