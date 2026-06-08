import type { Metadata } from "next";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "外国电影定档速报",
  description: "追踪外国电影在中国大陆的上映信息",
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
