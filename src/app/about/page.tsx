import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-newsprint-serif)" }}>关于本站</h2>

      <section className="mb-8">
        <h3 className="text-sm font-bold mb-2 pb-1 border-b border-ink" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
          这是什么？
        </h3>
        <p className="text-sm text-ink-light leading-relaxed" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          外国电影定档速报是一个手工维护的网站，追踪外国电影在中国大陆的上映信息。
          聚焦于进口片、合拍片的引进状态、定档日期、发行方等关键信息。
        </p>
        <p className="text-sm text-ink-light leading-relaxed mt-2" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          灵感来自{" "}
          <a href="https://yuc.wiki" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
            yuc.wiki
          </a>
          （長門番堂）的新番卫星观测站。
        </p>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-bold mb-2 pb-1 border-b border-ink" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
          收录范围
        </h3>
        <div className="space-y-3 text-sm" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          <div>
            <span className="bg-ink text-newsprint px-1.5 py-0.5 text-[10px] font-bold mr-2">A 类</span>
            <span className="text-ink">必须收录 — 确认引进、已定档、热映中、已下映</span>
          </div>
          <div>
            <span className="border border-ink px-1.5 py-0.5 text-[10px] font-bold mr-2">B 类</span>
            <span className="text-ink-light">优先观察 — 六大制片厂出品、日本动画剧场版、全球票房前50、知名IP续作</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-ink-faded mr-2">C 类 — 暂不收录</span>
            <span className="text-ink-faded">仅电影节放映、纯流媒体、独立电影、地区限定发行</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-sm font-bold mb-2 pb-1 border-b border-ink" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
          如何贡献
        </h3>
        <ol className="list-decimal list-inside text-sm text-ink-light space-y-1 leading-relaxed" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          <li>Fork 本仓库</li>
          <li>在 <code className="bg-ink/5 px-1">content/movies/</code> 下新建或修改 <code className="bg-ink/5 px-1">.mdx</code> 文件</li>
          <li>提交 PR，标题格式：<code className="bg-ink/5 px-1">[新增] 片名</code> 或 <code className="bg-ink/5 px-1">[更新] 片名 - 变更内容</code></li>
          <li>维护者审核合并 → 自动部署</li>
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-bold mb-2 pb-1 border-b border-ink" style={{ fontFamily: "var(--font-newsprint-serif)" }}>
          技术
        </h3>
        <p className="text-sm text-ink-light" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          Next.js · Tailwind CSS · MDX · Vercel
        </p>
        <p className="text-xs text-ink-faded mt-1" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          所有数据存储在 Git 仓库中，构建时自动生成时间线和更新日志。
        </p>
      </section>

      <div className="mt-10 pt-4 border-t border-ink">
        <Link href="/" className="text-xs underline hover:text-ink-light" style={{ fontFamily: "var(--font-newsprint-mono)" }}>
          ← 返回首页
        </Link>
      </div>
    </div>
  )
}
