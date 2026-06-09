"use client"

import { useState, useMemo } from "react"
import { Movie } from "@/lib/types"
import { searchMovies, filterByCountries } from "@/lib/movies-client"
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
  byMonth: _byMonth,
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

  // Months with movies first (sorted by calendar order), empty months follow
  const allMonths = useMemo(() => {
    const movieMonths = new Set(filteredByMonth.keys())
    const withMovies = Array.from(movieMonths).sort((a, b) => a - b)
    const withoutMovies = Array.from({ length: 12 }, (_, i) => i + 1)
      .filter((m) => !movieMonths.has(m))
    return [...withMovies, ...withoutMovies]
  }, [filteredByMonth])

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
