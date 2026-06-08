import "server-only"
import { execSync } from "child_process"

export interface UpdateEntry {
  date: string
  type: "新增" | "更新"
  title: string
  summary: string
}

export function getFileLastUpdated(filePath: string): string {
  try {
    return execSync(`git log -1 --format=%ai -- "${filePath}"`, {
      cwd: process.cwd(),
      encoding: "utf-8",
    })
      .trim()
      .split(" ")[0]
  } catch {
    return new Date().toISOString().split("T")[0]
  }
}

export function getUpdates(): UpdateEntry[] {
  try {
    const output = execSync(
      'git log --format="%ai|||%s" -- content/movies/',
      {
        cwd: process.cwd(),
        encoding: "utf-8",
      }
    ).trim()

    if (!output) return []

    const entries: UpdateEntry[] = []
    for (const line of output.split("\n")) {
      const idx = line.indexOf("|||")
      if (idx === -1) continue
      const dateStr = line.slice(0, idx)
      const message = line.slice(idx + 3)

      const match = message.match(/^\[(新增|更新)\]\s+(.+?)(?:\s*-\s*(.+))?$/)
      if (!match) continue

      entries.push({
        date: dateStr.trim().split(" ")[0],
        type: match[1] as "新增" | "更新",
        title: match[2].trim(),
        summary: (match[3] || "").trim(),
      })
    }

    return entries
  } catch {
    return []
  }
}
