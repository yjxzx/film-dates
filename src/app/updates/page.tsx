import { getUpdates, UpdateEntry } from "@/lib/git"
import Link from "next/link"

function groupByDate(entries: UpdateEntry[]): Map<string, UpdateEntry[]> {
  const map = new Map<string, UpdateEntry[]>()
  for (const entry of entries) {
    if (!map.has(entry.date)) map.set(entry.date, [])
    map.get(entry.date)!.push(entry)
  }
  return map
}

export default function UpdatesPage() {
  const updates = getUpdates()
  const grouped = groupByDate(updates)
  const dates = [...grouped.keys()].sort().reverse()

  return (
    <div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-newsprint-serif)" }}>更新日志</h2>
      <p className="text-[13px] text-ink-faded mb-8" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
        数据来源：Git 提交历史 · 自动生成 ·{" "}
        <Link href="/" className="underline hover:text-ink">
          返回首页
        </Link>
      </p>

      {dates.length === 0 ? (
        <p className="text-sm text-ink-faded py-12 text-center border border-dashed border-ink-faded" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          暂无更新记录
        </p>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <section key={date}>
              <h3 className="text-sm font-bold mb-3 pb-1 border-b border-ink" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
                {date}
              </h3>
              <ul className="space-y-2">
                {grouped.get(date)!.map((entry, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
                    <span className={`shrink-0 text-[13px] px-1.5 py-0.5 border ${entry.type === "新增" ? "bg-ink text-newsprint border-ink" : "border-ink text-ink"}`}>
                      {entry.type}
                    </span>
                    <span className="text-ink font-bold">{entry.title}</span>
                    {entry.summary && (
                      <span className="text-ink-light">— {entry.summary}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
