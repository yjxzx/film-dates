import { MetadataRoute } from "next";
import { getAllMovies, getAvailableYears } from "@/lib/movies";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const movies = await getAllMovies();
  const years = getAvailableYears(movies);

  const baseUrl = "https://yjxzx.github.io/film-dates";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const yearPages: MetadataRoute.Sitemap = years.map((year) => ({
    url: `${baseUrl}/${year}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...yearPages];
}
