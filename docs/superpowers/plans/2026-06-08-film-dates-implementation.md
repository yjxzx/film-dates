# Film Dates — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a retro-print styled website tracking foreign film releases in China, with MDX content, timeline view, changelog, and GitHub PR contribution workflow.

**Architecture:** Next.js App Router with React Server Components loads MDX files from flat `content/movies/` directory at build time. Client components handle search/filter interactivity. Git log parsed at build time for `/updates` changelog and per-movie `lastUpdated`. Static export deployed to Vercel.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS 3, shadcn/ui, MDX (gray-matter + next-mdx-remote/rsc), pnpm

---

## File Map

```
film-dates/
├── content/movies/           # Flat MDX files, one per movie
│   ├── toy-story-5.mdx
│   └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (font, metadata, global styles)
│   │   ├── page.tsx          # Home — redirects to current year
│   │   ├── [year]/
│   │   │   └── page.tsx      # Year timeline page (SSG, all years)
│   │   ├── updates/
│   │   │   └── page.tsx      # Git changelog page (SSG)
│   │   └── about/
│   │       └── page.tsx      # About + contribution guide
│   ├── components/
│   │   ├── header.tsx        # Site title + nav links
│   │   ├── search-box.tsx    # Client: text input, filters movies
│   │   ├── year-selector.tsx # Year tabs (2026 | 2025 | ...)
│   │   ├── country-filter.tsx# Client: multi-select country checkboxes
│   │   ├── timeline-section.tsx # One month block with movie cards
│   │   └── movie-card.tsx    # Single movie card
│   ├── lib/
│   │   ├── movies.ts         # MDX loader, group/sort/filter functions
│   │   └── git.ts            # Git log parsing for updates + lastUpdated
│   └── styles/
│       └── globals.css       # Tailwind directives + retro print theme vars
├── public/posters/           # Optional poster images
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── components.json           # shadcn/ui config
├── package.json
└── README.md
```

---

### Task 1: Scaffold Next.js project

**Files:**
- Create: All scaffold files via `create-next-app`

- [ ] **Step 1: Create Next.js project with pnpm**

```bash
cd /Users/asahiyang && npx create-next-app@latest film-dates --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
cd film-dates
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add gray-matter next-mdx-remote date-fns lucide-react
pnpm add -D @types/node
```

- [ ] **Step 3: Init shadcn/ui**

```bash
npx shadcn-ui@latest init -d
```

Expected: Creates `components.json` and updates `src/styles/globals.css` with CSS variables.

- [ ] **Step 4: Add shadcn/ui components**

```bash
npx shadcn-ui@latest add card button badge input
```

- [ ] **Step 5: Verify dev server starts**

```bash
pnpm dev
```

Expected: Next.js running on `http://localhost:3000` with default page.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js project with Tailwind and shadcn/ui"
```

---

### Task 2: Retro print theme — Tailwind config + global CSS

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Update Tailwind config with retro print theme**

Edit `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        newsprint: "#f5f0e8",
        ink: "#1a1a1a",
        "ink-light": "#555555",
        "ink-faded": "#888888",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "serif"],
        mono: ['"Courier New"', "Courier", "monospace"],
      },
      borderWidth: {
        "1": "1px",
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Replace global CSS with retro print base styles**

Overwrite `src/styles/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-newsprint text-ink font-mono;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

@layer utilities {
  .border-print {
    border: 1px solid theme('colors.ink');
  }

  .tag {
    @apply border border-ink px-1.5 py-0.5 font-mono;
  }
}
```

- [ ] **Step 3: Verify the page renders with newsprint background**

```bash
pnpm dev
```

Expected: `http://localhost:3000` shows cream background with subtle noise texture.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "style: add retro print theme with newsprint colors"
```

---

### Task 3: MDX content types + data loader

**Files:**
- Create: `src/lib/movies.ts`
- Create: `src/lib/git.ts`

- [ ] **Step 1: Define TypeScript types and create movie loader**

Create `src/lib/movies.ts`:

```typescript
import { readFile, readdir } from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { getFileLastUpdated } from "./git"

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

const MOVIES_DIR = path.join(process.cwd(), "content/movies")

export async function getAllMovies(): Promise<Movie[]> {
  let files: string[] = []
  try {
    files = await readdir(MOVIES_DIR)
  } catch {
    return []
  }

  const movies: Movie[] = []

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue

    const filePath = path.join(MOVIES_DIR, file)
    const raw = await readFile(filePath, "utf-8")
    const { data, content } = matter(raw)

    const slug = path.basename(file, ".mdx")
    const lastUpdated = getFileLastUpdated(filePath)

    movies.push({
      slug,
      ...(data as Omit<MovieFrontmatter, "slug">),
      lastUpdated,
      content,
    })
  }

  return movies.sort((a, b) => {
    const dateA = a.releaseDate || a.releasePeriod || ""
    const dateB = b.releaseDate || b.releasePeriod || ""
    return dateA.localeCompare(dateB)
  })
}

