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
        className="w-full border border-ink bg-newsprint px-3 py-2 text-sm text-ink
                   placeholder:text-ink-faded focus:outline-none focus:ring-1 focus:ring-ink"
        style={{ fontFamily: "var(--font-newsprint-mono)" }}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faded hover:text-ink text-xs"
          style={{ fontFamily: "var(--font-newsprint-mono)" }}
        >
          清除
        </button>
      )}
    </div>
  )
}
