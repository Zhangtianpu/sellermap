import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.SITE_URL || "").replace(/\/+$/, "");

if (!/^https?:\/\/[^/]+$/i.test(siteUrl)) {
  console.error("Usage: SITE_URL=https://your-domain.com npm run seo");
  process.exit(1);
}

const pages = [
  { path: "", priority: "1.0", changefreq: "weekly" },
  { path: "cn/", priority: "1.0", changefreq: "weekly" },
  { path: "en/", priority: "0.9", changefreq: "weekly" },
  { path: "cn/contact.html", priority: "0.5", changefreq: "monthly" },
  { path: "en/contact.html", priority: "0.5", changefreq: "monthly" },
  { path: "cn/privacy.html", priority: "0.3", changefreq: "yearly" },
  { path: "en/privacy.html", priority: "0.3", changefreq: "yearly" }
];

const lastmod = new Date().toISOString().slice(0, 10);
const urls = pages.map((page) => `  <url>
    <loc>${siteUrl}/${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const robotsTemplate = await readFile(resolve("robots.txt"), "utf8");
const robots = robotsTemplate
  .replace(/\n?Sitemap: .*\n?/g, "\n")
  .trimEnd() + `\n\nSitemap: ${siteUrl}/sitemap.xml\n`;

await writeFile(resolve("sitemap.xml"), sitemap);
await writeFile(resolve("robots.txt"), robots);
console.log(`Generated sitemap.xml and updated robots.txt for ${siteUrl}`);
