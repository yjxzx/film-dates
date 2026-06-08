import "server-only"
import { readFile, readdir } from "fs/promises"
import path from "path"
import matter from "gray-matter"
import { getFileLastUpdated } from "./git"
import { Movie, MovieFrontmatter } from "./types"

function normalizeDate(val: unknown): string | undefined {
  if (!val) return undefined
  if (val instanceof Date) {
    return val.toISOString().split("T")[0]
  }
  return String(val)
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

    // Normalize: gray-matter may parse dates as Date objects
    const frontmatter = data as Record<string, unknown>
    const releaseDate = normalizeDate(frontmatter.releaseDate)
    const releasePeriod = typeof frontmatter.releasePeriod === "string" ? frontmatter.releasePeriod : undefined

    // Normalize timeline event dates
    const timeline = Array.isArray(frontmatter.timeline)
      ? frontmatter.timeline.map((e: Record<string, unknown>) => ({
          date: normalizeDate(e.date) || "",
          event: String(e.event || ""),
        }))
      : undefined

    movies.push({
      slug,
      ...(frontmatter as Omit<MovieFrontmatter, "slug">),
      releaseDate,
      releasePeriod,
      timeline,
      lastUpdated,
      content,
    })
  }

  return movies.sort((a, b) => {
    const dateA = a.releaseDate || a.releasePeriod || ""
    const dateB = b.releaseDate || b.releasePeriod || ""
    return String(dateA).localeCompare(String(dateB))
  })
}

export function getMoviesByYear(movies: Movie[], year: number): Movie[] {
  return movies.filter((m) => {
    const rd = m.releaseDate ? String(m.releaseDate) : ""
    const rp = m.releasePeriod ? String(m.releasePeriod) : ""
    if (rd) return rd.startsWith(`${year}-`)
    if (rp) return rp.includes(`${year}`)
    return false
  })
}

export function groupByMonth(movies: Movie[]): Map<number, Movie[]> {
  const byMonth = new Map<number, Movie[]>()

  for (const movie of movies) {
    let month: number | null = null
    const rd = movie.releaseDate ? String(movie.releaseDate) : ""
    const rp = movie.releasePeriod ? String(movie.releasePeriod) : ""
    if (rd) {
      month = parseInt(rd.split("-")[1], 10)
    } else if (rp) {
      const m = rp.match(/(\d+)月/)
      if (m) month = parseInt(m[1], 10)
      const d = rp.match(/-(\d{2})/)
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

export function getAvailableYears(movies: Movie[]): number[] {
  const currentYear = new Date().getFullYear()
  const years = new Set<number>()
  years.add(currentYear)

  for (const movie of movies) {
    const rd = movie.releaseDate ? String(movie.releaseDate) : ""
    if (rd) {
      years.add(parseInt(rd.split("-")[0], 10))
    }
  }

  return [...years].sort((a, b) => b - a)
}
