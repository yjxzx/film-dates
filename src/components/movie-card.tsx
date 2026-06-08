"use client"

import { useState } from "react"
import { Movie, MovieSource } from "@/lib/types"

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
      {/* Poster */}
      <div className="w-full h-40 border-b border-dashed border-ink-faded flex items-center justify-center overflow-hidden bg-ink/5">
        {movie.poster ? (
          <img
            src={`/film-dates/images/${movie.poster}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-ink-faded tracking-wider" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            POSTER
          </span>
        )}
      </div>

      <div className="p-3">
        {/* Top row: title + import status */}
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h3 className="text-sm font-bold text-ink leading-tight" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
            {movie.title}
          </h3>
          <span className="border border-ink px-1.5 py-0.5 text-[9px] whitespace-nowrap shrink-0" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            {IMPORT_STATUS_LABEL[movie.importStatus] || movie.importStatus}
          </span>
        </div>

        {/* Original title + country */}
        <p className="text-[10px] text-ink-light mb-2" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          {movie.originalTitle} · {movie.country.join("/")}
        </p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-2">
          {movie.genres.map((g) => (
            <span key={g} className="border border-ink px-1.5 py-0.5 text-[9px]" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
              {g}
            </span>
          ))}
          {movie.releaseStatus === "热映中" && (
            <span className="text-[9px] bg-ink text-newsprint px-1.5 py-0.5" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
              热映中
            </span>
          )}
          {movie.releaseStatus === "已下映" && (
            <span className="text-[9px] text-ink-faded px-1.5 py-0.5" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
              已下映
            </span>
          )}
          {movie.distributor && (
            <span className="text-[9px] text-ink-faded" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
              {movie.distributor}
            </span>
          )}
        </div>

        {/* Date */}
        <p className="text-[11px] font-bold text-ink mb-1" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          {displayDate}
          {movie.releaseStatus === "热映中" && " 上映"}
        </p>

        {/* Last updated */}
        <p className="text-[9px] text-ink-faded mb-2" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          更新于 {movie.lastUpdated}
        </p>

        {/* Sources */}
        {primarySource && (
          <div className="text-[9px]" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            <span className="text-ink-faded">来源：</span>
            <a href={primarySource.url} target="_blank" rel="noopener noreferrer" className="text-ink underline hover:text-ink-light">
              {primarySource.name}
            </a>
            {extraSources.length > 0 && (
              <>
                {" "}
                <button onClick={() => setShowSources(!showSources)} className="text-ink-faded underline hover:text-ink">
                  {showSources ? "收起" : `+${extraSources.length}`}
                </button>
              </>
            )}
          </div>
        )}

        {showSources && extraSources.length > 0 && (
          <div className="text-[9px] mt-1 space-y-0.5" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            {extraSources.map((s) => (
              <div key={s.name}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink underline hover:text-ink-light">
                  {s.name}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        {movie.timeline && movie.timeline.length > 0 && (
          <div className="mt-2 pt-2 border-t border-dashed border-ink-faded">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="text-[9px] text-ink-faded underline hover:text-ink"
              style={{ fontFamily: "var(--font-newsprint-mono)" }}
            >
              历史记录 ({movie.timeline.length})
            </button>
            {showTimeline && (
              <div className="mt-1 space-y-1">
                {movie.timeline.map((event, i) => (
                  <div key={i} className="text-[9px] flex gap-1.5" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
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
