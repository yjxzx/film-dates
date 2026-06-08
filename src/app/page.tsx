import { getAllMovies, getMoviesByYear, groupByMonth, getAvailableYears, getUniqueCountries } from "@/lib/movies"
import { getCurrentYear } from "@/lib/movies-client"
import { YearPageClient } from "./year-page-client"

export const dynamic = "force-static"

export default async function HomePage() {
  const movies = await getAllMovies()
  const currentYear = getCurrentYear()
  const yearMovies = getMoviesByYear(movies, currentYear)
  const byMonth = groupByMonth(yearMovies)
  const years = getAvailableYears(movies)
  const countries = getUniqueCountries(yearMovies)

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
