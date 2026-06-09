# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作时提供指引。

## 先读 AGENTS.md

@AGENTS.md 包含关键的版本警告。这是 Next.js 16，与你所熟知的版本有破坏性变更。在编写任何 Next.js 代码之前，请先阅读 `node_modules/next/dist/docs/` 中的相关指南。

## 常用命令

```bash
pnpm dev      # 启动开发服务器
pnpm build    # 生产构建（静态导出到 out/ 目录）
pnpm lint     # 运行 ESLint
```

本项目没有测试。

## 架构

这是一个**静态导出（static export）的 Next.js 站点**，部署在 GitHub Pages 的 `/film-dates` 路径下。`next.config.ts` 设置了 `output: "export"` 和 `basePath: "/film-dates"`。所有路由都使用 `export const dynamic = "force-static"`。

### 数据层 — 基于 Git 的 MDX frontmatter

所有电影数据以 `.mdx` 文件存储在 `content/movies/` 中。每个文件包含 YAML frontmatter，字段定义见 `src/lib/types.ts` 中的 `MovieFrontmatter` 类型。没有数据库——一切在构建时从文件系统读取。

**仅服务端**（`src/lib/movies.ts`）：通过 `gray-matter` 读取 MDX 文件，规范化日期、排序、按月份分组、提取国家/年份。标记了 `import "server-only"`。

**客户端安全**（`src/lib/movies-client.ts`）：对已加载数据做搜索和国家筛选的纯函数。不访问文件系统或 git。

**Git 集成**（`src/lib/git.ts`，仅服务端）：通过 `execSync("git log ...")` 获取每个文件的 `lastUpdated` 以及 `/updates` 页面的完整更新历史。提交信息必须遵循格式：`[新增] 片名` 或 `[更新] 片名 - 变更内容`。

### 路由结构（App Router，静态导出）

| 路由 | 文件 | 行为 |
|---|---|---|
| `/` | `src/app/page.tsx` | 服务端组件：加载所有电影，渲染当前年份数据 |
| `/[year]` | `src/app/[year]/page.tsx` | 服务端组件 + `generateStaticParams()`，无数据时 404 |
| `/about` | `src/app/about/page.tsx` | 通过 `next-mdx-remote/rsc` 渲染 `content/about.mdx` |
| `/updates` | `src/app/updates/page.tsx` | 解析 git log 生成更新历史 |

### 服务端/客户端分离模式

服务端页面（`page.tsx`、`[year]/page.tsx`）获取所有数据，并将其作为 props 传递给 `YearPageClient`（`src/app/year-page-client.tsx`）。后者是 `"use client"` 组件，负责搜索、国家筛选和可折叠的月份区块。交互状态全部在客户端组件中，数据获取全部在服务端组件中。

### 组件树

```
RootLayout（服务端）
├── Header（服务端组件 — 链接到 /updates、/about）
└── YearPageClient（客户端组件）
    ├── YearSelector — 年份标签，链接到 /[year]
    ├── SearchBox — 按片名/原名文本筛选
    ├── CountryFilter — 按国家多选切换
    └── TimelineSection[] — 每月一个，可折叠（已过的月份默认折叠）
        └── MovieCard[] — 海报、片名、状态、类型、来源、时间线
```

### 样式

Tailwind CSS v4，自定义"新闻纸"主题，定义在 `src/app/globals.css` 中：米色背景（`--color-newsprint`）、深墨色文字（`--color-ink`）、标题用衬线字体、正文用等宽字体。shadcn/ui 组件可通过 `@/components/ui/button` 使用，但站点主要使用自己精简的组件。

### 构建产物

`pnpm build` 生成静态 `out/` 目录。所有路由在构建时通过 `generateStaticParams`（年份页面）和 `force-static`（所有路由）预渲染。sitemap 自动生成。

## 添加或更新电影数据

1. 在 `content/movies/` 中编辑或新建 `.mdx` 文件
2. Frontmatter 字段定义见 `src/lib/types.ts`（`MovieFrontmatter`）
3. 参考模板：`content/movies/toy-story-5.mdx`
4. 提交信息格式：`[新增] 片名` 或 `[更新] 片名 - 变更内容`

## 重要约束

- `basePath` 为 `/film-dates` — 所有内部链接和资源必须带此前缀（例如海报路径 `/film-dates/images/...`，首页链接 `href="/film-dates"`）
- `src/lib/movies.ts` 和 `src/lib/git.ts` 标记了 `import "server-only"` — 它们使用了 `fs` 和 `child_process`，不能在客户端组件中导入
- 站点没有运行时服务器 — 任何需要实时数据的功能都必须在构建时完成
