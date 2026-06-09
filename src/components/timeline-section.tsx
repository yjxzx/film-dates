"use client"

import { useState } from "react"
import { Movie } from "@/lib/types"
import { MovieCard } from "./movie-card"

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

export function TimelineSection({ month, movies, isCurrentMonth, isPastMonth }: TimelineSectionProps) {
  const hasHotMovie = movies.some((m) => m.releaseStatus === "热映中")
  const [collapsed, setCollapsed] = useState(!hasHotMovie && (isPastMonth || movies.length === 0))

  return (
    <section className="mb-6">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 mb-3 group"
      >
        <h2
          className={`text-lg font-bold ${isCurrentMonth ? "text-ink" : "text-ink-light"}`}
          style={{ fontFamily: "var(--font-newsprint-serif)" }}
        >
          {MONTH_NAMES[month]}
          {isCurrentMonth && (
            <span className="ml-2 text-[13px] bg-ink text-newsprint px-1.5 py-0.5 align-middle" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
              当前
            </span>
          )}
        </h2>
        <span className="text-[13px] text-ink-faded" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          {movies.length} 部
        </span>
        <span className="text-[13px] text-ink-faded ml-auto" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
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
          <p className="text-[14px] text-ink-faded italic py-4 text-center border border-dashed border-ink-faded" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            暂无定档影片
          </p>
        )
      )}
    </section>
  )
}
