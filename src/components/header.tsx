import Link from "next/link"

export function Header() {
  return (
    <header className="border-b-2 border-ink mb-8 pb-4">
      <div className="flex items-end justify-between">
        <div>
          <Link href="/" className="hover:opacity-70 transition-opacity">
            <h1 className="text-2xl font-bold text-ink tracking-tight" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
              外国电影定档速报
            </h1>
          </Link>
          <p className="text-[13px] text-ink-faded mt-1" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
            FOREIGN FILMS IN CHINA · RELEASE TRACKER
          </p>
        </div>
        <nav className="flex gap-4 text-[14px]" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          <Link href="/updates" className="text-ink underline hover:text-ink-light">
            更新日志
          </Link>
          <Link href="/about" className="text-ink underline hover:text-ink-light">
            关于
          </Link>
        </nav>
      </div>
    </header>
  )
}