export function getMoviesByYear(movies: Movie[], year: number): Movie[] {
  return movies.filter((m) => {
    if (m.releaseDate) return m.releaseDate.startsWith(`${year}-`)
    if (m.releasePeriod) return m.releasePeriod.includes(`${year}`)
    return false
  })
}

export function groupByMonth(movies: Movie[]): Map<number, Movie[]> {
  const byMonth = new Map<number, Movie[]>()

  for (const movie of movies) {
    let month: number | null = null
    if (movie.releaseDate) {
      month = parseInt(movie.releaseDate.split("-")[1], 10)
    } else if (movie.releasePeriod) {
      const m = movie.releasePeriod.match(/(\d+)月/)
      if (m) month = parseInt(m[1], 10)
      const d = movie.releasePeriod.match(/-(\d{2})/)
      if (d) month = parseInt(d[1], 10)
    }
    if (month && month >= 1 && month <= 12) {
      if (!byMonth.has(month)) byMonth.set(month, [])
      byMonth.get(month)!.push(movie)
    }
  }

  return byMonth
}

export function getUniqueCountries(movies: Movie[]): string[] {
  const countries = new Set<string>()
  for (const movie of movies) {
    for (const c of movie.country) countries.add(c)
  }
  return [...countries].sort()
}

export function searchMovies(movies: Movie[], query: string): Movie[] {
  if (!query.trim()) return movies
  const q = query.toLowerCase().trim()
  return movies.filter(
    (m) =>
      m.title.toLowerCase().includes(q) ||
      m.originalTitle.toLowerCase().includes(q)
  )
}

export function filterByCountries(movies: Movie[], selected: Set<string>): Movie[] {
  if (selected.size === 0) return movies
  return movies.filter((m) => m.country.some((c) => selected.has(c)))
}

export function getAvailableYears(movies: Movie[]): number[] {
  const currentYear = new Date().getFullYear()
  const years = new Set<number>()
  years.add(currentYear)

  for (const movie of movies) {
    if (movie.releaseDate) {
      years.add(parseInt(movie.releaseDate.split("-")[0], 10))
    }
  }

  return [...years].sort((a, b) => b - a)
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}
```

- [ ] **Step 2: Create git utilities**

Create `src/lib/git.ts`:

```typescript
import { execSync } from "child_process"

export interface UpdateEntry {
  date: string
  type: "新增" | "更新"
  title: string
  summary: string
}

