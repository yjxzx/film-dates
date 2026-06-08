import { readFile } from "fs/promises"
import path from "path"
import { MDXRemote } from "next-mdx-remote/rsc"
import Link from "next/link"
import { getFileLastUpdated } from "@/lib/git"

export const dynamic = "force-static"

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), "content/about.mdx")
  const source = await readFile(filePath, "utf-8")
  const lastUpdated = getFileLastUpdated(filePath)

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
        关于本站
      </h2>

      <div
        className="prose prose-sm max-w-none text-ink-light [&_h2]:text-sm [&_h2]:font-bold [&_h2]:pb-1 [&_h2]:border-b [&_h2]:border-ink [&_h2]:mb-2 [&_h2]:mt-0 [&_h2]:font-[family-name:var(--font-newsprint-serif)] [&_p]:text-sm [&_p]:leading-relaxed [&_p]:font-[family-name:var(--font-newsprint-mono)] [&_ol]:text-sm [&_ol]:leading-relaxed [&_ol]:font-[family-name:var(--font-newsprint-mono)] [&_strong]:font-bold [&_a]:underline [&_a]:hover:text-ink [&_code]:bg-ink/5 [&_code]:px-1"
        style={{ fontFamily: "var(--font-newsprint-mono)" }}
      >
        <MDXRemote source={source} />
      </div>

      <p className="text-[13px] text-ink-faded mt-8" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
        最后更新：{lastUpdated}
      </p>

      <div className="mt-6 pt-4 border-t border-ink">
        <Link href="/film-dates" className="text-xs underline hover:text-ink-light" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          ← 返回首页
        </Link>
      </div>
    </div>
  )
}
