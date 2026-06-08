import { Movie } from "./types"

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

export function getCurrentYear(): number {
  return new Date().getFullYear()
}