export function getFileLastUpdated(filePath: string): string {
  try {
    return execSync(`git log -1 --format=%ai -- "${filePath}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
    })
      .trim()
      .split(" ")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

export function getUpdates(): UpdateEntry[] {
  try {
    const output = execSync(
      'git log --format="%ai|||%s" -- content/movies/',
      {
        cwd: process.cwd(),
        encoding: "utf-8",
      }
    ).trim()

    if (!output) return []

    const entries: UpdateEntry[] = []
    for (const line of output.split("\n")) {
      const [dateStr, ...messageParts] = line.split("|||")
      const message = messageParts.join("|||")

      const match = message.match(/^\[(新增|更新)\]\s+(.+?)(?:\s*-\s*(.+))?$/)
      if (!match) continue

      entries.push({
        date: dateStr.trim().split(" ")[0],
        type: match[1] as "新增" | "更新",
        title: match[2].trim(),
        summary: (match[3] || "").trim(),
      })
    }

    return entries
  } catch {
    return []
  }
}
```

- [ ] **Step 3: Create sample movie MDX**

Create `content/movies/toy-story-5.mdx`:

```mdx
---
slug: toy-story-5
title: 玩具总动员5
originalTitle: Toy Story 5
country:
  - 美国
genres:
  - 动画
  - 冒险
  - 喜剧
importStatus: 确认引进
releaseStatus: 已定档
releaseDate: 2026-06-19
distributor: 中国电影集团
sources:
  - name: 国家电影局
    url: https://www.chinafilm.gov.cn
  - name: 皮克斯官方微博
    url: https://weibo.com/pixar
timeline:
  - date: 2025-08-10
    event: D23 宣布制作
  - date: 2026-04-15
    event: 确认引进
  - date: 2026-05-20
    event: 定档6月19日，中美同步上映
---

皮克斯经典系列回归。
```

Create `content/movies/super-mario-galaxy.mdx`:

```mdx
---
slug: super-mario-galaxy
title: 超级马力欧银河大电影
originalTitle: The Super Mario Galaxy Movie
country:
  - 日本
  - 美国
genres:
  - 动画
  - 冒险
  - 喜剧
importStatus: 确认引进
releaseStatus: 热映中
releaseDate: 2026-04-03
distributor: 中国电影集团
sources:
  - name: 环球影业微博
    url: https://weibo.com/universalpictures
timeline:
  - date: 2025-06-01
    event: 任天堂宣布制作
  - date: 2026-02-10
    event: 确认引进
  - date: 2026-03-01
    event: 定档4月3日
---

马力欧回归大银幕，这次冲向银河。
```

- [ ] **Step 4: Verify data loading works**

Create a quick test script or just run `pnpm dev` and check no errors.

Expected: `getAllMovies()` returns 2 movies when called.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add MDX data loader, types, git utils, and sample content"
```

---

### Task 4: MovieCard component

**Files:**
- Create: `src/components/movie-card.tsx`

- [ ] **Step 1: Create movie-card.tsx**

Create `src/components/movie-card.tsx`:

```tsx
import { Movie, MovieSource } from "@/lib/movies"
import { useState } from "react"

const IMPORT_STATUS_LABEL: Record<string, string> = {
  "确认引进": "已确认",
  "引进传闻": "传闻",
  "确认不上映": "不上映",
  "未确认": "待确认",
}

export function MovieCard({ movie }: { movie: Movie }) {
  const [showSources, setShowSources] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  const primarySource: MovieSource | undefined = movie.sources?.[0]
  const extraSources: MovieSource[] = movie.sources?.slice(1) || []

  const displayDate = movie.releaseDate || movie.releasePeriod || "待定"

  return (
    <div className="border-print bg-newsprint">
      {/* Poster placeholder */}
      <div className="w-full h-28 border-b border-dashed border-ink-faded flex items-center justify-center">
        <span className="text-[10px] font-mono text-ink-faded tracking-wider">
          POSTER
        </span>
      </div>

      <div className="p-3">
        {/* Top row: title + import status badge */}
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="text-sm font-bold font-serif text-ink leading-tight">
            {movie.title}
          </h3>
          <span className="tag text-[9px] whitespace-nowrap shrink-0">
            {IMPORT_STATUS_LABEL[movie.importStatus] || movie.importStatus}
          </span>
        </div>

        {/* Original title + country */}
        <p className="text-[10px] text-ink-light font-mono mb-2">
          {movie.originalTitle} · {movie.country.join("/")}
        </p>

        {/* Tags row */}
        <div className="flex gap-1 flex-wrap mb-2">
          {movie.genres.map((g) => (
            <span key={g} className="tag text-[9px]">
              {g}
            </span>
          ))}
          {movie.releaseStatus === "热映中" && (
            <span className="text-[9px] font-mono bg-ink text-newsprint px-1.5 py-0.5">
              热映中
            </span>
          )}
          {movie.releaseStatus === "已下映" && (
            <span className="text-[9px] font-mono text-ink-faded px-1.5 py-0.5">
              已下映
            </span>
          )}
          {movie.distributor && (
            <span className="text-[9px] font-mono text-ink-faded">
              {movie.distributor}
            </span>
          )}
        </div>

        {/* Release date */}
        <p className="text-[11px] font-mono font-bold text-ink mb-1">
          {displayDate}
          {movie.releaseStatus === "热映中" && " 上映"}
        </p>

        {/* Last updated */}
        <p className="text-[9px] font-mono text-ink-faded mb-2">
          更新于 {movie.lastUpdated}
        </p>

        {/* Source */}
        {primarySource && (
          <div className="text-[9px] font-mono">
            <span className="text-ink-faded">来源：</span>
            <a
              href={primarySource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline hover:text-ink-light"
            >
              {primarySource.name}
            </a>
            {extraSources.length > 0 && (
              <>
                {" "}
                <button
                  onClick={() => setShowSources(!showSources)}
                  className="text-ink-faded underline hover:text-ink"
                >
                  {showSources ? "收起" : `+${extraSources.length}`}
                </button>
              </>
            )}
          </div>
        )}

        {showSources && extraSources.length > 0 && (
          <div className="text-[9px] font-mono mt-1 space-y-0.5">
            {extraSources.map((s) => (
              <div key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink underline hover:text-ink-light"
                >
                  {s.name}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Timeline history toggle */}
        {movie.timeline && movie.timeline.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-ink-faded">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-[9px] font-mono text-ink-faded underline hover:text-ink"
            >
              历史记录 ({movie.timeline.length})
            </button>
            {showTimeline && (
              <div className="mt-1 space-y-1">
                {movie.timeline.map((event, i) => (
                  <div key={i} className="text-[9px] font-mono flex gap-1.5">
                    <span className="text-ink-faded shrink-0">{event.date}</span>
                    <span className="text-ink-light">{event.event}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify component compiles**

```bash
pnpm dev
```

Import `MovieCard` in `page.tsx` with dummy data to check rendering.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add MovieCard component with retro print styling"
```

---

### Task 5: TimelineSection component

**Files:**
- Create: `src/components/timeline-section.tsx`

- [ ] **Step 1: Create timeline-section.tsx**

Create `src/components/timeline-section.tsx`:

```tsx
"use client"

import { Movie } from "@/lib/movies"
import { MovieCard } from "./movie-card"
import { useState } from "react"

const MONTH_NAMES = [
  "", "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
]

interface TimelineSectionProps {
  month: number
  movies: Movie[]
  isCurrentMonth: boolean
  isPastMonth: boolean
}

export function TimelineSection({
  month,
  movies,
  isCurrentMonth,
  isPastMonth,
}: TimelineSectionProps) {
  const [collapsed, setCollapsed] = useState(isPastMonth)

  return (
    <section className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <h2 className={`text-lg font-bold font-serif ${isCurrentMonth ? "text-ink" : "text-ink-light"}`}>
          {MONTH_NAMES[month]}
          {isCurrentMonth && (
            <span className="ml-2 text-[10px] font-mono bg-ink text-newsprint px-1.5 py-0.5 align-middle">
              当前
            </span>
          )}
        </h2>
        <span className="text-[10px] font-mono text-ink-faded">
          {movies.length} 部
        </span>
        <span className="text-[10px] font-mono text-ink-faded ml-auto">
          {collapsed ? "▶ 展开" : "▼ 收起"}
        </span>
      </button>

      {!collapsed && (
        movies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {movies.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-[11px] font-mono text-ink-faded italic py-4 text-center border border-dashed border-ink-faded">
            暂无定档影片
          </p>
        )
      )}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add TimelineSection component with collapsible months"
```

---

### Task 6: Header, search box, year selector, country filter

**Files:**
- Create: `src/components/header.tsx`
- Create: `src/components/search-box.tsx`
- Create: `src/components/year-selector.tsx`
- Create: `src/components/country-filter.tsx`

- [ ] **Step 1: Create header.tsx**

Create `src/components/header.tsx`:

```tsx
import Link from "next/link"

export function Header() {
  return (
    <header className="border-b-2 border-ink mb-8 pb-4">
      <div className="flex items-end justify-between">
        <div>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <h1 className="text-2xl font-bold font-serif text-ink tracking-tight">
              外国电影定档速报
            </h1>
          </Link>
          <p className="text-[10px] font-mono text-ink-faded mt-1">
            FOREIGN FILMS IN CHINA · RELEASE TRACKER
          </p>
        </div>
        <nav className="flex gap-4 text-[11px] font-mono">
          <Link
            href="/updates"
            className="text-ink underline hover:text-ink-light"
          >
            更新日志
          </Link>
          <Link
            href="/about"
            className="text-ink underline hover:text-ink-light"
          >
            关于
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create search-box.tsx**

Create `src/components/search-box.tsx`:

```tsx
"use client"

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative mb-4">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索片名..."
        className="w-full border border-ink bg-newsprint px-3 py-2 font-mono text-sm text-ink
                   placeholder:text-ink-faded focus:outline-none focus:border-ink
                   focus:ring-1 focus:ring-ink"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faded hover:text-ink font-mono text-xs"
        >
          清除
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create year-selector.tsx**

Create `src/components/year-selector.tsx`:

```tsx
import Link from "next/link"

interface YearSelectorProps {
  years: number[]
  currentYear: number
}

export function YearSelector({ years, currentYear }: YearSelectorProps) {
  return (
    <div className="flex gap-1 mb-6 overflow-x-auto">
      {years.map((year) => (
        <Link
          key={year}
          href={year === new Date().getFullYear() ? "/" : `/${year}`}
          className={`px-3 py-1.5 font-mono text-xs border transition-colors
            ${year === currentYear
              ? "bg-ink text-newsprint border-ink"
              : "border-ink text-ink hover:bg-ink hover:text-newsprint"
            }`}
        >
          {year}
        </Link>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Create country-filter.tsx**

Create `src/components/country-filter.tsx`:

```tsx
"use client"

interface CountryFilterProps {
  countries: string[]
  selected: Set<string>
  onToggle: (country: string) => void
}

export function CountryFilter({
  countries,
  selected,
  onToggle,
}: CountryFilterProps) {
  return (
    <div className="mb-6">
      <p className="text-[10px] font-mono text-ink-faded mb-2 uppercase tracking-wider">
        按国家筛选
      </p>
      <div className="flex flex-wrap gap-1.5">
        {countries.map((country) => {
          const isSelected = selected.has(country)
          return (
            <button
              key={country}
              onClick={() => onToggle(country)}
              className={`px-2 py-1 font-mono text-[10px] border transition-colors
                ${isSelected
                  ? "bg-ink text-newsprint border-ink"
                  : "border-ink text-ink hover:bg-ink/10"
                }`}
            >
              {country}
            </button>
          )
        })}
        {selected.size > 0 && (
          <button
            onClick={() => countries.forEach((c) => onToggle(c))}
            className="px-2 py-1 font-mono text-[10px] text-ink-faded hover:text-ink"
          >
            清除
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add header, search, year selector, and country filter components"
```

---

### Task 7: Root layout

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update root layout**

Overwrite `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { Header } from "@/components/header"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "外国电影定档速报",
  description: "追踪外国电影在中国大陆的上映信息",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add root layout with header and metadata"
```

---

### Task 8: Year timeline page ([year] route)

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/app/[year]/page.tsx`

- [ ] **Step 1: Create home page (redirects to current year)**

Create `src/app/page.tsx`:

```tsx
import { getAllMovies, getMoviesByYear, groupByMonth, getAvailableYears, getUniqueCountries, getCurrentYear } from "@/lib/movies"
import { YearPageClient } from "./year-page-client"

export const dynamic = "force-static"

export default async function HomePage() {
  const movies = await getAllMovies()
  const currentYear = getCurrentYear()
  const yearMovies = getMoviesByYear(movies, currentYear)
  const byMonth = groupByMonth(yearMovies)
  const years = getAvailableYears(movies)
  const countries = getUniqueCountries(movies)

  return (
    <YearPageClient
      movies={yearMovies}
      byMonth={byMonth}
      years={years}
      currentYear={currentYear}
      countries={countries}
    />
  )
}
```

- [ ] **Step 2: Create [year] page**

Create `src/app/[year]/page.tsx`:

```tsx
import { getAllMovies, getMoviesByYear, groupByMonth, getAvailableYears, getUniqueCountries, getCurrentYear } from "@/lib/movies"
import { YearPageClient } from "../year-page-client"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const movies = await getAllMovies()
  const years = getAvailableYears(movies)
  return years.map((year) => ({ year: String(year) }))
}

interface YearPageProps {
  params: Promise<{ year: string }>
}

export default async function YearPage({ params }: YearPageProps) {
  const { year: yearStr } = await params
  const year = parseInt(yearStr, 10)

  if (isNaN(year) || year < 2020 || year > 2100) {
    notFound()
  }

  const movies = await getAllMovies()
  const yearMovies = getMoviesByYear(movies, year)

  if (yearMovies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-serif text-lg text-ink-faded">该年份暂无记录</p>
        <p className="font-mono text-xs text-ink-faded mt-2">
          NO FOREIGN FILM DATA FOR {year}
        </p>
      </div>
    )
  }

  const byMonth = groupByMonth(yearMovies)
  const years = getAvailableYears(movies)
  const countries = getUniqueCountries(movies)

  return (
    <YearPageClient
      movies={yearMovies}
      byMonth={byMonth}
      years={years}
      currentYear={year}
      countries={countries}
    />
  )
}
```

- [ ] **Step 3: Create the shared client page component**

Create `src/app/year-page-client.tsx`:

```tsx
"use client"

import { useState, useMemo } from "react"
import { Movie, searchMovies, filterByCountries } from "@/lib/movies"
import { SearchBox } from "@/components/search-box"
import { YearSelector } from "@/components/year-selector"
import { CountryFilter } from "@/components/country-filter"
import { TimelineSection } from "@/components/timeline-section"

interface YearPageClientProps {
  movies: Movie[]
  byMonth: Map<number, Movie[]>
  years: number[]
  currentYear: number
  countries: string[]
}

export function YearPageClient({
  movies,
  byMonth,
  years,
  currentYear,
  countries,
}: YearPageClientProps) {
  const [search, setSearch] = useState("")
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    let result = searchMovies(movies, search)
    result = filterByCountries(result, selectedCountries)
    return result
  }, [movies, search, selectedCountries])

  // Re-group filtered movies by month
  const filteredByMonth = useMemo(() => {
    const map = new Map<number, Movie[]>()
    for (const movie of filtered) {
      let month: number | null = null
      if (movie.releaseDate) {
        month = parseInt(movie.releaseDate.split("-")[1], 10)
      } else if (movie.releasePeriod) {
        const m = movie.releasePeriod.match(/(\d+)月/) || movie.releasePeriod.match(/-(\d{2})/)
        if (m) month = parseInt(m[1], 10)
      }
      if (month && month >= 1 && month <= 12) {
        if (!map.has(month)) map.set(month, [])
        map.get(month)!.push(movie)
      }
    }
    return map
  }, [filtered])

  const handleCountryToggle = (country: string) => {
    const next = new Set(selectedCountries)
    if (next.has(country)) {
      next.delete(country)
    } else {
      next.add(country)
    }
    setSelectedCountries(next)
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1

  // All months 1-12, sorted: start from current month, wrap around
  const allMonths = Array.from({ length: 12 }, (_, i) => {
    const m = ((currentMonth - 1 + i) % 12) + 1
    return m
  })

  return (
    <div>
      <YearSelector years={years} currentYear={currentYear} />
      <SearchBox value={search} onChange={setSearch} />
      <CountryFilter
        countries={countries}
        selected={selectedCountries}
        onToggle={handleCountryToggle}
      />

      {allMonths.map((month) => {
        const monthMovies = filteredByMonth.get(month) || []
        const isCurrentMonth = month === currentMonth
        const isPastMonth = month < currentMonth
        return (
          <TimelineSection
            key={month}
            month={month}
            movies={monthMovies}
            isCurrentMonth={isCurrentMonth}
            isPastMonth={isPastMonth}
          />
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Verify the timeline page renders with sample data**

```bash
pnpm dev
```

Visit `http://localhost:3000` — should show 2026 timeline with "玩具总动员5" and "超级马力欧银河大电影" cards.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add year timeline pages with search and country filter"
```

---

### Task 9: Updates page (Git changelog)

**Files:**
- Create: `src/app/updates/page.tsx`

- [ ] **Step 1: Create /updates page**

Create `src/app/updates/page.tsx`:

```tsx
import { getUpdates, UpdateEntry } from "@/lib/git"
import Link from "next/link"

function groupByDate(entries: UpdateEntry[]): Map<string, UpdateEntry[]> {
  const map = new Map<string, UpdateEntry[]>()
  for (const entry of entries) {
    if (!map.has(entry.date)) map.set(entry.date, [])
    map.get(entry.date)!.push(entry)
  }
  return map
}

export default async function UpdatesPage() {
  const updates = getUpdates()
  const grouped = groupByDate(updates)
  const dates = [...grouped.keys()].sort().reverse()

  return (
    <div>
      <h2 className="text-xl font-bold font-serif mb-2">更新日志</h2>
      <p className="text-[10px] font-mono text-ink-faded mb-8">
        数据来源：Git 提交历史 · 自动生成 ·{" "}
        <Link href="/" className="underline hover:text-ink">
          返回首页
        </Link>
      </p>

      {dates.length === 0 ? (
        <p className="font-mono text-sm text-ink-faded py-12 text-center border border-dashed border-ink-faded">
          暂无更新记录
        </p>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <section key={date}>
              <h3 className="text-sm font-bold font-mono mb-3 pb-1 border-b border-ink">
                {date}
              </h3>
              <ul className="space-y-2">
                {grouped.get(date)!.map((entry, i) => (
                  <li key={i} className="flex gap-2 text-sm font-mono">
                    <span
                      className={`shrink-0 text-[10px] px-1.5 py-0.5 border
                        ${entry.type === "新增"
                          ? "bg-ink text-newsprint border-ink"
                          : "border-ink text-ink"
                        }`}
                    >
                      {entry.type}
                    </span>
                    <span className="text-ink font-bold">{entry.title}</span>
                    {entry.summary && (
                      <span className="text-ink-light">— {entry.summary}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit with proper format to test changelog**

```bash
git add -A && git commit -m "[新增] 更新日志页面 - 自动生成Git变更记录"
```

- [ ] **Step 3: Verify updates page**

```bash
pnpm dev
```

Visit `http://localhost:3000/updates` — should show the commit above.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add /updates page driven by git log"
```

---

### Task 10: About page

**Files:**
- Create: `src/app/about/page.tsx`

- [ ] **Step 1: Create /about page**

Create `src/app/about/page.tsx`:

```tsx
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold font-serif mb-6">关于本站</h2>

      <section className="mb-8">
        <h3 className="text-sm font-bold font-serif mb-2 border-b border-ink pb-1">
          这是什么？
        </h3>
        <p className="text-sm font-mono text-ink-light leading-relaxed">
          外国电影定档速报是一个手工维护的网站，追踪外国电影在中国大陆的上映信息。
          聚焦于进口片、合拍片的引进状态、定档日期、发行方等关键信息。
        </p>
        <p className="text-sm font-mono text-ink-light leading-relaxed mt-2">
          灵感来自{" "}
          <a
            href="https://yuc.wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink"
          >
            yuc.wiki
          </a>
          （長門番堂）的新番卫星观测站。
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-bold font-serif mb-2 border-b border-ink pb-1">
          收录范围
        </h3>

        <div className="space-y-3 text-sm font-mono">
          <div>
            <span className="bg-ink text-newsprint px-1.5 py-0.5 text-[10px] font-bold mr-2">
              A 类
            </span>
            <span className="text-ink">
              必须收录 — 确认引进、已定档、热映中、已下映
            </span>
          </div>

          <div>
            <span className="border border-ink px-1.5 py-0.5 text-[10px] font-bold mr-2">
              B 类
            </span>
            <span className="text-ink-light">
              优先观察 — 六大制片厂出品、日本动画剧场版、全球票房前50、知名IP续作
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-ink-faded mr-2">
              C 类 — 暂不收录
            </span>
            <span className="text-ink-faded">
              仅电影节放映、纯流媒体、独立电影（排片&lt;1000场）、地区限定发行
            </span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-bold font-serif mb-2 border-b border-ink pb-1">
          如何贡献
        </h3>
        <ol className="list-decimal list-inside text-sm font-mono text-ink-light space-y-1 leading-relaxed">
          <li>Fork 本仓库</li>
          <li>
            在 <code className="bg-ink/5 px-1">content/movies/</code>{" "}
            下新建或修改 <code className="bg-ink/5 px-1">.mdx</code> 文件
          </li>
          <li>
            提交 PR，标题格式：{" "}
            <code className="bg-ink/5 px-1">[新增] 片名</code> 或{" "}
            <code className="bg-ink/5 px-1">[更新] 片名 - 变更内容</code>
          </li>
          <li>维护者审核合并 → 自动部署</li>
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-bold font-serif mb-2 border-b border-ink pb-1">
          技术
        </h3>
        <p className="text-sm font-mono text-ink-light">
          Next.js · shadcn/ui · Tailwind CSS · MDX · Vercel
        </p>
        <p className="text-xs font-mono text-ink-faded mt-1">
          所有数据存储在 Git 仓库中，构建时自动生成时间线和更新日志。
        </p>
      </section>

      <div className="mt-10 pt-4 border-t border-ink">
        <Link
          href="/"
          className="text-xs font-mono underline hover:text-ink-light"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "[新增] 关于页面"
```

---

### Task 11: Vercel deployment config + README

**Files:**
- Create: `.gitignore` (verify)
- Create/Update: `README.md`

- [ ] **Step 1: Ensure .gitignore covers everything**

Read `.gitignore` and confirm it includes `.next`, `node_modules`, `.superpowers/`.

- [ ] **Step 2: Write README.md**

Create `README.md`:

```markdown
# 外国电影定档速报

追踪外国电影在中国大陆的上映信息。

## 收录范围

### A 类 — 必须收录
确认引进 / 已定档 / 热映中 / 已下映

### B 类 — 优先观察
六大制片厂出品、日本动画剧场版、全球票房前50、知名IP续作

### C 类 — 暂不收录
电影节放映、纯流媒体、独立电影、地区限定发行

## 贡献

1. Fork 本仓库
2. 在 `content/movies/` 下新建 `.mdx` 文件
3. 提交 PR：`[新增] 片名` 或 `[更新] 片名 - 变更内容`
4. 审核合并后自动部署

## 数据格式

参见 `content/movies/toy-story-5.mdx` 示例。

## 技术

Next.js · shadcn/ui · Tailwind CSS · MDX · Vercel

## 灵感

[yuc.wiki](https://yuc.wiki) — 長門番堂
```

- [ ] **Step 3: Push to GitHub and deploy on Vercel**

```bash
# Create GitHub repo (manual step — do via gh CLI or GitHub web UI)
gh repo create film-dates --public --source=. --remote=origin --push
```

Then import to Vercel:
1. Go to https://vercel.com/new
2. Import `film-dates` repo
3. Vercel auto-detects Next.js — no config needed
4. Deploy

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "docs: add README and finalize project"
```

---

### Task 12: Polish and verify

- [ ] **Step 1: Full local verification**

```bash
pnpm dev
```

Checklist:
- [ ] Homepage shows 2026 timeline with months
- [ ] Current/upcoming months expanded, past months collapsed
- [ ] Search box filters by title (Chinese and English)
- [ ] Country filter works
- [ ] Year selector switches years
- [ ] /updates shows git commits
- [ ] /about shows contribution guide
- [ ] Mobile responsive (single column cards)

- [ ] **Step 2: Build check**

```bash
pnpm build
```

Expected: No errors. Static pages generated for all years.

- [ ] **Step 3: Fix any issues found**

- [ ] **Step 4: Final commit and push**

```bash
git add -A && git commit -m "chore: final polish and verification"
git push origin main
```
