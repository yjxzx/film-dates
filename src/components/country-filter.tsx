"use client"

interface CountryFilterProps {
  countries: string[]
  selected: Set<string>
  onToggle: (country: string) => void
}

export function CountryFilter({ countries, selected, onToggle }: CountryFilterProps) {
  if (countries.length === 0) return null

  return (
    <div className="mb-6">
      <p className="text-[10px] text-ink-faded mb-2 uppercase tracking-wider" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
        按国家筛选
      </p>
      <div className="flex flex-wrap gap-1.5">
        {countries.map((country) => {
          const isSelected = selected.has(country)
          return (
            <button
              key={country}
              onClick={() => onToggle(country)}
              className={`px-2 py-1 text-[10px] border transition-colors
                ${isSelected
                  ? "bg-ink text-newsprint border-ink"
                  : "border-ink text-ink hover:bg-ink/10"
                }`}
              style={{ fontFamily: "var(--font-newsprint-mono)" }}
            >
              {country}
            </button>
          )
        })}
        {selected.size > 0 && (
          <button
            onClick={() => countries.forEach((c) => onToggle(c))}
            className="px-2 py-1 text-[10px] text-ink-faded hover:text-ink"
            style={{ fontFamily: "var(--font-newsprint-mono)" }}
          >
            清除
          </button>
        )}
      </div>
    </div>
  )
}
