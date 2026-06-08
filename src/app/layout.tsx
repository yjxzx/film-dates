import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "外国电影定档速报",
    template: "%s | 外国电影定档速报",
  },
  description: "追踪外国电影在中国大陆的上映信息——定档、引进、上映日期一站查询。",
  keywords: ["外国电影", "定档", "上映日期", "引进", "中国大陆", "电影资讯"],
  authors: [{ name: "yjxzx" }],
  creator: "yjxzx",
  metadataBase: new URL("https://yjxzx.github.io"),
  alternates: {
    canonical: "/film-dates",
  },
  openGraph: {
    title: "外国电影定档速报",
    description: "追踪外国电影在中国大陆的上映信息——定档、引进、上映日期一站查询。",
    url: "https://yjxzx.github.io/film-dates",
    siteName: "外国电影定档速报",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "外国电影定档速报",
    description: "追踪外国电影在中国大陆的上映信息",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
