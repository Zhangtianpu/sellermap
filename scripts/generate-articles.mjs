import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const { articles } = JSON.parse(await readFile(resolve(root, "data/articles.json"), "utf8"));
const config = JSON.parse(await readFile(resolve(root, "data/site-config.json"), "utf8"));
const baseUrl = config.siteUrl.replace(/\/+$/, "");

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const copy = {
  zh: { locale: "zh-CN", home: "返回导航", guides: "实测文章", tested: "实际测试", published: "发布", open: "打开工具", sources: "参考来源", description: "SellerMap 实际操作跨境工具后整理的使用方法、截图和注意事项。" },
  en: { locale: "en", home: "Back to directory", guides: "Hands-on guides", tested: "Tested", published: "Published", open: "Open tool", sources: "Sources", description: "Hands-on cross-border tool guides with real usage screenshots and practical caveats." }
};

const pageHead = ({ lang, title, description, canonical, depth = "../.." }) => `<!DOCTYPE html>
<html lang="${copy[lang].locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="shortcut icon" href="${depth}/assets/images/sellermap.svg">
  <link rel="stylesheet" href="${depth}/assets/css/seller.css">
  <link rel="stylesheet" href="${depth}/assets/css/articles.css">
  <script defer src="${depth}/assets/js/theme.js"></script>
</head>`;

for (const lang of ["zh", "en"]) {
  const directory = lang === "zh" ? "cn" : "en";
  const outputDir = resolve(root, directory, "articles");
  await mkdir(outputDir, { recursive: true });

  const cards = articles.map((article) => `
      <a class="article-card" href="${escapeHtml(article.slug)}.html">
        <span class="article-kicker">${escapeHtml(article.toolName)} · ${escapeHtml(article.publishedAt)}</span>
        <h2>${escapeHtml(article.title[lang])}</h2>
        <p>${escapeHtml(article.summary[lang])}</p>
      </a>`).join("");

  const indexHtml = `${pageHead({ lang, title: `${copy[lang].guides} | SellerMap`, description: copy[lang].description, canonical: `${baseUrl}/${directory}/articles/` })}
<body>
  <main class="article-shell">
    <nav class="article-nav"><a href="../index.html">← ${copy[lang].home}</a><a href="../../${lang === "zh" ? "en" : "cn"}/articles/">${lang === "zh" ? "EN" : "中文"}</a></nav>
    <header class="article-hero"><span class="article-kicker">SellerMap</span><h1>${copy[lang].guides}</h1><p>${copy[lang].description}</p></header>
    <section class="article-list">${cards}</section>
  </main>
</body>
</html>`;
  await writeFile(resolve(outputDir, "index.html"), indexHtml);

  for (const article of articles) {
    const sections = article.sections.map((section) => `
    <section class="article-section">
      <h2>${escapeHtml(section.heading[lang])}</h2>
      ${section.paragraphs[lang].map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n      ")}
      ${section.screenshot ? `<figure class="article-figure"><img src="${escapeHtml(section.screenshot.src)}" alt="${escapeHtml(section.screenshot.alt[lang])}" loading="lazy"><figcaption>${escapeHtml(section.screenshot.caption[lang])}</figcaption></figure>` : ""}
    </section>`).join("");
    const sources = article.sources.map((source) => `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`).join("");
    const html = `${pageHead({ lang, title: `${article.title[lang]} | SellerMap`, description: article.summary[lang], canonical: `${baseUrl}/${directory}/articles/${article.slug}.html` })}
<body>
  <main class="article-shell">
    <nav class="article-nav"><a href="./">← ${copy[lang].guides}</a><a href="../../${lang === "zh" ? "en" : "cn"}/articles/${article.slug}.html">${lang === "zh" ? "EN" : "中文"}</a></nav>
    <article>
      <header class="article-hero">
        <span class="article-kicker">${escapeHtml(article.toolName)} · ${copy[lang].tested}</span>
        <h1>${escapeHtml(article.title[lang])}</h1>
        <p>${escapeHtml(article.summary[lang])}</p>
        <div class="article-meta"><span>${copy[lang].published}: ${escapeHtml(article.publishedAt)}</span><span>${copy[lang].tested}: ${escapeHtml(article.testedAt)}</span><a href="${escapeHtml(article.toolUrl)}" target="_blank" rel="noopener noreferrer">${copy[lang].open} ↗</a></div>
      </header>${sections}
      <aside class="article-sources"><strong>${copy[lang].sources}</strong><ul>${sources}</ul></aside>
    </article>
  </main>
</body>
</html>`;
    await writeFile(resolve(outputDir, `${article.slug}.html`), html);
  }
}

console.log(`Generated ${articles.length} article(s) in Chinese and English.`);
