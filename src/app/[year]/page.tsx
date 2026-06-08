import { getAllMovies, getMoviesByYear, groupByMonth, getAvailableYears, getUniqueCountries } from "@/lib/movies"
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
        <p className="text-lg text-ink-faded" style={{ fontFamily: "var(--font-newsprint-serif)" }}>该年份暂无记录</p>
        <p className="text-xs text-ink-faded mt-2" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          NO FOREIGN FILM DATA FOR {year}
        </p>
      </div>
    )
  }

  const byMonth = groupByMonth(yearMovies)
  const years = getAvailableYears(movies)
  const countries = getUniqueCountries(yearMovies)

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
