import Link from "next/link"

interface YearSelectorProps {
  years: number[]
  currentYear: number
}

export function YearSelector({ years, currentYear }: YearSelectorProps) {
  return (
    <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
      {years.map((year) => (
        <Link
          key={year}
          href={year === new Date().getFullYear() ? "/" : `/${year}`}
          className={`px-3 py-1.5 text-xs border transition-colors whitespace-nowrap
            ${year === currentYear
              ? "bg-ink text-newsprint border-ink"
              : "border-ink text-ink hover:bg-ink hover:text-newsprint"
            }`}
          style={{ fontFamily: "var(--font-newsprint-mono)" }}
        >
          {year}
        </Link>
      ))}
    </div>
  )
}
